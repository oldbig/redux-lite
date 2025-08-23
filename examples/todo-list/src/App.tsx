import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { TodoFilter } from './components/TodoFilter';
import './App.css';

function App() {
  return (
    <div className="todo-app">
      <header>
        <h1>Todo List</h1>
      </header>
      <main>
        <TodoInput />
        <TodoList />
        <TodoFilter />
      </main>
    </div>
  );
}

export default App;