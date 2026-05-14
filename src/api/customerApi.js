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

// Nota: El endpoint de subtypes no está implementado en el backend aún
// export const getCustomerSubtypes = () =>
//   axiosInstance.get(ENDPOINTS.CUSTOMERS.SUBTYPES);
