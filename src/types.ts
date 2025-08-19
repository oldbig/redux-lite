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
 * Transforms the initial store definition into the actual state type.
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
export type Action<TState> = {
  type: keyof TState;
  payload: any;
  isPartial: boolean;
};

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
};

/**
 * The final type of the store object returned by the `useReduxLiteStore` hook.
 * It combines the state slices with their corresponding dispatchers.
 */
export type ReduxLiteStore<T> = T & Dispatchers<T>;