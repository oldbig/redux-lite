import { vi } from 'vitest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { initiate } from './index';
import React, {act  } from 'react';
import { optional } from './utils';

const INIT_STORE = {
  user: { name: 'Jhon', age: 30, data: { name: 'data-test', value: 111 } },
  task: optional({ id: 1, title: 'Test' }),
  count: 6,
};

// Define a reusable type for the store hook return value
import { ReduxLiteStore, StateFromInit, StateOverride } from './types';

type StoreHook = ReduxLiteStore<StateFromInit<typeof INIT_STORE>>;

describe('redux-lite core functionality', () => {
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
    expect(store!.user.age).toBe(30);
    expect(store!.user.data).toEqual({ name: 'data-test', value: 111 });
    expect(store!.task?.title).toBe('Test');
    expect(store!.count).toBe(6);
  });

  it('should dispatch full updates correctly', () => {
    const { useReduxLiteStore, ReduxLiteProvider } = initiate(INIT_STORE);
    let store: StoreHook | null = null;
    const TestComponent = () => {
      store = useReduxLiteStore();
      return <button onClick={() => store!.dispatchUser({ name: 'Ken', age: 31, data: { name: 'new-data', value: 222 } })}>Update Full</button>;
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
    expect(store!.user.data).toEqual({ name: 'new-data', value: 222 });
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
    expect(store!.user.data).toEqual({ name: 'data-test', value: 111 }); // Should remain unchanged
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
      return <button onClick={() => store!.dispatchUser({ name: 'Jhon', age: 30, data: { name: 'data-test', value: 111 } })}>Update Same</button>;
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

  it('should override initial state with shallow merge for object slices and replace for nested objects', () => {
    const { useReduxLiteStore, ReduxLiteProvider } = initiate(INIT_STORE);
    let store: StoreHook | null = null;
    const TestComponent = () => {
      store = useReduxLiteStore();
      return null;
    };
    render(
      <ReduxLiteProvider initStore={{ count: 1, user: { age: 10 }, task: undefined }}>
        <TestComponent />
      </ReduxLiteProvider>
    );
    expect(store).not.toBeNull();
    expect(store!.count).toBe(1);
    expect(store!.user.name).toBe('Jhon');
    expect(store!.user.age).toBe(10);
    expect(store!.user.data).toEqual({ name: 'data-test', value: 111 });
    expect(store!.task).toBeUndefined();
  });

  it('should replace nested objects completely when provided in initStore', () => {
    const { useReduxLiteStore, ReduxLiteProvider } = initiate(INIT_STORE);
    let store: StoreHook | null = null;
    const TestComponent = () => {
      store = useReduxLiteStore();
      return null;
    };
    render(
      <ReduxLiteProvider initStore={{ count: 11, task: { id: 2, title: 'new task' }, user: { data: { name: 'new-data-name', value: 222 } } }}>
        <TestComponent />
      </ReduxLiteProvider>
    );
    expect(store).not.toBeNull();
    expect(store!.count).toBe(11);
    expect(store!.user.name).toBe('Jhon');
    expect(store!.user.age).toBe(30);
    expect(store!.user.data).toEqual({ name: 'new-data-name', value: 222 });
    expect(store!.task).toEqual({ id: 2, title: 'new task' });
  });

  it('should throw an error when useReduxLiteStore is used outside of a ReduxLiteProvider', () => {
    const { useReduxLiteStore } = initiate(INIT_STORE);
    const TestComponent = () => {
      useReduxLiteStore();
      return null;
    };
    // Suppress the expected error from being logged to the console
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow('useReduxLiteStore must be used within a ReduxLiteProvider.');
    spy.mockRestore();
  });

  describe('Test Utils Pattern - Simplified', () => {
    const { useReduxLiteStore, ReduxLiteProvider } = initiate(INIT_STORE);

    const UserDisplay: React.FC = () => {
      const { user } = useReduxLiteStore();
      return <div>User: {user.name}</div>;
    };

    it('should render with default initial state', () => {
      const { getByText } = render(
        <ReduxLiteProvider>
          <UserDisplay />
        </ReduxLiteProvider>
      );
      expect(getByText('User: Jhon')).not.toBeNull();
    });

    it('should render with mocked state', () => {
      const { getByText } = render(
        <ReduxLiteProvider initStore={{ user: { name: 'Mocked User' } }}>
          <UserDisplay />
        </ReduxLiteProvider>
      );
      expect(getByText('User: Mocked User')).not.toBeNull();
    });
  });
});

describe('DevTools Integration', () => {
  const mockDevTools = {
    connect: vi.fn(),
    init: vi.fn(),
    send: vi.fn(),
    disconnect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockDevTools.connect.mockReturnValue(mockDevTools);
    window.__REDUX_DEVTOOLS_EXTENSION__ = mockDevTools;
  });

  afterEach(() => {
    delete window.__REDUX_DEVTOOLS_EXTENSION__;
  });

  it('should connect to DevTools and initialize state when enabled', () => {
    const { ReduxLiteProvider } = initiate(INIT_STORE, { devTools: true });
    render(<ReduxLiteProvider><div /></ReduxLiteProvider>);

    expect(mockDevTools.connect).toHaveBeenCalledTimes(1);
    expect(mockDevTools.init).toHaveBeenCalledTimes(1);
  });

  it('should send updates to DevTools when state changes', () => {
    const { useReduxLiteStore, ReduxLiteProvider } = initiate(INIT_STORE, { devTools: true });
    const TestComponent = () => {
      const { dispatchCount } = useReduxLiteStore();
      return <button onClick={() => dispatchCount(c => c + 1)}>Increment</button>;
    };

    const { getByText } = render(<ReduxLiteProvider><TestComponent /></ReduxLiteProvider>);

    act(() => {
      getByText('Increment').click();
    });

    // In the new implementation, the reducer is called, but the state update that triggers the send to devtools
    // happens in a useEffect, which doesn't run in this testing setup without a state change that causes a re-render.
    // A full integration test would be needed to verify the send.
    // However, we can verify the reducer was called.
    expect(mockDevTools.send).toHaveBeenCalledTimes(1);
    const [action, state] = mockDevTools.send.mock.calls[0];
    expect(action.type).toBe('count');
    expect(state.count).toBe(7);
  });

  it('should not interact with DevTools when disabled', () => {
    const { ReduxLiteProvider } = initiate(INIT_STORE); // devTools option is off
    render(<ReduxLiteProvider><div /></ReduxLiteProvider>);

    expect(mockDevTools.connect).not.toHaveBeenCalled();
    expect(mockDevTools.init).not.toHaveBeenCalled();
    expect(mockDevTools.send).not.toHaveBeenCalled();
  });

  it('should pass options to DevTools connect function', () => {
    const devToolsOptions = { name: 'My Test App' };
    const { ReduxLiteProvider } = initiate(INIT_STORE, { devTools: devToolsOptions });
    render(<ReduxLiteProvider><div /></ReduxLiteProvider>);

    expect(mockDevTools.connect).toHaveBeenCalledWith(devToolsOptions);
  });
});
describe('reducer branch coverage', () => {
    it('should return the original state if a partial update results in an equal slice', async () => {
      const { useReduxLiteStore, ReduxLiteProvider } = initiate(INIT_STORE);
      const utils = await import('./utils');
      const spy = vi.spyOn(utils, 'isEqual').mockReturnValue(true);

      let store: StoreHook | null = null;
      let renderCount = 0;
      const TestComponent = () => {
        renderCount++;
        store = useReduxLiteStore();
        return <button onClick={() => store!.dispatchPartialUser({ age: 30 })}>Update</button>;
      };
      const { getByText } = render(<ReduxLiteProvider><TestComponent /></ReduxLiteProvider>);
      
      act(() => {
        getByText('Update').click();
      });

      expect(renderCount).toBe(1);
      spy.mockRestore();
    });

    it('should return the original state if a full update results in an equal slice', async () => {
      const { useReduxLiteStore, ReduxLiteProvider } = initiate(INIT_STORE);
      const utils = await import('./utils');
      const spy = vi.spyOn(utils, 'isEqual').mockReturnValue(true);
      
      let store: StoreHook | null = null;
      let renderCount = 0;
      const TestComponent = () => {
        renderCount++;
        store = useReduxLiteStore();
        return <button onClick={() => store!.dispatchUser({ name: 'Jhon', age: 30, data: { name: 'data-test', value: 111 } })}>Update</button>;
      };
      const { getByText } = render(<ReduxLiteProvider><TestComponent /></ReduxLiteProvider>);
      
      act(() => {
        getByText('Update').click();
      });

      expect(renderCount).toBe(1);
      spy.mockRestore();
    });
  });