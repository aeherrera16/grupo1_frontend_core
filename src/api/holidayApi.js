import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../config/environment';

export const checkBusinessDay = (date) => {
  // Este endpoint está en /api/holidays, no en /core/v1/holidays
  return axiosInstance.get(ENDPOINTS.HOLIDAYS.CHECK_BUSINESS_DAY(date));
};
