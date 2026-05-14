import axiosInstance from './axiosInstance';

export const debit = (data) =>
  axiosInstance.post('/transactions/debits', data);

export const credit = (data) =>
  axiosInstance.post('/transactions/credits', data);

export const transfer = (data) =>
  axiosInstance.post('/transactions/transfers', data);

export const getTransactionHistory = (accountNumber) =>
  axiosInstance.get(`/transactions/history/${accountNumber}`);
