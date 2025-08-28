import { useCallback } from 'react';
import { useReduxLiteStore } from '../store';

export const TodoEditor = () => {
  const { todo, todos, dispatchTodo, dispatchTodos, dispatchPartialTodo } = useReduxLiteStore();
  const setText = useCallback((e: React.ChangeEvent<HTMLInputElement>)=> dispatchPartialTodo({text: e.target.value.trim()}), [dispatchPartialTodo]);
  const handleSave = () => {
    if (todo && todo.text.trim()) {
      // Update the todo in the main todos array
      dispatchTodos(todos.map(t => 
        t.id === todo.id ? { ...t, text: todo.text.trim() } : t
      ));
      dispatchTodo(undefined);
    }
  };

  const handleCancel = () => {
    // Clear the optional todo slice
    dispatchTodo(undefined);
  };

  if (!todo) {
    return null;
  }

  return (
    <div className="todo-editor">
      <h3>Edit Todo</h3>
      <div className="todo-editor-form">
        <input
          type="text"
          value={todo.text}
          onChange={ setText }
          placeholder="Edit todo text"
          className="todo-input"
        />
        <div className="todo-editor-buttons">
          <button onClick={handleSave} className="todo-add-btn">
            Save
          </button>
          <button onClick={handleCancel} className="todo-delete-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};