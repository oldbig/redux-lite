import { useReduxLiteStore } from '../store';
import type { Todo } from '../store/todo';

export const TodoList = () => {
  const { todos, filter, dispatchTodos } = useReduxLiteStore();

  const toggleTodo = (id: number) => {
    /**
     * 👇 This also demonstrates a full state slice update.
     * We are replacing the entire `todos` array with a new, modified version.
     */
    dispatchTodos(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    /**
     * 👇 Another example of a full state slice update for an array.
     */
    dispatchTodos(todos => todos.filter(todo => todo.id !== id));
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
  );
};