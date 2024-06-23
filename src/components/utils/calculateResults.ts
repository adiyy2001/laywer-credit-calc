import { WiborData } from '../../store/reducers/wiborReducer';
import {
  calculateTotalInterest,
  createClaimResult,
  calculateInstallments,
  calculateEndDate,
} from '../../helpers/calculateHelpers';
import { CalculationParams, CalculationResults } from '../../types';

export const calculateResults = (
  params: CalculationParams,
  wiborData: WiborData[],
): CalculationResults => {
  const { loanAmount, loanTerms, margin, startDate, holidayMonths } = params;

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
    installmentsWibor3M: calculateInstallments('wibor3m', params, wiborData),
    installmentsWibor6M: calculateInstallments('wibor6m', params, wiborData),
    startDate,
    endDate: calculateEndDate(startDate, loanTerms, holidayMonths.length),
    loanAmount,
    currentRate: margin,
  };
};
