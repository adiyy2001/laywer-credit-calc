import axios from 'axios';

const API_URL =
  'laywer-calculator-server-production.up.railway.app/api/fetch-wibor-rates';

// Utwórz instancję Axios z maksymalnym timeoutem
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000000, // 2 minuty timeout (możesz dostosować do jeszcze większej wartości)
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const fetchWiborData = async (startDate: string) => {
  try {
    const response = await axiosInstance.get('', {
      params: {
        startDate,
      },
    });
    console.log(response);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // Serwer zwrócił odpowiedź z błędem
      console.error('Error response:', error.response.data);
    } else if (error.request) {
      // Żądanie zostało wysłane, ale brak odpowiedzi
      console.error('Error request:', error.request);
    } else {
      // Coś się stało podczas konfiguracji żądania
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

export const saveDataToLocalStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getDataFromLocalStorage = (key: string): any[] | null => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};
