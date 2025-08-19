import { initiate, optional } from '@oldbig/redux-lite';

// 1. Define the initial store structure
const INIT_STORE = {
  user: {
    name: 'Jhon' as string | null,
    age: 30,
  },
  task: optional({
    id: 1,
    title: 'Finish redux-lite',
  }),
  counter: 0,
};

// 2. Create the Provider and Hook
const { ReduxLiteProvider, useReduxLiteStore } = initiate(INIT_STORE);

// 3. Create components that use the hook
const UserDisplay = () => {
  const { user, dispatchPartialUser } = useReduxLiteStore();

  return (
    <div>
      <h2>User Information</h2>
      <p>Name: {user.name ?? 'N/A'}</p>
      <p>Age: {user.age}</p>
      <button onClick={() => dispatchPartialUser({ name: 'Ken' })}>
        Change Name to Ken
      </button>
      <button onClick={() => dispatchPartialUser((prev) => ({ age: prev.age + 1 }))}>
        Increment Age
      </button>
    </div>
  );
};

const TaskDisplay = () => {
  const { task, dispatchTask, dispatchPartialTask } = useReduxLiteStore();

  return (
    <div>
      <h2>Task Information</h2>
      {task ? (
        <>
          <p>ID: {task.id}</p>
          <p>Title: {task.title}</p>
          <button onClick={() => dispatchPartialTask({ title: 'Task Updated!' })}>
            Update Title
          </button>
          <button onClick={() => dispatchTask(undefined)}>
            Clear Task
          </button>
        </>
      ) : (
        <p>No task assigned.</p>
      )}
    </div>
  );
};

const Counter = () => {
  const { counter, dispatchCounter } = useReduxLiteStore();
  return (
    <div>
      <h2>Counter</h2>
      <p>Count: {counter}</p>
      <button onClick={() => dispatchCounter((c) => c + 1)}>Increment</button>
      <button onClick={() => dispatchCounter(0)}>Reset</button>
    </div>
  )
}

// 4. Wrap the main App with the Provider
function App() {
  return (
    <ReduxLiteProvider>
      <h1>Redux-Lite Example</h1>
      <UserDisplay />
      <hr />
      <TaskDisplay />
      <hr />
      <Counter />
    </ReduxLiteProvider>
  );
}

export default App;
