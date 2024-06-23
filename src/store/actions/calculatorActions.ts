// actions/calculatorActions.ts
import { CalculationParams, CalculationResults } from '../../types';

export const SET_PARAMS = 'SET_PARAMS';
export const SET_RESULTS = 'SET_RESULTS';

interface SetParamsAction {
  type: typeof SET_PARAMS;
  payload: CalculationParams;
}

interface SetResultsAction {
  type: typeof SET_RESULTS;
  payload: CalculationResults;
}

export type CalculatorActionTypes = SetParamsAction | SetResultsAction;

export const setParams = (params: CalculationParams): SetParamsAction => ({
  type: SET_PARAMS,
  payload: params,
});

export const setResults = (results: CalculationResults): SetResultsAction => ({
  type: SET_RESULTS,
  payload: results,
});
