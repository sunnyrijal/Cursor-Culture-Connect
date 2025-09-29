'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Platform,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  MessageCircle,
  Filter,
} from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { getUsers } from '@/contexts/user.api';
import {
  sendFriendRequest,
  cancelFriendRequest,
  respondToFriendRequest,
} from '@/contexts/friend.api';
import { FriendFilterModal } from '../UserFilterModal';

const theme = {
  primary: '#6366F1',
  accent: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
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

const FriendshipStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  BLOCKED: 'BLOCKED',
};

interface FriendFilters {
  myUniversity?: boolean;
  major?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  universityId?: string;
}

export default function SendFriendRequestScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [message, setMessage] = useState('');

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FriendFilters>({});

  const {
    data: usersResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users', filters], // Add filters to query key
    queryFn: () => getUsers(filters), // Pass filters to API
  });
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }, [queryClient])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  }, [refetch]);

  const users = usersResponse?.users || [];
  console.log(users)

  const sendRequestMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: (data, variables) => {
      setModalVisible(false);
      setMessage('');
      console.log('Friend request sent successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      Alert.alert('Success', 'Friend request sent successfully!');
    },
    onError: (error: any) => {
      console.error('Error sending friend request:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to send friend request. Please try again.';
      Alert.alert('Error', errorMessage);
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: cancelFriendRequest,
    onSuccess: (data, variables) => {
      console.log('Friend request cancelled successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      Alert.alert('Success', 'Friend request cancelled.');
    },
    onError: (error: any) => {
      console.error('Error cancelling friend request:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to cancel friend request. Please try again.';
      Alert.alert('Error', errorMessage);
    },
  });

  const respondToRequestMutation = useMutation({
    mutationFn: respondToFriendRequest,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
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

  const filteredUsers = useMemo(() => {
    let filtered = users.filter((user: any) => user.friendshipStatus === null);
    if (searchQuery.trim()) {
      filtered = filtered.filter((user: any) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [users, searchQuery]);

  const handleSendRequest = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName });
    setModalVisible(true);
  };

  const handleSendWithMessageHandler = () => {
    if (!selectedUser) return;
    sendRequestMutation.mutate({
      receiverId: selectedUser.id,
      message: message.trim(),
    });
    setModalVisible(false);
    setMessage('');
    setSelectedUser(null);
  };

  const handleCancelRequest = (userId: string, userName: string) => {
    Alert.alert(
      'Cancel Request',
      `Are you sure you want to cancel the friend request to ${userName}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => cancelRequestMutation.mutate({ receiverId: userId }),
        },
      ]
    );
  };

  const handleAcceptRequest = (friendshipId: string, userName: string) => {
    Alert.alert(
      'Accept Friend Request',
      `Accept friend request from ${userName}?`,
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

  const getActionButton = (user: any) => {
    const { friendshipStatus, isFriendRequestSender } = user;

    // No friendship exists - show Add button
    if (!friendshipStatus) {
      return (
        <TouchableOpacity
          style={styles.sendRequestButton}
          onPress={() => handleSendRequest(user.id, user.name)}
          disabled={sendRequestMutation.isPending}
        >
          <UserPlus size={18} color={theme.white} />
          <Text style={styles.sendRequestText}>Add</Text>
        </TouchableOpacity>
      );
    }

    // Friend request pending
    if (friendshipStatus === FriendshipStatus.PENDING) {
      if (isFriendRequestSender) {
        // I sent the request
        // Current user sent the request - show "Sent" button
        return (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelRequest(user.id, user.name)}
            disabled={cancelRequestMutation.isPending}
          >
            <UserX size={18} color={theme.danger} />
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        );
      } else {
        // I received the request - show "Accept" button
        return (
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAcceptRequest(user.friendshipId, user.name)}
            disabled={respondToRequestMutation.isPending}
          >
            <UserCheck size={18} color={theme.white} />
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        );
      }
    }

    // Friend request accepted - they are friends
    if (friendshipStatus === FriendshipStatus.ACCEPTED) {
      return (
        <TouchableOpacity style={styles.friendsButton} disabled>
          <MessageCircle size={18} color={theme.success} />
          <Text style={styles.friendsText}>Friends</Text>
        </TouchableOpacity>
      );
    }

    // Friend request declined
    if (friendshipStatus === FriendshipStatus.DECLINED) {
      return (
        <TouchableOpacity style={styles.declinedButton} disabled>
          <UserX size={18} color={theme.gray500} />
          <Text style={styles.declinedText}>Declined</Text>
        </TouchableOpacity>
      );
    }

    // User is blocked
    if (friendshipStatus === FriendshipStatus.BLOCKED) {
      return (
        <TouchableOpacity style={styles.blockedButton} disabled>
          <UserX size={18} color={theme.gray500} />
          <Text style={styles.blockedText}>Blocked</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const getStatusBadge = (friendshipStatus: string) => {
    if (
      !friendshipStatus ||
      friendshipStatus === FriendshipStatus.ACCEPTED ||
      friendshipStatus == FriendshipStatus.DECLINED
    )
      return null;

    const statusConfig = {
      [FriendshipStatus.PENDING]: {
        text: 'Pending',
        color: theme.warning,
        bg: '#FEF3C7',
      },
      [FriendshipStatus.ACCEPTED]: {
        text: 'Friends',
        color: theme.success,
        bg: '#D1FAE5',
      },
      [FriendshipStatus.DECLINED]: {
        text: 'Declined',
        color: theme.danger,
        bg: '#FEE2E2',
      },
      [FriendshipStatus.BLOCKED]: {
        text: 'Blocked',
        color: theme.gray500,
        bg: theme.gray200,
      },
    };

    const config = statusConfig[friendshipStatus];
    if (!config) return null;

    return (
      <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
        <Text style={[styles.statusBadgeText, { color: config.color }]}>
          {config.text}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load users</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBarContainer}>
          <Search size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search people..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          {Object.keys(filters).length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {Object.keys(filters).length}
              </Text>
            </View>
          )}
          <Filter
            size={20}
            color={Object.keys(filters).length > 0 ? theme.primary : '#64748B'}
          />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Send a friend request to {selectedUser?.name}?
            </Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Add an optional message..."
              placeholderTextColor={theme.gray400}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.textStyle, { color: 'black' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSend]}
                onPress={handleSendWithMessageHandler}
              >
                <Text style={styles.textStyle}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color={theme.gray400} />
            <Text style={styles.emptyStateTitle}>No users found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'No users available to connect with'}
            </Text>
          </View>
        ) : (
          <View style={styles.usersList}>
            {filteredUsers.map((user: any) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userCard}
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

                <View style={styles.userInfo}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName}>{user.name}</Text>
                    {getStatusBadge(user.friendshipStatus)}
                  </View>
                  {user.major && (
                    <Text style={styles.userEmail}>{user.major}</Text>
                  )}
                  {user.university && (
                    <Text style={styles.userUniversity}>
                      {user.university.name}
                    </Text>
                  )}
                  {user.classYear && (
                    <Text style={styles.userClass}>{user.classYear}</Text>
                  )}
                  {(user.countryOfOrigin || user.city) && (
                    <Text style={styles.userLocation}>
                      {user.countryOfOrigin || user.city}
                    </Text>
                  )}
                </View>
                {getActionButton(user)}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      <FriendFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onApply={() => setFilterModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  searchWrapper: {
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 52,
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  searchIcon: {
    marginLeft: 16,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.danger,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.white,
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  filterButton: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.textPrimary,
    fontWeight: '500',
    marginLeft: 12,
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

  usersList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  userCard: {
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

  userInfo: {
    flex: 1,
  },

  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 8,
  },

  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
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
    marginBottom: 1,
  },

  userClass: {
    fontSize: 13,
    color: theme.gray500,
  },

  sendRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  requestSentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.gray200,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: theme.gray200,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },

  pendingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },

  friendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },

  declinedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },

  blockedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.gray200,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },

  sendRequestText: {
    color: theme.white,
    fontWeight: '600',
    fontSize: 13,
  },

  requestSentText: {
    color: theme.gray500,
    fontWeight: '600',
    fontSize: 13,
  },

  pendingText: {
    color: theme.warning,
    fontWeight: '600',
    fontSize: 13,
  },

  friendsText: {
    color: theme.success,
    fontWeight: '600',
    fontSize: 13,
  },

  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.success,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
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
  acceptButtonText: {
    color: theme.white,
    fontWeight: '600',
    fontSize: 13,
  },
  declinedText: {
    color: theme.danger,
    fontWeight: '600',
    fontSize: 13,
  },

  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: theme.danger,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
        borderColor: theme.danger,
        borderWidth: 0.5,
      },
    }),
  },

  blockedText: {
    color: theme.gray500,
    fontWeight: '600',
    fontSize: 13,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  messageInput: {
    width: '100%',
    minHeight: 80,
    maxHeight: 120,
    backgroundColor: theme.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonClose: {
    backgroundColor: theme.gray200,
  },
  buttonSend: {
    backgroundColor: theme.primary,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelText: {
    color: theme.danger,
    fontWeight: '600',
    fontSize: 13,
  },
});
