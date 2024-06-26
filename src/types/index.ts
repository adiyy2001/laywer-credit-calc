export interface DynamicField {
  date: Date;
  amount: number;
}

export interface CalculationParams {
  endDate: string | Date;
  borrower: string;
  loanAmount: number;
  loanTerms: number;
  margin: number;
  wiborRate: number;
  currentRate: number;
  startDate: Date;
  firstInstallmentDate: Date;
  gracePeriodMonths: number;
  holidayMonths: DynamicField[];
  prepayments: DynamicField[];
  disbursements: DynamicField[];
  installmentType: 'stałe' | 'malejące';
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
  wiborRate: number;
  remainingAmount: string;
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
