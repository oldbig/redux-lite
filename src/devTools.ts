import { useEffect, useRef, useMemo } from 'react';
import { Action, StateFromInit, DevToolsOptions } from './types';

/**
 * Custom hook to integrate with Redux DevTools Extension.
 * It enhances the dispatch function and sends state updates to the DevTools.
 * @param state The current state of the store.
 * @param dispatch The original dispatch function from useReducer.
 * @param initialState The initial state of the store.
 * @param devToolsOptions Options for Redux DevTools integration.
 * @returns An enhanced dispatch function.
 */
export const useReduxDevTools = <T extends Record<string, any>>(
  state: StateFromInit<T>,
  dispatch: React.Dispatch<Action<StateFromInit<T>>>,
  initialState: StateFromInit<T>,
  devToolsOptions?: boolean | DevToolsOptions
) => {
  const devToolsRef = useRef<any>(null);
  const lastActionRef = useRef<Action<StateFromInit<T>> | null>(null);

  // Memoize enhancedDispatch to prevent unnecessary re-creations
  const enhancedDispatch = useMemo(() => {
    if (devToolsOptions) {
      return (action: Action<StateFromInit<T>>) => {
        lastActionRef.current = action;
        dispatch(action);
      };
    }
    return dispatch;
  }, [dispatch, devToolsOptions]);

  // Effect to send state updates to DevTools
  useEffect(() => {
    if (devToolsRef.current && lastActionRef.current) {
      devToolsRef.current.send(lastActionRef.current, state);
    }
  }, [state]);

  // Effect to connect to Redux DevTools Extension
  useEffect(() => {
    if (!devToolsOptions) {
      return;
    }

    const options = typeof devToolsOptions === 'object' ? devToolsOptions : {};
    const devTools = window.__REDUX_DEVTOOLS_EXTENSION__?.connect(options);

    if (devTools) {
      devToolsRef.current = devTools;
      devTools.init(initialState);

      return () => {
        devToolsRef.current = null;
      };
    }
  }, [initialState, devToolsOptions]);

  return enhancedDispatch;
};