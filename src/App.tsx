import { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';

import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/toast/index';
import Spinner from './components/spinner/Spinner';

// Dynamiczne importowanie komponentów
const Calculator = lazy(() => import('./components/Calculator'));
const Summary = lazy(() => import('./components/Summary'));
const InstallmentsMainClaim = lazy(
  () => import('./components/InstallmentsMainClaim'),
);
const InstallmentsFirstClaim = lazy(
  () => import('./components/InstallmentsFirstClaim'),
);
const InstallmentsSecondClaim = lazy(
  () => import('./components/InstallmentsSecondClaim'),
);

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-100">
          <Navbar />
          <main className="flex-grow container mx-auto p-4">
            <ErrorBoundary>
              <Suspense fallback={<Spinner />}>
                <Routes>
                  <Route path="/" element={<Calculator />} />
                  <Route
                    path="/payments/main-claim"
                    element={<InstallmentsMainClaim />}
                  />
                  <Route
                    path="/payments/first-claim"
                    element={<InstallmentsFirstClaim />}
                  />
                  <Route
                    path="/payments/second-claim"
                    element={<InstallmentsSecondClaim />}
                  />
                  <Route path="/summary" element={<Summary />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
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
