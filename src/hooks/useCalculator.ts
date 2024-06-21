import { useContext } from 'react';
import {
  CalculationParams,
  CalculationResults,
  Installment,
  ClaimResult,
} from '../types';
import { WiborContext } from '../contexts/WiborContext';

const useCalculator = (params: CalculationParams | null): CalculationResults | null => {
  if(!!!params) {
    return null
  }
  const { wiborData } = useContext(WiborContext);

  const {
    loanAmount,
    loanTerms,
    margin,
    startDate,
  } = params;

  const validateInputs = (params: CalculationParams): void => {
    const {
      loanAmount,
      loanTerms,
      margin,
      startDate,
      endDate,
      prepayments,
      disbursements,
    } = params;

    if (loanAmount <= 0) {
      throw new Error('Kwota kredytu musi być większa niż 0');
    }
    if (loanTerms <= 0) {
      throw new Error('Ilość rat musi być większa niż 0');
    }
    if (margin <= 0) {
      throw new Error('Marża musi być większa niż 0');
    }
    if (startDate >= endDate) {
      throw new Error(
        'Data podpisania musi być wcześniejsza niż data pierwszej raty',
      );
    }

    prepayments.forEach(({ date, amount }) => {
      if (date <= startDate) {
        throw new Error('Nadpłata musi być po dacie podpisania');
      }
      if (amount <= 0) {
        throw new Error('Kwota nadpłaty musi być większa niż 0');
      }
    });

    disbursements.forEach(({ date, amount }) => {
      if (date <= startDate) {
        throw new Error('Transza musi być po dacie podpisania');
      }
      if (amount <= 0) {
        throw new Error('Kwota transzy musi być większa niż 0');
      }
    });
  };

  validateInputs(params);

  const getWiborRate = (date: Date, type: 'wibor3m' | 'wibor6m'): number => {
    if (!wiborData) {
      return 0;
    }

    const closestDateEntry = wiborData.reduce((prev, curr) => {
      const prevDate = new Date(prev.date).getTime();
      const currDate = new Date(curr.date).getTime();
      const targetDate = date.getTime();
      return Math.abs(currDate - targetDate) < Math.abs(prevDate - targetDate)
        ? curr
        : prev;
    });

    return closestDateEntry ? closestDateEntry[type] || 0 : 0;
  };

  const calculateEndDate = (startDate: Date, terms: number): Date => {
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + terms);
    return endDate;
  };

  const formatDate = (date: Date): string => date.toLocaleDateString('pl-PL');

  const formatNumber = (value: number): string =>
    value.toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const calculateInstallments = (
    type: 'wibor3m' | 'wibor6m',
    params: CalculationParams,
  ): Installment[] => {
    const {
      loanAmount,
      loanTerms,
      margin,
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
      prepayments.map((p) => [p.date.getTime(), p.amount]),
    );
    const disbursementMap = new Map(
      disbursements.map((d) => [d.date.getTime(), d.amount]),
    );
    let lastWiborUpdateDate = new Date(startDate);

    for (let i = 0; i < loanTerms + holidayMonths.length; i++) {
      const currentDate = new Date(startDate);
      currentDate.setMonth(currentDate.getMonth() + i);

      if (holidayMonths.includes(currentDate.getMonth())) {
        installments.push({
          date: formatDate(currentDate),
          principal: formatNumber(0),
          interest: formatNumber(0),
          totalPayment: formatNumber(0),
          wiborRate: 0,
        });
        continue;
      }

      if (i % (type === 'wibor3m' ? 3 : 6) === 0) {
        lastWiborUpdateDate = new Date(currentDate);
      }

      remainingAmount += disbursementMap.get(currentDate.getTime()) || 0;

      let principalPayment = 0;
      const wiborRate = getWiborRate(lastWiborUpdateDate, type);
      const interestPayment =
        (remainingAmount * (margin + wiborRate)) / 12 / 100;

      if (
        i >= gracePeriodMonths &&
        !holidayMonths.includes(currentDate.getMonth())
      ) {
        if (installmentType === 'malejące') {
          principalPayment = remainingAmount / (loanTerms - i);
        } else {
          principalPayment = loanAmount / loanTerms;
        }
        remainingAmount -= principalPayment;
      }

      const installment = calculateInstallment(
        currentDate,
        principalPayment,
        interestPayment,
        wiborRate,
      );
      installments.push(installment);

      const prepaymentAmount = prepaymentMap.get(currentDate.getTime()) || 0;
      remainingAmount -= prepaymentAmount;
    }

    return installments;
  };

  const calculateInstallment = (
    date: Date,
    principal: number,
    interest: number,
    wiborRate: number,
  ): Installment => ({
    date: formatDate(date),
    principal: formatNumber(principal),
    interest: formatNumber(interest),
    totalPayment: formatNumber(principal + interest),
    wiborRate: wiborRate,
  });

  const totalInterestWibor = calculateTotalInterest(
    loanAmount,
    margin,
    loanTerms,
  );
  const totalInterestNoWibor = 0;
  const mainClaim = createClaimResult(
    totalInterestWibor,
    totalInterestNoWibor,
    loanAmount,
    margin,
    loanTerms,
  );

  return {
    mainClaim,
    firstClaim: createClaimResult(
      totalInterestWibor * 0.3,
      totalInterestNoWibor * 0.3,
      loanAmount,
      margin,
      loanTerms,
    ),
    secondClaim: createClaimResult(
      totalInterestWibor * 0.7,
      totalInterestNoWibor * 0.7,
      loanAmount,
      margin,
      loanTerms,
    ),
    installmentsWibor3M: calculateInstallments('wibor3m', params),
    installmentsWibor6M: calculateInstallments('wibor6m', params),
    startDate,
    endDate: calculateEndDate(startDate, loanTerms),
    loanAmount,
    currentRate: margin,
  };
};

const calculateTotalInterest = (
  loanAmount: number,
  rate: number,
  terms: number,
): number => (loanAmount * rate * terms) / 100;

const createClaimResult = (
  totalInterestWibor: number,
  totalInterestNoWibor: number,
  loanAmount: number,
  margin: number,
  loanTerms: number,
): ClaimResult => {
  const variableRate = (loanAmount * margin) / loanTerms;
  const fixedRate = (loanAmount * margin) / loanTerms;
  const borrowerBenefit = totalInterestWibor - totalInterestNoWibor;
  const benefitPerInstallment = variableRate - fixedRate;
  const refund = borrowerBenefit * 0.4;
  const futureInterest = borrowerBenefit * 0.6;

  return {
    totalInterestWibor: totalInterestWibor.toFixed(2) + ' zł',
    totalInterestNoWibor: totalInterestNoWibor.toFixed(2) + ' zł',
    variableRate: variableRate.toFixed(2) + ' zł',
    fixedRate: fixedRate.toFixed(2) + ' zł',
    borrowerBenefit: borrowerBenefit.toFixed(2) + ' zł',
    benefitPerInstallment: benefitPerInstallment.toFixed(2) + ' zł',
    refund: refund.toFixed(2) + ' zł',
    futureInterest: futureInterest.toFixed(2) + ' zł',
  };
};

export default useCalculator;
