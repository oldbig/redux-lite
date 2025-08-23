import React, { useState } from 'react';
import { useReduxLiteStore } from '../store';

export const TodoInput = () => {
  const { dispatchTodos } = useReduxLiteStore();
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      /**
       * 👇 This demonstrates a full state slice update.
       * `dispatchTodos` replaces the entire `todos` array with the new one.
       * This is the standard way to update arrays or primitives.
       */
      dispatchTodos(todos => [
        ...todos,
        { id: Date.now(), text, completed: false },
      ]);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-input-form">
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What needs to be done?"
        className="todo-input"
      />
      <button type="submit" className="todo-add-btn">
        Add
      </button>
    </form>
  );
};