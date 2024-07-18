export interface DynamicField {
  date: Date;
  amount: number;
}

export interface BaseCalculationParams {
  loanAmount: number;
  loanTerms: number;
  margin: number;
  wiborRate: number;
  startDate: Date;
  firstInstallmentDate: Date;
  gracePeriodMonths: number;
  holidayMonths: DynamicField[];
  prepayments: DynamicField[];
  disbursements: DynamicField[];
  installmentType: 'stałe' | 'malejące';
}

export interface CalculationParams extends BaseCalculationParams {
  endDate: string | Date;
  borrower: string;
  currentRate: number;
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
  futureInterestSecondClaim: number;
  claims: {
    mainClaim: ClaimResult[];
    firstClaim: ClaimResult[];
    secondClaim: ClaimResult[];
  };
  
  installments: {
    mainClaim: Installment[][];
    firstClaim: Installment[][];
    secondClaim: Installment[][];
  };

  startDate: Date;
  endDate: Date;
  loanAmount: number;
  currentRate: number;
}
