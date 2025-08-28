import { ReduxLiteProvider } from './store'
import PerformanceTest from './components/PerformanceTest'
import './App.css'

function App() {
 return (
    <ReduxLiteProvider>
      <div className="App">
        <header className="App-header">
          <h1>Redux Lite Performance Test</h1>
        </header>
        <main>
          <PerformanceTest />
        </main>
      </div>
    </ReduxLiteProvider>
  )
}

export default App