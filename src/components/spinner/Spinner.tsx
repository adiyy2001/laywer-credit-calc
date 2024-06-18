import './Spinner.style.css';

interface SpinnerProps {
  monthsLeft: number;
}

const Spinner: React.FC<SpinnerProps> = () => {
  return (
    <div className="spinner-container">
      <div className="loader"></div>
      <p className="loading-text">Ładowanie danych WIBOR, proszę czekać...</p>
    </div>
  );
};

export default Spinner;
