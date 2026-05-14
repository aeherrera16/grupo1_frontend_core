import axiosInstance from './axiosInstance';

export const loginStaff = (username) =>
  axiosInstance.post('/auth/login/staff', {
    username,
    password: '' // Sin seguridad aún
  });
