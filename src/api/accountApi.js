import axiosInstance from './axiosInstance';

export const getAccountsByCustomer = (customerId) =>
  axiosInstance.get(`/accounts?customerId=${customerId}`);

export const getAccount = (accountNumber) =>
  axiosInstance.get(`/accounts/${accountNumber}`);

export const createAccount = (data) =>
  axiosInstance.post('/accounts/', data);

export const activateAccount = (accountNumber) =>
  axiosInstance.patch(`/accounts/${accountNumber}/activate`);

export const inactivateAccount = (accountNumber) =>
  axiosInstance.patch(`/accounts/${accountNumber}/inactivate`);

export const blockAccount = (accountNumber) =>
  axiosInstance.patch(`/accounts/${accountNumber}/block`);

export const suspendAccount = (accountNumber) =>
  axiosInstance.patch(`/accounts/${accountNumber}/suspend`);

export const getAccountTransactions = (accountNumber, limit = 10) =>
  axiosInstance.get(`/accounts/${accountNumber}/transactions?limit=${limit}`);
