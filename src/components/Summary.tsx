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

  const {
    mainClaim3M,
    firstClaim3M,
    secondClaim3M,
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

  const formattedMainClaim: ClaimResult = {
    ...mainClaim3M,
    totalInterestWibor: formatNumber(mainClaim3M.totalInterestWibor),
    totalInterestNoWibor: formatNumber(mainClaim3M.totalInterestNoWibor),
    variableRate: formatNumber(mainClaim3M.variableRate),
    fixedRate: formatNumber(mainClaim3M.fixedRate),
    borrowerBenefit: formatNumber(mainClaim3M.borrowerBenefit),
    benefitPerInstallment: formatNumber(mainClaim3M.benefitPerInstallment),
    refund: formatNumber(mainClaim3M.refund),
    futureInterest: formatNumber(mainClaim3M.futureInterest),
  };

  const formattedFirstClaim: ClaimResult = {
    ...firstClaim3M,
    totalInterestWibor: formatNumber(firstClaim3M.totalInterestWibor),
    totalInterestNoWibor: formatNumber(firstClaim3M.totalInterestNoWibor),
    variableRate: formatNumber(firstClaim3M.variableRate),
    fixedRate: formatNumber(firstClaim3M.fixedRate),
    borrowerBenefit: formatNumber(firstClaim3M.borrowerBenefit),
    benefitPerInstallment: formatNumber(firstClaim3M.benefitPerInstallment),
    refund: formatNumber(firstClaim3M.refund),
    futureInterest: formatNumber(firstClaim3M.futureInterest),
  };

  const formattedSecondClaim: ClaimResult = {
    ...secondClaim3M,
    totalInterestWibor: formatNumber(secondClaim3M.totalInterestWibor),
    totalInterestNoWibor: formatNumber(secondClaim3M.totalInterestNoWibor),
    variableRate: formatNumber(secondClaim3M.variableRate),
    fixedRate: formatNumber(secondClaim3M.fixedRate),
    borrowerBenefit: formatNumber(borrowerBenefit3M.toString()),
    benefitPerInstallment: formatNumber(secondClaim3M.benefitPerInstallment),
    refund: formatNumber(refundOverpaidInterest3M.toString() + ' zł'),
    futureInterest: formatNumber(futureCanceledInterest3M.toString() + ' zł'),
  };
  console.log(formattedSecondClaim);
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
        totalInterestWibor={formattedMainClaim.totalInterestWibor}
        totalInterestNoWibor={formattedMainClaim.totalInterestNoWibor}
        variableRate={formattedMainClaim.variableRate}
        fixedRate={formattedMainClaim.fixedRate}
        borrowerBenefit={formattedMainClaim.borrowerBenefit}
        benefitPerInstallment={formattedMainClaim.benefitPerInstallment}
        refund={formattedMainClaim.refund}
        futureInterest={formattedMainClaim.futureInterest}
      />
      <Claim
        title="I ROSZCZENIE EWENTUALNE: UZNANIE ZA BEZSKUTECZNE CZĘŚĆ OPROCENTOWANIA W ZAKRESIE WIBORU (pozostaje tylko MARŻA)"
        totalInterestWibor={formattedFirstClaim.totalInterestWibor}
        totalInterestNoWibor={formattedFirstClaim.totalInterestNoWibor}
        variableRate={formattedFirstClaim.variableRate}
        fixedRate={formattedFirstClaim.fixedRate}
        borrowerBenefit={formattedFirstClaim.borrowerBenefit}
        benefitPerInstallment={formattedFirstClaim.benefitPerInstallment}
        refund={formattedFirstClaim.refund}
        futureInterest={formattedFirstClaim.futureInterest}
      />
      <Claim
        title="II ROSZCZENIE EWENTUALNE: O UKSZTAŁTOWANIE STOSUNKU POPRZEZ USTALENIE ŻE PIERWOTNY WSKAŹNIK WIBOR 3M W UMOWIE JEST STAŁYM OPROCENTOWANIEM"
        totalInterestWibor={formattedSecondClaim.totalInterestNoWibor}
        totalInterestNoWibor={formattedSecondClaim.totalInterestWibor}
        variableRate={formattedSecondClaim.variableRate}
        fixedRate={formattedSecondClaim.fixedRate}
        borrowerBenefit={formattedSecondClaim.borrowerBenefit}
        benefitPerInstallment={formattedSecondClaim.benefitPerInstallment}
        refund={formattedSecondClaim.refund}
        futureInterest={formattedSecondClaim.futureInterest}
      />
    </motion.div>
  );
};

export default Summary;
