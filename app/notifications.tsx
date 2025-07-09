import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import { 
  ArrowLeft, 
  Bell, 
  Users, 
  Calendar, 
  MessageCircle, 
  UserPlus,
  Heart,
  Settings,
  Check,
  X
} from 'lucide-react-native';
import { findUserById, MockUser, MockEvent, MockGroup } from '@/data/mockData';

interface Notification {
  id: string;
  type: 'connection' | 'event' | 'message' | 'group' | 'reminder';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  actionRequired?: boolean;
  userImage?: string;
  eventImage?: string;
  fromUserId?: string;
  entityId?: number; // For event or group IDs
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'connection',
    title: 'New Connection Request',
    message: 'Maria Rodriguez wants to connect with you',
    time: '5 minutes ago',
    isRead: false,
    actionRequired: true,
    userImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    fromUserId: '16'
  },
  {
    id: '2',
    type: 'event',
    title: 'Event Reminder',
    message: 'Lunar New Year Celebration starts in 2 hours',
    time: '2 hours ago',
    isRead: false,
    eventImage: 'https://images.pexels.com/photos/6786961/pexels-photo-6786961.jpeg?auto=compress&cs=tinysrgb&w=400',
    entityId: 1,
  },
  {
    id: '4',
    type: 'group',
    title: 'Group Invitation',
    message: 'You\'ve been invited to join "East Asian Cultural Exchange"',
    time: '6 hours ago',
    isRead: true,
    actionRequired: true,
    entityId: 2,
  },
  {
    id: '5',
    type: 'message',
    title: 'New Message',
    message: 'Maria Rodriguez sent you a message',
    time: '1 day ago',
    isRead: true,
    userImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    fromUserId: '16',
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection':
        return <UserPlus size={20} color={theme.primary} />;
      case 'event':
        return <Calendar size={20} color={theme.info} />;
      case 'message':
        return <MessageCircle size={20} color={theme.accent} />;
      case 'group':
        return <Users size={20} color={theme.success} />;
      case 'reminder':
        return <Bell size={20} color={theme.warning} />;
      default:
        return <Bell size={20} color={theme.gray500} />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(currentNotifications => 
      currentNotifications.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const handleAcceptConnection = (e: any, id: string) => {
    e.stopPropagation();
    const notification = notifications.find(n => n.id === id);
    Alert.alert("Connection Accepted", `You are now connected with ${notification?.message.split(' ')[0]}.`);
    setNotifications(current => current.filter(notif => notif.id !== id));
  };

  const handleDeclineConnection = (e: any, id: string) => {
    e.stopPropagation();
    setNotifications(current => current.filter(notif => notif.id !== id));
  };

  const handleJoinGroup = (e: any, id: string) => {
      e.stopPropagation();
      Alert.alert("Group Joined", "You have successfully joined the group.");
      setNotifications(current => current.filter(notif => notif.id !== id));
  }

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    switch(notification.type) {
        case 'connection':
            if (notification.fromUserId) {
                const user = findUserById(notification.fromUserId);
                if (user) {
                    router.push(`/profile/public/${user.id}`);
                }
            }
            break;
        case 'message':
             if (notification.fromUserId) {
                router.push(`/chat/${notification.fromUserId}`);
            }
            break;
        case 'event':
            if (notification.entityId) {
                router.push(`/event/${notification.entityId}`);
            }
            break;
        case 'group':
            if (notification.entityId) {
                router.push(`/group/${notification.entityId}`);
            }
            break;
        default:
            console.log("No navigation for this notification type.");
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <Badge 
              label={unreadCount.toString()} 
              variant="error" 
              size="sm" 
              style={styles.unreadBadge}
            />
          )}
        </View>
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsButton}>
          <Settings size={20} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {unreadCount > 0 && (
        <View style={styles.actionBar}>
          <Button
            title={`Mark all as read (${unreadCount})`}
            variant="ghost"
            onPress={markAllAsRead}
            size="sm"
          />
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            onPress={() => handleNotificationPress(notification)}
            activeOpacity={0.7}
          >
            <Card style={[
              styles.notificationCard,
              !notification.isRead && styles.unreadCard
            ]}>
              <View style={styles.notificationContent}>
                <View style={styles.notificationLeft}>
                  <View style={styles.iconContainer}>
                    {getNotificationIcon(notification.type)}
                  </View>
                  {(notification.userImage || notification.eventImage) && (
                    <Image 
                      source={{ uri: notification.userImage || notification.eventImage }} 
                      style={styles.notificationImage} 
                    />
                  )}
                </View>

                <View style={styles.notificationBody}>
                  <Text style={[
                    styles.notificationTitle,
                    !notification.isRead && styles.unreadTitle
                  ]}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {notification.time}
                  </Text>

                  {notification.actionRequired && notification.type === 'connection' && (
                    <View style={styles.actionButtons}>
                      <Button
                        title="Accept"
                        onPress={(e) => handleAcceptConnection(e, notification.id)}
                        size="sm"
                        style={styles.acceptButton}
                      />
                      <Button
                        title="Decline"
                        variant="outline"
                        onPress={(e) => handleDeclineConnection(e, notification.id)}
                        size="sm"
                        style={styles.declineButton}
                      />
                    </View>
                  )}

                  {notification.actionRequired && notification.type === 'group' && (
                    <View style={styles.actionButtons}>
                      <Button
                        title="Join Group"
                        onPress={(e) => handleJoinGroup(e, notification.id)}
                        size="sm"
                        style={styles.joinButton}
                      />
                      <Button
                        title="Ignore"
                        variant="ghost"
                        onPress={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                        size="sm"
                      />
                    </View>
                  )}
                </View>

                {!notification.isRead && (
                  <View style={styles.unreadIndicator} />
                )}
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        {notifications.length === 0 && (
          <Card style={styles.emptyState}>
            <Bell size={48} color={theme.gray400} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyMessage}>
              You're all caught up! Check back later for updates.
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.white,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
  },
  unreadBadge: {
    marginLeft: spacing.xs,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  actionBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: theme.gray50,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  notificationCard: {
    marginTop: spacing.md,
    padding: spacing.md,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: theme.primary,
    backgroundColor: theme.gray50,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationLeft: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: theme.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  notificationImage: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: theme.white,
    marginTop: -20,
    marginLeft: 20
  },
  notificationBody: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: theme.textPrimary,
    marginBottom: spacing.xs,
  },
  unreadTitle: {
    fontFamily: typography.fontFamily.semiBold,
  },
  notificationMessage: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  notificationTime: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: theme.gray400,
    marginBottom: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  acceptButton: {
    flex: 1,
  },
  declineButton: {
    flex: 1,
  },
  joinButton: {
    flex: 1,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.primary,
    marginLeft: spacing.sm,
    marginTop: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    textAlign: 'center',
    maxWidth: 250,
  },
});
