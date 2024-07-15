import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

import { AppState } from '../store/store';
import { Installment } from '../types';

const InstallmentsSecondClaim: React.FC = () => {
  const installments3M = useSelector(
    (state: AppState) =>
      state.calculator.results?.installmentsSecondClaim3M || [],
  );
  const installments6M = useSelector(
    (state: AppState) =>
      state.calculator.results?.installmentsSecondClaim6M || [],
  );

  const formatDate = (date: string): string =>
    new Date(date).toLocaleDateString('pl-PL');
  const formatNumber = (value: number): string =>
    value.toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const renderInstallments = (installments: Installment[], label: string) => (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-2">{label}</h3>
      <table className="min-w-full bg-white border mb-4">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-2 px-4 border">Data</th>
            <th className="py-2 px-4 border text-right">Kapitał (zł)</th>
            <th className="py-2 px-4 border text-right" style={{'width': '120px'}}>Odsetki (zł)</th>
            <th className="py-2 px-4 border text-right">Pozostało</th>
            <th className="py-2 px-4 border text-right">Rata</th>
            <th className="py-2 px-4 border text-right">WIBOR (%)</th>
            <th className="py-2 px-4 border text-right" style={{'width': '150px'}}>WIBOR bez marży (%)</th>
          </tr>
        </thead>
        <tbody>
          {installments.map((installment: Installment, index: number) => (
            <tr key={index} className="even:bg-gray-50">
              <td className="border px-4 py-2">
                {formatDate(installment.date)}
              </td>
              <td className="border px-4 py-2 text-right">
                {installment.principal}
              </td>
              <td className="border px-4 py-2 text-right">
                {formatNumber(parseFloat(installment.interest))}
              </td>
              <td className="border px-4 py-2 text-right">
                {formatNumber(installment.remainingAmount)}
              </td>
              <td className="border px-4 py-2 text-right">
                {installment.totalPayment}
              </td>
              <td className="border px-4 py-2 text-right">
                {installment.wiborRate.toFixed(2)}
              </td>
              <td className="border px-4 py-2 text-right">
                {installment.wiborWithoutMargin}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <motion.div className="container mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Szczegóły Spłaty Ratalnej - II Roszczenie Ewentualne
      </h2>
      <div className="flex flex-wrap -mx-2">
        <div className="w-full md:w-1/2 px-2">
          {renderInstallments(installments3M, 'WIBOR 3M')}
        </div>
        <div className="w-full md:w-1/2 px-2">
          {renderInstallments(installments6M, 'WIBOR 6M')}
        </div>
      </div>
    </motion.div>
  );
};

export default InstallmentsSecondClaim;
