import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../config/environment';

export const loginStaff = (username, password) =>
  axiosInstance.post(ENDPOINTS.AUTH.LOGIN_STAFF, {
    username,
    password
  });
