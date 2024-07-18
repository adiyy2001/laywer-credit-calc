import { WiborData } from '../store/reducers/wiborReducer';
import { CalculationParams, Installment, ClaimResult } from '../types';

class LoanCalculator {
  constructor(private wiborData: WiborData[]) {}

  private static formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  private static formatNumber(value: number): string {
    const fixedValue = value.toFixed(2);
    const [integerPart, fractionalPart] = fixedValue.split('.');
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formattedIntegerPart},${fractionalPart}`;
  }

  private static formatDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}-01`;
  }

  private static calculatePMT(rate: number, nper: number, pv: number): number {
    return (rate * pv) / (1 - Math.pow(1 + rate, -nper));
  }

  public getWiborRate(date: Date, type: 'wibor3m' | 'wibor6m', isFirstClaim: boolean): number {
    if (!this.wiborData || this.wiborData.length === 0) return 0;

    const sortedWiborData = [...this.wiborData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const lastDateEntry = new Date(sortedWiborData[sortedWiborData.length - 1].date);

    if (date > lastDateEntry) {
      return isFirstClaim ? 0 : sortedWiborData[sortedWiborData.length - 1][type] || 0;
    }

    const closestDateEntry = sortedWiborData.reduce((prev, curr) => {
      const prevDate = new Date(prev.date).getTime();
      const currDate = new Date(curr.date).getTime();
      const targetDate = date.getTime();
      return Math.abs(currDate - targetDate) < Math.abs(prevDate - targetDate) ? curr : prev;
    });

    return closestDateEntry ? closestDateEntry[type] || 0 : 0;
  }

  public static calculateEndDate(startDate: Date, terms: number, holidayMonths: number): Date {
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + terms + holidayMonths);
    return endDate;
  }

  public calculateInstallments(
    type: 'wibor3m' | 'wibor6m',
    params: CalculationParams,
    includeWibor: boolean,
    isFirstClaim: boolean = false,
    isSecondClaim: boolean = false,
  ): Installment[] {
    const {
      loanAmount,
      loanTerms,
      margin,
      firstInstallmentDate,
      gracePeriodMonths,
      prepayments,
      disbursements,
      holidayMonths,
      installmentType,
      startDate,
    } = params;

    let remainingAmount = loanAmount;
    const installments: Installment[] = [];
    const prepaymentMap = new Map(
      prepayments.map((p) => [LoanCalculator.formatDateOnly(new Date(p.date)), p.amount]),
    );
    const disbursementMap = new Map(
      disbursements.map((d) => [LoanCalculator.formatDateOnly(new Date(d.date)), d.amount]),
    );
    const holidayMonthsSet = new Set(
      holidayMonths.map((h) => LoanCalculator.formatDateOnly(new Date(h.date))),
    );

    const fixedWiborRate = isSecondClaim ? params.wiborRate : 0;
    let lastWiborUpdateDate = new Date(firstInstallmentDate);
    let wiborRate = isSecondClaim
      ? fixedWiborRate
      : this.getWiborRate(lastWiborUpdateDate, type, isFirstClaim);

    for (let i = 0; i < loanTerms; i++) {
      const currentDate = new Date(firstInstallmentDate);
      currentDate.setMonth(currentDate.getMonth() + i);

      if (holidayMonthsSet.has(LoanCalculator.formatDateOnly(currentDate))) {
        installments.push({
          date: LoanCalculator.formatDate(currentDate),
          principal: LoanCalculator.formatNumber(0),
          interest: LoanCalculator.formatNumber(0),
          totalPayment: LoanCalculator.formatNumber(0),
          wiborRate: 0,
          remainingAmount,
          wiborWithoutMargin: 0,
        });
        continue;
      }

      if (!isSecondClaim && i % (type === 'wibor3m' ? 3 : 6) === 0) {
        lastWiborUpdateDate = new Date(currentDate);
        wiborRate = this.getWiborRate(lastWiborUpdateDate, type, isFirstClaim);
      }

      remainingAmount += disbursementMap.get(LoanCalculator.formatDateOnly(currentDate)) || 0;

      let principalPayment = 0;
      const currentRate = includeWibor ? margin + wiborRate : margin;
      const interestPayment = (remainingAmount * currentRate) / 12 / 100;

      if (i >= gracePeriodMonths) {
        if (installmentType === 'malejące') {
          principalPayment =
            LoanCalculator.calculatePMT(currentRate / 100 / 12, loanTerms - i, remainingAmount) -
            interestPayment;
        } else {
          principalPayment = remainingAmount / (loanTerms - i);
        }
        remainingAmount -= principalPayment;
      }

      installments.push({
        date: LoanCalculator.formatDate(currentDate),
        principal: LoanCalculator.formatNumber(principalPayment),
        interest: LoanCalculator.formatNumber(interestPayment),
        totalPayment: LoanCalculator.formatNumber(principalPayment + interestPayment),
        wiborRate: currentRate,
        remainingAmount,
        wiborWithoutMargin: includeWibor ? wiborRate : 0,
      });

      const prepaymentAmount = prepaymentMap.get(LoanCalculator.formatDateOnly(currentDate)) ?? 0;
      if (prepaymentAmount > 0) {
        remainingAmount -= prepaymentAmount;
        installments.push({
          date: LoanCalculator.formatDate(currentDate),
          principal: LoanCalculator.formatNumber(prepaymentAmount),
          interest: LoanCalculator.formatNumber(0),
          totalPayment: LoanCalculator.formatNumber(prepaymentAmount),
          wiborRate: 0,
          remainingAmount,
          wiborWithoutMargin: 0,
        });
      }
    }

    return installments;
  }

  public static createClaimResult(
    totalInterestWibor: number,
    totalInterestNoWibor: number,
    loanAmount: number,
    margin: number,
    loanTerms: number,
    initialWiborRate: number,
    mainClaimInterest: number,
    type: 'main' | 'first' | 'second',
  ): ClaimResult {
    let borrowerBenefit, benefitPerInstallment, refund, futureInterest;

    if (type === 'main') {
      borrowerBenefit = totalInterestWibor - totalInterestNoWibor;
      benefitPerInstallment = borrowerBenefit / loanTerms;
      refund = borrowerBenefit * 0.6;
      futureInterest = borrowerBenefit * 0.4;
    } else if (type === 'first') {
      borrowerBenefit = totalInterestWibor - totalInterestNoWibor;
      benefitPerInstallment = borrowerBenefit / loanTerms;
      refund = borrowerBenefit * 0.6;
      futureInterest = borrowerBenefit * 0.4;
    } else {
      borrowerBenefit = totalInterestWibor - totalInterestNoWibor;
      benefitPerInstallment = borrowerBenefit / loanTerms;
      refund = mainClaimInterest - totalInterestNoWibor;
      futureInterest = refund;
    }

    return {
      totalInterestWibor: totalInterestWibor.toFixed(2) + ' zł',
      totalInterestNoWibor: totalInterestNoWibor.toFixed(2) + ' zł',
      variableRate:
        LoanCalculator.calculatePMT((margin + initialWiborRate) / 100 / 12, loanTerms, loanAmount)
          .toFixed(2) + ' zł',
      fixedRate:
        LoanCalculator.calculatePMT((margin + initialWiborRate) / 100 / 12, loanTerms, loanAmount)
          .toFixed(2) + ' zł',
      borrowerBenefit: borrowerBenefit.toFixed(2) + ' zł',
      benefitPerInstallment: benefitPerInstallment.toFixed(2) + ' zł',
      refund: refund.toFixed(2) + ' zł',
      futureInterest: futureInterest.toFixed(2) + ' zł',
    };
  }

  public static calculateInstallment(
    date: Date,
    principal: number,
    interest: number,
    totalRate: number,
    remainingAmount: number,
    wiborRate: number,
  ): Installment {
    return {
      date: LoanCalculator.formatDate(date),
      principal: LoanCalculator.formatNumber(principal),
      interest: LoanCalculator.formatNumber(interest),
      totalPayment: LoanCalculator.formatNumber(principal + interest),
      wiborRate: totalRate,
      remainingAmount,
      wiborWithoutMargin: wiborRate,
    };
  }

  public static calculateTotalInterest(loanAmount: number, rate: number, terms: number): number {
    return (loanAmount * rate * terms) / 100;
  }

  public static calculateTotalInterestFixedWibor(
    loanAmount: number,
    margin: number,
    fixedWiborRate: number,
    loanTerms: number,
  ): number {
    const monthlyRate = (margin + fixedWiborRate) / 100 / 12;
    let totalInterest = 0;
    let remainingAmount = loanAmount;

    for (let i = 0; i < loanTerms; i++) {
      const interestPayment = remainingAmount * monthlyRate;
      totalInterest += interestPayment;
      const principalPayment =
        LoanCalculator.calculatePMT(monthlyRate, loanTerms - i, remainingAmount) -
        interestPayment;
      remainingAmount -= principalPayment;
    }

    return totalInterest;
  }

  public static calculateInstallmentsFixedWibor(
    loanAmount: number,
    loanTerms: number,
    margin: number,
    fixedWiborRate: number,
  ): Installment[] {
    const installments: Installment[] = [];
    const monthlyRate = (margin + fixedWiborRate) / 100 / 12;
    let remainingAmount = loanAmount;

    for (let i = 0; i < loanTerms; i++) {
      const interestPayment = remainingAmount * monthlyRate;
      const principalPayment =
        LoanCalculator.calculatePMT(monthlyRate, loanTerms - i, remainingAmount) -
        interestPayment;
      remainingAmount -= principalPayment;

      installments.push({
        date: LoanCalculator.formatDate(new Date(new Date().setMonth(new Date().getMonth() + i))),
        principal: LoanCalculator.formatNumber(principalPayment),
        interest: LoanCalculator.formatNumber(interestPayment),
        totalPayment: LoanCalculator.formatNumber(principalPayment + interestPayment),
        wiborRate: margin + fixedWiborRate,
        remainingAmount,
        wiborWithoutMargin: fixedWiborRate,
      });
    }

    return installments;
  }

  public static calculateTotalInterestWibor(
    type: 'wibor3m' | 'wibor6m',
    params: CalculationParams,
    wiborData: WiborData[],
  ): number {
    const loanCalculator = new LoanCalculator(wiborData);
    const installments = loanCalculator.calculateInstallments(type, params, true);
    return installments.reduce((sum, installment) => {
      return sum + parseFloat(installment.interest.replace(' zł', '').replace(/\s/g, ''));
    }, 0);
  }

  public static calculateTotalInterestWithoutWibor(
    params: CalculationParams,
    margin: number,
  ): number {
    const { loanAmount, loanTerms } = params;
    return (loanTerms * (loanAmount * (margin / 100))) / 12;
  }

  public static calculateInstallmentsWithoutWibor(
    params: CalculationParams,
    margin: number,
  ): Installment[] {
    const {
      loanAmount,
      loanTerms,
      startDate,
      gracePeriodMonths,
      prepayments,
      disbursements,
      holidayMonths,
      installmentType,
    } = params;
    let remainingAmount = loanAmount;
    const installments: Installment[] = [];
    const prepaymentMap = new Map(
      prepayments.map((p) => [LoanCalculator.formatDateOnly(new Date(p.date)), p.amount]),
    );
    const disbursementMap = new Map(
      disbursements.map((d) => [LoanCalculator.formatDateOnly(new Date(d.date)), d.amount]),
    );
    const holidayMonthsSet = new Set(
      holidayMonths.map((h) => LoanCalculator.formatDateOnly(new Date(h.date))),
    );

    for (let i = 0; i < loanTerms; i++) {
      const currentDate = new Date(startDate);
      currentDate.setMonth(currentDate.getMonth() + i);

      if (holidayMonthsSet.has(LoanCalculator.formatDateOnly(currentDate))) {
        installments.push({
          date: LoanCalculator.formatDate(currentDate),
          principal: LoanCalculator.formatNumber(0),
          interest: LoanCalculator.formatNumber(0),
          totalPayment: LoanCalculator.formatNumber(0),
          wiborRate: 0,
          remainingAmount,
          wiborWithoutMargin: 0,
        });
        continue;
      }

      remainingAmount += disbursementMap.get(LoanCalculator.formatDateOnly(currentDate)) || 0;

      let principalPayment = 0;
      const interestPayment = (remainingAmount * (margin / 100)) / 12;

      if (i >= gracePeriodMonths) {
        if (installmentType === 'malejące') {
          principalPayment = remainingAmount / (loanTerms - i);
        } else {
          principalPayment =
            LoanCalculator.calculatePMT(margin / 100 / 12, loanTerms - i, remainingAmount) -
            interestPayment;
        }
        remainingAmount -= principalPayment;
      }

      installments.push({
        date: LoanCalculator.formatDate(currentDate),
        principal: LoanCalculator.formatNumber(principalPayment),
        interest: LoanCalculator.formatNumber(interestPayment),
        totalPayment: LoanCalculator.formatNumber(principalPayment + interestPayment),
        wiborRate: margin,
        remainingAmount,
        wiborWithoutMargin: 0,
      });

      const prepaymentAmount = prepaymentMap.get(LoanCalculator.formatDateOnly(currentDate)) ?? 0;
      if (prepaymentAmount > 0) {
        remainingAmount -= prepaymentAmount;
        installments.push({
          date: LoanCalculator.formatDate(currentDate),
          principal: LoanCalculator.formatNumber(prepaymentAmount),
          interest: LoanCalculator.formatNumber(0),
          totalPayment: LoanCalculator.formatNumber(prepaymentAmount),
          wiborRate: 0,
          remainingAmount,
          wiborWithoutMargin: 0,
        });
      }
    }

    return installments;
  }

  public sumInterestFromUnknownWiborDate(
    type: 'wibor3m' | 'wibor6m',
    params: CalculationParams
  ): number {
    const { loanAmount, loanTerms, margin, startDate } = params;
  
    let totalInterest = 0;
    let remainingAmount = loanAmount;
    let currentDate = new Date(startDate);
  
    // Sort WIBOR data to find the last known WIBOR date
    const sortedWiborData = [...this.wiborData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  
    const lastWiborDate = new Date(sortedWiborData[sortedWiborData.length - 1].date);
  
    for (let i = 0; i < loanTerms; i++) {
      const currentWiborRate = this.getWiborRate(currentDate, type, false);
  
      if (currentDate >= lastWiborDate) {
        const monthlyRate = (margin + currentWiborRate) / 100 / 12;
        const interestPayment = remainingAmount * monthlyRate;
        totalInterest += interestPayment;
      }
  
      // Move to the next month
      currentDate.setMonth(currentDate.getMonth() + 1);
  
      // Calculate principal payment for the remaining amount
      remainingAmount -= this.calculatePrincipalPayment(margin, currentWiborRate, remainingAmount, loanTerms - i);
    }
  
    return totalInterest;
  }
  
  private calculatePrincipalPayment(
    margin: number,
    wiborRate: number,
    remainingAmount: number,
    monthsLeft: number
  ): number {
    const monthlyRate = (margin + wiborRate) / 100 / 12;
    return LoanCalculator.calculatePMT(monthlyRate, monthsLeft, remainingAmount) - (remainingAmount * monthlyRate);
  }
  
}

export default LoanCalculator;
