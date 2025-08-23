import { createContext } from 'react';
import { StateFromInit, Action } from './types';

/**
 * React Context for the ReduxLite store.
 * It provides the current state and the dispatch function to consuming components.
 */
export const StoreContext = createContext<{
  state: StateFromInit<any>;
  dispatch: React.Dispatch<Action<StateFromInit<any>>>;
} | null>(null);