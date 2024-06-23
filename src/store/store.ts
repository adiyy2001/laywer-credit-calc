import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';

import calculatorReducer from './reducers/calculatorReducer';
import wiborReducer from './reducers/wiborReducer';

const store = configureStore({
  reducer: {
    calculator: calculatorReducer,
    wibor: wiborReducer,
  },
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export default store;
