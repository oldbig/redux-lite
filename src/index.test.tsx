import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { initiate, optional } from './index';
import React from 'react';

const INIT_STORE = {
  user: { name: 'Jhon', age: 30 },
  task: optional({ id: 1, title: 'Test' }),
  count: 6,
};

// Define a reusable type for the store hook return value
import { ReduxLiteStore, StateFromInit } from './types';

// Define a reusable type for the store hook return value
type StoreHook = ReduxLiteStore<StateFromInit<typeof INIT_STORE>>;

describe('redux-lite', () => {
  it('should initialize with correct initial state', () => {
    const { useReduxLiteStore, ReduxLiteProvider } = initiate(INIT_STORE);
    let store: StoreHook | null = null;
    const TestComponent = () => {
      store = useReduxLiteStore();
      return null;
    };
    render(
      <ReduxLiteProvider>
        <TestComponent />
      </ReduxLiteProvider>
    );
    expect(store).not.toBeNull();
    expect(store!.user.name).toBe('Jhon');
    expect(store!.task?.title).toBe('Test');
    expect(store!.count).toBe(6);
  });

  it('should dispatch full updates correctly', () => {
    const { useReduxLiteStore, ReduxLiteProvider } = initiate(INIT_STORE);
    let store: StoreHook | null = null;
    const TestComponent = () => {
      store = useReduxLiteStore();
      return <button onClick={() => store!.dispatchUser({ name: 'Ken', age: 31 })}>Update Full</button>;
    };
    const { getByText } = render(
      <ReduxLiteProvider>
        <TestComponent />
      </ReduxLiteProvider>
    );
    act(() => {
      getByText('Update Full').click();
    });
    expect(store).not.toBeNull();
    expect(store!.user.name).toBe('Ken');
    expect(store!.user.age).toBe(31);
  });

  it('should dispatch partial updates correctly', () => {
    const { useReduxLiteStore, ReduxLiteProvider } = initiate(INIT_STORE);
    let store: StoreHook | null = null;
    const TestComponent = () => {
      store = useReduxLiteStore();
      return <button onClick={() => store!.dispatchPartialUser({ age: 32 })}>Update Partial</button>;
    };
    const { getByText } = render(
      <ReduxLiteProvider>
        <TestComponent />
      </ReduxLiteProvider>
    );
    act(() => {
      getByText('Update Partial').click();
    });
    expect(store).not.toBeNull();
    expect(store!.user.name).toBe('Jhon'); // Should remain unchanged
    expect(store!.user.age).toBe(32);
  });

  it('should handle functional updates correctly', () => {
    const { useReduxLiteStore, ReduxLiteProvider } = initiate(INIT_STORE);
    let store: StoreHook | null = null;
    const TestComponent = () => {
      store = useReduxLiteStore();
      return <button onClick={() => store!.dispatchCount(c => c + 5)}>Update Functional</button>;
    };
    const { getByText } = render(
      <ReduxLiteProvider>
        <TestComponent />
      </ReduxLiteProvider>
    );
    act(() => {
      getByText('Update Functional').click();
    });
    expect(store).not.toBeNull();
    // Initial count was 6, added 5.
    expect(store!.count).toBe(11);
  });

  it('should handle optional state being set to undefined', () => {
    const { useReduxLiteStore, ReduxLiteProvider } = initiate(INIT_STORE);
    let store: StoreHook | null = null;
    const TestComponent = () => {
      store = useReduxLiteStore();
      return <button onClick={() => store!.dispatchTask(undefined)}>Clear Task</button>;
    };
    const { getByText } = render(
      <ReduxLiteProvider>
        <TestComponent />
      </ReduxLiteProvider>
    );
    act(() => {
      getByText('Clear Task').click();
    });
    expect(store).not.toBeNull();
    expect(store!.task).toBeUndefined();
  });

  it('should not re-render if state is the same', () => {
    const { useReduxLiteStore, ReduxLiteProvider } = initiate(INIT_STORE);
    let renderCount = 0;
    let store: StoreHook | null = null;
    const TestComponent = () => {
      renderCount++;
      store = useReduxLiteStore();
      return <button onClick={() => store!.dispatchUser({ name: 'Jhon', age: 30 })}>Update Same</button>;
    };
    const { getByText } = render(
      <ReduxLiteProvider>
        <TestComponent />
      </ReduxLiteProvider>
    );
    expect(renderCount).toBe(1);
    act(() => {
      getByText('Update Same').click();
    });
    expect(renderCount).toBe(1); // Should not re-render
  });

  it('should allow functional updates to access the full store', () => {
    const { useReduxLiteStore, ReduxLiteProvider } = initiate(INIT_STORE);
    let store: StoreHook | null = null;
    const TestComponent = () => {
      store = useReduxLiteStore();
      return (
        <>
          <button onClick={() => store!.dispatchCount(10)}>Set Counter</button>
          <button onClick={() => store!.dispatchPartialUser((user, fullStore) => ({ age: user.age + fullStore.count + (fullStore.task?.id ?? 0) }))}>Update With Store</button>
        </>
      );
    };

    const { getByText } = render(
      <ReduxLiteProvider>
        <TestComponent />
      </ReduxLiteProvider>
    );

    // First, set the counter to a known value
    act(() => {
      getByText('Set Counter').click();
    });

    // Then, perform the update that depends on the counter
    act(() => {
      getByText('Update With Store').click();
    });

    expect(store).not.toBeNull();
    // Initial age was 30, counter was set to 10, task.id is 1. New age should be 41.
    expect(store!.user.age).toBe(41);
  });
});