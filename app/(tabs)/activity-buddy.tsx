// project/app/(tabs)/activity-buddy.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Filter,
  MapPin,
  Users,
  Plus,
  MessageCircle,
  Phone,
  Star,
  Package,
  Car,
  Send,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { router } from 'expo-router';
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import {
  getInterests,
  getUsersByInterest,
  sendInterestPing,
  getUserPings,
  updateInterestPing,
  Interest,
  User,
  InterestPing,
} from '@/contexts/interest.api';

const theme = {
  primary: '#6366F1',
  accent: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
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

type TabType = 'interests' | 'pings';

export default function ActivityBuddyPage() {
  const [activeTab, setActiveTab] = useState<TabType>('interests');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterest, setSelectedInterest] = useState<string | null>(
    'All Activities'
  );
  const [refreshing, setRefreshing] = useState(false);
  const [showPingModal, setShowPingModal] = useState(false);
  const [pingTarget, setPingTarget] = useState<{
    receiverId: string;
    interestName: string;
    userName: string;
  } | null>(null);
  const [pingMessage, setPingMessage] = useState('');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  // Query for interests
  const { data: interestsData, isLoading: interestsLoading } = useQuery({
    queryKey: ['interests'],
    queryFn: getInterests,
  });

  // Query for users by interest using infinite query for pagination
  const {
    data: usersPages,
    fetchNextPage,
    hasNextPage,
    isLoading: usersLoading,
    isFetchingNextPage,
    refetch: refetchUsers,
  } = useInfiniteQuery({
    queryKey: ['usersByInterest', selectedInterest],
    queryFn: ({ pageParam = 1 }) => {
      const interestToFetch =
        selectedInterest === 'All Activities' ? 'all' : selectedInterest;
      return getUsersByInterest(interestToFetch!, pageParam);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.data.pagination.hasNext) {
        return lastPage.data.pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!selectedInterest,
  });

  // Query for user pings
  const { data: pingsData, isLoading: pingsLoading } = useQuery({
    queryKey: ['userPings'],
    queryFn: () => getUserPings('all'),
    enabled: activeTab === 'pings',
  });

  // Send ping mutation
  const sendPingMutation = useMutation({
    mutationFn: sendInterestPing,
    onSuccess: () => {
      Alert.alert('Success', 'Interest ping sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['userPings'] });
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to send ping. Please try again.');
      console.error('Send ping error:', error);
    },
  });

  // Update ping mutation
  const updatePingMutation = useMutation({
    mutationFn: ({ pingId, updateData }: { pingId: string; updateData: any }) =>
      updateInterestPing(pingId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPings'] });
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to update ping. Please try again.');
      console.error('Update ping error:', error);
    },
  });

  const interests = interestsData?.data || [];
  const users = usersPages?.pages.flatMap((page) => page.data.users) || [];
  const pings = pingsData?.data || { sent: [], received: [] };

  const filteredUsers = users.filter(
    (user: User) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.major &&
        user.major.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setExpandedCards({});
    if (activeTab === 'interests') {
      await refetchUsers();
      
    } else {
      await queryClient.invalidateQueries({ queryKey: ['userPings'] });
    }
    setRefreshing(false);
  };

  const toggleInterests = (userId: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleSendPing = (
    receiverId: string,
    interestName: string,
    userName: string
  ) => {
    setPingTarget({ receiverId, interestName, userName });
    setPingMessage(
      `Hi! I'd love to connect over our shared interest in ${interestName}!`
    );
    setShowPingModal(true);
  };

  const handlePingResponse = (
    pingId: string,
    status: 'accepted' | 'declined'
  ) => {
    if (status === 'accepted') {
      Alert.prompt(
        'Accept Ping',
        'Add a response message (optional):',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Accept',
            onPress: (response) => {
              updatePingMutation.mutate({
                pingId,
                updateData: { status, response: response || undefined },
              });
            },
          },
        ],
        'plain-text',
        "Great! I'd love to connect over this interest!"
      );
    } else {
      updatePingMutation.mutate({
        pingId,
        updateData: { status },
      });
    }
  };
  const renderUserCard = (user: User) => {
    const isExpanded = expandedCards[user.id];
    const interestsToShow = isExpanded ? user.interests : user.interests.slice(0, 3);

    return (<View key={user.id} style={styles.userCard}>
      <View style={styles.userHeader}>
        <Image
          source={
            user.profilePicture
              ? { uri: user.profilePicture }
              : require('../../assets/user.png')
          }
          style={styles.userImage}
          defaultSource={require('../../assets/user.png')}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          {user.major && <Text style={styles.userMajor}>{user.major}</Text>}
          <Text style={styles.userYear}>Class of {user.classYear}</Text>
          {user.bio && (
            <Text style={styles.userBio} numberOfLines={2}>
              {user.bio}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.userInterests}>
        {interestsToShow.map((interest, index) => (
          <View key={index} style={styles.interestChip}>
            <Text style={styles.interestChipText}>{interest}</Text>
          </View>
        ))}
        {!isExpanded && user.interests.length > 3 && (
          <TouchableOpacity onPress={() => toggleInterests(user.id)} style={styles.interestChip}>
            <Text style={styles.moreInterests}>
              +{user.interests.length - 3} more
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.pingButton}
        onPress={() => handleSendPing(user.id, selectedInterest!, user.name)}
        disabled={sendPingMutation.isPending}
      >
        <Send size={14} color={theme.white} />
        <Text style={styles.pingButtonText}>
          {sendPingMutation.isPending ? 'Sending...' : 'Send Ping'}
        </Text>
      </TouchableOpacity>
    </View>)
  };

  const renderPingCard = (ping: InterestPing, type: 'sent' | 'received') => (
    <View key={ping.id} style={styles.pingCard}>
      <View style={styles.pingHeader}>
        <Image
          source={
            type === 'sent'
              ? ping.receiver.profilePicture
                ? { uri: ping.receiver.profilePicture }
                : require('../../assets/user.png')
              : ping.sender.profilePicture
              ? { uri: ping.sender.profilePicture }
              : require('../../assets/user.png')
          }
          style={styles.pingUserImage}
          defaultSource={require('../../assets/user.png')}
        />

        <View style={styles.pingInfo}>
          <Text style={styles.pingUserName}>
            {type === 'sent' ? ping.receiver.name : ping.sender.name}
          </Text>
          <Text style={styles.pingInterest}>{ping.interest.name}</Text>
          <Text style={styles.pingDate}>
            {new Date(ping.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.pingStatus}>
          {ping.status === 'pending' && (
            <View style={[styles.statusBadge, styles.statusPending]}>
              <Clock size={12} color={theme.warning} />
              <Text style={styles.statusText}>Pending</Text>
            </View>
          )}
          {ping.status === 'accepted' && (
            <View style={[styles.statusBadge, styles.statusAccepted]}>
              <CheckCircle size={12} color={theme.success} />
              <Text style={styles.statusText}>Accepted</Text>
            </View>
          )}
          {ping.status === 'declined' && (
            <View style={[styles.statusBadge, styles.statusDeclined]}>
              <XCircle size={12} color={theme.gray500} />
              <Text style={styles.statusText}>Declined</Text>
            </View>
          )}
        </View>
      </View>

      {ping.message && <Text style={styles.pingMessage}>"{ping.message}"</Text>}

      {ping.response && (
        <Text style={styles.pingResponse}>Response: "{ping.response}"</Text>
      )}

      {type === 'received' && ping.status === 'pending' && (
        <View style={styles.pingActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => handlePingResponse(ping.id, 'declined')}
            disabled={updatePingMutation.isPending}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handlePingResponse(ping.id, 'accepted')}
            disabled={updatePingMutation.isPending}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderSendPingModal = () => (
    <Modal
      visible={showPingModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowPingModal(false)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            Send Ping to {pingTarget?.userName}
          </Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Add an optional message..."
            placeholderTextColor={theme.gray400}
            value={pingMessage}
            onChangeText={setPingMessage}
            multiline
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setShowPingModal(false)}
            >
              <Text style={[styles.textStyle, { color: theme.textPrimary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSend]}
              onPress={() => {
                if (pingTarget) {
                  sendPingMutation.mutate({
                    receiverId: pingTarget.receiverId,
                    interestName: pingTarget.interestName,
                    message: pingMessage.trim() || undefined,
                  });
                }
                setShowPingModal(false);
              }}
              disabled={sendPingMutation.isPending}
            >
              <Text style={styles.textStyle}>
                {sendPingMutation.isPending ? 'Sending...' : 'Send Ping'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderInterestsTab = () => (
    <View style={styles.tabContent}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={theme.gray500} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, university, or location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.gray400}
          />
        </View>
      </View>

      {/* Interest Categories */}
      <View style={styles.categoryFilter}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedInterest === 'All Activities' &&
                styles.categoryChipActive,
            ]}
            onPress={() => setSelectedInterest('All Activities')}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryChipIcon}>🎯</Text>
            <Text
              style={[
                styles.categoryChipText,
                selectedInterest === 'All Activities' &&
                  styles.categoryChipTextActive,
              ]}
            >
              All Activities
            </Text>
          </TouchableOpacity>
          {interestsLoading ? (
            <Text style={styles.loadingChip}>Loading...</Text>
          ) : (
            interests.map((interest: Interest) => (
              <TouchableOpacity
                key={interest.id}
                style={[
                  styles.categoryChip,
                  selectedInterest === interest.name &&
                    styles.categoryChipActive,
                ]}
                onPress={() => setSelectedInterest(interest.name)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryChipIcon}>⚡</Text>
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedInterest === interest.name &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {interest.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Results */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.contentContainer}
      >
        
        {usersLoading && !usersPages?.pages.length ? (
          <Text style={styles.loadingText}>Loading users...</Text>
        ) : selectedInterest ? (
          <>
            <Text style={styles.resultsCount}>
              {usersPages?.pages[0]?.data.pagination.totalCount ||
                filteredUsers.length}{' '}
              {(usersPages?.pages[0]?.data.pagination.totalCount ||
                filteredUsers.length) === 1
                ? 'person'
                : 'people'}{' '}
              found
            </Text>
            {filteredUsers.length === 0 && !usersLoading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🔍</Text>
                <Text style={styles.emptyStateTitle}>No people found</Text>
                <Text style={styles.emptyStateSubtitle}>
                  No one has shown interest in {selectedInterest} yet
                </Text>
              </View>
            ) : (
              <>
                {filteredUsers.map(renderUserCard)}
                {hasNextPage && (
                  <TouchableOpacity
                    style={[
                      styles.loadMoreButton,
                      isFetchingNextPage && styles.disabledButton,
                    ]}
                    onPress={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? (
                      <ActivityIndicator size="small" color={theme.primary} />
                    ) : (
                      <Text style={styles.loadMoreButtonText}>Load More</Text>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}
          </>
        ) : (
          // Show message to select an interest
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎯</Text>
            <Text style={styles.emptyStateTitle}>Select an Interest</Text>
            <Text style={styles.emptyStateSubtitle}>
              Choose an interest above to find people who share your passion
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderPingsTab = () => (
    <View style={styles.tabContent}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.contentContainer}>
          {/* Received Pings */}
          <Text style={styles.sectionTitle}>
            Received Pings ({pings.received?.length || 0})
          </Text>
          {pingsLoading ? (
            <Text style={styles.loadingText}>Loading pings...</Text>
          ) : pings.received?.length === 0 ? (
            <Text style={styles.emptyText}>No received pings</Text>
          ) : (
            pings.received?.map((ping: InterestPing) =>
              renderPingCard(ping, 'received')
            )
          )}

          {/* Sent Pings */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Sent Pings ({pings.sent?.length || 0})
          </Text>
          {pings.sent?.length === 0 ? (
            <Text style={styles.emptyText}>No sent pings</Text>
          ) : (
            pings.sent?.map((ping: InterestPing) =>
              renderPingCard(ping, 'sent')
            )
          )}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Interest Buddy</Text>
          <TouchableOpacity
            style={styles.addInterestButton}
            onPress={() => router.push('/profile/edit')}
          >
            <Plus size={16} color={theme.primary} />
            <Text style={styles.addInterestButtonText}>Add Interest</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'interests' && styles.tabActive]}
            onPress={() => setActiveTab('interests')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'interests' && styles.tabTextActive,
              ]}
            >
              Interests
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pings' && styles.tabActive]}
            onPress={() => setActiveTab('pings')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'pings' && styles.tabTextActive,
              ]}
            >
              Pings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'interests' ? renderInterestsTab() : renderPingsTab()}

      {renderSendPingModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.white,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  addInterestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.gray50,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  addInterestButtonText: {
    marginLeft: 6,
    color: theme.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: theme.gray50,
    borderRadius: 8,
    padding: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 7,
      },
    }),
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: theme.primary,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  tabTextActive: {
    color: theme.white,
    fontWeight: '600',
  },
  tabContent: {
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
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.border,
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: theme.textPrimary,
  },
  backButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  categoryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  categoryScrollContent: {
    paddingRight: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.gray50,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.border,
    minHeight: 36,
  },
  categoryChipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  categoryChipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 13,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: theme.white,
  },
  loadingChip: {
    fontSize: 13,
    color: theme.textSecondary,
    alignSelf: 'center',
    marginLeft: 10,
  },
  resultsCount: {
    fontSize: 15,
    color: theme.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // User Card Styles
  userCard: {
    backgroundColor: theme.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 1,
  },
  userYear: {
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  interestChip: {
    backgroundColor: theme.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  interestChipText: {
    fontSize: 11,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  moreInterests: {
    fontSize: 11,
    color: theme.primary,
    fontWeight: '600',
  },
  pingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
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
  pingButtonText: {
    fontSize: 13,
    color: theme.white,
    fontWeight: '600',
    marginLeft: 6,
  },
  // Ping Card Styles
  pingCard: {
    backgroundColor: theme.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  pingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pingUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  pingInfo: {
    flex: 1,
  },
  pingUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  pingInterest: {
    fontSize: 13,
    color: theme.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  pingDate: {
    fontSize: 11,
    color: theme.gray500,
  },
  pingStatus: {
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusAccepted: {
    backgroundColor: '#D1FAE5',
  },
  statusDeclined: {
    backgroundColor: theme.gray100,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
    color: theme.textPrimary,
  },
  pingMessage: {
    fontSize: 13,
    color: theme.textSecondary,
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 18,
  },
  pingResponse: {
    fontSize: 13,
    color: theme.success,
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 18,
  },
  pingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  declineButton: {
    backgroundColor: theme.gray100,
  },
  acceptButton: {
    backgroundColor: theme.success,
  },
  declineButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  acceptButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.white,
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
    justifyContent: 'space-around',
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
    backgroundColor: theme.gray100,
  },
  buttonSend: {
    backgroundColor: theme.primary,
  },
  textStyle: {
    color: theme.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadMoreButton: {
    backgroundColor: theme.gray50,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.border,
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  loadMoreButtonText: {
    color: theme.primary,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
