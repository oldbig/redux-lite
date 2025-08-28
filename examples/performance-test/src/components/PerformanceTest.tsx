import React, { useState, useCallback, useRef } from 'react';
import { useReduxLiteStore, useSelector } from '../store';
import { INIT_PERFORMANCE_STORE } from '../store';

const PerformanceTest: React.FC = () => {
  const { counter, items, profile, dispatchCounter, dispatchItems, dispatchProfile } = useReduxLiteStore();
  const [testResults, setTestResults] = useState<{name: string, time: number, renders?: number}[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  // Refs to track re-render counts
  const counterRenderCount = useRef(0);
  const itemsRenderCount = useRef(0);
  const profileRenderCount = useRef(0);
  const overallRenderCount = useRef(0);
  
  // Increment render counts on each render
  overallRenderCount.current++;
  
  // Track specific component renders
  const CounterDisplay = useCallback(() => {
    counterRenderCount.current++;
    return <p>Counter: {counter}</p>;
  }, [counter]);
  
  const ItemsDisplay = useCallback(() => {
    itemsRenderCount.current++;
    return <p>Items count: {items.length}</p>;
  }, [items]);
  
  const ProfileDisplay = useCallback(() => {
    profileRenderCount.current++;
    return <p>Profile name: {profile.name}</p>;
  }, [profile]);
  
  // Reset render counts
  const resetRenderCounts = useCallback(() => {
    counterRenderCount.current = 0;
    itemsRenderCount.current = 0;
    profileRenderCount.current = 0;
    overallRenderCount.current = 0;
  }, []);
  
  // Test 1: Counter update performance
  const testCounterPerformance = useCallback(() => {
    const iterations = 1000;
    resetRenderCounts();
    
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      dispatchCounter(prev => prev + 1);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const totalRenders = overallRenderCount.current;
    
    setTestResults(prev => [
      ...prev,
      { name: `Counter Update (${iterations} iterations)`, time: totalTime, renders: totalRenders }
    ]);
  }, [dispatchCounter, resetRenderCounts]);
  
  // Test 2: Array update performance
  const testArrayPerformance = useCallback(() => {
    const iterations = 1000;
    resetRenderCounts();
    
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      dispatchItems(prev => [...prev, `Item ${Date.now()}-${i}`]);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const totalRenders = overallRenderCount.current;
    
    setTestResults(prev => [
      ...prev,
      { name: `Array Update (${iterations} iterations)`, time: totalTime, renders: totalRenders }
    ]);
  }, [dispatchItems, resetRenderCounts]);
  
  // Test 3: Object update performance
  const testObjectPerformance = useCallback(() => {
    const iterations = 10000;
    resetRenderCounts();
    
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
    const totalRenders = overallRenderCount.current;
    
    setTestResults(prev => [
      ...prev,
      { name: `Object Update (${iterations} iterations)`, time: totalTime, renders: totalRenders }
    ]);
  }, [dispatchProfile, resetRenderCounts]);

  // Test 4: useSelector performance
  const testSelectorPerformance = useCallback(() => {
    const iterations = 10000;
    resetRenderCounts();
    
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      useSelector((state: typeof INIT_PERFORMANCE_STORE) => state.counter);
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const totalRenders = overallRenderCount.current;

    setTestResults(prev => [
      ...prev,
      { name: `useSelector (${iterations} iterations)`, time: totalTime, renders: totalRenders }
    ]);
  }, [resetRenderCounts]);
  
  // Test 5: Selective updates (only one component should re-render)
  const testSelectiveUpdates = useCallback(() => {
    const iterations = 1000;
    resetRenderCounts();
    
    // Reset specific render counts
    counterRenderCount.current = 0;
    itemsRenderCount.current = 0;
    profileRenderCount.current = 0;
    
    const startTime = performance.now();
    
    // Only update counter - should only re-render counter component
    for (let i = 0; i < iterations; i++) {
      dispatchCounter(prev => prev + 1);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    setTestResults(prev => [
      ...prev,
      { 
        name: `Selective Updates (Counter only, ${iterations} iterations)`, 
        time: totalTime,
        renders: counterRenderCount.current
      }
    ]);
  }, [dispatchCounter, resetRenderCounts]);
  
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
          setTimeout(() => {
            testSelectorPerformance();
            setTimeout(() => {
              testSelectiveUpdates();
              setIsRunning(false);
            }, 100);
          }, 10);
        }, 100);
      }, 100);
    }, 100);
  }, [
    testCounterPerformance, 
    testArrayPerformance, 
    testObjectPerformance, 
    testSelectorPerformance,
    testSelectiveUpdates
  ]);
  
  return (
    <div className="performance-test">
      <h2>Redux Lite Performance Tests</h2>
      
      <div className="test-controls">
        <button onClick={runAllTests} disabled={isRunning}>
          {isRunning ? 'Running Tests...' : 'Run All Performance Tests'}
        </button>
        <button onClick={() => setTestResults([])} disabled={isRunning}>
          Clear Results
        </button>
      </div>
      
      <div className="test-results">
        <h3>Test Results</h3>
        {testResults.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Test</th>
                <th>Time (ms)</th>
                <th>Renders</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((result, index) => (
                <tr key={index}>
                  <td>{result.name}</td>
                  <td>{result.time.toFixed(2)}ms</td>
                  <td>{result.renders !== undefined ? result.renders : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No tests run yet.</p>
        )}
      </div>
      
      <div className="current-state">
        <h3>Current State</h3>
        <CounterDisplay />
        <ItemsDisplay />
        <ProfileDisplay />
      </div>
      
      <div className="render-counts">
        <h3>Component Render Counts</h3>
        <p>Overall renders: {overallRenderCount.current}</p>
        <p>Counter component renders: {counterRenderCount.current}</p>
        <p>Items component renders: {itemsRenderCount.current}</p>
        <p>Profile component renders: {profileRenderCount.current}</p>
      </div>
    </div>
  );
};

export default PerformanceTest;