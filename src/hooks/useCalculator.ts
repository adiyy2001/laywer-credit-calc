import { CalculationParams, CalculationResults, Installment, ClaimResult } from "../types";

const useCalculator = (params: CalculationParams): CalculationResults => {
  const { loanAmount, loanTerms, margin, wiborRate, currentRate, startDate, endDate, gracePeriod, prepayments, disbursements } = params;
  const installmentsWibor3M: Installment[] = [];
  const installmentsWibor6M: Installment[] = [];

  // Walidacja danych wejściowych
  const validateInputs = () => {
    if (loanAmount <= 0 || loanTerms <= 0 || margin <= 0 || wiborRate <= 0 || currentRate <= 0) {
      throw new Error("Nieprawidłowe dane wejściowe");
    }
  };

  validateInputs();

  let remainingAmount = loanAmount;
  const gracePeriodMonths = gracePeriod ? 6 : 0;
  const monthlyPrincipalPayment = loanAmount / (loanTerms - gracePeriodMonths);

  // Mapy do szybszego wyszukiwania dat nadpłat i wypłat
  const prepaymentMap = new Map(prepayments.map(p => [p.date.getTime(), p.amount]));
  const disbursementMap = new Map(disbursements.map(d => [d.date.getTime(), d.amount]));

  const calculateInstallment = (date: Date, principal: number, interest: number): Installment => ({
    date: date.toISOString().split('T')[0], // Dokładniejszy format daty
    principal: principal.toFixed(2),
    interest: interest.toFixed(2),
    totalPayment: (principal + interest).toFixed(2),
  });

  for (let i = 0; i < loanTerms; i++) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(currentDate.getMonth() + i);

    // Aktualizacja pozostałej kwoty kredytu na podstawie wypłat
    const disbursementAmount = disbursementMap.get(currentDate.getTime()) || 0;
    remainingAmount += disbursementAmount;

    let principalPayment = 0;
    const interestPayment = (remainingAmount * wiborRate) / 100;

    if (i >= gracePeriodMonths) {
      principalPayment = monthlyPrincipalPayment;
      remainingAmount -= principalPayment;
    }

    const installment3M = calculateInstallment(currentDate, principalPayment, interestPayment);
    const installment6M = calculateInstallment(currentDate, principalPayment, interestPayment);

    installmentsWibor3M.push(installment3M);
    installmentsWibor6M.push(installment6M);

    // Uwzględnienie nadpłat
    const prepaymentAmount = prepaymentMap.get(currentDate.getTime()) || 0;
    remainingAmount -= prepaymentAmount;
  }

  const calculateTotalInterest = (loanAmount: number, rate: number, terms: number): number => {
    return (loanAmount * rate * terms) / 100;
  };

  const totalInterestWibor = calculateTotalInterest(loanAmount, wiborRate, loanTerms);
  const totalInterestNoWibor = 0;
  const variableRate = (loanAmount * (margin + wiborRate)) / loanTerms;
  const fixedRate = (loanAmount * margin) / loanTerms;
  const borrowerBenefit = totalInterestWibor - totalInterestNoWibor;
  const benefitPerInstallment = variableRate - fixedRate;
  const refund = borrowerBenefit * 0.4;
  const futureInterest = borrowerBenefit * 0.6;

  const createClaimResult = (totalInterestNoWibor: number): ClaimResult => ({
    totalInterestWibor: totalInterestWibor.toFixed(2) + ' zł',
    totalInterestNoWibor: totalInterestNoWibor.toFixed(2) + ' zł',
    variableRate: variableRate.toFixed(2) + ' zł',
    fixedRate: fixedRate.toFixed(2) + ' zł',
    borrowerBenefit: borrowerBenefit.toFixed(2) + ' zł',
    benefitPerInstallment: benefitPerInstallment.toFixed(2) + ' zł',
    refund: refund.toFixed(2) + ' zł',
    futureInterest: futureInterest.toFixed(2) + ' zł',
  });

  const mainClaim = createClaimResult(totalInterestNoWibor);
  const firstClaim = createClaimResult(totalInterestWibor * 0.3);
  const secondClaim = createClaimResult(totalInterestWibor * 0.7);

  return {
    mainClaim,
    firstClaim,
    secondClaim,
    installmentsWibor3M,
    installmentsWibor6M,
    startDate,
    endDate,
    loanAmount,
    currentRate
  };
};

export default useCalculator;
