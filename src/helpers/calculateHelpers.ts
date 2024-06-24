import { WiborData } from '../store/reducers/wiborReducer';
import { CalculationParams, Installment, ClaimResult } from '../types';

export const getWiborRate = (
  date: Date,
  type: 'wibor3m' | 'wibor6m',
  wiborData: WiborData[],
): number => {
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

const formatDateOnly = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}-01`; 
};

export const calculateEndDate = (
  startDate: Date | string,
  terms: number,
  holidayMonths: number,
): string => {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + terms + holidayMonths);
  return endDate.toISOString().split('T')[0]; // format in YYYY-MM-DD
};

export const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export const formatNumber = (value: number): string =>
  value.toLocaleString('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const calculateInstallments = (
  type: 'wibor3m' | 'wibor6m',
  params: CalculationParams,
  wiborData: WiborData[],
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
    prepayments.map((p) => [formatDateOnly(new Date(p.date)), p.amount]),
  );
  const disbursementMap = new Map(
    disbursements.map((d) => [formatDateOnly(new Date(d.date)), d.amount]),
  );
  const holidayMonthsSet = new Set(
    holidayMonths.map((h) => formatDateOnly(new Date(h.date))),
  );
  let lastWiborUpdateDate = new Date(startDate);

  for (let i = 0; i < loanTerms; i++) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(currentDate.getMonth() + i);
    // Sprawdzenie, czy miesiąc jest wakacjami kredytowymi
    if (holidayMonthsSet.has(formatDateOnly(currentDate))) {
      installments.push({
        date: formatDate(currentDate),
        principal: formatNumber(0),
        interest: formatNumber(0),
        totalPayment: formatNumber(0),
        wiborRate: 0,
      });
      continue;
    }

    // Aktualizacja stawki WIBOR co 3 lub 6 miesięcy
    if (i % (type === 'wibor3m' ? 3 : 6) === 0) {
      lastWiborUpdateDate = new Date(currentDate);
    }

    remainingAmount += disbursementMap.get(formatDateOnly(currentDate)) || 0;

    let principalPayment = 0;
    const wiborRate = getWiborRate(lastWiborUpdateDate, type, wiborData);
    const interestPayment = (remainingAmount * (margin + wiborRate)) / 12 / 100;

    // Sprawdzenie, czy miesiąc jest w okresie karencji
    if (i >= gracePeriodMonths) {
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

    // Obsługa nadpłat
    const prepaymentAmount =
      prepaymentMap.get(formatDateOnly(currentDate)) ?? 0;
    if (prepaymentAmount > 0) {
      console.log(prepaymentAmount);
      remainingAmount -= prepaymentAmount;
      installments.push({
        date: formatDate(currentDate),
        principal: formatNumber(prepaymentAmount),
        interest: formatNumber(0),
        totalPayment: formatNumber(prepaymentAmount),
        wiborRate: 0,
      });
    }
  }

  return installments;
};

export const calculateTotalInterest = (
  loanAmount: number,
  rate: number,
  terms: number,
): number => (loanAmount * rate * terms) / 100;

export const createClaimResult = (
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
