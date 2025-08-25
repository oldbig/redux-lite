import { optional } from '@oldbig/redux-lite';

export type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export type Filter = 'all' | 'active' | 'completed';

export const INIT_TODO_STORE = {
  todos: [] as Todo[],
  filter: 'all' as Filter,
  /**
   * 👇 This demonstrates the `optional` feature.
   * The `todo` slice is marked as optional, meaning it can be `undefined`.
   * If not provided in the `ReduxLiteProvider`, it will not be included in the store,
   * which is useful for features that are enabled conditionally.
   */
  todo: optional({
    id: 0,
    text: 'optional todo',
    completed: false,
  }),
};