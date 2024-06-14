import React, { useContext } from 'react';
import ParametersForm from './ParametersForm';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useCalculator from '../hooks/useCalculator';
import { CalculationParams } from '../types';
import { CalculationContext } from '../contexts/CalculationContext';

interface CalculatorProps {
  showToast: (message: string) => void;
}

const Calculator: React.FC<CalculatorProps> = ({ showToast }) => {
  const context = useContext(CalculationContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error('Calculator must be used within a CalculationProvider');
  }

  const { setResults } = context;

  const handleCalculate = (calculationParams: CalculationParams) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const results = useCalculator(calculationParams);
    setResults(results);
    showToast("Obliczenia zakończone");
    navigate('/payments');
  };

  return (
    <motion.div 
      style={{ marginTop: '100px' }}
      className="p-6 bg-white rounded-lg shadow-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl font-bold mb-4">Kalkulator Korzyści</h1>
      <ParametersForm onCalculate={handleCalculate} />
    </motion.div>
  );
};

export default Calculator;
