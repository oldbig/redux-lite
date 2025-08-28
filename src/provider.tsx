import React, { useMemo, useReducer, useRef } from 'react';
import { StoreContext } from './context';
import { StateFromInit, StateOverride, InitiateOptions, MiddlewareAPI, Action } from './types';
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
  options?: InitiateOptions<StateFromInit<T>>
) => {
  const [state, dispatch] = useReducer<React.Reducer<StateFromInit<T>, Action<StateFromInit<T>>>>(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const enhancedDispatch = useMemo(() => {
    const { middlewares } = options || {};

    const internalDispatch = (action: Action<StateFromInit<T>>) => {
      const newState = reducer(stateRef.current, action);
      stateRef.current = newState;
      dispatch(action);
      return action;
    };

    if (!middlewares || middlewares.length === 0) {
      return internalDispatch;
    }

    let composedMiddlewareDispatch: (action: Action<StateFromInit<T>>) => Action<StateFromInit<T>>;

    const middlewareAPI: MiddlewareAPI<StateFromInit<T>> = {
      getState: () => stateRef.current,
      dispatch: (action: Action<StateFromInit<T>>): Action<StateFromInit<T>> => {
        return composedMiddlewareDispatch(action);
      },
    };

    const baseMiddlewareDispatch = (action: Action<StateFromInit<T>>): Action<StateFromInit<T>> => {
      internalDispatch(action);
      return action;
    };

    composedMiddlewareDispatch = compose(...middlewares.map(m => m(middlewareAPI)))(baseMiddlewareDispatch);

    return (action: Action<StateFromInit<T>>): Action<StateFromInit<T>> => {
      return composedMiddlewareDispatch(action);
    };
  }, [options]);

  const devToolsEnhancedDispatch = useReduxDevTools(state, enhancedDispatch, initialState, options?.devTools);

  return [state, devToolsEnhancedDispatch] as const;
};

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments; the remaining functions must be unary.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */
function compose(...funcs: Function[]) {
  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args: any[]) => a(b(...args)));
}

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
  options?: InitiateOptions<StateFromInit<T>>;
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