# Todo List Example

This project is a simple yet elegant Todo List application built with React and Vite. It serves as a comprehensive example of how to use the `@oldbig/redux-lite` state management library.

## Purpose

This example demonstrates the core features of `redux-lite`, including:

- **State Initialization**: How to define an initial store with typed slices.
- **`optional` Slices**: How to define a state slice that can be conditionally included.
- **`useReduxLiteStore` Hook**: How to access state and dispatchers in your components.
- **Full and Partial Updates**: The difference between `dispatch` and `dispatchPartial` functions.
- **Redux DevTools**: How to integrate with the Redux DevTools extension for easy debugging.

## Getting Started

To run this project locally, follow these steps:

1.  **Install Dependencies**:
    Navigate to the `examples/todo-list` folder and run:
    ```bash
    npm install
    ```
    This will install the dependencies for both the main library and the example project.

2.  **Start the Development Server**:
    From the `examples/todo-list` folder, run:
    ```bash
    npm run dev
    ```

3.  **Open in Browser**:
    Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

You should now see the Todo List application running in your browser.
