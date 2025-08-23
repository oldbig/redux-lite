import { useReduxLiteStore } from '../store';
import type { Filter } from '../store/todo';

export const TodoFilter = () => {
  const { filter, todos, dispatchFilter } = useReduxLiteStore();

  const activeCount = todos.filter(todo => !todo.completed).length;

  return (
    <div className="todo-filter">
      <span className="todo-count">{activeCount} items left</span>
      <div className="filters">
        {(['all', 'active', 'completed'] as Filter[]).map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => {
              /**
               * 👇 This demonstrates updating a primitive value (a string).
               * `dispatchFilter` directly sets the new value for the `filter` slice.
               */
              dispatchFilter(f);
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};