import api from './axiosConfig';
import { AxiosResponse } from 'axios';

export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  senderId: string;
  receiverId:string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    profilePicture?: string;
  };
  metadata?: any;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export interface NotificationCountResponse {
  count: number;
}


export const getNotifications = async () => {
  try {
    const response= await api.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const getNotificationCount = async () => {
  try {
    const response: AxiosResponse<NotificationCountResponse> = await api.get('/notifications/count');
    return response.data;
  } catch (error) {
    console.error('Error fetching notification count:', error);
    throw error;
  }
};


export const markNotificationAsRead = async (notificationIds: string[]) => {
  try {
    const response: AxiosResponse = await api.patch(`/notifications/read`,{
        notificationIds
    });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};



export const markAllNotificationsAsRead = async () => {
  try {
    const response: AxiosResponse = await api.patch('/notifications/read/all');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};