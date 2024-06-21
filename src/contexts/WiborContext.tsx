import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface WiborData {
  date: string;
  id: number;
  wibor3m: number; 
  wibor6m: number; 
}

interface WiborContextProps {
  wiborData: WiborData[] | null;
  loading: boolean;
}

export const WiborContext = createContext<WiborContextProps>({
  wiborData: null,
  loading: true,
});

export const useWibor = () => useContext(WiborContext);

export const WiborProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wiborData, setWiborData] = useState<WiborData[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWiborData = async () => {
      try {
        const response = await axios.get(
          'https://laywer-calculator-server-production.up.railway.app/api/get-wibor-rates',
        );

        const processedData = response.data.map((item: WiborData) => ({
          ...item,
          wibor3m: parseFloat(
            item.wibor3m.toString().replace(',', '.').replace('%', ''),
          ), 
          wibor6m: parseFloat(
            item.wibor6m.toString().replace(',', '.').replace('%', ''),
          ), 
        }));

        setWiborData(processedData);
      } catch (error) {
        console.error('Failed to load WIBOR data', error);
      } finally {
        setLoading(false);
      }
    };

    loadWiborData();
  }, []);

  return (
    <WiborContext.Provider value={{ wiborData, loading }}>
      {children}
    </WiborContext.Provider>
  );
};
