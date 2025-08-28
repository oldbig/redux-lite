import { StateFromInit, InitiateOptions, StateOverride, InitiateReturnType } from './types';
import { optional } from './utils';
import { createInitialState } from './initialState';
import { StoreContextProvider } from './provider';
import { useReduxLiteStore } from './hook';
import { createUseSelector } from './useSelector';

/**
 * Initiates the ReduxLite store by taking the initial store definition
 * and returning the Provider component and the useReduxLiteStore hook.
 * @param storeDefinition The initial store definition object.
 * @param options Optional configuration for the store, including DevTools.
 * @returns An object containing the ReduxLiteProvider, useReduxLiteStore hook, and useSelector hook.
 */
function initiate<T extends Record<string, any>>(storeDefinition: T, options?: InitiateOptions<StateFromInit<T>>): InitiateReturnType<T> {
  // Create the initial state by unwrapping optional values
  const initialState = createInitialState(storeDefinition);

  // Create a typed useSelector hook
  const useSelector = createUseSelector<T>();

  // StoreContextProvider component that holds the state and provides it to the React tree.
  const ReduxLiteProvider = (props: React.PropsWithChildren<{ initStore?: StateOverride<StateFromInit<T>> }>) => (
    <StoreContextProvider<T>
      initialState={initialState}
      options={options}
      {...props}
    />
  );

  return {
    ReduxLiteProvider,
    useReduxLiteStore: useReduxLiteStore<T>,
    useSelector,
  };
}

export { optional, initiate };