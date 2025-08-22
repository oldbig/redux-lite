# redux-lite

[简体中文](README.zh-CN.md)

[![npm version](https://img.shields.io/npm/v/@oldbig/redux-lite.svg)](https://www.npmjs.com/package/@oldbig/redux-lite)
[![license](https://img.shields.io/npm/l/@oldbig/redux-lite.svg)](LICENSE)
![coverage badge](assets/coverage.svg)

**A lightweight, zero-dependency, type-safe state management library for React.**

`redux-lite` offers a modern, simple, and highly performant state management solution, designed to provide an excellent developer experience with TypeScript. Unit testing your components is now unimaginably easy.

## Core Features

- **🚀 Zero-Dependency**: Extremely lightweight with no third-party runtime dependencies (only `react` as a peer dependency).
- **⚡️ High Performance**: Avoids unnecessary re-renders by design through smart value comparisons.
- **✨ Simple & Intuitive API**: A minimal API that is easy to learn and use.
- **🔒 Fully Type-Safe**: End-to-end type safety, from store definition to dispatchers, with excellent autocompletion.
- **✅ Unbelievably Easy Testing**: A flexible provider makes mocking state for unit tests trivial.
- **🐞 DevTools Ready**: Optional, zero-cost integration with Redux DevTools for a great debugging experience.

## Installation

```bash
npm install @oldbig/redux-lite
# or
yarn add @oldbig/redux-lite
# or
pnpm add @oldbig/redux-lite
```

## Getting Started

### 1. Define your initial store

Create an `INIT_STORE` object. This single object is the source of truth for your entire state structure and types.

```typescript
// store.ts
import { initiate, optional } from '@oldbig/redux-lite';

export const INIT_STORE = {
  user: {
    name: 'Jhon' as string | null,
    age: 30,
  },
  // Use `optional` for state slices that might not exist
  task: optional({ 
    id: 1,
    title: 'Finish redux-lite',
  }),
  counter: 0,
};

export const { ReduxLiteProvider, useReduxLiteStore } = initiate(INIT_STORE);
```

### 2. Wrap your app with the `Provider`

In your main application file, wrap your component tree with the `ReduxLiteProvider`.

```tsx
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ReduxLiteProvider } from './store';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReduxLiteProvider>
      <App />
    </ReduxLiteProvider>
  </React.StrictMode>,
);
```

### 3. Use the hook in your components

Use the `useReduxLiteStore` hook to access state slices and their corresponding dispatchers. The hook returns a flattened object containing all state properties and type-safe dispatcher functions.

```tsx
// MyComponent.tsx
import { useReduxLiteStore } from './store';

const MyComponent = () => {
  // Destructure state and dispatchers
  const { 
    user, 
    counter,
    dispatchUser, 
    dispatchPartialUser, 
    dispatchCounter 
  } = useReduxLiteStore();

  return (
    <div>
      <h2>User: {user.name}</h2>
      <p>Counter: {counter}</p>

      {/* Full update */}
      <button onClick={() => dispatchUser({ name: 'Ken', age: 31 })}>
        Set User
      </button>

      {/* Partial update */}
      <button onClick={() => dispatchPartialUser({ age: 35 })}>
        Update Age
      </button>

      {/* Functional update with access to the full store */}
      <button onClick={() => dispatchPartialUser((prev, store) => ({ age: prev.age + store.counter }))}>
        Increment Age by Counter
      </button>
    </div>
  );
};
```

## API

### `initiate(INIT_STORE)`

The sole entry point for the library.

- **`INIT_STORE`**: An object that defines the shape and initial values of your store.
- **Returns**: An object containing `{ ReduxLiteProvider, useReduxLiteStore }`.

### `useReduxLiteStore()`

The hook returns a flattened object containing all state slices and dispatchers.

**Dispatchers**

For each slice of state (e.g., `user`), two dispatchers are generated:
- `dispatchUser(payload)`: For full updates.
- `dispatchPartialUser(payload)`: For partial updates.

The `payload` can be a value or a function. If it's a function, it receives the previous state of that slice as the first argument, and the **entire store state** as the second argument: `(prevState, fullStore) => newState`.

### `optional(initialValue?)`

A helper function to mark a state slice as optional. The state property will be typed as `T | undefined`.

- **`initialValue`** (optional): The initial value of the property. If not provided, the state will be `undefined`.

## Performance

`redux-lite` is designed for high performance. The internal reducer uses smart value comparison to prevent state updates and re-renders when data has not changed.

In a benchmark test that simulates a real-world scenario by calling a dispatch function repeatedly, `redux-lite` was able to perform **10,000 state updates in approximately 35 milliseconds**. This demonstrates its exceptional speed even when including React's rendering lifecycle.

## Comparison with Redux

| Feature              | **Redux (with Redux Toolkit)**                                  | **redux-lite**                                                              |
| -------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Boilerplate**      | Requires `createSlice`, `configureStore`, actions, reducers.    | Almost zero. Define one object, get everything you need.                    |
| **API Surface**      | Larger API with multiple concepts (slices, thunks, selectors).  | Minimal. `initiate`, `optional`, and the returned hook.                     |
| **Type Safety**      | Good, but can require manual typing for thunks and selectors.   | **End-to-end**. Types are automatically inferred for everything.            |
| **Performance**      | Highly performant, but relies on memoized selectors (`reselect`). | Built-in. Automatically prevents updates if values are deeply equal.        |
| **Dependencies**     | `@reduxjs/toolkit` and `react-redux`.                           | **None**. Only `react` as a peer dependency.                                |
| **Simplicity**       | Steeper learning curve.                                         | Extremely simple. If you know React hooks, you know `redux-lite`.           |

<details>
<summary>Testing Your Components</summary>

`redux-lite` makes testing components that use the store incredibly simple. The `ReduxLiteProvider` accepts an `initStore` prop, which allows you to provide a deep partial state to override the default initial state for your tests.

This means you don't need to dispatch actions to set up your desired test state. You can directly render your component with the exact state it needs.

### Example

Here's how you can easily mock state for your components:

```tsx
import { render } from '@testing-library/react';
import { initiate } from '@oldbig/redux-lite';
import React from 'react';

// Assume this is your initial store configuration
const INIT_STORE = {
  user: { name: 'Guest', age: 0, profile: { theme: 'dark' } },
  isAuthenticated: false,
};

const { ReduxLiteProvider, useReduxLiteStore } = initiate(INIT_STORE);

// --- Your Component ---
const UserProfile: React.FC = () => {
  const { user } = useReduxLiteStore();
  return <div>Welcome, {user.name} (Theme: {user.profile.theme})</div>;
};

// --- Your Test ---
it('should display the authenticated user name with overridden profile', () => {
  const { getByText } = render(
    <ReduxLiteProvider initStore={{ user: { name: 'Alice', profile: { theme: 'light' } }, isAuthenticated: true }}>
      <UserProfile />
    </ReduxLiteProvider>
  );

  // The component renders with the exact state you provided
  expect(getByText('Welcome, Alice (Theme: light)')).toBeInTheDocument();
});

it('should shallow merge user slice and replace nested objects', () => {
  const { getByText } = render(
    <ReduxLiteProvider initStore={{ user: { name: 'Bob' } }}>
      <UserProfile />
    </ReduxLiteProvider>
  );

  // user.name is overridden, user.age remains default, user.profile is untouched
  expect(getByText('Welcome, Bob (Theme: dark)')).toBeInTheDocument();
});
```

You can easily test your components in different states without any complex setup or mocking.

</details>

<details>
<summary>DevTools Integration</summary>

`redux-lite` offers optional integration with the [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools) for a first-class debugging experience, including action tracking and time-travel debugging.

This feature is disabled by default and has **zero performance cost** when not in use.

**How to Enable**

To enable the integration, pass the `devTools` option to the `initiate` function.

```typescript
// Enable with default options
const { ReduxLiteProvider, useReduxLiteStore } = initiate(INIT_STORE, {
  devTools: true
});

// Or provide a name for your store instance
const { ReduxLiteProvider, useReduxLiteStore } = initiate(INIT_STORE, {
  devTools: { name: 'MyAppStore' }
});
```

**Installation**

1.  Install the Redux DevTools Extension for your browser:
    *   [Chrome Web Store](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
    *   [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)
2.  Enable the feature in your code as shown above.
3.  Open your browser's developer tools and find the "Redux" tab.

![Redux DevTools Screenshot](./assets/redux-devTools.png)

</details>

## Support This Project

If you find `redux-lite` helpful and would like to support its development, please consider:

- Giving a ⭐️ on [GitHub](https://github.com/oldbig/redux-lite)
- [Buying me a coffee](https://buymeacoffee.com/oldbig)

Your support is greatly appreciated!

## License

This project is licensed under the MIT License.