import LoanCalculator from '../../helpers/calculateHelpers';
import { WiborData } from '../../store/reducers/wiborReducer';
import { CalculationParams, CalculationResults, Installment } from '../../types';

export const calculateResults = (
  params: CalculationParams,
  wiborData: WiborData[],
): CalculationResults => {
  const { loanAmount, loanTerms, margin, startDate, holidayMonths, wiborRate } = params;

  const loanCalculator = new LoanCalculator(wiborData);

  const generateInstallments = (type: 'wibor3m' | 'wibor6m', isFirst: boolean, isSecond: boolean) => 
    loanCalculator.calculateInstallments(type, params, !isFirst, isFirst, isSecond);

  const installmentsMainClaim3M = generateInstallments('wibor3m', false, false);
  const installmentsMainClaim6M = generateInstallments('wibor6m', false, false);
  const installmentsFirstClaim3M = generateInstallments('wibor3m', true, false);
  const installmentsFirstClaim6M = generateInstallments('wibor6m', true, false);
  const installmentsSecondClaim3M = generateInstallments('wibor3m', false, true);
  const installmentsSecondClaim6M = generateInstallments('wibor6m', false, true);
  const futureInterestSecondClaim = loanCalculator.sumInterestFromUnknownWiborDate('wibor3m', params)
  const calculateTotalInterest = (installments: Installment[]): number => {
    return installments.reduce((sum: number, installment: Installment) => {
      const interest = parseFloat(installment.interest.replace(' zł', '').replace(/\s/g, ''));
      return sum + (isNaN(interest) ? 0 : interest);
    }, 0);
  };

  // Obliczenia dla mainClaim
  const totalInterestWibor3M = calculateTotalInterest(installmentsMainClaim3M);
  const totalInterestWibor6M = calculateTotalInterest(installmentsMainClaim6M);
  const totalInterestWithoutWibor3M = calculateTotalInterest(installmentsFirstClaim3M);
  const totalInterestWithoutWibor6M = calculateTotalInterest(installmentsFirstClaim6M);

  // Obliczenia dla secondClaim
  const actualInterestPaidToDate3M = calculateTotalInterest(installmentsMainClaim3M.slice(0, Math.floor(installmentsMainClaim3M.length / 2)));
  const actualInterestPaidToDate6M = calculateTotalInterest(installmentsMainClaim6M.slice(0, Math.floor(installmentsMainClaim6M.length / 2)));
  const fixedInterestPaidToDate3M = calculateTotalInterest(installmentsSecondClaim3M.slice(0, Math.floor(installmentsSecondClaim3M.length / 2)));
  const fixedInterestPaidToDate6M = calculateTotalInterest(installmentsSecondClaim6M.slice(0, Math.floor(installmentsSecondClaim6M.length / 2)));

  // Zwrot do klienta nadpłaconych odsetek
  const refundSecondClaim3M = actualInterestPaidToDate3M - fixedInterestPaidToDate3M;
  const refundSecondClaim6M = actualInterestPaidToDate6M - fixedInterestPaidToDate6M;

  // Odsetki zmienne oprocentowanie od momentu przeliczenia kredytu
  const futureInterestWibor3M = calculateTotalInterest(installmentsMainClaim3M.slice(Math.floor(installmentsMainClaim3M.length / 2)));
  const futureInterestWibor6M = calculateTotalInterest(installmentsMainClaim6M.slice(Math.floor(installmentsMainClaim6M.length / 2)));

  // Odsetki stałe oprocentowanie od momentu przeliczenia kredytu
  const futureInterestFixedWibor3M = calculateTotalInterest(installmentsSecondClaim3M.slice(Math.floor(installmentsSecondClaim3M.length / 2)));
  const futureInterestFixedWibor6M = calculateTotalInterest(installmentsSecondClaim6M.slice(Math.floor(installmentsSecondClaim6M.length / 2)));

  // Wartość anulowanych odsetek na przyszłość
  const futureCanceledInterest3M = futureInterestWibor3M - futureInterestFixedWibor3M;
  const futureCanceledInterest6M = futureInterestWibor6M - futureInterestFixedWibor6M;

  // Korzyść kredytobiorcy
  const borrowerBenefit3M = refundSecondClaim3M + futureCanceledInterest3M;
  const borrowerBenefit6M = refundSecondClaim6M + futureCanceledInterest6M;

  const createClaim = (totalInterest: number, totalInterestNoWibor: number, type: 'main' | 'first' | 'second', mainClaimInterest: number = 0) =>
    LoanCalculator.createClaimResult(totalInterest, totalInterestNoWibor, loanAmount, margin, loanTerms, wiborRate, mainClaimInterest, type);

  const mainClaim3M = createClaim(totalInterestWibor3M, 0, 'main');
  const mainClaim6M = createClaim(totalInterestWibor6M, 0, 'main');
  const firstClaim3M = createClaim(totalInterestWibor3M, totalInterestWithoutWibor3M, 'first', refundSecondClaim3M); // Dostosowanie do wymogów
  const firstClaim6M = createClaim(totalInterestWibor6M, totalInterestWithoutWibor6M, 'first', refundSecondClaim6M); // Dostosowanie do wymogów

  const secondClaim3M = createClaim(futureInterestFixedWibor3M, totalInterestWibor3M, 'second', refundSecondClaim3M);
  const secondClaim6M = createClaim(futureInterestFixedWibor6M, totalInterestWibor6M, 'second', refundSecondClaim6M);
  console.log(secondClaim3M)
  return {
    claims: {
      mainClaim: [mainClaim3M, mainClaim6M],
      firstClaim: [firstClaim3M, firstClaim6M],
      secondClaim: [secondClaim3M, secondClaim6M],
    },
    installments: {
      mainClaim: [installmentsMainClaim3M, installmentsMainClaim6M],
      firstClaim: [installmentsFirstClaim3M, installmentsFirstClaim6M],
      secondClaim: [installmentsSecondClaim3M, installmentsSecondClaim6M],
    },
    refundOverpaidInterest3M: refundSecondClaim3M,
    refundOverpaidInterest6M: refundSecondClaim6M,
    futureCanceledInterest3M,
    futureCanceledInterest6M,
    borrowerBenefit3M,
    borrowerBenefit6M,
    startDate,
    endDate: LoanCalculator.calculateEndDate(startDate, loanTerms, holidayMonths.length),
    loanAmount,
    currentRate: margin,
    futureInterestSecondClaim
  };
};
