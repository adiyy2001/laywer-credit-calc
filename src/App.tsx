import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Calculator from './components/Calculator';
import Payments from './components/Payments';
import Summary from './components/Summary';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import { CalculationProvider } from './contexts/CalculationContext';

const App: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <CalculationProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-100">
          <Navbar />
          <main className="flex-grow container mx-auto p-4">
            <Routes>
              <Route path="/" element={<Calculator showToast={showToast} />} />
              <Route path="/payments" element={<Payments />} />

              <Route path="/summary" element={<Summary />} />
            </Routes>
          </main>
          {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
        </div>
      </Router>
    </CalculationProvider>
  );
};

export default App;
