import React, { useContext } from 'react';
import Claim from './Claim';
import { motion } from 'framer-motion';
import { CalculationContext } from '../contexts/CalculationContext';

const Summary: React.FC = () => {
  const context = useContext(CalculationContext);

  if (!context) {
    throw new Error('Summary must be used within a CalculationProvider');
  }

  const { results } = context;

  if (!results) return null;

  const { mainClaim, firstClaim, secondClaim } = results;

  const formatNumber = (value: string) => {
    const number = parseFloat(value.replace(/\s+/g, '').replace(' zł', ''));
    if (isNaN(number)) return '0 zł';
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(number).replace(',00', '');
  };

  const formattedMainClaim = {
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

  const formattedFirstClaim = {
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

  const formattedSecondClaim = {
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
      style={{ marginTop: '50px' }}
      className="p-6 bg-white rounded-lg shadow-md container mx-auto"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold mb-4 text-center">Podsumowanie Roszczeń</h2>
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
