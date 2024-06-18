import { createContext, useState, ReactNode } from 'react';

import { CalculationResults } from '../types';

interface CalculationContextType {
  results: CalculationResults | null;
  setResults: (results: CalculationResults) => void;
}

interface CalculationProviderProps {
  children: ReactNode;
}

export const CalculationContext = createContext<
  CalculationContextType | undefined
>(undefined);

export const CalculationProvider: React.FC<CalculationProviderProps> = ({
  children,
}) => {
  const [results, setResultsState] = useState<CalculationResults | null>(() => {
    const savedResults = localStorage.getItem('calculationResults');
    return savedResults ? JSON.parse(savedResults) : null;
  });

  const setResults = (results: CalculationResults) => {
    setResultsState(results);
    localStorage.setItem('calculationResults', JSON.stringify(results));
  };

  return (
    <CalculationContext.Provider value={{ results, setResults }}>
      {children}
    </CalculationContext.Provider>
  );
};
