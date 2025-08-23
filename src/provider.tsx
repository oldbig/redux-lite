import React, { useMemo, useReducer } from 'react';
import { StoreContext } from './context';
import { StateFromInit, StateOverride, InitiateOptions } from './types';
import { mergeState } from './utils';
import { reducer } from './reducer';
import { useReduxDevTools } from './devTools';

/**
 * Custom hook to create and manage the reducer state, with optional Redux DevTools integration.
 * @param initialState The initial state for the reducer.
 * @param options Options for ReduxLite initialization, including DevTools settings.
 * @returns A tuple containing the current state and the enhanced dispatch function.
 */
const useCreateReducer = <T extends Record<string, any>>(
  initialState: StateFromInit<T>,
  options?: InitiateOptions
) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const enhancedDispatch = useReduxDevTools(state, dispatch, initialState, options?.devTools);
  return [state, enhancedDispatch] as const;
};

/**
 * StoreContextProvider component.
 * It wraps the application or a part of it, holding the state and providing it to the React tree.
 * @param children The React children to be rendered within the provider.
 * @param initStore A partial override of the top-level state slices for initial state.
 * @param options Options for ReduxLite initialization, including DevTools settings.
 */
export const StoreContextProvider = <T extends Record<string, any>>({
  children,
  initStore: propInitStore,
  initialState, // This prop is passed from initiate function as the base initial state
  options,
}: React.PropsWithChildren<{
  initialState: StateFromInit<T>;
  initStore?: StateOverride<StateFromInit<T>>;
  options?: InitiateOptions;
}>) => {
  const finalInitialState = useMemo(() => {
    if (propInitStore) {
      return mergeState(initialState, propInitStore);
    }
    return initialState;
  }, [propInitStore, initialState]);

  const [state, dispatch] = useCreateReducer(finalInitialState, options);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};