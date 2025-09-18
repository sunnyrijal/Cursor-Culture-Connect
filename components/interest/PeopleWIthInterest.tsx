// app/people-with-interest/[interestName].tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ArrowLeft, MessageCircle, Heart, MapPin } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsersByInterest, sendInterestPing } from '@/contexts/interest.api';

const theme = {
  primary: '#6366F1',
  accent: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  background: '#FAFAFA',
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

export default function PeopleWithInterestPage() {
  const { interestName } = useLocalSearchParams<{ interestName: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pingMessage, setPingMessage] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch users with this interest
  const { data: usersData, isPending, error, refetch } = useQuery({
    queryKey: ['users-by-interest', interestName, page],
    queryFn: () => getUsersByInterest(interestName!, page, 10),
    enabled: !!interestName,
  });

  // Send ping mutation
  const sendPingMutation = useMutation({
    mutationFn: sendInterestPing,
    onSuccess: () => {
      Alert.alert('Success', 'Ping sent successfully!');
      setSelectedUserId(null);
      setPingMessage('');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send ping');
    },
  });

  const users = usersData?.data?.users || [];
  const pagination = usersData?.data?.pagination;

  // Filter users based on search query
  const filteredUsers = users.filter((user: any) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.major?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.classYear.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendPing = (userId: string) => {
    setSelectedUserId(userId);
    // Show ping message input
    Alert.prompt(
      'Send Ping',
      `Send a message about ${interestName}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: (message) => {
            if (message) {
              sendPingMutation.mutate({
                receiverId: userId,
                interestName: interestName!,
                message: message.trim()
              });
            }
          }
        }
      ],
      'plain-text',
      `Hey! I saw you're interested in ${interestName}. Want to connect?`
    );
  };

  const handleLoadMore = () => {
    if (pagination?.hasNext && !isPending) {
      setPage(prev => prev + 1);
    }
  };

  const renderUserCard = (user: any) => (
    <View key={user.id} style={styles.userCard}>
      <View style={styles.userHeader}>
        <Image 
          source={{ 
            uri: user.profilePicture || 'https://via.placeholder.com/150x150?text=User' 
          }} 
          style={styles.userImage} 
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          {user.major && (
            <Text style={styles.userMajor}>{user.major}</Text>
          )}
          <Text style={styles.userClass}>{user.classYear}</Text>
          {user.bio && (
            <Text style={styles.userBio} numberOfLines={2}>
              {user.bio}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.userInterests}>
        <Text style={styles.interestsLabel}>Interests:</Text>
        <View style={styles.interestTags}>
          {user.interests.slice(0, 3).map((interest: string, index: number) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestTagText}>{interest}</Text>
            </View>
          ))}
          {user.interests.length > 3 && (
            <Text style={styles.moreInterests}>+{user.interests.length - 3} more</Text>
          )}
        </View>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.pingButton]}
          onPress={() => handleSendPing(user.id)}
          disabled={sendPingMutation.isPending && selectedUserId === user.id}
        >
          {sendPingMutation.isPending && selectedUserId === user.id ? (
            <ActivityIndicator size="small" color={theme.white} />
          ) : (
            <>
              <Heart size={14} color={theme.white} />
              <Text style={styles.pingButtonText}>Ping</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.messageButton]}
          onPress={() => {
            // Navigate to chat or messaging
            Alert.alert('Message', `This would open a chat with ${user.name}`);
          }}
        >
          <MessageCircle size={14} color={theme.primary} />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load users</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>People interested in {interestName}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={theme.gray500} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, major, or class..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.gray400}
          />
        </View>
      </View>

      {/* Content */}
      {isPending && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Finding people...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={isPending && page === 1} 
              onRefresh={() => {
                setPage(1);
                refetch();
              }} 
            />
          }
        >
          <View style={styles.contentContainer}>
            <Text style={styles.resultsCount}>
              {pagination?.totalCount || filteredUsers.length} {(pagination?.totalCount || filteredUsers.length) === 1 ? 'person' : 'people'} found
            </Text>

            {filteredUsers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>👥</Text>
                <Text style={styles.emptyStateTitle}>No people found</Text>
                <Text style={styles.emptyStateSubtitle}>
                  {searchQuery 
                    ? 'Try adjusting your search query' 
                    : `No one is interested in ${interestName} yet`
                  }
                </Text>
              </View>
            ) : (
              <>
                {filteredUsers.map(renderUserCard)}
                
                {/* Load More Button */}
                {pagination?.hasNext && (
                  <TouchableOpacity
                    style={[styles.loadMoreButton, isPending && styles.disabledButton]}
                    onPress={handleLoadMore}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <ActivityIndicator size="small" color={theme.primary} />
                    ) : (
                      <Text style={styles.loadMoreText}>Load More</Text>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </ScrollView>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.white,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.gray50,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: theme.textPrimary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  resultsCount: {
    fontSize: 15,
    color: theme.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  userCard: {
    backgroundColor: theme.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  userMajor: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  userClass: {
    fontSize: 12,
    color: theme.gray500,
    marginBottom: 4,
  },
  userBio: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  userInterests: {
    marginBottom: 12,
  },
  interestsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 6,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  interestTag: {
    backgroundColor: theme.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  interestTagText: {
    fontSize: 11,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  moreInterests: {
    fontSize: 11,
    color: theme.gray500,
    fontStyle: 'italic',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  pingButton: {
    backgroundColor: theme.primary,
  },
  pingButtonText: {
    color: theme.white,
    fontWeight: '600',
    fontSize: 13,
  },
  messageButton: {
    backgroundColor: theme.gray100,
    borderWidth: 1,
    borderColor: theme.border,
  },
  messageButtonText: {
    color: theme.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  loadMoreButton: {
    backgroundColor