import { initiate } from '../../../../src';
import { INIT_TODO_STORE } from './todo';

/**
 * 👇 This is the single entry point for `redux-lite`.
 * The `initiate` function takes your initial store definition
 * and returns the `ReduxLiteProvider` and the `useReduxLiteStore` hook.
 *
 * The second argument to `initiate` is an options object.
 * Here, we are enabling Redux DevTools integration by passing `{ devTools: true }`.
 * You can also pass an object with a `name` property to identify the store instance
 * in the DevTools extension, like `{ devTools: { name: 'My Awesome App' } }`.
 */
export const { ReduxLiteProvider, useReduxLiteStore } =
  initiate(INIT_TODO_STORE, { devTools: { name: 'Todo list state' } });