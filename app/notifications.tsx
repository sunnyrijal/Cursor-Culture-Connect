import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { theme, spacing, typography } from '@/components/theme';
import { ArrowLeft, Bell, Settings } from 'lucide-react-native';
import { 
  getNotifications, 
  markNotificationAsRead,
  markAllNotificationsAsRead as apiMarkAllAsRead
} from '@/contexts/notification.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationCard } from '@/components/NotificationCard';
import { updateInterestPing } from '@/contexts/interest.api';

interface NotificationData {
  id: string;
  isRead: boolean;
  createdAt: string;
  type: string;
  title: string;
  content: string | null;
  data: any;
  recipientId: string;
  senderId: string | null;
  friendshipId: string | null;
  eventId: string | null;
  groupId: string | null;
  interestPingId: string | null;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
  };
}

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data: notificationResponse, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
  });

  const notifications: NotificationData[] = notificationResponse?.data || [];

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead([notificationId]),
    onSuccess: () => {
      // Invalidate and refetch the notifications query to get the updated list
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] });

    },
    onError: (error) => {
      console.error("Failed to mark notification as read:", error);
      Alert.alert("Error", "Could not mark notification as read.");
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: apiMarkAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
    },
    onError: (error) => {
      console.error("Failed to mark all notifications as read:", error);
      Alert.alert("Error", "Could not mark all notifications as read.");
    }
  });





  const handleMarkAsRead = (notification: NotificationData) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  const handleNotificationPress = (notification: NotificationData) => {
    handleMarkAsRead(notification);
    // The navigation logic is already inside NotificationCard, 
    // so we just need to ensure it's marked as read.
    // The card's onPress will handle the navigation.
  };

  const unreadCount = notifications.filter((n:any) => !n.isRead).length;

  // Show loading indicator only on initial fetch
  if (isLoading && !notificationResponse) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsButton}>
            <Settings size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}> 
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading Notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Notifications</Text>
          {/* {unreadCount > 0 && (
            <Badge 
              label={unreadCount.toString()} 
              variant="warning" 
              size="sm" 
              style={styles.unreadBadge}
            />
          )} */}
        </View>
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsButton}>
          <Settings size={20} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {unreadCount > 0 && (
        <View style={styles.actionBar}>
          <Button
            title={`Mark all as read (${unreadCount})`}
            variant="outline"
            onPress={handleMarkAllAsRead}
            size="sm"
            disabled={markAllAsReadMutation.isPending}
          />
        </View>
      )}

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }>
        {notifications.map((notification:any) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onPress={()=>{}}
            onMarkAsRead={() => handleMarkAsRead(notification)}
          />
        ))}

        {notifications.length === 0 && !isLoading && (
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
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