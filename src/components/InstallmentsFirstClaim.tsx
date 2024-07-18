import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectInstallmentsFirstClaim3M, selectInstallmentsFirstClaim6M } from '../store/selector/calculatorSelector';
import { Installment } from '../types';

const InstallmentsFirstClaim: React.FC = () => {
  const installments3M = useSelector(selectInstallmentsFirstClaim3M);
  const installments6M = useSelector(selectInstallmentsFirstClaim6M);

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
            <th className="py-2 px-4 border text-right" style={{ width: '120px' }}>Kapitał (zł)</th>
            <th className="py-2 px-4 border text-right" style={{ width: '120px' }}>Odsetki (zł)</th>
            <th className="py-2 px-4 border text-right">Pozostało</th>
            <th className="py-2 px-4 border text-right">Rata</th>
            <th className="py-2 px-4 border text-right">MARŻA (%)</th>
          </tr>
        </thead>
        <tbody>
          {installments.map((installment: Installment, index: number) => (
            <tr key={index} className="even:bg-gray-50">
              <td className="border px-4 py-2">{formatDate(installment.date)}</td>
              <td className="border px-4 py-2 text-right">{installment.principal}</td>
              <td className="border px-4 py-2 text-right">{formatNumber(parseFloat(installment.interest))}</td>
              <td className="border px-4 py-2 text-right">{formatNumber(installment.remainingAmount)}</td>
              <td className="border px-4 py-2 text-right">{installment.totalPayment}</td>
              <td className="border px-4 py-2 text-right">{installment.wiborRate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <motion.div className="container mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Szczegóły Spłaty Ratalnej - I Roszczenie Ewentualne
      </h2>
      <div className="flex flex-wrap -mx-2">
        <div className="w-full md:w-1/2 px-2">
          {renderInstallments(installments3M as Installment[], 'WIBOR 3M')}
        </div>
        <div className="w-full md:w-1/2 px-2">
          {renderInstallments(installments6M as Installment[], 'WIBOR 6M')}
        </div>
      </div>
    </motion.div>
  );
};

export default InstallmentsFirstClaim;
