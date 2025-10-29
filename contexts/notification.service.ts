// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import { Platform } from 'react-native';
// import Constants from 'expo-constants';

// // Configure how notifications are handled when app is in foreground
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//     shouldShowBanner: true,
//     shouldShowList: true,
//   }),
// });

// export const NotificationService = {
//   /**
//    * Request notification permissions and get push token
//    */
//   async registerForPushNotifications() {
//     let token;

//     if (!Device.isDevice) {
//       console.warn('Must use physical device for Push Notifications');
//       return null;
//     }

//     // Check existing permissions
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;

//     // Request permissions if not granted
//     if (existingStatus !== 'granted') {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }

//     if (finalStatus !== 'granted') {
//       console.warn('Failed to get push token for push notification!');
//       return null;
//     }

//     // Get the token
//     try {
//       const projectId = Constants.expoConfig?.extra?.eas?.projectId;
//       token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
//       console.log('Push Token:', token);
//     } catch (error) {
//       console.error('Error getting push token:', error);
//       return null;
//     }

//     // Android-specific channel setup
//     if (Platform.OS === 'android') {
//       await Notifications.setNotificationChannelAsync('default', {
//         name: 'default',
//         importance: Notifications.AndroidImportance.MAX,
//         vibrationPattern: [0, 250, 250, 250],
//         lightColor: '#FF231F7C',
//         sound: 'default',
//       });
//     }

//     return token;
//   },

//   /**
//    * Schedule a local notification
//    */
//   async  scheduleNotification(
//     title: string,
//     body: string,
//     data: Record<string, any> = {},
//     trigger: Notifications.NotificationTriggerInput | null = null) {
//     try {
//       const id = await Notifications.scheduleNotificationAsync({
//         content: {
//           title,
//           body,
//           data,
//           sound: true,
//           priority: Notifications.AndroidNotificationPriority.HIGH,
//         },
//         trigger: trigger || null, // null = immediate
//       });
//       return id;
//     } catch (error) {
//       console.error('Error scheduling notification:', error);
//       return null;
//     }
//   },

//   /**
//    * Schedule a notification with delay (in seconds)
//    */
//   async scheduleDelayedNotification(
//     title: string,
//     body: string,
//     seconds: number,
//     data: Record<string, any> = {}) {
//     return await this.scheduleNotification(title, body, data, {
//       type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
//       seconds,
//     });
//   },

  

//   /**
//    * Cancel a scheduled notification
//    */
//   async cancelNotification(notificationId: string) {
//     await Notifications.cancelScheduledNotificationAsync(notificationId);
//   },

//   /**
//    * Cancel all scheduled notifications
//    */
//   async cancelAllNotifications() {
//     await Notifications.cancelAllScheduledNotificationsAsync();
//   },

//   /**
//    * Get all scheduled notifications
//    */
//   async getAllScheduledNotifications() {
//     return await Notifications.getAllScheduledNotificationsAsync();
//   },

//   /**
//    * Set badge count (iOS)
//    */
//   async setBadgeCount(count: number) {
//     await Notifications.setBadgeCountAsync(count);
//   },

//   /**
//    * Get badge count
//    */
//   async getBadgeCount() {
//     return await Notifications.getBadgeCountAsync();
//   },

//   /**
//    * Clear badge (set to 0)
//    */
//   async clearBadge() {
//     await Notifications.setBadgeCountAsync(0);
//   },

//   /**
//    * Dismiss a notification
//    */
//   async dismissNotification(notificationId: string) {
//     await Notifications.dismissNotificationAsync(notificationId);
//   },

//   /**
//    * Dismiss all notifications
//    */
//   async dismissAllNotifications() {
//     await Notifications.dismissAllNotificationsAsync();
//   },

//   /**
//    * Add notification received listener (foreground)
//    */
//   addNotificationReceivedListener(callback: (event: Notifications.Notification) => void) {
//     return Notifications.addNotificationReceivedListener(callback);
//   },

//   /**
//    * Add notification response listener (user tapped notification)
//    */
//   addNotificationResponseReceivedListener(callback: (event: Notifications.NotificationResponse) => void) {
//     return Notifications.addNotificationResponseReceivedListener(callback);
//   },

//   /**
//    * Remove subscription
//    */
//   removeSubscription(subscription: Notifications.Subscription | undefined) {
//     if (subscription) {
//       subscription.remove();
//     }
//   },
// };