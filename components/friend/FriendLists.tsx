import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, MessageCircle, UserMinus, Search } from 'lucide-react-native';
import { getFriends, removeFriend } from '@/contexts/friend.api';
import { router } from 'expo-router';

const theme = {
  primary: '#6366F1',
  accent: '#EC4899',
  success: '#10B981',
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

export default function FriendsListScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: friendsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['friends'],
    queryFn: () => getFriends(),
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  }, [refetch]);

  const friends = friendsResponse?.data || [];

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;

    const lowercasedQuery = searchQuery.toLowerCase();
    return friends.filter(
      (friend: any) =>
        friend.firstName.toLowerCase().includes(lowercasedQuery) ||
        friend.lastName.toLowerCase().includes(lowercasedQuery) ||
        `${friend.firstName} ${friend.lastName}`
          .toLowerCase()
          .includes(lowercasedQuery)
    );
  }, [friends, searchQuery]);

  const removeFriendMutation = useMutation({
    mutationFn: removeFriend,
    onSuccess: (data, variables) => {
      console.log('Friend removed successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      Alert.alert('Success', data.message || 'Friend removed successfully!');
    },
    onError: (error: any) => {
      console.error('Error removing friend:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to remove friend. Please try again.';
      Alert.alert('Error', errorMessage);
    },
  });

  const handleRemoveFriend = (friendId: string, friendName: string) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friendName} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFriendMutation.mutate({ friendId }),
        },
      ]
    );
  };

  const handleMessage = (friendId: string) => {
    // Navigate to chat screen
    router.push(`/chat/${friendId}`);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading friends...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load friends</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchWrapper}>
        <View style={styles.searchBarContainer}>
          <Search size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredFriends.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color={theme.gray400} />
            <Text style={styles.emptyStateTitle}>No friends yet</Text>
            <Text style={styles.emptyStateText}>
              Start connecting with people to build your network!
            </Text>
          </View>
        ) : (
          <View style={styles.friendsList}>
            {filteredFriends.map((friend: any) => (
              <TouchableOpacity
                key={friend.id}
                style={styles.friendCard}
                onPress={() => router.push(`/public/profile/${friend.id}`)}
              >
                <Image
                  source={{
                    uri:
                      friend.profilePicture ||
                      'https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png',
                  }}
                  style={styles.friendImage}
                  defaultSource={require('../../assets/user.png')}
                />
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>
                    {friend.firstName} {friend.lastName}
                  </Text>
                  {friend.major && (
                    <Text style={styles.friendDetails}>{friend.major}</Text>
                  )}
                  {friend.university && (
                    <Text style={styles.friendDetails}>
                      {friend.university.name}
                    </Text>
                  )}
                  {friend.classYear && (
                    <Text style={styles.friendDetails}>{friend.classYear}</Text>
                  )}
                  {(friend.countryOfOrigin || friend.city) && (
                    <Text style={styles.friendDetails}>
                      {friend.countryOfOrigin || friend.city}
                    </Text>
                  )}

                  {/* <Text style={styles.friendDetails}>{friend.email}</Text> */}
                </View>
                <View style={styles.friendActions}>
                  <TouchableOpacity
                    style={styles.messageButton}
                    onPress={() => handleMessage(friend.chatId)}
                  >
                    <MessageCircle size={20} color={theme.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() =>
                      handleRemoveFriend(
                        friend.id,
                        `${friend.firstName} ${friend.lastName}`
                      )
                    }
                  >
                    <UserMinus size={18} color={theme.gray500} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
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

  searchWrapper: {
    marginHorizontal: 16,
    marginBottom: 12,
  },

  searchBarContainer: {
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
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  searchIcon: {
    marginLeft: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.textPrimary,
    fontWeight: '500',
    marginLeft: 12,
  },

  friendsCountText: {
    fontSize: 15,
    color: theme.gray500,
    fontWeight: '600',
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

  friendsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  friendCard: {
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

  friendImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },

  friendInfo: {
    flex: 1,
  },

  friendName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 2,
  },

  friendDetails: {
    fontSize: 13,
    color: theme.gray500,
    marginBottom: 1,
  },

  friendActions: {
    flexDirection: 'row',
    gap: 8,
  },
  messageButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.gray50,
    ...Platform.select({
      ios: {
        shadowColor: theme.gray200,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },

  removeButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: theme.gray50,
    ...Platform.select({
      ios: {
        shadowColor: theme.gray200,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
});
