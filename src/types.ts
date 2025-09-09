declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __REDUX_DEVTOOLS_EXTENSION__?: any;
  }
}

/**
 * A unique symbol to identify optional values at runtime.
 * We re-export it here to make it accessible to other type definitions.
 */
export const OPTIONAL_SYMBOL = Symbol('optional');

/**
 * The structure of the object returned by the optional function.
 */
export type OptionalValue<T> = {
  [OPTIONAL_SYMBOL]: true;
  value: T | undefined;
};

/**
 * A utility type to check if a type `T` is an OptionalValue.
 */
export type IsOptional<T> = T extends OptionalValue<any> ? true : false;

/**
 * A utility type to extract the underlying value from an OptionalValue.
 */
export type UnwrapOptional<T> = T extends OptionalValue<infer U> ? U : T;

/**
 * A type to capitalize the first letter of a string.
 * e.g., 'user' -> 'User'
 */
export type CapitalizeString<S extends string> = S extends `${infer First}${infer Rest}`
  ? `${Uppercase<First>}${Rest}`
  : S;

/**
 * Transforms the store definition into the actual state type.
 * It unwraps OptionalValue and handles optional properties.
 */
export type StateFromInit<T> = {
  [K in keyof T]: T[K] extends OptionalValue<infer V>
    ? V | undefined
    : T[K];
};

/**
 * The shape of the action for the reducer.
 */
type PayloadType<TState, K extends keyof TState, IsPartial extends boolean> =
  IsPartial extends true
    ? Partial<TState[K]>
    : TState[K];

/**
 * The shape of the action for the reducer.
 * This is a union type that precisely defines the payload based on `isPartial`.
 */
export type Action<TState> =
  | {
      [K in keyof TState]: {
        type: K;
        payload: PayloadType<TState, K, false>;
        isPartial: false;
      };
    }[keyof TState]
  | {
      [K in keyof TState]: {
        type: K;
        payload: PayloadType<TState, K, true>;
        isPartial: true;
      };
    }[keyof TState];

/**
 * The API object provided to each middleware.
 * `getState` returns the current state.
 * `dispatch` sends an action to the next middleware in the chain.
 */
export type MiddlewareAPI<S> = {
  getState: () => S;
  dispatch: (action: Action<S>) => Action<S>;
};

/**
 * The function signature for a middleware.
 * It is a higher-order function that composes with other middlewares.
 */
export type Middleware<S> = (
  api: MiddlewareAPI<S>
) => (
  next: (action: Action<S>) => Action<S>
) => (action: Action<S>) => Action<S>;

/**
 * The type for the dispatch functions, e.g., `dispatchUser`.
 */
export type Dispatcher<T, S> = (
  payload: T | ((prev: T, fullState: S) => T)
) => void;

/**
 * The type for the partial dispatch functions, e.g., `dispatchPartialUser`.
 */
export type PartialDispatcher<T, S> = (
  payload: Partial<T> | ((prev: T, fullState: S) => Partial<T>)
) => void;

/**
 * Generates the full set of dispatchers from the state type.
 * e.g., { dispatchUser: ..., dispatchPartialUser: ..., dispatchTask: ... }
 */
export type Dispatchers<T> = {
  [K in keyof T & string as `dispatch${CapitalizeString<K>}`]: Dispatcher<T[K], T>;
} & {
  [K in keyof T & string as `dispatchPartial${CapitalizeString<K>}`]: PartialDispatcher<T[K], T>;
} & {
  [K in keyof T & string as `dispatchAsync${CapitalizeString<K>}`]: AsyncDispatcher<T[K], T>;
} & {
  [K in keyof T & string as `dispatchAsyncPartial${CapitalizeString<K>}`]: AsyncPartialDispatcher<T[K], T>;
};

/**
 * The type for the async dispatch functions, e.g., `dispatchAsyncUser`.
 */
export type AsyncDispatcher<T, S> = (
  payload: Promise<T> | ((getPrev: () => T, getFullState: () => S) => Promise<T>)
) => Promise<void>;

/**
 * The type for the async partial dispatch functions, e.g., `dispatchAsyncPartialUser`.
*/
export type AsyncPartialDispatcher<T, S> = (
  payload: Promise<Partial<T>> | ((getPrev: () => T, getFullState: () => S) => Promise<Partial<T>>)
) => Promise<void>;

/**
 * The final type of the store object returned by the `useReduxLiteStore` hook.
 * It combines the state slices with their corresponding dispatchers.
 */
export type ReduxLiteStore<T> = T & Dispatchers<T>;

/**
 * Configuration options for Redux DevTools integration.
 */
export type DevToolsOptions = {
  /**
   * The name of the store instance to display in the DevTools.
   */
  name?: string;
};

/**
 * Options for the `initiate` function.
 */
export type InitiateOptions<S> = {
  /**
   * Configuration for Redux DevTools.
   * Can be a boolean to enable/disable or an object for more specific options.
   */
  devTools?: boolean | DevToolsOptions;
  /**
   * An array of middlewares to apply to the store.
   * Middlewares are applied in the order they are provided.
   */
  middlewares?: Middleware<S>[];
};

/**
 * A type for the `initStore` prop of the provider. It allows each state slice
 * to be optional, and for object-based slices, their properties are also optional.
 * This enables shallow merging of initial state overrides.
 */
export type StateOverride<T> = {
  [K in keyof T]?: T[K] extends object ? Partial<T[K]> : T[K];
};

/**
 * The return type of the `initiate` function.
 */
export type InitiateReturnType<T> = {
  ReduxLiteProvider: React.ComponentType<React.PropsWithChildren<{ initStore?: StateOverride<StateFromInit<T>> }>>;
  useReduxLiteStore: () => ReduxLiteStore<StateFromInit<T>>;
  useSelector: <TSelected>(
    selector: (state: StateFromInit<T>) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean
  ) => TSelected;
};