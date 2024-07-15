import { WiborData } from '../store/reducers/wiborReducer';
import { CalculationParams, Installment, ClaimResult } from '../types';

export const getWiborRate = (
  date: Date,
  type: 'wibor3m' | 'wibor6m',
  wiborData: WiborData[],
  isFirstClaim: boolean,
): number => {
  if (!wiborData || wiborData.length === 0) return 0;

  // Create a copy of the array and sort it
  const sortedWiborData = [...wiborData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Check the last available entry in the WIBOR data
  const lastDateEntry = new Date(
    sortedWiborData[sortedWiborData.length - 1].date,
  );

  // For first claim, return 0 if the date exceeds the last available entry
  if (date > lastDateEntry) {
    return isFirstClaim
      ? 0
      : sortedWiborData[sortedWiborData.length - 1][type] || 0;
  }

  const closestDateEntry = sortedWiborData.reduce((prev, curr) => {
    const prevDate = new Date(prev.date).getTime();
    const currDate = new Date(curr.date).getTime();
    const targetDate = date.getTime();
    return Math.abs(currDate - targetDate) < Math.abs(prevDate - targetDate)
      ? curr
      : prev;
  });

  return closestDateEntry ? closestDateEntry[type] || 0 : 0;
};

const formatDateOnly = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}-01`;
};

export const calculateEndDate = (
  startDate: Date,
  terms: number,
  holidayMonths: number,
): Date => {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + terms + holidayMonths);
  return endDate;
};

export const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export const formatNumber = (value: number): string => {
  // Use toFixed to round the number to 2 decimal places
  const fixedValue = value.toFixed(2);

  // Split the number into integer and fractional parts
  const [integerPart, fractionalPart] = fixedValue.split('.');

  // Format the integer part, adding spaces every three digits
  const formattedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ' ',
  );

  // Return the formatted number as a string with "zł" and "gr" units
  return `${formattedIntegerPart}, ${fractionalPart}`;
};

function calculatePMT(rate: number, nper: number, pv: number): number {
  return (rate * pv) / (1 - Math.pow(1 + rate, -nper));
}

export const calculateInstallments = (
  type: 'wibor3m' | 'wibor6m',
  params: CalculationParams,
  wiborData: WiborData[],
  includeWibor: boolean,
  isFirstClaim: boolean = false,
  isSecondClaim: boolean = false,
): Installment[] => {
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
    prepayments.map((p) => [formatDateOnly(new Date(p.date)), p.amount]),
  );
  const disbursementMap = new Map(
    disbursements.map((d) => [formatDateOnly(new Date(d.date)), d.amount]),
  );
  const holidayMonthsSet = new Set(
    holidayMonths.map((h) => formatDateOnly(new Date(h.date))),
  );

  // Get the fixed WIBOR rate for the second claim
  const fixedWiborRate = isSecondClaim
    ? params.wiborRate // Use the provided fixed WIBOR rate for the second claim
    : 0;

  let lastWiborUpdateDate = new Date(firstInstallmentDate);
  let wiborRate = isSecondClaim
    ? fixedWiborRate
    : getWiborRate(lastWiborUpdateDate, type, wiborData, isFirstClaim);

  for (let i = 0; i < loanTerms; i++) {
    const currentDate = new Date(firstInstallmentDate);
    currentDate.setMonth(currentDate.getMonth() + i);

    if (holidayMonthsSet.has(formatDateOnly(currentDate))) {
      installments.push({
        date: formatDate(currentDate),
        principal: formatNumber(0),
        interest: formatNumber(0),
        totalPayment: formatNumber(0),
        wiborRate: 0,
        remainingAmount: formatNumber(remainingAmount),
        wiborWithoutMargin: 0,
      });
      continue;
    }

    if (!isSecondClaim && i % (type === 'wibor3m' ? 3 : 6) === 0) {
      lastWiborUpdateDate = new Date(currentDate);
      wiborRate = getWiborRate(
        lastWiborUpdateDate,
        type,
        wiborData,
        isFirstClaim,
      );
    }

    remainingAmount += disbursementMap.get(formatDateOnly(currentDate)) || 0;

    let principalPayment = 0;
    const currentRate = includeWibor ? margin + wiborRate : margin;
    const interestPayment = (remainingAmount * currentRate) / 12 / 100;

    if (i >= gracePeriodMonths) {
      if (installmentType === 'malejące') {
        principalPayment =
          calculatePMT(currentRate / 100 / 12, loanTerms - i, remainingAmount) -
          interestPayment;
      } else {
        principalPayment = remainingAmount / (loanTerms - i);
      }
      remainingAmount -= principalPayment;
    }

    installments.push({
      date: formatDate(currentDate),
      principal: formatNumber(principalPayment),
      interest: formatNumber(interestPayment),
      totalPayment: formatNumber(principalPayment + interestPayment),
      wiborRate: currentRate,
      remainingAmount: formatNumber(remainingAmount),
      wiborWithoutMargin: includeWibor ? wiborRate : 0,
    });

    const prepaymentAmount =
      prepaymentMap.get(formatDateOnly(currentDate)) ?? 0;
    if (prepaymentAmount > 0) {
      remainingAmount -= prepaymentAmount;
      installments.push({
        date: formatDate(currentDate),
        principal: formatNumber(prepaymentAmount),
        interest: formatNumber(0),
        totalPayment: formatNumber(prepaymentAmount),
        wiborRate: 0,
        remainingAmount: formatNumber(remainingAmount),
        wiborWithoutMargin: 0,
      });
    }
  }

  return installments;
};

export const calculateTotalInterest = (
  loanAmount: number,
  rate: number,
  terms: number,
): number => {
  return (loanAmount * rate * terms) / 100;
};

export const createClaimResult = (
  totalInterestWibor: number,
  totalInterestNoWibor: number,
  loanAmount: number,
  margin: number,
  loanTerms: number,
  initialWiborRate: number,
  mainClaimInterest: number,
  type: 'main' | 'first' | 'second',
): ClaimResult => {
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
      calculatePMT(
        (margin + initialWiborRate) / 100 / 12,
        loanTerms,
        loanAmount,
      ).toFixed(2) + ' zł',
    fixedRate:
      calculatePMT(
        (margin + initialWiborRate) / 100 / 12,
        loanTerms,
        loanAmount,
      ).toFixed(2) + ' zł',
    borrowerBenefit: borrowerBenefit.toFixed(2) + ' zł',
    benefitPerInstallment: benefitPerInstallment.toFixed(2) + ' zł',
    refund: refund.toFixed(2) + ' zł',
    futureInterest: futureInterest.toFixed(2) + ' zł',
  };
};

export const calculateInstallment = (
  date: Date,
  principal: number,
  interest: number,
  totalRate: number,
  remainingAmount: number,
  wiborRate: number,
): Installment => ({
  date: formatDate(date),
  principal: formatNumber(principal),
  interest: formatNumber(interest),
  totalPayment: formatNumber(principal + interest),
  wiborRate: totalRate,
  remainingAmount: formatNumber(remainingAmount),
  wiborWithoutMargin: wiborRate,
});

export const calculateTotalInterestFixedWibor = (
  loanAmount: number,
  margin: number,
  fixedWiborRate: number,
  loanTerms: number,
): number => {
  const monthlyRate = (margin + fixedWiborRate) / 100 / 12;
  let totalInterest = 0;
  let remainingAmount = loanAmount;

  for (let i = 0; i < loanTerms; i++) {
    const interestPayment = remainingAmount * monthlyRate;
    totalInterest += interestPayment;
    const principalPayment =
      calculatePMT(monthlyRate, loanTerms - i, remainingAmount) -
      interestPayment;
    remainingAmount -= principalPayment;
  }

  return totalInterest;
};

export const calculateInstallmentsFixedWibor = (
  loanAmount: number,
  loanTerms: number,
  margin: number,
  fixedWiborRate: number,
): Installment[] => {
  const installments: Installment[] = [];
  const monthlyRate = (margin + fixedWiborRate) / 100 / 12;
  let remainingAmount = loanAmount;

  for (let i = 0; i < loanTerms; i++) {
    const interestPayment = remainingAmount * monthlyRate;
    const principalPayment =
      calculatePMT(monthlyRate, loanTerms - i, remainingAmount) -
      interestPayment;
    remainingAmount -= principalPayment;

    installments.push({
      date: formatDate(
        new Date(new Date().setMonth(new Date().getMonth() + i)),
      ),
      principal: formatNumber(principalPayment),
      interest: formatNumber(interestPayment),
      totalPayment: formatNumber(principalPayment + interestPayment),
      wiborRate: margin + fixedWiborRate,
      remainingAmount: formatNumber(remainingAmount),
      wiborWithoutMargin: fixedWiborRate,
    });
  }

  return installments;
};

// Calculate total interest for WIBOR 3M
export const calculateTotalInterestWibor = (
  type: 'wibor3m' | 'wibor6m',
  params: CalculationParams,
  wiborData: WiborData[],
): number => {
  const installments = calculateInstallments(type, params, wiborData, true);
  return installments.reduce((sum, installment) => {
    return (
      sum +
      parseFloat(installment.interest.replace(' zł', '').replace(/\s/g, ''))
    );
  }, 0);
};

// Calculate total interest without WIBOR (only margin)
export const calculateTotalInterestWithoutWibor = (
  params: CalculationParams,
  margin: number,
): number => {
  const { loanAmount, loanTerms } = params;
  return (loanTerms * (loanAmount * (margin / 100))) / 12;
};

export const calculateInstallmentsWithoutWibor = (
  params: CalculationParams,
  margin: number,
): Installment[] => {
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
    prepayments.map((p) => [formatDateOnly(new Date(p.date)), p.amount]),
  );
  const disbursementMap = new Map(
    disbursements.map((d) => [formatDateOnly(new Date(d.date)), d.amount]),
  );
  const holidayMonthsSet = new Set(
    holidayMonths.map((h) => formatDateOnly(new Date(h.date))),
  );

  for (let i = 0; i < loanTerms; i++) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(currentDate.getMonth() + i);

    if (holidayMonthsSet.has(formatDateOnly(currentDate))) {
      installments.push({
        date: formatDate(currentDate),
        principal: formatNumber(0),
        interest: formatNumber(0),
        totalPayment: formatNumber(0),
        wiborRate: 0,
        remainingAmount: formatNumber(remainingAmount),
        wiborWithoutMargin: 0,
      });
      continue;
    }

    remainingAmount += disbursementMap.get(formatDateOnly(currentDate)) || 0;

    let principalPayment = 0;
    const interestPayment = (remainingAmount * (margin / 100)) / 12;

    if (i >= gracePeriodMonths) {
      if (installmentType === 'malejące') {
        principalPayment = remainingAmount / (loanTerms - i);
      } else {
        principalPayment =
          calculatePMT(margin / 100 / 12, loanTerms - i, remainingAmount) -
          interestPayment;
      }
      remainingAmount -= principalPayment;
    }

    installments.push({
      date: formatDate(currentDate),
      principal: formatNumber(principalPayment),
      interest: formatNumber(interestPayment),
      totalPayment: formatNumber(principalPayment + interestPayment),
      wiborRate: margin,
      remainingAmount: formatNumber(remainingAmount),
      wiborWithoutMargin: 0,
    });

    const prepaymentAmount =
      prepaymentMap.get(formatDateOnly(currentDate)) ?? 0;
    if (prepaymentAmount > 0) {
      remainingAmount -= prepaymentAmount;
      installments.push({
        date: formatDate(currentDate),
        principal: formatNumber(prepaymentAmount),
        interest: formatNumber(0),
        totalPayment: formatNumber(prepaymentAmount),
        wiborRate: 0,
        remainingAmount: formatNumber(remainingAmount),
        wiborWithoutMargin: 0,
      });
    }
  }

  return installments;
};
