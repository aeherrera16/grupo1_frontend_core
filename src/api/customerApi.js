import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../config/environment';

export const getAllCustomers = () =>
  axiosInstance.get(ENDPOINTS.CUSTOMERS.GET_ALL);

export const searchCustomer = (type, identification) =>
  axiosInstance.get(ENDPOINTS.CUSTOMERS.SEARCH(type, identification));

export const getCustomer = (id) =>
  axiosInstance.get(ENDPOINTS.CUSTOMERS.GET(id));

export const createCustomer = (data) =>
  axiosInstance.post(ENDPOINTS.CUSTOMERS.CREATE, data);

export const updateCustomer = (id, data) =>
  axiosInstance.patch(ENDPOINTS.CUSTOMERS.UPDATE(id), data);

export const getCustomerSubtypesByType = (customerType) =>
  axiosInstance.get(`/customer-subtypes/type/${customerType}`);
