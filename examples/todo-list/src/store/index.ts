import { initiate, type Middleware, type StateFromInit } from '@oldbig/redux-lite';
import { INIT_TODO_STORE } from './todo';

/**
 * 👇 This is a middleware example that logs when the optional todo is being edited.
 * Middlewares in redux-lite work similarly to Redux middlewares, allowing you to
 * intercept and process actions before they reach the reducer.
 */
const todoEditLoggerMiddleware: Middleware<StateFromInit<typeof INIT_TODO_STORE>> =
  ({getState}) => (next: any) => (action: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    // Log when the optional 'todo' slice is being updated
    if (action.type === 'todo') {
      console.log('Optional todo is being edited:', action);
      console.log('Optional todo before edited:', getState().todo?.text);
    }
    const newAction = next(action);
    if (action.type === 'todo') {
      console.log('Optional todo after edited:', getState().todo?.text);
    }
    // Pass the action to the next middleware or reducer
    return newAction;
  };

/**
 * 👇 This is the single entry point for `redux-lite`.
 * The `initiate` function takes your initial store definition
 * and returns the `ReduxLiteProvider` and the `useReduxLiteStore` hook.
 *
 * The second argument to `initiate` is an options object.
 * Here, we are enabling Redux DevTools integration by passing `{ devTools: true }`.
 * We're also adding a middleware example to demonstrate how middlewares work.
 * You can also pass an object with a `name` property to identify the store instance
 * in the DevTools extension, like `{ devTools: { name: 'My Awesome App' } }.
 */
export const { ReduxLiteProvider, useReduxLiteStore, useSelector } =
  initiate(INIT_TODO_STORE, { 
    devTools: { name: 'Todo list state' },
    middlewares: [todoEditLoggerMiddleware]
  });
