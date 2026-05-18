import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../config/environment';

export const checkBusinessDay = (date) => {

  return axiosInstance.get(ENDPOINTS.HOLIDAYS.CHECK_BUSINESS_DAY(date));
};
