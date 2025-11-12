import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import Constants from 'expo-constants';

import { Platform } from 'react-native';
import { registerPushToken } from '@/contexts/pushNotification.api';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

export interface PushNotificationState {
  expoPushToken?: Notifications.ExpoPushToken;
  notification?: Notifications.Notification;
}

export const usePushNotifications = (): PushNotificationState => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldShowAlert: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  const [expoPushToken, setExpoPushToken] = useState<
    Notifications.ExpoPushToken | undefined
  >();

  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();

  const notificationListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );
  const responseListener = useRef<Notifications.Subscription | undefined>(
    undefined
  );
  const queryClient = useQueryClient();

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        // alert('Failed to get push token for push notification');
        return;
      }

      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas.projectId,
      });
    } else {
      // alert('Must be using a physical device for Push notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  }

  useEffect(() => {
    const handleNotificationResponse = (
      response: Notifications.NotificationResponse
    ) => {
      const data = response.notification.request.content.data;
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
            queryClient.invalidateQueries({
              queryKey: ['group', data.groupId],
            });
            router.push(`/group/${data.groupId}`);
          }
          break;
        case 'GROUP_MEMBER_ADDED':
        case 'GROUP_JOINED_SELF':
          if (data.groupId) {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            queryClient.invalidateQueries({
              queryKey: ['group', data.groupId],
            });
            queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
            router.push(`/group/${data.groupId}`);
          }
          break;
        case 'NEW_MESSAGE':
          if (data.chatId) {
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            queryClient.invalidateQueries({ queryKey: ['chat'] });

            queryClient.invalidateQueries({
              queryKey: ['messages', data.chatId],
            });
            router.push(`/chat/${data.chatId}`);
          }
          break;

        case 'NEW_QUICK_EVENT':
        case 'QUICK_EVENT_JOINED':
          if (data.quickEventId) {
            queryClient.invalidateQueries({ queryKey: ['quick-events'] });
            router.push(`/quickevent/${data.quickEventId}`);
          }
          break;
        case 'EVENT_INVITE':
        case 'EVENT_RSVP':
        case 'EVENT_JOINED':
        case 'NEW_EVENT':
          if (data.eventId) {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({
              queryKey: ['event', data.eventId],
            });
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
          console.log(
            `No navigation handler for notification type: ${data.type}`
          );
          queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
          router.push('/notifications');
      }
    };

    registerForPushNotificationsAsync().then(async (token) => {
      setExpoPushToken(token);
      if (token) {
        try {
          await registerPushToken(token.data);
        } catch (error) {
          console.error(
            'Failed to send push token to backend from hook',
            error
          );
        }
      }
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        handleNotificationResponse(response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [queryClient]);

  return {
    expoPushToken,
    notification,
  };
};
