import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../config/environment';

export const getAccountsByCustomer = (customerId) =>
  axiosInstance.get(ENDPOINTS.ACCOUNTS.GET_BY_CUSTOMER(customerId));

export const getAccount = (accountNumber) =>
  axiosInstance.get(ENDPOINTS.ACCOUNTS.GET(accountNumber));

export const createAccount = (data) =>
  axiosInstance.post(ENDPOINTS.ACCOUNTS.CREATE, data);

export const activateAccount = (accountNumber) =>
  axiosInstance.patch(ENDPOINTS.ACCOUNTS.ACTIVATE(accountNumber));

export const inactivateAccount = (accountNumber) =>
  axiosInstance.patch(ENDPOINTS.ACCOUNTS.INACTIVATE(accountNumber));

export const blockAccount = (accountNumber) =>
  axiosInstance.patch(ENDPOINTS.ACCOUNTS.BLOCK(accountNumber));

export const suspendAccount = (accountNumber) =>
  axiosInstance.patch(ENDPOINTS.ACCOUNTS.SUSPEND(accountNumber));

export const creditAccount = (accountNumber, data) =>
  axiosInstance.post(ENDPOINTS.ACCOUNTS.CREDIT(accountNumber), data);

export const transferFunds = (data) =>
  axiosInstance.post(ENDPOINTS.ACCOUNTS.TRANSFER, data);

export const getFavoriteAccount = () =>
  axiosInstance.get(ENDPOINTS.ACCOUNTS.GET_FAVORITE);

export const getAccountAvailability = (accountNumber) =>
  axiosInstance.get(ENDPOINTS.ACCOUNTS.AVAILABILITY(accountNumber));
