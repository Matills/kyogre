import axios from 'axios';

const apiUrl = 'https://criptoya.com/api';

export const getCripto = async (coin, fiat = 'ars', exchange = 'lemoncash') => {
  try {
    const response = await axios.get(`${apiUrl}/${exchange}/${coin}/${fiat}`);
    return response.data;
  } catch (error) {
    throw new Error('No se pudo obtener la información de la criptomoneda.');
  }
};
