import { NOTIFICATION_API } from '../apiConfig';
import { getAuthToken } from './authService';

// Common request function with authentication
const authRequest = async (url: string, method: string, body?: any) => {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  const options: RequestInit = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Get all notifications
export const getAllNotifications = async () => {
  try {
    return await authRequest(NOTIFICATION_API.all, 'GET');
  } catch (error) {
    console.error('Get notifications error:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    return await authRequest(NOTIFICATION_API.unreadCount, 'GET');
  } catch (error) {
    console.error('Get unread count error:', error);
    throw error;
  }
};

// Mark notification as read
export const markAsRead = async (notificationId: string) => {
  try {
    return await authRequest(NOTIFICATION_API.markAsRead(notificationId), 'PUT');
  } catch (error) {
    console.error('Mark notification as read error:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    return await authRequest(NOTIFICATION_API.markAllAsRead, 'PUT');
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    throw error;
  }
}; 