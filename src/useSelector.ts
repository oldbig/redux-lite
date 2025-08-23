import { useContext, useState } from 'react';
import { StoreContext } from './context';
import { StateFromInit } from './types';
import { isEqual } from './utils';

/**
 * A hook to select a slice of the ReduxLite store state.
 *
 * @param selector A function that selects a slice of the state.
 * @param equalityFn An optional function to compare the previous and next selected state.
 *                   In most cases, you don't need to provide this parameter. Only provide it
 *                   when the selector function's return value contains method-type fields.
 * @returns The selected state slice.
 */
export function useSelector<TState extends Record<string, any>, TSelected>(
  selector: (state: StateFromInit<TState>) => TSelected,
  equalityFn: (left: TSelected, right: TSelected) => boolean = isEqual
): TSelected {
  const context = useContext(StoreContext);
  
  if (!context) {
    throw new Error('useSelector must be used within a ReduxLiteProvider.');
  }

  const { state } = context;
  const currentSelectorData = selector(state);
  const [selectorData, setSelectorData] = useState<TSelected>(currentSelectorData);

  if(!equalityFn(selectorData, currentSelectorData)) {
    setSelectorData(currentSelectorData);
  }
  
  return selectorData;
}

// Export a typed version for use in the initiate function
export const createUseSelector = <T extends Record<string, any>>() => {
  return <TSelected>(
    selector: (state: StateFromInit<T>) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean
  ): TSelected => useSelector<T, TSelected>(selector, equalityFn);
};