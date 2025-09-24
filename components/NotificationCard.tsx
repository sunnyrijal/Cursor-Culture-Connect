import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import {
  UserPlus,
  Calendar,
  MessageCircle,
  Users,
  Bell,
  Heart,
  UserCheck,
  Shield,
} from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { respondToFriendRequest } from '@/contexts/friend.api';
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

interface NotificationCardProps {
  notification: NotificationData;
  onPress: () => void;
  onMarkAsRead: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onMarkAsRead,
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'FRIEND_REQUEST_RECEIVED':
      case 'FRIEND_REQUEST_ACCEPTED':
      case 'FRIEND_REQUEST_DECLINED':
        return <UserPlus size={20} color={theme.primary} />;
      case 'EVENT_RSVP':
      case 'EVENT_INVITE':
      case 'EVENT_JOINED':
      case 'EVENT_LEFT':
      case 'QUICK_EVENT_JOINED':
      case 'QUICK_EVENT_LEFT':
        return <Calendar size={20} color={theme.info} />;
      case 'NEW_GROUP_MESSAGE':
      case 'GROUP_MEMBER_ADDED':
        return <MessageCircle size={20} color={theme.accent} />;
      case 'GROUP_ROLE_UPDATED':
        return <Shield size={20} color={theme.warning} />;
      case 'INTEREST_PING_RECEIVED':
      case 'INTEREST_PING_ACCEPTED':
      case 'INTEREST_PING_DECLINED':
        return <Heart size={20} color={theme.error} />;
      default:
        return <Bell size={20} color={theme.gray500} />;
    }
  };

  const queryClient = useQueryClient();
  const respondToRequestMutation = useMutation({
    mutationFn: respondToFriendRequest,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
      queryClient.invalidateQueries({ queryKey: ['counts'] });

      const action = variables.action === 'accept' ? 'accepted' : 'declined';
      Alert.alert('Success', `Friend request ${action}!`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to respond to friend request. Please try again.';
      Alert.alert('Error', errorMessage);
    },
  });

  const handleAcceptRequest = (friendshipId: string, senderName: string) => {
    Alert.alert(
      'Accept Friend Request',
      `Accept friend request from ${senderName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () =>
            respondToRequestMutation.mutate({ friendshipId, action: 'accept' }),
        },
      ]
    );
  };

  const handleRejectRequest = (friendshipId: string, senderName: string) => {
    Alert.alert(
      'Reject Friend Request',
      `Reject friend request from ${senderName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () =>
            respondToRequestMutation.mutate({
              friendshipId,
              action: 'decline',
            }),
        },
      ]
    );
  };

  const updatePingMutation = useMutation({
    mutationFn: ({ pingId, updateData }: { pingId: string; updateData: any }) =>
      updateInterestPing(pingId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPings'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationCount'] });
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error?.response.data.message ||
          'Failed to update ping. Please try again.'
      );
      console.error('Update ping error:', error);
    },
  });
  const handlePingResponse = (
    pingId: string,
    status: 'accepted' | 'declined'
  ) => {
    if (status === 'accepted') {
      // Alert.prompt(
      //   'Accept Ping',
      //   'Add a response message (optional):',
      //   [
      //     { text: 'Cancel', style: 'cancel' },
      //     {
      //       text: 'Accept',
      //       onPress: (response) => {
      //         updatePingMutation.mutate({
      //           pingId,
      //           updateData: { status, response: response || undefined },
      //         });
      //       },
      //     },
      //   ],
      //   'plain-text',
      //   "Great! I'd love to connect over this activity!"
      // );
      updatePingMutation.mutate({
        pingId,
        updateData: { status },
      });
    } else {
      updatePingMutation.mutate({
        pingId,
        updateData: { status },
      });
    }
  };

  const getTimeAgo = (createdAt: string) => {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMinutes = Math.floor(
      (now.getTime() - notificationTime.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return notificationTime.toLocaleDateString();
  };

  const handleAcceptFriendRequest = (e: any) => {
    e.stopPropagation();
    if (notification.friendshipId) {
      handleAcceptRequest(
        notification.friendshipId,
        notification.sender?.firstName || 'user'
      );
    }
  };

  const handleDeclineFriendRequest = (e: any) => {
    e.stopPropagation();
    if (notification.friendshipId) {
      handleRejectRequest(
        notification.friendshipId,
        notification.sender?.firstName || 'user'
      );
    }
  };

  const handleAcceptInterestPing = (e: any) => {
    e.stopPropagation();
    if (notification.interestPingId) {
      handlePingResponse(notification.interestPingId, 'accepted');
    }
  };

  const handleDeclineInterestPing = (e: any) => {
    e.stopPropagation();
    if (notification.interestPingId) {
      handlePingResponse(notification.interestPingId, 'declined');
    }
  };

  const showActionButtons = () => {
    return (
      notification.type === 'FRIEND_REQUEST_RECEIVED' ||
      notification.type === 'INTEREST_PING_RECEIVED'
    );
  };

  const handleCardPress = () => {
    onMarkAsRead();

    switch (notification.type) {
      case 'FRIEND_REQUEST_RECEIVED':
      case 'FRIEND_REQUEST_ACCEPTED':
        if (notification.senderId) {
          router.push(`/public/profile/${notification.senderId}`);
        }
        break;
      case 'NEW_GROUP_MESSAGE':
        if (notification.groupId) {
          router.push(`/group/${notification.groupId}`);
        }
        break;
      case 'EVENT_RSVP':
      case 'EVENT_INVITE':
      case 'EVENT_JOINED':
      case 'EVENT_LEFT':
      case 'QUICK_EVENT_JOINED':
      case 'QUICK_EVENT_LEFT':
        if (notification.eventId) {
          router.push(`/event/${notification.eventId}`);
        }
        break;
      case 'GROUP_ROLE_UPDATED':
      case 'GROUP_MEMBER_ADDED':
        if (notification.groupId) {
          router.push(`/group/${notification.groupId}`);
        }
        break;
      case 'INTEREST_PING_RECEIVED':
      case 'INTEREST_PING_ACCEPTED':
      case 'INTEREST_PING_DECLINED':
        if (notification.senderId) {
          router.push(`/public/profile/${notification.senderId}`);
        }
        break;
      default:
        console.log(
          'No navigation for this notification type:',
          notification.type
        );
    }
  };

  return (
    <TouchableOpacity onPress={handleCardPress} activeOpacity={0.7}>
      <Card
        style={[
          styles.notificationCard,
          !notification.isRead && styles.unreadCard,
        ]}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationLeft}>
            <View style={styles.iconContainer}>
              {getNotificationIcon(notification.type)}
            </View>
            {notification.sender?.profilePicture && (
              <Image
                source={{ uri: notification.sender.profilePicture }}
                style={styles.notificationImage}
              />
            )}
          </View>

          <View style={styles.notificationBody}>
            <Text
              style={[
                styles.notificationTitle,
                !notification.isRead && styles.unreadTitle,
              ]}
            >
              {notification.title}
            </Text>
            {notification.content && (
              <Text style={styles.notificationMessage}>
                {notification.content}
              </Text>
            )}
            <Text style={styles.notificationTime}>
              {getTimeAgo(notification.createdAt)}
            </Text>

            {showActionButtons() && (
              <View style={styles.actionButtons}>
                {notification.type === 'FRIEND_REQUEST_RECEIVED' && (
                  <>
                    <TouchableOpacity
                      onPress={handleAcceptFriendRequest}
                      style={[
                        styles.acceptButton,
                        respondToRequestMutation.isPending &&
                          styles.disabledButton,
                      ]}
                      disabled={respondToRequestMutation.isPending}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleDeclineFriendRequest}
                      style={[
                        styles.declineButton,
                        respondToRequestMutation.isPending &&
                          styles.disabledButton,
                      ]}
                      disabled={respondToRequestMutation.isPending}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>
                  </>
                )}
                {notification.type === 'INTEREST_PING_RECEIVED' && (
                  <>
                    <TouchableOpacity
                      onPress={handleAcceptInterestPing}
                      style={[
                        styles.acceptButton,
                        updatePingMutation.isPending && styles.disabledButton,
                      ]}
                      disabled={updatePingMutation.isPending}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleDeclineInterestPing}
                      style={[
                        styles.declineButton,
                        updatePingMutation.isPending && styles.disabledButton,
                      ]}
                      disabled={updatePingMutation.isPending}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>

          {!notification.isRead && <View style={styles.unreadIndicator} />}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    marginLeft: 20,
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
    backgroundColor: theme.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: theme.white,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
  },
  declineButton: {
    flex: 1,
    backgroundColor: theme.white,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  declineButtonText: {
    color: theme.textSecondary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.primary,
    marginLeft: spacing.sm,
    marginTop: spacing.xs,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
