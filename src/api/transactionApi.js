import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../config/environment';

export const debit = (data) =>
  axiosInstance.post(ENDPOINTS.TRANSACTIONS.DEBIT, data);

export const credit = (data) =>
  axiosInstance.post(ENDPOINTS.TRANSACTIONS.CREDIT, data);

export const transfer = (data) =>
  axiosInstance.post(ENDPOINTS.TRANSACTIONS.TRANSFER, data);

// Nota: El endpoint de historial de transacciones no está implementado en el backend aún
// export const getTransactionHistory = (accountNumber) =>
//   axiosInstance.get(ENDPOINTS.TRANSACTIONS.HISTORY(accountNumber));
