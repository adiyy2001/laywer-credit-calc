import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import { CalculationProvider } from './contexts/CalculationContext';
import ErrorBoundary from './components/ErrorBoundary';
import Spinner from './components/spinner/Spinner';
import { ToastProvider } from './components/toast/index';
import {
  getDataFromLocalStorage,
  fetchWiborData,
  saveDataToLocalStorage,
} from './components/utils/fetchWiborData';
import { getBusinessDates } from './components/utils/getBusinessDates';

const Calculator = lazy(() => import('./components/Calculator'));
const Payments = lazy(() => import('./components/Payments'));
const Summary = lazy(() => import('./components/Summary'));

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [monthsLeft, setMonthsLeft] = useState(0);

  useEffect(() => {
    const loadWiborData = async () => {
      const startDate = new Date('2011-01-01');
      const endDate = new Date();
      const existingData = getDataFromLocalStorage('wiborRates') || [];
      console.log('eqwjioeqwj')
      const existingDates = existingData.map((rate: any) => rate.date);
      const datesToFetch = getBusinessDates(startDate, endDate).filter(
        (date) => !existingDates.includes(date),
      );
      const monthsToFetch = Math.ceil(datesToFetch.length / 30);

      if (datesToFetch.length > 0) {
        setMonthsLeft(monthsToFetch);
        try {
          const data = await fetchWiborData(datesToFetch[0]);
          const allData = [...existingData, ...data];
          saveDataToLocalStorage('wiborRates', allData);
        } catch (error) {
          console.error('Error fetching WIBOR data:', error);
        }
      } else {
        setMonthsLeft(0); // No data to fetch
      }

      setLoading(false);
    };

    loadWiborData();
  }, []);

  if (loading) {
    return <Spinner monthsLeft={monthsLeft} />;
  }

  return (
    <CalculationProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-gray-100">
            <Navbar />
            <main className="flex-grow container mx-auto p-4">
              <ErrorBoundary>
                <Suspense fallback={<Spinner monthsLeft={monthsLeft} />}>
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
    </CalculationProvider>
  );
};

export default App;
