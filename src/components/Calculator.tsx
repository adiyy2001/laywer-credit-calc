import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { CalculationParams } from '../types';
import { fetchWibor } from '../store/actions/wiborActions';
import { setParams, setResults } from '../store/reducers/calculatorReducer';
import { AppDispatch, AppState } from '../store/store';

import { useToast } from './toast/index';
import ParametersForm from './ParametersForm';
import { calculateResults } from './utils/calculateResults';

const Calculator: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const calculatedResults = useSelector(
    (state: AppState) => state.calculator.results,
  );
  const wiborData = useSelector((state: AppState) => state.wibor.wiborData);
  const loading = useSelector((state: AppState) => state.wibor.loading);

  useEffect(() => {
    dispatch(fetchWibor());
  }, [dispatch]);

  useEffect(() => {
    if (calculatedResults) {
      try {
        showToast('Obliczenia zakończone', { type: 'success' });
        navigate('/payments');
      } catch (error) {
        if (error instanceof Error) {
          showToast(error.message, { type: 'error' });
        } else {
          showToast('An unknown error occurred', { type: 'error' });
        }
      }
    }
  }, [calculatedResults, showToast, navigate]);

  const handleCalculate = (params: CalculationParams) => {
    const updatedParams = {
      ...params,
      startDate: new Date(params.startDate).toISOString(),
      endDate: new Date(params.endDate).toISOString(),
    };
    if (wiborData) {
      dispatch(setParams(updatedParams));
      const results = calculateResults(params, wiborData);
      dispatch(setResults(results));
    }
  };

  if (loading) {
    return <div>Loading WIBOR data...</div>;
  }

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
