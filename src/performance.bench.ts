import { bench, describe, beforeEach } from 'vitest';
import { initiate } from './index';

// Define a test store structure
const TEST_STORE = {
 counter: 0,
  items: [] as string[],
  profile: {
    name: 'Test User',
    age: 30,
    settings: {
      theme: 'light',
      notifications: true,
    },
  },
  nested: {
    level1: {
      level2: {
        value: 'deeply nested'
      }
    }
  }
};

describe('Redux Lite Performance Benchmarks', () => {
  let useReduxLiteStore: any;
  let dispatchCounter: any;
  let dispatchItems: any;
  let dispatchProfile: any;
  let dispatchPartialProfile: any;
  let dispatchNested: any;
  
  beforeEach(() => {
    // Create a fresh store for each benchmark
    const { useReduxLiteStore: storeHook } = initiate(TEST_STORE);
    
    // In a real test, we would mount a component, but for benchmarks,
    // we'll just access the dispatchers directly
    useReduxLiteStore = storeHook;
    
    // Mock the dispatchers - in real usage these would come from the hook
    // but for benchmarks we'll simulate them
    let state = JSON.parse(JSON.stringify(TEST_STORE));
    
    dispatchCounter = (updater: any) => {
      if (typeof updater === 'function') {
        state.counter = updater(state.counter, state);
      } else {
        state.counter = updater;
      }
    };
    
    dispatchItems = (updater: any) => {
      if (typeof updater === 'function') {
        state.items = updater(state.items, state);
      } else {
        state.items = updater;
      }
    };
    
    dispatchProfile = (updater: any) => {
      if (typeof updater === 'function') {
        state.profile = updater(state.profile, state);
      } else {
        state.profile = updater;
      }
    };
    
    dispatchPartialProfile = (updater: any) => {
      if (typeof updater === 'function') {
        state.profile = { ...state.profile, ...updater(state.profile, state) };
      } else {
        state.profile = { ...state.profile, ...updater };
      }
    };
    
    dispatchNested = (updater: any) => {
      if (typeof updater === 'function') {
        state.nested = updater(state.nested, state);
      } else {
        state.nested = updater;
      }
    };
  });

  bench('initiate function', () => {
    initiate(TEST_STORE);
  });

  bench('dispatchCounter with primitive value', () => {
    dispatchCounter(5);
  });

  bench('dispatchCounter with function updater', () => {
    dispatchCounter((prev: number) => prev + 1);
  });

  bench('dispatchItems with array update', () => {
    dispatchItems(['item1', 'item2', 'item3']);
  });

  bench('dispatchItems with function updater', () => {
    dispatchItems((prev: string[]) => [...prev, 'new item']);
  });

  bench('dispatchProfile with object update', () => {
    dispatchProfile({
      name: 'Updated User',
      age: 35,
      settings: {
        theme: 'dark',
        notifications: false,
      },
    });
  });

  bench('dispatchProfile with function updater', () => {
    dispatchProfile((prev: any) => ({
      ...prev,
      name: 'Function Updated User',
      age: prev.age + 1
    }));
  });

  bench('dispatchPartialProfile with partial update', () => {
    dispatchPartialProfile({
      name: 'Partially Updated User',
    });
  });

  bench('dispatchPartialProfile with function updater', () => {
    dispatchPartialProfile((prev: any) => ({
      name: `${prev.name} - updated`,
    }));
 });

  bench('dispatchNested with deep update', () => {
    dispatchNested({
      level1: {
        level2: {
          value: 'new deep value'
        }
      }
    });
  });

  bench('dispatchNested with function updater', () => {
    dispatchNested((prev: any) => ({
      ...prev,
      level1: {
        ...prev.level1,
        level2: {
          ...prev.level1.level2,
          value: 'function updated deep value'
        }
      }
    }));
  });

  // Batch operations
  bench('1000 consecutive counter updates', () => {
    for (let i = 0; i < 1000; i++) {
      dispatchCounter((prev: number) => prev + 1);
    }
  });

  bench('100 consecutive array pushes', () => {
    for (let i = 0; i < 100; i++) {
      dispatchItems((prev: string[]) => [...prev, `item-${i}`]);
    }
  });
});