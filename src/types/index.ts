export interface ClaimResults {
  principal: number;
  interest: number;
  benefit: number;
}

export interface Parameters {
  loanAmount: number;
  loanTerms: number;
  margin: number;
  wiborRate: number;
  currentRate: number;
  startDate: Date;
  endDate: Date;
}

export interface CalculationParams {
  borrower: string;
  loanAmount: number;
  loanTerms: number;
  margin: number;
  wiborRate: number;
  currentRate: number;
  startDate: Date;
  endDate: Date;
  gracePeriod: boolean;
  holiday: boolean;
  prepayments: { date: Date; amount: number }[];
  disbursements: { date: Date; amount: number }[];
}

export interface ClaimResult {
  totalInterestWibor: string;
  totalInterestNoWibor: string;
  variableRate: string;
  fixedRate: string;
  borrowerBenefit: string;
  benefitPerInstallment: string;
  refund: string;
  futureInterest: string;
}

export interface Installment {
  date: string;
  principal: string;
  interest: string;
  totalPayment: string;
}

export interface CalculationResults {
  mainClaim: ClaimResult;
  firstClaim: ClaimResult;
  secondClaim: ClaimResult;
  installmentsWibor3M: Installment[];
  installmentsWibor6M: Installment[];
  startDate: Date;
  endDate: Date;
  loanAmount: number;
  currentRate: number;
}
