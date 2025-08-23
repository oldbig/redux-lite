import { initiate } from '@oldbig/redux-lite';

// Define the initial store structure for performance testing
export const INIT_PERFORMANCE_STORE = {
  // Simple counter for basic performance tests
  counter: 0,
  
  // Array for testing list performance
  items: [] as string[],
  
  // Object for testing nested updates
  profile: {
    name: 'Test User',
    age: 30,
    settings: {
      theme: 'light',
      notifications: true,
    },
  },
};

export const { ReduxLiteProvider, useReduxLiteStore, useSelector } = initiate(INIT_PERFORMANCE_STORE);