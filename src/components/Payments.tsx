import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

import { CalculationResults, Installment } from '../types';
import { AppState } from '../store/store';

const Payments: React.FC = () => {
  const results: CalculationResults | null = useSelector(
    (state: AppState) => state.calculator.results,
  );

  if (!results) {
    return null;
  }

  const formatDate = (date: Date): string => date.toLocaleDateString('pl-PL');

  function parseNumber<T>(value: T): number {
    let numberValue: number;

    if (typeof value === 'string') {
      numberValue = parseFloat(value);
    } else if (typeof value === 'number') {
      numberValue = value;
    } else {
      return 0;
    }

    return isNaN(numberValue) ? 0 : numberValue;
  }

  const formatNumber = (value: number): string =>
    value.toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const {
    installmentsWibor3M,
    installmentsWibor6M,
    startDate,
    endDate,
    loanAmount,
    currentRate,
  } = results;

  const totalPrincipal3M = installmentsWibor3M.reduce(
    (sum, installment) => sum + parseNumber(installment.principal),
    0,
  );
  const totalInterest3M = installmentsWibor3M.reduce(
    (sum, installment) => sum + parseNumber(installment.interest),
    0,
  );
  const totalPayment3M = installmentsWibor3M.reduce(
    (sum, installment) => sum + parseNumber(installment.totalPayment),
    0,
  );

  const totalPrincipal6M = installmentsWibor6M.reduce(
    (sum, installment) => sum + parseNumber(installment.principal),
    0,
  );
  const totalInterest6M = installmentsWibor6M.reduce(
    (sum, installment) => sum + parseNumber(installment.interest),
    0,
  );
  const totalPayment6M = installmentsWibor6M.reduce(
    (sum, installment) => sum + parseNumber(installment.totalPayment),
    0,
  );

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
            <p>{formatDate(new Date(startDate))}</p>
          </div>
          <div>
            <p className="font-semibold">Data Zakończenia:</p>
            <p>{formatDate(new Date(endDate))}</p>
          </div>
          <div>
            <p className="font-semibold">Kwota Kredytu:</p>
            <p>{formatNumber(parseNumber(loanAmount))} zł</p>
          </div>
          <div>
            <p className="font-semibold">Aktualna Stawka WIBOR:</p>
            <p>{formatNumber(parseNumber(currentRate))}%</p>
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
                  <th className="py-2 px-4 border text-right">WIBOR (%)</th>
                </tr>
              </thead>
              <tbody>
                {installmentsWibor3M.map(
                  (installment: Installment, index: number) => (
                    <tr key={index} className="even:bg-gray-50">
                      <td className="border px-4 py-2">
                        {formatDate(new Date(installment.date))}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {formatNumber(parseNumber(installment.principal))}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {formatNumber(parseNumber(installment.interest))}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {formatNumber(parseNumber(installment.totalPayment))}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {formatNumber(parseNumber(installment.wiborRate))}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
              <tfoot className="bg-gray-200">
                <tr>
                  <td className="border px-4 py-2 font-semibold">Suma:</td>
                  <td className="border px-4 py-2 font-semibold text-right">
                    {formatNumber(totalPrincipal3M)} zł
                  </td>
                  <td className="border px-4 py-2 font-semibold text-right">
                    {formatNumber(totalInterest3M)} zł
                  </td>
                  <td className="border px-4 py-2 font-semibold text-right">
                    {formatNumber(totalPayment3M)} zł
                  </td>
                  <td className="border px-4 py-2 font-semibold text-right">
                    {/* Brak sumy WIBOR w oryginalnym kodzie */}
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
                  <th className="py-2 px-4 border text-right">WIBOR (%)</th>
                </tr>
              </thead>
              <tbody>
                {installmentsWibor6M.map(
                  (installment: Installment, index: number) => (
                    <tr key={index} className="even:bg-gray-50">
                      <td className="border px-4 py-2">
                        {formatDate(new Date(installment.date))}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {formatNumber(parseNumber(installment.principal))}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {formatNumber(parseNumber(installment.interest))}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {formatNumber(parseNumber(installment.totalPayment))}
                      </td>
                      <td className="border px-4 py-2 text-right">
                        {formatNumber(parseNumber(installment.wiborRate))}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
              <tfoot className="bg-gray-200">
                <tr>
                  <td className="border px-4 py-2 font-semibold">Suma:</td>
                  <td className="border px-4 py-2 font-semibold text-right">
                    {formatNumber(totalPrincipal6M)} zł
                  </td>
                  <td className="border px-4 py-2 font-semibold text-right">
                    {formatNumber(totalInterest6M)} zł
                  </td>
                  <td className="border px-4 py-2 font-semibold text-right">
                    {formatNumber(totalPayment6M)} zł
                  </td>
                  <td className="border px-4 py-2 font-semibold text-right"></td>
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
