import { useState, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { registerPushToken } from '@/contexts/pushNotification.api';
export interface PushNotificationState {
  fcmToken?: string;
  notification?: FirebaseMessagingTypes.RemoteMessage;
}

const FCM_TOKEN_KEY = 'fcm_push_token';

export const usePushNotifications = (): PushNotificationState => {
  
  const [fcmToken, setFcmToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<FirebaseMessagingTypes.RemoteMessage | undefined>();
  const queryClient = useQueryClient();
  const isRegistering = useRef(false);

  // Register FCM token with backend
  async function registerTokenWithBackend(token: string) {
    const authToken = await SecureStore.getItemAsync('token');
    if (!authToken) {
      console.warn('No auth token provided, skipping backend registration');
      return;
    }

    if (isRegistering.current) {
      console.log('Already registering token, skipping...');
      return;
    }

    isRegistering.current = true;

    try {
      console.log('Registering FCM token with backend...');
      await registerPushToken(token);
      console.log('FCM token registered successfully!');
      await SecureStore.setItemAsync(FCM_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to register FCM token with backend:', error);
    } finally {
      isRegistering.current = false;
    }
  }

  // Request permission and get FCM token
  async function requestPermissionAndGetToken() {
    try {

       const app = messaging().app;
    if (!app) {
      console.error('Firebase app not initialized');
      return;
    }
      // Check stored token first
      const storedToken = await SecureStore.getItemAsync(FCM_TOKEN_KEY);
      
      // Request permission (iOS only, Android auto-grants)
      let permissionGranted = true;
      
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        permissionGranted =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!permissionGranted) {
          console.warn('Notification permission not granted');
          return;
        }
      }

      // Get FCM token
      const token = await messaging().getToken();
      
      if (!token) {
        console.error('Failed to get FCM token');
        return;
      }

      console.log('FCM token obtained:', token);
      setFcmToken(token);

      // Register with backend if token changed
      if (token !== storedToken) {
        await registerTokenWithBackend(token);
      }

      return token;
    } catch (error) {
      console.error('Error requesting permission or getting token:', error);
    }
  }

  // Handle notification tap/open
  const handleNotificationResponse = (data: Record<string, any>) => {
    console.log('Notification tapped, data:', data);

    if (!data || !data.type) {
      console.log('No data or type in notification, cannot navigate.');
      return;
    }

    // Centralized navigation logic
    switch (data.type) {
      case 'FRIEND_REQUEST_RECEIVED':
        queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
        queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
        queryClient.invalidateQueries({ queryKey: ['counts'] });
        queryClient.invalidateQueries({ queryKey: ['chats'] });
        router.push('/discover?tab=requests');
        break;

      case 'FRIEND_REQUEST_ACCEPTED':
        queryClient.invalidateQueries({ queryKey: ['friends'] });
        queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
        queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
        queryClient.invalidateQueries({ queryKey: ['counts'] });
        router.push('/discover?tab=friends');
        break;

      case 'NEW_GROUP_MESSAGE':
        if (data.groupId) {
          queryClient.invalidateQueries({ queryKey: ['groups'] });
          queryClient.invalidateQueries({ queryKey: ['group', data.groupId] });
          router.push(`/group/${data.groupId}`);
        }
        break;

      case 'GROUP_MEMBER_ADDED':
      case 'GROUP_JOINED_SELF':
        if (data.groupId) {
          queryClient.invalidateQueries({ queryKey: ['groups'] });
          queryClient.invalidateQueries({ queryKey: ['group', data.groupId] });
          queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
          router.push(`/group/${data.groupId}`);
        }
        break;

      case 'NEW_MESSAGE':
        if (data.chatId) {
          queryClient.invalidateQueries({ queryKey: ['chats'] });
          queryClient.invalidateQueries({ queryKey: ['messages', data.chatId] });
          router.push(`/chat/${data.chatId}`);
        }
        break;

      case 'EVENT_INVITE':
      case 'EVENT_RSVP':
      case 'EVENT_JOINED':
        if (data.eventId) {
          queryClient.invalidateQueries({ queryKey: ['events'] });
          queryClient.invalidateQueries({ queryKey: ['event', data.eventId] });
          queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
          router.push(`/event/${data.eventId}`);
        }
        break;

      case 'INTEREST_PING_RECEIVED':
      case 'INTEREST_PING_ACCEPTED':
      case 'INTEREST_PING_DECLINED':
      case 'INTEREST_PING_BACK':
        queryClient.invalidateQueries({ queryKey: ['userPings'] });
        queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
        queryClient.invalidateQueries({ queryKey: ['counts'] });
        router.push('/activity-buddy?tab=pings');
        break;

      default:
        console.log(`No navigation handler for notification type: ${data.type}`);
        queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
        router.push('/notifications');
    }
  };

  useEffect(() => {
    // Request permission and get token
    requestPermissionAndGetToken();

    // Listen for token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
      console.log('FCM token refreshed:', newToken);
      setFcmToken(newToken);
      await registerTokenWithBackend(newToken);
    });

    // Handle foreground notifications
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground notification received:', remoteMessage);
      setNotification(remoteMessage);
      // Invalidate notification count
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
    });

    // Handle notification opened from background state
    const unsubscribeBackground = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app from background:', remoteMessage);
      if (remoteMessage.data) {
        handleNotificationResponse(remoteMessage.data);
      }
    });

    // Check if app was opened from a notification (quit state)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification opened app from quit state:', remoteMessage);
          if (remoteMessage.data) {
            handleNotificationResponse(remoteMessage.data);
          }
        }
      });

    // Cleanup
    return () => {
      unsubscribeTokenRefresh();
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }, [queryClient]);

  return {
    fcmToken,
    notification,
  };
};