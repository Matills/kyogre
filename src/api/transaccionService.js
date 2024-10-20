import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://laboratorio3-f36a.restdb.io/rest/',
  withCredentials: false,
  headers:{
    'x-apikey': '60eb09146661365596af552f',
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

export const getTransaction = async (idTransaction) => {
  try {
    const response = await apiClient.get(`/transactions/${idTransaction}`)
    return response.data;
  } catch (error) {
    throw new Error('No se pudo obtener el registro.');
  }
}

export const updateTransaction = async (idTransaction, updatedData) => {
  try {
    const response = await apiClient.patch(`/transactions/${idTransaction}`, updatedData)
    return response.data
  } catch (error) {
    throw new Error('No se pudo actualizar el registro.')
  }
}


export const deleteTransaction = async (idTransaction) => {
  try {
    await apiClient.delete(`/transactions/${idTransaction}`);
  } catch (error) {
    throw new Error('No se pudo eliminar el registro.');
  }
};
