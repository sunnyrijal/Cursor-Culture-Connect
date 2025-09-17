'use client';

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCheck, UserX, Clock, Users } from 'lucide-react-native';
import {
  getPendingFriendRequests,
  respondToFriendRequest,
} from '@/contexts/friend.api';
import { router } from 'expo-router';
import getDecodedToken from '@/utils/getMyData';

const theme = {
  primary: '#6366F1',
  accent: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  background: '#F0F3F7',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray900: '#111827',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export default function FriendRequestsScreen() {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const queryClient = useQueryClient();

  const { data: myData } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getDecodedToken(),
  });

  const {
    data: requestsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: () => getPendingFriendRequests(),
  });

  const receivedRequests = requestsResponse?.data?.received || [];
  const sentRequests = requestsResponse?.data?.sent || [];

  console.log(requestsResponse);

  const respondToRequestMutation = useMutation({
    mutationFn: respondToFriendRequest,
    onSuccess: (data, variables) => {
      console.log('Friend request response successful:', data);
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      const action = variables.action === 'accept' ? 'accepted' : 'declined';
      Alert.alert('Success', `Friend request ${action}!`);
    },
    onError: (error: any) => {
      console.error('Error responding to friend request:', error);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading friend requests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load friend requests</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentRequests =
    activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Container */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'received' && styles.activeTabText,
            ]}
          >
            Received ({receivedRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'sent' && styles.activeTabText,
            ]}
          >
            Sent ({sentRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {currentRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color={theme.gray400} />
            <Text style={styles.emptyStateTitle}>
              {activeTab === 'received'
                ? 'No friend requests'
                : 'No sent requests'}
            </Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'received'
                ? "When people send you friend requests, they'll appear here"
                : "Friend requests you've sent will appear here"}
            </Text>
          </View>
        ) : (
          <View style={styles.requestsList}>
            {currentRequests.map((request: any) => {
              const user =
                activeTab === 'received' ? request.sender : request.receiver;

                const name = user.name || `${user.firstName} ${user.lastName}`;

              return (
                <TouchableOpacity
                  key={request.id}
                  style={styles.requestCard}
                  onPress={() => router.push(`/public/profile/${user.id}`)}
                >
                  <Image
                     source={{
                    uri:
                      user?.profilePicture ||
                      'https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png',
                  }}
                    style={styles.userImage}
                    defaultSource={require('../../assets/user.png')}
                  />
                  <View style={styles.requestInfo}>
                    <Text style={styles.userName}>{name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    {user.city && (
                      <Text style={styles.userLocation}>{user.city}</Text>
                    )}
                    {user.university && (
                      <Text style={styles.userUniversity}>
                        {user.university.name}
                      </Text>
                    )}
                    <View style={styles.requestMeta}>
                      <Clock size={12} color={theme.gray400} />
                      <Text style={styles.requestTime}>
                        {formatDate(request.createdAt)}
                      </Text>
                    </View>
                  </View>

                  {activeTab === 'received' ? (
                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() =>
                          handleAcceptRequest(request.id, user.name)
                        }
                        disabled={respondToRequestMutation.isPending}
                      >
                        <UserCheck size={18} color={theme.white} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() =>
                          handleRejectRequest(request.id, user.name)
                        }
                        disabled={respondToRequestMutation.isPending}
                      >
                        <UserX size={18} color={theme.white} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.sentStatus}>
                      <Clock size={14} color={theme.warning} />
                      <Text style={styles.sentStatusText}>Pending</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
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

  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeTab: {
    backgroundColor: theme.primary,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },

  activeTabText: {
    color: theme.white,
  },

  scrollView: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: theme.gray500,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorText: {
    fontSize: 16,
    color: theme.gray500,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },

  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },

  emptyStateText: {
    fontSize: 15,
    color: theme.gray500,
    textAlign: 'center',
    lineHeight: 22,
  },

  requestsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  userImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },

  requestInfo: {
    flex: 1,
  },

  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: 'black',
    marginBottom: 2,
  },

  userEmail: {
    fontSize: 13,
    color: theme.gray500,
    marginBottom: 1,
  },

  userLocation: {
    fontSize: 13,
    color: theme.gray500,
    marginBottom: 1,
  },

  userUniversity: {
    fontSize: 13,
    color: theme.gray500,
    marginBottom: 6,
  },

  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  requestTime: {
    fontSize: 11,
    color: theme.gray400,
  },

  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },

  acceptButton: {
    backgroundColor: theme.success,
    padding: 10,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: theme.success,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  rejectButton: {
    backgroundColor: theme.gray400,
    padding: 10,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: theme.gray400,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  sentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: theme.gray50,
    borderRadius: 8,
  },

  sentStatusText: {
    fontSize: 13,
    color: theme.warning,
    fontWeight: '600',
  },
});
