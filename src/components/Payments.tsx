import { useContext } from 'react';
import { motion } from 'framer-motion';

import { CalculationContext } from '../contexts/CalculationContext';
import { Installment } from '../types';

import Spinner from './spinner/Spinner';

const Payments: React.FC = () => {
  const context = useContext(CalculationContext);

  if (!context || !context.results) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  const {
    installmentsWibor3M,
    installmentsWibor6M,
    startDate,
    endDate,
    loanAmount,
    currentRate,
  } = context.results;

  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(date).toLocaleDateString('pl-PL', options);
  };

  const formatNumber = (number: string | number) => {
    return new Intl.NumberFormat('pl-PL').format(Number(number));
  };

  const calculateSummary = (installments: Installment[]) => {
    let totalPrincipal = 0;
    let totalInterest = 0;
    let totalPayment = 0;

    installments.forEach((installment) => {
      totalPrincipal += parseFloat(installment.principal);
      totalInterest += parseFloat(installment.interest);
      totalPayment += parseFloat(installment.totalPayment);
    });

    return {
      totalPrincipal: formatNumber(totalPrincipal),
      totalInterest: formatNumber(totalInterest),
      totalPayment: formatNumber(totalPayment),
    };
  };

  const summaryWibor3M = calculateSummary(installmentsWibor3M);
  const summaryWibor6M = calculateSummary(installmentsWibor6M);

  return (
    <motion.div
      className="container mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold mb-6 text-center">
        Szczegóły Spłaty Ratalnej
      </h2>
      <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-2xl font-semibold mb-4">
          Raty Kapitałowo-Odsetkowe
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="font-semibold">Data Rozpoczęcia:</p>
            <p>{formatDate(startDate.toString())}</p>
          </div>
          <div>
            <p className="font-semibold">Data Zakończenia:</p>
            <p>{formatDate(endDate.toString())}</p>
          </div>
          <div>
            <p className="font-semibold">Kwota Kredytu:</p>
            <p>{formatNumber(loanAmount)} zł</p>
          </div>
          <div>
            <p className="font-semibold">Aktualna Stawka WIBOR:</p>
            <p>{currentRate}%</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-2">WIBOR 3M</h3>
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 border">Data</th>
                  <th className="py-2 px-4 border text-right">Kapitał (zł)</th>
                  <th className="py-2 px-4 border text-right">Odsetki (zł)</th>
                  <th className="py-2 px-4 border text-right">
                    Całkowita Płatność (zł)
                  </th>
                </tr>
              </thead>
              <tbody>
                {installmentsWibor3M.map((installment, index) => (
                  <tr key={index} className="even:bg-gray-50">
                    <td className="border px-4 py-2">
                      {formatDate(installment.date)}
                    </td>
                    <td className="border px-4 py-2 text-right">
                      {formatNumber(installment.principal)}
                    </td>
                    <td className="border px-4 py-2 text-right">
                      {formatNumber(installment.interest)}
                    </td>
                    <td className="border px-4 py-2 text-right">
                      {formatNumber(installment.totalPayment)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-200">
                <tr>
                  <td className="border px-4 py-2 font-semibold">Suma:</td>
                  <td className="border px-4 py-2 font-semibold text-right">
                    {summaryWibor3M.totalPrincipal}
                  </td>
                  <td className="border px-4 py-2 font-semibold text-right">
                    {summaryWibor3M.totalInterest}
                  </td>
                  <td className="border px-4 py-2 font-semibold text-right">
                    {summaryWibor3M.totalPayment}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">WIBOR 6M</h3>
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-4 border">Data</th>
                  <th className="py-2 px-4 border text-right">Kapitał (zł)</th>
                  <th className="py-2 px-4 border text-right">Odsetki (zł)</th>
                  <th className="py-2 px-4 border text-right">
                    Całkowita Płatność (zł)
                  </th>
                </tr>
              </thead>
              <tbody>
                {installmentsWibor6M.map((installment, index) => (
                  <tr key={index} className="even:bg-gray-50">
                    <td className="border px-4 py-2">
                      {formatDate(installment.date)}
                    </td>
                    <td className="border px-4 py-2 text-right">
                      {formatNumber(installment.principal)}
                    </td>
                    <td className="border px-4 py-2 text-right">
                      {formatNumber(installment.interest)}
                    </td>
                    <td className="border px-4 py-2 text-right">
                      {formatNumber(installment.totalPayment)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-200">
                <tr>
                  <td className="border px-4 py-2 font-semibold">Suma:</td>
                  <td className="border px-4 py-2 font-semibold text-right">
                    {summaryWibor6M.totalPrincipal}
                  </td>
                  <td className="border px-4 py-2 font-semibold text-right">
                    {summaryWibor6M.totalInterest}
                  </td>
                  <td className="border px-4 py-2 font-semibold text-right">
                    {summaryWibor6M.totalPayment}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Payments;
