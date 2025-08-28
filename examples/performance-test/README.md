# Redux Lite Performance Test

This directory contains performance tests for the `@oldbig/redux-lite` library to demonstrate its efficiency and speed.

## What is Tested

The performance tests measure several key aspects of the library:

1. **Counter Updates** - Simple primitive value updates
2. **Array Operations** - List operations like pushing new items
3. **Object Updates** - Complex object updates with nested properties
4. **Partial Updates** - Partial object updates that preserve existing properties
5. **Selective Update Efficiency** - How well the library prevents unnecessary re-renders
6. **Deeply Nested Updates** - Performance with deeply nested state structures

## Running the Tests

### In the Browser

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to http://localhost:5175
3. Click the "Run All Performance Tests" button
4. View the results in the table

### In Node.js Environment

Run the performance tests in a Node.js environment:

```bash
npm run test:performance
```

This will output detailed performance metrics to the console and save results to the `results/` directory.

## Performance Metrics

The tests measure:

- **Total Time** - The total time taken for all iterations
- **Average Time** - The average time per operation
- **Render Counts** - The number of component re-renders triggered (in browser tests)
- **Efficiency** - How well the library prevents unnecessary updates

## Expected Results

`redux-lite` is designed to be highly performant:

- Updates should be fast (microseconds per operation)
- Selective updates should trigger minimal re-renders
- Deeply nested updates should be handled efficiently
- Memory usage should remain stable

## Test Results

Results are saved in the `results/` directory as both JSON and CSV files for analysis.