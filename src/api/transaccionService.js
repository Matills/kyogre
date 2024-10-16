import axios from 'axios';

const apiUrl = 'https://laboratorio3-f36a.restdb.io/rest/transactions';
const apiKey = '60eb09146661365596af552f';

const apiClient = axios.create({
  baseURL: apiUrl,
  headers: { 'x-apikey': apiKey },
});

export const createTransaction = async (transaction) => {
  try{
    const response = await apiClient.post('/', transaction);
    return response.data;
} catch (error) {
    throw new Error('No se pudo realizar la transacción.');
  }
};
