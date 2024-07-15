import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { CalculationParams, CalculationResults } from '../../types';

interface CalculatorState {
  params: CalculationParams | null;
  results: CalculationResults | null;
}

const initialState: CalculatorState = {
  params: null,
  results: null,
};

const formatDateOnly = (date: string | Date): Date => {
  return new Date(date); // format in YYYY-MM-DD
};

const calculatorSlice = createSlice({
  name: 'calculator',
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<CalculationParams>) {
      const params = action.payload;
      state.params = {
        ...params,
        startDate: formatDateOnly(params.startDate),
        endDate: formatDateOnly(params.endDate),
      };
    },
    setResults(state, action: PayloadAction<CalculationResults>) {
      const results = action.payload;
      state.results = {
        ...results,
        startDate: formatDateOnly(results.startDate),
        endDate: formatDateOnly(results.endDate),
      };
    },
  },
});

export const { setParams, setResults } = calculatorSlice.actions;
export default calculatorSlice.reducer;
