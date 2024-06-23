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

const calculatorSlice = createSlice({
  name: 'calculator',
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<CalculationParams>) {
      const params = action.payload;
      state.params = {
        ...params,
        startDate: new Date(params.startDate).toISOString(),
        endDate: new Date(params.endDate).toISOString(),
      };
    },
    setResults(state, action: PayloadAction<CalculationResults>) {
      const results = action.payload;
      state.results = {
        ...results,
        startDate: new Date(results.startDate).toISOString(),
        endDate: new Date(results.endDate).toISOString(),
      };
    },
  },
});

export const { setParams, setResults } = calculatorSlice.actions;
export default calculatorSlice.reducer;
