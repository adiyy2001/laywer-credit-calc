import React, { useState } from 'react';

interface ParametersFormProps {
  onCalculate: (params: any) => void;
}

const ParametersForm: React.FC<ParametersFormProps> = ({ onCalculate }) => {
  const [borrower, setBorrower] = useState('JAN KOWALSKI');
  const [loanAmount, setLoanAmount] = useState('400000');
  const [loanTerms, setLoanTerms] = useState(360);
  const [signingDate, setSigningDate] = useState('2013-02-01');
  const [firstPaymentDate, setFirstPaymentDate] = useState('2013-03-01');
  const [gracePeriod, setGracePeriod] = useState('NIE');
  const [margin, setMargin] = useState('2.50');
  const [holiday, setHoliday] = useState('NIE');
  const [wiborRate, setWiborRate] = useState('2.80');
  const [currentRate, setCurrentRate] = useState('3.5');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate({
      borrower,
      loanAmount,
      loanTerms,
      signingDate,
      firstPaymentDate,
      gracePeriod,
      margin,
      holiday,
      wiborRate,
      currentRate,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-bold mb-4">Wprowadź parametry kredytu</h2>
      <div className="grid grid-cols-2 gap-4">
        <label>
          Kredytoborca:
          <input type="text" value={borrower} onChange={(e) => setBorrower(e.target.value)} className="border p-2 w-full" />
        </label>
        <label>
          Kwota kredytu (zł):
          <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} className="border p-2 w-full" />
        </label>
        <label>
          Ilość rat:
          <input type="number" value={loanTerms} onChange={(e) => setLoanTerms(parseInt(e.target.value))} className="border p-2 w-full" />
        </label>
        <label>
          Data podpisania:
          <input type="date" value={signingDate} onChange={(e) => setSigningDate(e.target.value)} className="border p-2 w-full" />
        </label>
        <label>
          Data pierwszej raty:
          <input type="date" value={firstPaymentDate} onChange={(e) => setFirstPaymentDate(e.target.value)} className="border p-2 w-full" />
        </label>
        <label>
          Karencja:
          <select value={gracePeriod} onChange={(e) => setGracePeriod(e.target.value)} className="border p-2 w-full">
            <option value="NIE">NIE</option>
            <option value="TAK">TAK</option>
          </select>
        </label>
        <label>
          Marża (%):
          <input type="number" step="0.01" value={margin} onChange={(e) => setMargin(e.target.value)} className="border p-2 w-full" />
        </label>
        <label>
          Wakacje kredytowe:
          <select value={holiday} onChange={(e) => setHoliday(e.target.value)} className="border p-2 w-full">
            <option value="NIE">NIE</option>
            <option value="TAK">TAK</option>
          </select>
        </label>
        <label>
          WIBOR 3M w dniu sporządzenia umowy (%):
          <input type="number" step="0.01" value={wiborRate} onChange={(e) => setWiborRate(e.target.value)} className="border p-2 w-full" />
        </label>
        <label>
          Wysokość raty - ZMIENNA AKTUALNA (%):
          <input type="number" step="0.01" value={currentRate} onChange={(e) => setCurrentRate(e.target.value)} className="border p-2 w-full" />
        </label>
      </div>
      <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">Oblicz</button>
    </form>
  );
};

export default ParametersForm;
