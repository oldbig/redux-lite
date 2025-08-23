import { useContext, useMemo } from 'react';
import { StoreContext } from './context';
import { StateFromInit, ReduxLiteStore, CapitalizeString, Dispatchers } from './types';

/**
 * The primary API for components to interact with the store.
 * It consumes the context provided by ReduxLiteProvider and returns
 * a flattened object containing all state slices and their corresponding dispatchers.
 * @returns An object containing state slices and their dispatchers.
 */
export const useReduxLiteStore = <T extends Record<string, any>>(): ReduxLiteStore<StateFromInit<T>> => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useReduxLiteStore must be used within a ReduxLiteProvider.');
  }

  // Memoize dispatchers to prevent re-creation on every render
  const dispatchers = useMemo(() => {
    const { dispatch, state: fullState } = context;
    const dispatcherAcc = Object.keys(fullState).reduce((acc, key) => {
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
  }, [context.dispatch, context.state]);

  return { ...(context.state as StateFromInit<T>), ...dispatchers };
};