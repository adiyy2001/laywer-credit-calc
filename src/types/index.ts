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
   remainingAmount: number;
  wiborWithoutMargin: number;
}

export interface CalculationResults {
  refundOverpaidInterest3M: number;
  refundOverpaidInterest6M: number;
  futureCanceledInterest3M: number;
  futureCanceledInterest6M: number;
  borrowerBenefit3M: number;
  borrowerBenefit6M: number;

  mainClaim3M: ClaimResult;
  mainClaim6M: ClaimResult;
  firstClaim3M: ClaimResult;
  firstClaim6M: ClaimResult;
  secondClaim3M: ClaimResult;
  secondClaim6M: ClaimResult;
  installmentsMainClaim3M: Installment[];
  installmentsMainClaim6M: Installment[];
  installmentsFirstClaim3M: Installment[];
  installmentsFirstClaim6M: Installment[];
  installmentsSecondClaim3M: Installment[];
  installmentsSecondClaim6M: Installment[];
  startDate: Date;
  endDate: Date;
  loanAmount: number;
  currentRate: number;
}
