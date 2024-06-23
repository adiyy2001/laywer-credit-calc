import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/toast/index';
import Calculator from './components/Calculator';
import Payments from './components/Payments';
import Summary from './components/Summary';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-100">
          <Navbar />
          <main className="flex-grow container mx-auto p-4">
            <ErrorBoundary>
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<Calculator />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/summary" element={<Summary />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;
