import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../config/environment';

export const getAllBranches = () =>
  axiosInstance.get(ENDPOINTS.BRANCHES.GET_ALL);

export const getBranch = (code) =>
  axiosInstance.get(ENDPOINTS.BRANCHES.GET(code));

export const createBranch = (data) =>
  axiosInstance.post(ENDPOINTS.BRANCHES.CREATE, data);
