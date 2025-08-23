import { useReduxLiteStore, useSelector } from '../store';
import type { Todo } from '../store/todo';

export const TodoList = () => {
  const { todos, filter, dispatchTodos } = useReduxLiteStore();
  
  // Using useSelector to get counts of completed and active todos
  const completedCount = useSelector((state) =>
    state.todos.filter((todo: Todo) => todo.completed).length
  );
  
  const activeCount = useSelector((state) =>
    state.todos.filter((todo: Todo) => !todo.completed).length
  );

  const toggleTodo = (id: number) => {
    /**
     * 👇 This also demonstrates a full state slice update.
     * We are replacing the entire `todos` array with a new, modified version.
     */
    dispatchTodos((todos) =>
      todos.map((todo: Todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    /**
     * 👇 Another example of a full state slice update for an array.
     */
    dispatchTodos((todos) => todos.filter((todo: Todo) => todo.id !== id));
  };

  const filteredTodos = todos.filter((todo: Todo) => {
    if (filter === 'active') {
      return !todo.completed;
    }
    if (filter === 'completed') {
      return todo.completed;
    }
    return true;
  });

  return (
    <div>
      <div className="todo-stats">
        <span>Active: {activeCount}</span>
        <span>Completed: {completedCount}</span>
      </div>
      <ul className="todo-list">
        {filteredTodos.map((todo: Todo) => (
          <li
            key={todo.id}
            className={`todo-item ${todo.completed ? 'completed' : ''}`}
          >
            <span onClick={() => toggleTodo(todo.id)} className="todo-text">
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)} className="todo-delete-btn">
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};