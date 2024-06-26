import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

import { CalculationResults, ClaimResult } from '../types';
import { AppState } from '../store/store';

import Claim from './Claim';

const Summary: React.FC = () => {
  const results: CalculationResults | null = useSelector(
    (state: AppState) => state.calculator.results,
  );

  if (!results) {
    return null;
  }

  const { mainClaim, firstClaim, secondClaim } = results;

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

  const formattedMainClaim: ClaimResult = {
    ...mainClaim,
    totalInterestWibor: formatNumber(mainClaim.totalInterestWibor),
    totalInterestNoWibor: formatNumber(mainClaim.totalInterestNoWibor),
    variableRate: formatNumber(mainClaim.variableRate),
    fixedRate: formatNumber(mainClaim.fixedRate),
    borrowerBenefit: formatNumber(mainClaim.borrowerBenefit),
    benefitPerInstallment: formatNumber(mainClaim.benefitPerInstallment),
    refund: formatNumber(mainClaim.refund),
    futureInterest: formatNumber(mainClaim.futureInterest),
  };

  const formattedFirstClaim: ClaimResult = {
    ...firstClaim,
    totalInterestWibor: formatNumber(firstClaim.totalInterestWibor),
    totalInterestNoWibor: formatNumber(firstClaim.totalInterestNoWibor),
    variableRate: formatNumber(firstClaim.variableRate),
    fixedRate: formatNumber(firstClaim.fixedRate),
    borrowerBenefit: formatNumber(firstClaim.borrowerBenefit),
    benefitPerInstallment: formatNumber(firstClaim.benefitPerInstallment),
    refund: formatNumber(firstClaim.refund),
    futureInterest: formatNumber(firstClaim.futureInterest),
  };

  const formattedSecondClaim: ClaimResult = {
    ...secondClaim,
    totalInterestWibor: formatNumber(secondClaim.totalInterestWibor),
    totalInterestNoWibor: formatNumber(secondClaim.totalInterestNoWibor),
    variableRate: formatNumber(secondClaim.variableRate),
    fixedRate: formatNumber(secondClaim.fixedRate),
    borrowerBenefit: formatNumber(secondClaim.borrowerBenefit),
    benefitPerInstallment: formatNumber(secondClaim.benefitPerInstallment),
    refund: formatNumber(secondClaim.refund),
    futureInterest: formatNumber(secondClaim.futureInterest),
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
        {...formattedMainClaim}
      />
      <Claim
        title="I ROSZCZENIE EWENTUALNE: UZNANIE ZA BEZSKUTECZNE CZĘŚĆ OPROCENTOWANIA W ZAKRESIE WIBORU (pozostaje tylko MARŻA)"
        {...formattedFirstClaim}
      />
      <Claim
        title="II ROSZCZENIE EWENTUALNE: O UKSZTAŁTOWANIE STOSUNKU POPRZEZ USTALENIE ŻE PIERWOTNY WSKAŹNIK WIBOR 3M W UMOWIE JEST STAŁYM OPROCENTOWANIEM"
        {...formattedSecondClaim}
      />
    </motion.div>
  );
};

export default Summary;
