import axiosInstance from './axiosInstance';

export const getNotifications = (userId) =>
  axiosInstance.get(`/notifications/${userId}`);

export const getUnreadCount = (userId) =>
  axiosInstance.get(`/notifications/${userId}/unread-count`);

export const markAsRead = (notificationId) =>
  axiosInstance.put(`/notifications/${notificationId}/read`);
