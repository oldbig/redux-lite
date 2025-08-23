import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { act, memo } from 'react';
import { initiate } from './index';
import { optional } from './utils';

const INIT_STORE = {
  user: { name: 'Ken', age: 30, data: { name: 'data-test', value: 111 } },
  task: optional({ id: 1, title: 'Test' }),
  count: 6,
};

describe('useSelector', () => {
  it('should select state slice correctly', () => {
    const { useSelector, ReduxLiteProvider } = initiate(INIT_STORE);

    const TestComponent = () => {
      const selectedUser = useSelector((state) => state.user);
      return <div>User: {selectedUser.name}, Age: {selectedUser.age}</div>;
    };

    const { getByText } = render(
      <ReduxLiteProvider>
        <TestComponent />
      </ReduxLiteProvider>
    );

    // Verify the user data is displayed correctly
    expect(getByText('User: Ken, Age: 30')).toBeDefined();
  });

  it('should return selected data instead of entire store', () => {
    const { useSelector, ReduxLiteProvider, useReduxLiteStore } = initiate(INIT_STORE);

    const SelectorComponent = () => {
      const selectedUser = useSelector((state) => state.user);
      return <div>Selected User: {selectedUser.name}</div>;
    };

    const FullStoreComponent = () => {
      const fullStore = useReduxLiteStore();
      return <div>Full Store User: {fullStore.user.name}</div>;
    };

    const { getByText } = render(
      <ReduxLiteProvider>
        <SelectorComponent />
        <FullStoreComponent />
      </ReduxLiteProvider>
    );

    // Verify both components display the correct user name
    expect(getByText('Selected User: Ken')).toBeDefined();
    expect(getByText('Full Store User: Ken')).toBeDefined();
  });

  it('should use custom equality function', () => {
    const { useSelector, ReduxLiteProvider, useReduxLiteStore } = initiate(INIT_STORE);
    let renderCount = 0;

    // Custom equality function that only compares user name
    const nameEquality = (a: { name: string; sayHi: () => string; }, b: { name: string; sayHi: () => string; }) => a.name === b.name;

    const DataComponent = memo(({user}:{user: {name: string, sayHi():string}})=>{
      renderCount++;
      return <>
          <div>User: {user.name}</div>
          <div>User say: {user.sayHi()}</div>
        </>
    });
    const UserComponent = () => {
      const selectedUser = useSelector(({ user: { name } }) => ({ name, sayHi: () => `Hi ${name}` }), nameEquality);
      return <DataComponent user={selectedUser}/>;
    };

    const ControlComponent = () => {
      const store = useReduxLiteStore();
      return (
        <div>
          <button 
            onClick={() => store.dispatchUser((u) => ({ ...u, age: u.age + 1 }))
          }>
            Increment Age
          </button>
          <button 
            onClick={() => store.dispatchPartialUser({ name: 'John' })
          }>
            Change Name
          </button>
        </div>
      );
    };

    const { getByText } = render(
      <ReduxLiteProvider>
        <UserComponent />
        <ControlComponent />
      </ReduxLiteProvider>
    );

    // Initial render count should be 1
    expect(renderCount).toBe(1);
    
    // Verify initial user name is displayed
    expect(getByText('User: Ken')).toBeDefined();
    expect(getByText('User say: Hi Ken')).toBeDefined();

    // Update age - should not re-render UserComponent because name didn't change
    act(() => {
      getByText('Increment Age').click();
    });

    // Render count should still be 1 because name didn't change
    expect(renderCount).toBe(1);

    // Update name - should re-render UserComponent
    act(() => {
      getByText('Change Name').click();
    });

    // Render count should now be 2 because name changed
    expect(renderCount).toBe(2);
    expect(getByText('User: John')).toBeDefined();
  });

  it('should throw error when used outside of provider', () => {
    const { useSelector } = initiate(INIT_STORE);

    const TestComponent = () => {
      useSelector((state) => state.user);
      return <div>Test</div>;
    };

    // Suppress the expected error from being logged to the console
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow('useSelector must be used within a ReduxLiteProvider.');

    spy.mockRestore();
  });

  it('should handle complex selectors', () => {
    const { useSelector, ReduxLiteProvider } = initiate(INIT_STORE);

    const TestComponent = () => {
      const selectedData = useSelector((state) => state.user.data.value);
      return <div>Value: {selectedData}</div>;
    };

    const { getByText } = render(
      <ReduxLiteProvider>
        <TestComponent />
      </ReduxLiteProvider>
    );

    // Verify the complex selector works correctly
    expect(getByText('Value: 111')).toBeDefined();
  });
});