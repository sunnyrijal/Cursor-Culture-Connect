import { Platform } from 'react-native';
import api from './axiosConfig';
import * as Device from "expo-device";
export const getNotifications = async () => {
  try {
    const response= await api.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const registerPushToken = async (token: string) => {

    console.log(Device)
  const deviceId = Device.modelName || Device.modelId
  const payload: PushTokenPayload = {
    token,
    platform: Platform.OS as 'ios' | 'android',
    deviceId,
  };
  console.log(payload)
  return await sendPushNotificationToken(payload);
};

export interface PushTokenPayload {
  token: string;
  platform: 'ios' | 'android';
  deviceId: string;
}

export const sendPushNotificationToken = async (payload: PushTokenPayload) => {
  try {
    const response = await api.post('/push-notification/token', payload);
    return response.data;
  } catch (error) {
    console.error('Error sending push notification token:', error);
    throw error;
  }
};