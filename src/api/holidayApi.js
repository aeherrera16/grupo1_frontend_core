import axiosInstance from './axiosInstance';

export const getAllHolidays = () =>
  axiosInstance.get('/holidays');

export const createHoliday = (data) =>
  axiosInstance.post('/holidays/', data);

export const deleteHoliday = (date) =>
  axiosInstance.delete(`/holidays/${date}`);

export const checkBusinessDay = (date) =>
  axiosInstance.get(`/holidays/business-day?date=${date}`);
