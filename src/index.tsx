import { OPTIONAL_SYMBOL, OptionalValue } from './types';

/**
 * Marks a value in the initial store as optional.
 * This allows the property to be undefined in the state.
 *
 * @param initialValue The initial value of the property (optional).
 * @returns An object that signals the property is optional.
 */
export function optional<T>(initialValue?: T): OptionalValue<T> {
  return {
    [OPTIONAL_SYMBOL]: true,
    value: initialValue,
  };
}

import { StateFromInit, Action, Dispatchers, CapitalizeString, ReduxLiteStore } from './types';
import React, { createContext, useContext, useReducer, useMemo } from 'react';

// A simple deep-equal check for performance optimization.
function isEqual(objA: any, objB: any): boolean {
  // Use JSON.stringify for a simple but effective deep comparison, especially for debugging.
  // Note: This has limitations (e.g., with undefined, functions, symbol keys), but is sufficient for our current data structures.
  if (objA === objB) return true;
  try {
    return JSON.stringify(objA) === JSON.stringify(objB);
  } catch (e) {
    return false;
  }
}

export function initiate<T extends Record<string, any>>(INIT_STORE: T) {
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
  const reducer = (state: StateFromInit<T>, action: Action<StateFromInit<T>>) => {
    const { type, payload, isPartial } = action;
    const oldSlice = state[type];

    // Resolve the new value, whether it's a direct value or from a function
    const newSlice = typeof payload === 'function' ? payload(oldSlice, state) : payload;

    if (isPartial) {
      // Partial updates are only possible for objects.
      if (typeof oldSlice === 'object' && oldSlice !== null && typeof newSlice === 'object' && newSlice !== null) {
        const mergedSlice = { ...oldSlice, ...newSlice };
        if (isEqual(oldSlice, mergedSlice)) {
          return state; // No actual change, return original state
        }
        return {
          ...state,
          [type]: mergedSlice,
        };
      }
      // If not an object, fall back to a full update for this slice.
    }

    if (isEqual(oldSlice, newSlice)) {
      return state; // No actual change, return original state
    }

    return {
      ...state,
      [type]: newSlice,
    };
  };

  // 3. Create Context and Provider
  const StoreContext = createContext<{
    state: StateFromInit<T>;
    dispatch: React.Dispatch<Action<StateFromInit<T>>>;
  } | null>(null);

  const ReduxLiteProvider: React.FC<{
    children: React.ReactNode;
    initStore?: T; // Allow overriding initial store via props
  }> = ({ children, initStore: propInitStore }) => {
    // Use prop-provided store if available, otherwise use the one from the closure
    const finalInitialState = propInitStore
      ? Object.keys(propInitStore).reduce((acc, key) => {
          const value = propInitStore[key as keyof T];
          if (value && value[OPTIONAL_SYMBOL]) {
            acc[key as keyof T] = value.value;
          } else {
            acc[key as keyof T] = value;
          }
          return acc;
        }, {} as StateFromInit<T>)
      : initialState;

    const [state, dispatch] = useReducer(reducer, finalInitialState);

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

    const { state, dispatch } = context;

    // Memoize dispatchers to prevent re-creation on every render
    const dispatchers = useMemo(() => {
      const dispatcherAcc = Object.keys(state).reduce((acc, key) => {
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
    }, [dispatch, state]);

    return { ...state, ...dispatchers };
  };

  return {
    ReduxLiteProvider,
    useReduxLiteStore,
  };
}