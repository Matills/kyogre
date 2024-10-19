import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://laboratorio-afe2.restdb.io/rest/',
  withCredentials: false,
  headers:{
    'x-apikey': '650b53356888544ec60c00bf',
    'Content-Type':  'application/json'
  },
})

export const createTransaction = async (transaction) => {
  try {
    const response = await apiClient.post('/transactions', transaction);
    return response.data;
  } catch (error) {
    throw new Error('No se pudo realizar la transacción.');
  }
};

export const getTransactions = async (userId) => {
  try {
    const response = await apiClient.get(`/transactions?q={"user_id": "${userId}"}`)
    return response.data;
  } catch (error) {
    throw new Error('No se pudo obtener los registros.');
  }
}