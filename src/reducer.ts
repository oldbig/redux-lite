import { StateFromInit, Action } from './types';
import { isEqual } from './utils';

/**
 * Reducer function for ReduxLite.
 * It handles both full and partial state updates for different slices.
 * It performs a deep-value comparison to prevent unnecessary re-renders.
 * @param state The current state.
 * @param action The action to be dispatched, containing type, payload, and partial flag.
 * @returns The new state or the original state if no change occurred.
 */
export const reducer = <T extends Record<string, any>>(state: StateFromInit<T>, action: Action<StateFromInit<T>>): StateFromInit<T> => {
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
    // If not a plain object or if newSlice is null/array, fall back to a full update for this slice.
  }

  if (isEqual(oldSlice, newSlice)) {
    return state; // No actual change, return original state
  }

  return {
    ...state,
    [type]: newSlice,
  };
};