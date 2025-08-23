import React, { useState, useCallback, useRef } from 'react';
import { useReduxLiteStore } from '../store';

const PerformanceTest: React.FC = () => {
  const { counter, items, profile, dispatchCounter, dispatchItems, dispatchProfile } = useReduxLiteStore();
  const [testResults, setTestResults] = useState<{name: string, time: number}[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  // Test 1: Counter update performance
  const testCounterPerformance = useCallback(() => {
    const iterations = 1000;
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      dispatchCounter(prev => prev + 1);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    setTestResults(prev => [
      ...prev,
      { name: `Counter Update (${iterations} iterations)`, time: totalTime }
    ]);
  }, [dispatchCounter]);
  
  // Test 2: Array update performance
  const testArrayPerformance = useCallback(() => {
    const iterations = 1000;
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      dispatchItems(prev => [...prev, `Item ${Date.now()}-${i}`]);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    setTestResults(prev => [
      ...prev,
      { name: `Array Update (${iterations} iterations)`, time: totalTime }
    ]);
  }, [dispatchItems]);
  
  // Test 3: Object update performance
  const testObjectPerformance = useCallback(() => {
    const iterations = 10000;
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      dispatchProfile(prev => ({
        ...prev,
        name: `Updated User ${i}`,
        settings: {
          ...prev.settings,
          theme: prev.settings.theme === 'light' ? 'dark' : 'light'
        }
      }));
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    setTestResults(prev => [
      ...prev,
      { name: `Object Update (${iterations} iterations)`, time: totalTime }
    ]);
  }, [dispatchProfile]);
  
  // Run all tests
  const runAllTests = useCallback(() => {
    setIsRunning(true);
    setTestResults([]);
    
    // Run tests sequentially
    setTimeout(() => {
      testCounterPerformance();
      setTimeout(() => {
        testArrayPerformance();
        setTimeout(() => {
          testObjectPerformance();
          setIsRunning(false);
        }, 100);
      }, 100);
    }, 100);
  }, [testCounterPerformance, testArrayPerformance, testObjectPerformance]);
  
  return (
    <div className="performance-test">
      <h2>Redux Lite Performance Tests</h2>
      
      <div className="test-controls">
        <button onClick={runAllTests} disabled={isRunning}>
          {isRunning ? 'Running Tests...' : 'Run All Performance Tests'}
        </button>
      </div>
      
      <div className="test-results">
        <h3>Test Results</h3>
        {testResults.length > 0 ? (
          <ul>
            {testResults.map((result, index) => (
              <li key={index}>
                <strong>{result.name}:</strong> {result.time.toFixed(2)}ms
              </li>
            ))}
          </ul>
        ) : (
          <p>No tests run yet.</p>
        )}
      </div>
      
      <div className="current-state">
        <h3>Current State</h3>
        <p>Counter: {counter}</p>
        <p>Items count: {items.length}</p>
        <p>Profile name: {profile.name}</p>
      </div>
    </div>
  );
};

export default PerformanceTest;