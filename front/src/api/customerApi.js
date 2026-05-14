import axiosInstance from './axiosInstance';

export const searchCustomer = (type, identification) =>
  axiosInstance.get(`/customers/identification/${type}/${identification}`);

export const getCustomer = (id) =>
  axiosInstance.get(`/customers/${id}`);

export const createCustomer = (data) =>
  axiosInstance.post('/customers/', data);

export const getCustomerSubtypes = () =>
  axiosInstance.get('/customers/subtypes');
