import {
  calculateInstallments,
  getWiborRate,
  createClaimResult,
  calculateEndDate,
} from '../../helpers/calculateHelpers';
import { WiborData } from '../../store/reducers/wiborReducer';
import {
  CalculationParams,
  CalculationResults,
  Installment,
} from '../../types';

export const calculateResults = (
  params: CalculationParams,
  wiborData: WiborData[],
): CalculationResults => {
  const { loanAmount, loanTerms, margin, startDate, holidayMonths, wiborRate } =
    params;

  const installmentsMainClaim3M = calculateInstallments(
    'wibor3m',
    params,
    wiborData,
    true,
    false, // not first claim
    false, // not second claim
  );

  const installmentsMainClaim6M = calculateInstallments(
    'wibor6m',
    params,
    wiborData,
    true,
    false, // not first claim
    false, // not second claim
  );

  const installmentsFirstClaim3M = calculateInstallments(
    'wibor3m',
    params,
    wiborData,
    false,
    true, // first claim
    false, // not second claim
  );

  const installmentsFirstClaim6M = calculateInstallments(
    'wibor6m',
    params,
    wiborData,
    false,
    true, // first claim
    false, // not second claim
  );

  const installmentsSecondClaim3M = calculateInstallments(
    'wibor3m',
    params,
    wiborData,
    true,
    false, // not first claim
    true, // second claim
  );

  const installmentsSecondClaim6M = calculateInstallments(
    'wibor6m',
    params,
    wiborData,
    true,
    false, // not first claim
    true, // second claim
  );

  const totalInterestWibor3M = installmentsMainClaim3M.reduce(
    (sum: number, installment: Installment) =>
      sum +
      parseFloat(installment.interest.replace(' zł', '').replace(/\s/g, '')),
    0,
  );

  const totalInterestWibor6M = installmentsMainClaim6M.reduce(
    (sum: number, installment: Installment) =>
      sum +
      parseFloat(installment.interest.replace(' zł', '').replace(/\s/g, '')),
    0,
  );

  const totalInterestWithoutWibor3M = installmentsFirstClaim3M.reduce(
    (sum: number, installment: Installment) =>
      sum +
      parseFloat(installment.interest.replace(' zł', '').replace(/\s/g, '')),
    0,
  );

  const totalInterestWithoutWibor6M = installmentsFirstClaim6M.reduce(
    (sum: number, installment: Installment) =>
      sum +
      parseFloat(installment.interest.replace(' zł', '').replace(/\s/g, '')),
    0,
  );

  const totalInterestFixedWibor3M = installmentsSecondClaim3M.reduce(
    (sum: number, installment: Installment) =>
      sum +
      parseFloat(installment.interest.replace(' zł', '').replace(/\s/g, '')),
    0,
  );

  const totalInterestFixedWibor6M = installmentsSecondClaim6M.reduce(
    (sum: number, installment: Installment) =>
      sum +
      parseFloat(installment.interest.replace(' zł', '').replace(/\s/g, '')),
    0,
  );

  // Calculate refund for overpaid interest
  const refundOverpaidInterest3M =
    totalInterestWibor3M - totalInterestFixedWibor3M;
  const refundOverpaidInterest6M =
    totalInterestWibor6M - totalInterestFixedWibor6M;

  // Calculate value of future canceled interest
  const futureCanceledInterest3M =
    installmentsMainClaim3M
      .slice(Math.floor(installmentsMainClaim3M.length / 2))
      .reduce(
        (sum: number, installment: Installment) =>
          sum +
          parseFloat(
            installment.interest.replace(' zł', '').replace(/\s/g, ''),
          ),
        0,
      ) -
    installmentsSecondClaim3M
      .slice(Math.floor(installmentsSecondClaim3M.length / 2))
      .reduce(
        (sum: number, installment: Installment) =>
          sum +
          parseFloat(
            installment.interest.replace(' zł', '').replace(/\s/g, ''),
          ),
        0,
      );

  const futureCanceledInterest6M =
    installmentsMainClaim6M
      .slice(Math.floor(installmentsMainClaim6M.length / 2))
      .reduce(
        (sum: number, installment: Installment) =>
          sum +
          parseFloat(
            installment.interest.replace(' zł', '').replace(/\s/g, ''),
          ),
        0,
      ) -
    installmentsSecondClaim6M
      .slice(Math.floor(installmentsSecondClaim6M.length / 2))
      .reduce(
        (sum: number, installment: Installment) =>
          sum +
          parseFloat(
            installment.interest.replace(' zł', '').replace(/\s/g, ''),
          ),
        0,
      );

  // Calculate total benefit for the borrower
  const borrowerBenefit3M = refundOverpaidInterest3M + futureCanceledInterest3M;
  const borrowerBenefit6M = refundOverpaidInterest6M + futureCanceledInterest6M;

  const mainClaim3M = createClaimResult(
    totalInterestWibor3M,
    0,
    loanAmount,
    margin,
    loanTerms,
    wiborRate,
    0, // mainClaimInterest is not applicable for main claim
    'main',
  );

  const mainClaim6M = createClaimResult(
    totalInterestWibor6M,
    0,
    loanAmount,
    margin,
    loanTerms,
    wiborRate,
    0, // mainClaimInterest is not applicable for main claim
    'main',
  );

  const firstClaim3M = createClaimResult(
    totalInterestWibor3M,
    totalInterestWithoutWibor3M,
    loanAmount,
    margin,
    loanTerms,
    wiborRate,
    0, // mainClaimInterest is not applicable for first claim
    'first',
  );

  const firstClaim6M = createClaimResult(
    totalInterestWibor6M,
    totalInterestWithoutWibor6M,
    loanAmount,
    margin,
    loanTerms,
    wiborRate,
    0, // mainClaimInterest is not applicable for first claim
    'first',
  );

  const secondClaim3M = createClaimResult(
    totalInterestFixedWibor3M,
    totalInterestWibor3M,
    loanAmount,
    margin,
    loanTerms,
    wiborRate,
    refundOverpaidInterest3M,
    'second',
  );

  const secondClaim6M = createClaimResult(
    totalInterestFixedWibor6M,
    totalInterestWibor6M,
    loanAmount,
    margin,
    loanTerms,
    wiborRate,
    refundOverpaidInterest6M,
    'second',
  );

  return {
    mainClaim3M,
    mainClaim6M,
    firstClaim3M,
    firstClaim6M,
    secondClaim3M,
    secondClaim6M,
    installmentsMainClaim3M,
    installmentsMainClaim6M,
    installmentsFirstClaim3M,
    installmentsFirstClaim6M,
    installmentsSecondClaim3M,
    installmentsSecondClaim6M,
    refundOverpaidInterest3M,
    refundOverpaidInterest6M,
    futureCanceledInterest3M,
    futureCanceledInterest6M,
    borrowerBenefit3M,
    borrowerBenefit6M,
    startDate,
    endDate: calculateEndDate(startDate, loanTerms, holidayMonths.length),
    loanAmount,
    currentRate: margin,
  };
};
