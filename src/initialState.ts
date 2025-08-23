import { OPTIONAL_SYMBOL, StateFromInit } from './types';

/**
 * Creates the initial state by unwrapping optional values from the storeDefinition.
 * @param storeDefinition The initial store definition provided by the user.
 * @returns The processed initial state.
 */
export const createInitialState = <T extends Record<string, any>>(storeDefinition: T): StateFromInit<T> => {
  return Object.keys(storeDefinition).reduce((acc, key) => {
    const value = storeDefinition[key];
    if (value && value[OPTIONAL_SYMBOL]) {
      acc[key as keyof T] = value.value;
    } else {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as StateFromInit<T>);
};