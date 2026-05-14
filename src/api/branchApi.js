import axiosInstance from './axiosInstance';

export const getAllBranches = () =>
  axiosInstance.get('/branches');

export const createBranch = (data) =>
  axiosInstance.post('/branches/', data);
