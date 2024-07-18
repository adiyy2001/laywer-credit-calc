import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { CalculationResults, ClaimResult, Installment } from '../types';

import Claim from './Claim';
import { selectCalculationResults } from '../store/selector/calculatorSelector';

const Summary: React.FC = () => {
  const results: CalculationResults | null = useSelector(selectCalculationResults);

  if (!results) {
    return null;
  }

  const {
    claims: { mainClaim, firstClaim, secondClaim },
    refundOverpaidInterest3M,
    futureCanceledInterest3M,
    borrowerBenefit3M,
  } = results;

  const formatNumber = (value: string) => {
    const number = parseFloat(value.replace(/\s+/g, '').replace(' zł', ''));
    if (isNaN(number)) return '0 zł';
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
    })
      .format(number)
      .replace(',00', '');
  };
  const sumSecondClaimInterests = (secondClaimInstallments: Installment[][]): number => {
    return secondClaimInstallments[0].reduce((sum, installment) => {
      const interest = parseFloat(installment.interest.replace(' zł', '').replace(/\s/g, ''));
      return sum + (isNaN(interest) ? 0 : interest);
    }, 0);
  }
  const formatClaimResult = (claim: ClaimResult): ClaimResult => ({
    ...claim,
    totalInterestWibor: formatNumber(claim.totalInterestWibor),
    totalInterestNoWibor: formatNumber(claim.totalInterestNoWibor),
    variableRate: formatNumber(claim.variableRate),
    fixedRate: formatNumber(claim.fixedRate),
    borrowerBenefit: formatNumber(claim.borrowerBenefit),
    benefitPerInstallment: formatNumber(claim.benefitPerInstallment),
    refund: formatNumber(claim.refund),
    futureInterest: formatNumber(claim.futureInterest),
  });
  console.log(results.installments.secondClaim)
  const formattedMainClaim = formatClaimResult(mainClaim[0]);
  const formattedFirstClaim = formatClaimResult(firstClaim[0]);
  const formattedSecondClaim: ClaimResult = {
    ...secondClaim[0],
    totalInterestWibor: formatNumber(secondClaim[0].totalInterestNoWibor),
    totalInterestNoWibor: formatNumber(String(sumSecondClaimInterests(results.installments.secondClaim))),
    variableRate: formatNumber(secondClaim[0].variableRate),
    fixedRate: formatNumber(secondClaim[0].fixedRate),
    borrowerBenefit: formatNumber(borrowerBenefit3M.toString()),
    benefitPerInstallment: formatNumber(secondClaim[0].benefitPerInstallment),
    refund: formatNumber(refundOverpaidInterest3M.toString() + ' zł'),
    futureInterest: formatNumber(String(results.futureInterestSecondClaim)),
  };

  return (
    <motion.div
      className="container mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold mb-6 text-center">
        Podsumowanie Roszczeń
      </h2>
      <Claim
        title="ROSZCZENIE GŁÓWNE: ZWROT ZAPŁACONYCH ODSETEK I PRZELICZENIE SALDA ZADŁUŻENIA BEZ OPROCENTOWANIA"
        claimResult={formattedMainClaim}
      />
      <Claim
        title="I ROSZCZENIE EWENTUALNE: UZNANIE ZA BEZSKUTECZNE CZĘŚĆ OPROCENTOWANIA W ZAKRESIE WIBORU (pozostaje tylko MARŻA)"
        claimResult={formattedFirstClaim}
      />
      <Claim
        title="II ROSZCZENIE EWENTUALNE: O UKSZTAŁTOWANIE STOSUNKU POPRZEZ USTALENIE ŻE PIERWOTNY WSKAŹNIK WIBOR 3M W UMOWIE JEST STAŁYM OPROCENTOWANIEM"
        claimResult={formattedSecondClaim}
      />
    </motion.div>
  );
};

export default Summary;
