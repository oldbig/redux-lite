import { OPTIONAL_SYMBOL, StateFromInit, Action, Dispatchers, CapitalizeString, ReduxLiteStore, StateOverride, InitiateOptions, DevToolsOptions } from './types';
import { isEqual, mergeState, optional } from './utils';
import React, { createContext, useContext, useReducer, useMemo, useRef, useEffect, useCallback, act } from 'react';

function initiate<T extends Record<string, any>>(INIT_STORE: T, options?: InitiateOptions) {
  const reducer = (state: StateFromInit<T>, action: Action<StateFromInit<T>>) => {
    const { type, payload, isPartial } = action;
    const oldSlice = state[type];

    // Resolve the new value, whether it's a direct value or from a function
    const newSlice = typeof payload === 'function' ? payload(oldSlice, state) : payload;

    if (isPartial) {
      // Partial updates are only possible for plain objects, not arrays.
      if (typeof oldSlice === 'object' && oldSlice !== null && !Array.isArray(oldSlice) && typeof newSlice === 'object' && newSlice !== null) {
        const mergedSlice = { ...oldSlice, ...newSlice };
        if (isEqual(oldSlice, mergedSlice)) {
          return state; // No actual change, return original state
        }
        return {
          ...state,
          [type]: mergedSlice,
        };
      }
      // If not a plain object, fall back to a full update for this slice.
    }

    if (isEqual(oldSlice, newSlice)) {
      return state; // No actual change, return original state
    }

    return {
      ...state,
      [type]: newSlice,
    };
  };
  // 1. Create the initial state by unwrapping optional values
  const initialState = Object.keys(INIT_STORE).reduce((acc, key) => {
    const value = INIT_STORE[key];
    if (value && value[OPTIONAL_SYMBOL]) {
      acc[key as keyof T] = value.value;
    } else {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as StateFromInit<T>);

  // 2. Create the reducer function
  const useCreateReducer = (finalInitialState: StateFromInit<T>) => {
    const devToolsRef = useRef<any>(null);
    const lastActionRef = useRef<Action<StateFromInit<T>> | null>(null);

    const [state, dispatch] = useReducer(reducer, finalInitialState);

    const enhancedDispatch = useMemo(() => {
      if (options?.devTools) {
        return (action: Action<StateFromInit<T>>) => {
          lastActionRef.current = action;
          dispatch(action);
        };
      }
      return dispatch;
    }, [dispatch]);

    useEffect(() => {
      if (devToolsRef.current && lastActionRef.current) {
        devToolsRef.current.send(lastActionRef.current, state);
      }
    }, [state]);

    useEffect(() => {
      if (!options?.devTools) {
        return;
      }

      const devTools = window.__REDUX_DEVTOOLS_EXTENSION__?.connect(
        typeof options.devTools === 'object' ? options.devTools : {}
      );

      if (devTools) {
        devToolsRef.current = devTools;
        devTools.init(finalInitialState);

        return () => {
          devToolsRef.current = null;
        };
      }
    }, [finalInitialState]);

    return [state, enhancedDispatch] as const;
  };

  // 3. Create Context and Provider
  const StoreContext = createContext<{
    state: StateFromInit<T>;
    dispatch: React.Dispatch<Action<StateFromInit<T>>>;
  } | null>(null);

  const ReduxLiteProvider: React.FC<{
    children: React.ReactNode;
    initStore?: StateOverride<StateFromInit<T>>; // Allow shallow overrides of slices
  }> = ({ children, initStore: propInitStore }) => {
    const finalInitialState = useMemo(() => {
      if (propInitStore) {
        return mergeState(initialState, propInitStore);
      }
      return initialState;
    }, [propInitStore]);
    const [state, dispatch] = useCreateReducer(finalInitialState);
    return (
      <StoreContext.Provider value={{ state, dispatch }}>
        {children}
      </StoreContext.Provider>
    );
  };

  // 4. Create the main hook
  const useReduxLiteStore = (): ReduxLiteStore<StateFromInit<T>> => {
    const context = useContext(StoreContext);
    if (!context) {
      throw new Error('useReduxLiteStore must be used within a ReduxLiteProvider.');
    }

    // Memoize dispatchers to prevent re-creation on every render
    const dispatchers = useMemo(() => {
      const { dispatch } = context;
      const dispatcherAcc = Object.keys(initialState).reduce((acc, key) => {
        const capitalizedKey = (key.charAt(0).toUpperCase() + key.slice(1)) as CapitalizeString<typeof key>;

        // Create dispatchUser
        acc[`dispatch${capitalizedKey}`] = (payload: any) => {
          dispatch({ type: key, payload, isPartial: false });
        };

        // Create dispatchPartialUser
        acc[`dispatchPartial${capitalizedKey}`] = (payload: any) => {
          dispatch({ type: key, payload, isPartial: true });
        };

        return acc;
      }, {} as { [key: string]: any }); // Use a flexible type for the accumulator

      return dispatcherAcc as Dispatchers<StateFromInit<T>>; // Assert the final type
    }, [context.dispatch]);

    return { ...context.state, ...dispatchers };
  };

  return {
    ReduxLiteProvider,
    useReduxLiteStore,
  };
}


export { optional, initiate };