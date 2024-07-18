import { createSelector } from 'reselect';
import { AppState } from '../store';
import { CalculationResults, Installment } from '../../types';

// Selektory wejściowe
const getCalculatorResults = (state: AppState): CalculationResults | null => state.calculator.results;

export const selectCalculationResults = createSelector(
  [getCalculatorResults],
  (results) => results
);

// Selektor wynikowy, który przekształca dane
export const selectInstallmentsMainClaim3M = createSelector(
  [getCalculatorResults],
  (results): Installment[] => results ? results.installments.mainClaim[0] : []
);

export const selectInstallmentsMainClaim6M = createSelector(
  [getCalculatorResults],
  (results): Installment[] => results ? results.installments.mainClaim[1] : []
);

export const selectInstallmentsFirstClaim3M = createSelector(
  [getCalculatorResults],
  (results): Installment[] => results ? results.installments.firstClaim[0] : []
);

export const selectInstallmentsFirstClaim6M = createSelector(
  [getCalculatorResults],
  (results): Installment[] => results ? results.installments.firstClaim[1] : []
);

export const selectInstallmentsSecondClaim3M = createSelector(
  [getCalculatorResults],
  (results): Installment[] => results ? results.installments.secondClaim[0] : []
);

export const selectInstallmentsSecondClaim6M = createSelector(
  [getCalculatorResults],
  (results): Installment[] => results ? results.installments.secondClaim[1] : []
);
