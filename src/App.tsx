import { lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import { CalculationProvider } from './contexts/CalculationContext';
import { WiborProvider } from './contexts/WiborContext';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/toast/index';

const Calculator = lazy(() => import('./components/Calculator'));
const Payments = lazy(() => import('./components/Payments'));
const Summary = lazy(() => import('./components/Summary'));

const App: React.FC = () => {
  return (
    <CalculationProvider>
      <WiborProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-gray-100">
              <Navbar />
              <main className="flex-grow container mx-auto p-4">
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<Calculator />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/summary" element={<Summary />} />
                  </Routes>
                </ErrorBoundary>
              </main>
            </div>
          </Router>
        </ToastProvider>
      </WiborProvider>
    </CalculationProvider>
  );
};

export default App;
