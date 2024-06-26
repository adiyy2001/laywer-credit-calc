import { WiborData } from '../../store/reducers/wiborReducer';
import {
  calculateInstallments,
  calculateEndDate,
  getWiborRate,
  createClaimResult,
  calculateInstallmentsFixedWibor,
} from '../../helpers/calculateHelpers';
import { CalculationParams, CalculationResults } from '../../types';

export const calculateResults = (
  params: CalculationParams,
  wiborData: WiborData[],
): CalculationResults => {
  const { loanAmount, loanTerms, margin, startDate, holidayMonths } = params;

  const initialWiborRate = getWiborRate(
    new Date(startDate),
    'wibor3m',
    wiborData,
  );

  // Obliczanie odsetek dla WIBOR 3M
  const installmentsWibor3M = calculateInstallments(
    'wibor3m',
    params,
    wiborData,
  );
  const totalInterestWibor3M = installmentsWibor3M.reduce(
    (sum, installment) =>
      sum +
      parseFloat(installment.interest.replace(' zł', '').replace(/\s/g, '')),
    0,
  );

  // Główne roszczenie: bez WIBORU i marży
  const totalInterestNoWibor = 0;
  const mainClaim = createClaimResult(
    totalInterestWibor3M,
    totalInterestNoWibor,
    loanAmount,
    margin,
    loanTerms,
    initialWiborRate,
  );

  // I roszczenie ewentualne: bez WIBORU, tylko marża
  const totalInterestWithoutWibor = installmentsWibor3M.reduce(
    (sum, installment) => sum + (loanAmount * (margin / 100)) / 12,
    0,
  );
  const firstClaim = createClaimResult(
    totalInterestWibor3M,
    totalInterestWithoutWibor,
    loanAmount,
    margin,
    loanTerms,
    initialWiborRate,
  );

  // II roszczenie ewentualne: WIBOR 3M jako stałe oprocentowanie
  const fixedWiborRate = initialWiborRate; // Stała wartość WIBOR 3M na początku umowy

  // Obliczanie odsetek dla stałego WIBOR 3M
  const installmentsFixedWibor = calculateInstallmentsFixedWibor(
    loanAmount,
    loanTerms,
    margin,
    fixedWiborRate,
  );

  const totalInterestFixedWibor = installmentsFixedWibor.reduce(
    (sum, installment) =>
      sum +
      parseFloat(installment.interest.replace(' zł', '').replace(/\s/g, '')),
    0,
  );

  const secondClaim = createClaimResult(
    totalInterestWibor3M,
    totalInterestFixedWibor,
    loanAmount,
    margin,
    loanTerms,
    fixedWiborRate,
  );

  return {
    mainClaim,
    firstClaim,
    secondClaim,
    installmentsWibor3M,
    installmentsWibor6M: calculateInstallments('wibor6m', params, wiborData),
    startDate,
    endDate: calculateEndDate(startDate, loanTerms, holidayMonths.length),
    loanAmount,
    currentRate: margin,
  };
};
