export interface DeviceInfo {
  brand: string | null;
  modelName: string | null;
  osVersion: string | null;
}

export interface PushTokenData {
  userId: string;
  pushToken: string;
  platform: string;
  deviceInfo: DeviceInfo;
}

export interface SaveTokenResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface NotificationData {
  screen?: string;
  params?: Record<string, any>;
  [key: string]: any;
}

export interface NotificationContent {
  title: string;
  body: string;
  data?: NotificationData;
  sound?: boolean | string;
}