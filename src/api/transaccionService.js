import axios from 'axios';

const apiUrl = 'https://laboratorio3-5459.restdb.io/rest/transactions';
const apiKey = '64a57c2b86d8c50fe6ed8fa5';

const apiClient = axios.create({
  baseURL: apiUrl,
  withCredentials: false,
  headers: { 
    'x-apikey': apiKey,
    Accept: 'application/json',
  },
});

export const createTransaction = async (transaction) => {
  try{
    const response = await apiClient.post('/', transaction);
    return response.data;
  } catch (error) {
    throw new Error('No se pudo realizar la transacción.');
  }
};
