import { useEffect } from 'react';
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
import Spinner from './spinner/Spinner';

const Calculator: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const { showToast } = useToast();

  const wiborData = useSelector((state: AppState) => state.wibor.wiborData);
  const loading = useSelector((state: AppState) => state.wibor.loading);

  useEffect(() => {
    dispatch(fetchWibor());
  }, [dispatch]);

  const handleCalculate = (params: CalculationParams) => {
    const updatedParams = {
      ...params,
      startDate: params.startDate,
      endDate: params.endDate,
    };

    if (wiborData) {
      dispatch(setParams(updatedParams));
      const results = calculateResults(updatedParams, wiborData);
      dispatch(setResults(results));

      if (results) {
        showToast('Obliczenia zakończone', { type: 'success' });
        navigate('/payments/main-claim', { state: { from: '/calculator' } });
      }
    }
  };

  if (loading) {
    return <Spinner />;
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
