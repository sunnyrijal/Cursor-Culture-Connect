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
  Pressable,
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
  SlidersHorizontal,
} from 'lucide-react-native';
import { CreateActivityModal } from '@/components/AddActivityModal';
import { router } from 'expo-router';
import { CreateInterestPreferenceModal } from '@/components/CreateUserPreferenceModal';
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import {
  getUserPings,
  updateInterestPing,
  pingBack,
  unsendInterestPing,
  User,
  InterestPing,
} from '@/contexts/interest.api';
import {
  getActivities,
  getUsersByActivity,
  sendActivityPing,
} from '@/contexts/activity.api';
import { Activity } from '@/types/activity';
import MyPreferencesModal from '@/components/MyPreferenceModal';

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

type TabType = 'activities' | 'pings';

export default function ActivityBuddyPage() {
  const [activeTab, setActiveTab] = useState<TabType>('activities');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<string | null>(
    'all'
  );
  const [refreshing, setRefreshing] = useState(false);
  const [showPingModal, setShowPingModal] = useState(false);
  const [pingTarget, setPingTarget] = useState<{
    receiverId: string;
    activityId: string;
    originalPingId?: string;
    activityName: string;
    userName: string;
  } | null>(null);
  const [pingMessage, setPingMessage] = useState('');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(
    {}
  );

  const queryClient = useQueryClient();
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);
  const [isPreferenceModalVisible, setIsPreferenceModalVisible] =
    useState(false);
  const [isMyPreferenceVisible, setIsMyPreferenceVisible] = useState(false);

  const [editingActivity, setEditingActivity] = useState(null);

  const [showActivitySelectionModal, setShowActivitySelectionModal] =
    useState(false);
  const [selectedPingActivityId, setSelectedPingActivityId] = useState<
    string | null
  >(null);

  // Query for activities
  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => getActivities(),
  });

  // Query for users by activity using infinite query for pagination
  const {
    data: usersPages,
    fetchNextPage,
    hasNextPage,
    isLoading: usersLoading,
    isFetchingNextPage,
    refetch: refetchUsers,
  } = useInfiniteQuery({
    queryKey: ['usersByActivity', selectedActivity],
    queryFn: ({ pageParam = 1 }) => {
      const activityToFetch =
        selectedActivity === 'all' ? 'all' : selectedActivity;
      return getUsersByActivity(activityToFetch!, pageParam);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.data.pagination.hasNext) {
        return lastPage.data.pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!selectedActivity,
  });
  console.log(usersPages)

  // Query for user pings
  const { data: pingsData, isLoading: pingsLoading } = useQuery({
    queryKey: ['userPings'],
    queryFn: () => getUserPings('all'),
    enabled: activeTab === 'pings',
  });

  // Send ping mutation
  const sendPingMutation = useMutation({
    mutationFn: sendActivityPing,
    onSuccess: () => {
      Alert.alert('Success', 'Activity ping sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['userPings'] });
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error?.response.data.message || 'Failed to send ping. Please try again.'
      );
      console.error('Send ping error:', error);
    },
  });

  const pingBackMutation = useMutation({
    mutationFn: pingBack,
    onSuccess: () => {
      Alert.alert('Success', 'Ping back sent!');
      queryClient.invalidateQueries({ queryKey: ['userPings'] });
      setShowPingModal(false);
      setPingMessage('');
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to send ping back.'
      );
    },
  });

  // Update ping mutation
  const updatePingMutation = useMutation({
    mutationFn: ({ pingId, updateData }: { pingId: string; updateData: any }) =>
      updateInterestPing(pingId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPings'] });
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

  // Unsend ping mutation
  const unsendPingMutation = useMutation({
    mutationFn: unsendInterestPing,
    onSuccess: () => {
      Alert.alert('Success', 'Ping unsent successfully!');
      queryClient.invalidateQueries({ queryKey: ['userPings'] });
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to unsend ping.'
      );
      console.error('Unsend ping error:', error);
    },
  });


  const activities = activitiesData?.data || [];
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
    if (activeTab === 'activities') {
      await refetchUsers();
    } else {
      await queryClient.invalidateQueries({ queryKey: ['userPings'] });
    }
    setRefreshing(false);
  };

  const toggleActivities = (userId: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleSendPing = (
    receiverId: string,
    activityId: string,
    originalPingId: string,
    activityName: string,
    userName: string
  ) => {
    if (selectedActivity === 'all') {
      // Show activity selection modal
      setPingTarget({ receiverId, activityId, activityName, userName });
      setShowActivitySelectionModal(true);
    } else {
      // Direct ping with selected activity
      setPingTarget({
        receiverId,
        activityId,
        originalPingId,
        activityName,
        userName,
      });
      setPingMessage(
        `Hi! I'd love to connect over our shared activity in ${activityName}!`
      );
      setShowPingModal(true);
    }
  };

  const handlePingBack = (ping: InterestPing, type: 'sent' | 'received') => {
    const targetUser = type === 'sent' ? ping.receiver : ping.sender;
    setPingTarget({
      receiverId: targetUser.id,
      activityId: ping.activity?.id || ping.interest?.id,
      originalPingId: ping.id,
      activityName: ping.activity?.name || ping.interest?.name,
      userName: targetUser.name,
    });
    setShowPingModal(true);
  };

  const handleActivitySelection = (
    activityId: string,
    activityName: string
  ) => {
    if (pingTarget) {
      setPingTarget({
        ...pingTarget,
        activityId,
        activityName,
      });
      setPingMessage(
        `Hi! I'd love to connect over our shared activity in ${activityName}!`
      );
    }
    setShowActivitySelectionModal(false);
    setShowPingModal(true);
  };

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

  const renderUserCard = (user: any) => {
    const isExpanded = expandedCards[user.id];
    const preferencesToShow = isExpanded
      ? user.activityPreferences
      : user.activityPreferences?.slice(0, 2) || [];

    // Get the activity ID for pinging - if 'all' is selected, use 'all'
    const activityId = selectedActivity === 'all' ? 'all' : selectedActivity;
    const activityName =
      selectedActivity === 'all'
        ? 'all'
        : activities.find(
            (activity: Activity) => activity.id === selectedActivity
          )?.name || selectedActivity;

    const getSkillLevelColor = (level: string) => {
      switch (level) {
        case 'Beginner':
          return '#4CAF50';
        case 'Intermediate':
          return '#FF9800';
        case 'Advanced':
          return '#F44336';
        default:
          return '#757575';
      }
    };

    return (
      <View key={user.id} style={styles.userCard}>
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
            <Text style={styles.userYear}>{user.classYear}</Text>
            {user.bio && (
              <Text style={styles.userBio} numberOfLines={2}>
                {user.bio}
              </Text>
            )}
          </View>
        </View>

        {/* Activity Preferences Section */}
        {user.activityPreferences && user.activityPreferences.length > 0 && (
          <View style={styles.activitiesSection}>
            <Text style={styles.sectionTitle}>Activities</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.activitiesScrollView}
              contentContainerStyle={styles.activitiesContainer}
            >
              {preferencesToShow.map((preference: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.activityPreferenceCard,
                    (user.activityPreferences?.length || 0) > 1
                      ? { width: 250 }
                      : { width: 300 },
                  ]}
                >
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityName}>
                      {preference.activity.name}
                    </Text>
                    <View
                      style={[
                        styles.skillBadge,
                        {
                          backgroundColor: getSkillLevelColor(
                            preference.skillLevel
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.skillBadgeText}>
                        {preference.skillLevel}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.preferenceDetails}>
                    <View style={styles.preferenceRow}>
                      {preference.hasEquipment ? (
                        <View style={styles.preferenceTag}>
                          <Text style={styles.preferenceTagText}>
                            Has Equipment
                          </Text>
                        </View>
                      ) : (
                        <View style={[styles.preferenceTag, styles.needsTag]}>
                          <Text style={styles.needsTagText}>
                            Needs: {preference.equipmentNeeded || 'Equipment'}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.preferenceRow}>
                      {preference.hasTransport ? (
                        <View style={styles.preferenceTag}>
                          <Text style={styles.preferenceTagText}>
                            Has Transport
                          </Text>
                        </View>
                      ) : (
                        <View style={[styles.preferenceTag, styles.needsTag]}>
                          <Text style={styles.needsTagText}>
                            Transport: {preference.transportDetails || 'Needed'}
                          </Text>
                        </View>
                      )}
                    </View>

                    {preference.additionalNotes && (
                      <View style={styles.additionalNotesContainer}>
                        <Text style={styles.additionalNotesLabel}>Note:</Text>
                        <Text style={styles.additionalNotesText}>
                          {preference.additionalNotes}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}

              {!isExpanded && (user?.activityPreferences?.length || 0) > 2 && (
                <TouchableOpacity
                  onPress={() => toggleActivities(user.id)}
                  style={styles.expandButton}
                >
                  <Text style={styles.expandButtonText}>
                    +{(user?.activityPreferences?.length || 0) - 2} more
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            {isExpanded && (user?.activityPreferences?.length || 0) > 2 && (
              <TouchableOpacity
                onPress={() => toggleActivities(user.id)}
                style={styles.collapseButton}
              >
                <Text style={styles.collapseButtonText}>Show less</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.pingButton}
          onPress={() =>
            handleSendPing(user.id, activityId!, '', activityName!, user.name)
          }
          disabled={sendPingMutation.isPending}
        >
          <Send size={14} color={theme.white} />
          <Text style={styles.pingButtonText}>
            {sendPingMutation.isPending ? 'Sending...' : 'Send Ping'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderActivitySelectionModal = () => (
    <Modal
      visible={showActivitySelectionModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowActivitySelectionModal(false)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            Select Activity for {pingTarget?.userName}
          </Text>
          <ScrollView style={{ maxHeight: 300, width: '100%' }}>
            {activities.map((activity: Activity) => (
              <TouchableOpacity
                key={activity.id}
                style={styles.activitySelectButton}
                onPress={() =>
                  handleActivitySelection(activity.id, activity.name)
                }
              >
                <Text style={styles.activitySelectText}>{activity.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Pressable
            style={{
              paddingHorizontal: 24,
              paddingVertical: 12,
              backgroundColor: theme.primary,
              marginTop: 12,
              borderRadius: 12,
            }}
            onPress={() => setShowActivitySelectionModal(false)}
          >
            <Text style={[styles.textStyle, { color: 'white' }]}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

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
          <Text style={styles.pingActivity}>
            {ping.activity?.name || ping.interest?.name}
          </Text>
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
      <View style={styles.pingActions}>
        {type === 'received' && ping.status === 'pending' && (
          <>
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
          </>
        )}
        {type === 'sent' && ping.status === 'pending' && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.declineButton,
              unsendPingMutation.isPending && styles.disabledButton,
            ]}
            onPress={() =>
              Alert.alert(
                'Unsend Ping',
                'Are you sure you want to unsend this ping?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Unsend', style: 'destructive', onPress: () => unsendPingMutation.mutate(ping.id) },
                ]
              )
            }
            disabled={unsendPingMutation.isPending}>
            <Text style={styles.declineButtonText}>{unsendPingMutation.isPending && pingTarget?.originalPingId === ping.id ? 'Unsending...' : 'Unsend'}</Text>
          </TouchableOpacity>
        )}
        {type === 'received' && ping.status !== 'declined' && !ping.pingedBack && (
          <TouchableOpacity
            style={[styles.actionButton, styles.pingBackButton]}
            onPress={() => handlePingBack(ping, type)}
            disabled={pingBackMutation.isPending}
          >
            <Text style={styles.pingBackButtonText}>
              {pingBackMutation.isPending &&
              pingTarget?.originalPingId === ping.id
                ? 'Pinging...'
                : 'Ping Back'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
                  if (pingTarget.originalPingId) {
                    // This is a ping back
                    pingBackMutation.mutate({
                      originalPingId: pingTarget.originalPingId,
                      message: pingMessage.trim() || undefined,
                    });
                  } else {
                    // This is a new ping
                    sendPingMutation.mutate({
                      receiverId: pingTarget.receiverId,
                      activityId:
                        pingTarget.activityId === 'all'
                          ? selectedPingActivityId || pingTarget.activityId
                          : pingTarget.activityId,
                      message: pingMessage.trim() || undefined,
                    });
                  }
                }
                setShowPingModal(false);
              }}
              disabled={
                sendPingMutation.isPending || pingBackMutation.isPending
              }
            >
              <Text style={styles.textStyle}>
                {pingTarget?.originalPingId
                  ? pingBackMutation.isPending
                    ? 'Pinging Back...'
                    : 'Send Ping Back'
                  : sendPingMutation.isPending
                  ? 'Sending...'
                  : 'Send Ping'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderActivitiesTab = () => (
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

      {/* Activity Categories */}
      <View style={styles.categoryFilter}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedActivity === 'all' && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedActivity('all')}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryChipIcon}>🎯</Text>
            <Text
              style={[
                styles.categoryChipText,
                selectedActivity === 'all' && styles.categoryChipTextActive,
              ]}
            >
              All Activities
            </Text>
          </TouchableOpacity>

          {activitiesLoading ? (
            <Text style={styles.loadingChip}>Loading Activities...</Text>
          ) : (
            activities.map((activity: Activity) => (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.categoryChip,
                  selectedActivity === activity.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedActivity(activity.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedActivity === activity.id &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {activity.name}
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
        ) : selectedActivity ? (
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
                  No one has shown activity in{' '}
                  {selectedActivity === 'all'
                    ? 'any activities'
                    : activities.find(
                        (activity: Activity) => activity.id === selectedActivity
                      )?.name || selectedActivity}{' '}
                  yet
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
          // Show message to select an activity
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎯</Text>
            <Text style={styles.emptyStateTitle}>Select an Activity</Text>
            <Text style={styles.emptyStateSubtitle}>
              Choose an activity above to find people who share your interests
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
          <Text style={styles.headerTitle}>Activity Buddy</Text>
          <TouchableOpacity
            style={styles.addActivityButton}
            onPress={() => setIsMyPreferenceVisible(true)}
          >
            <SlidersHorizontal size={16} color={theme.white} />
            <Text style={styles.addActivityButtonText}>My Preferences</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'activities' && styles.tabActive]}
            onPress={() => setActiveTab('activities')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'activities' && styles.tabTextActive,
              ]}
            >
              Activities
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

      {activeTab === 'activities' ? renderActivitiesTab() : renderPingsTab()}
      {renderSendPingModal()}
      {renderActivitySelectionModal()}

      <CreateInterestPreferenceModal
        visible={isPreferenceModalVisible}
        onClose={() => setIsPreferenceModalVisible(false)}
      />
      <CreateActivityModal
        visible={isActivityModalVisible}
        onClose={() => setIsActivityModalVisible(false)}
        editingActivity={editingActivity}
      />

      {/* Floating Action Button to Add Preference */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsPreferenceModalVisible(true)}
      >
        <Plus size={24} color={theme.white} />
      </TouchableOpacity>
      <MyPreferencesModal
        visible={isMyPreferenceVisible}
        onClose={() => setIsMyPreferenceVisible(false)}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
    addActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addActivityButtonText: {
    marginLeft: 6,
    color: theme.white,
    fontWeight: '600',
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    right:20,
    bottom:16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3d40ebff",
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  activitySelectButton: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    width: '100%',
  },
  activitySelectText: {
    fontSize: 16,
    color: theme.textPrimary,
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userMajor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userYear: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  activitiesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  activitiesContainer: {
    gap: 12,
  },
  activitiesScrollView: {
    marginBottom: 8,
  },
  activityPreferenceCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.primary,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  skillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  skillBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  preferenceDetails: {
    gap: 6,
  },
  preferenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  preferenceTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  preferenceTagText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  needsTag: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  needsTagText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '500',
  },
  expandButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  expandButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  collapseButton: {
    alignItems: 'center',
    padding: 8,
  },
  collapseButtonText: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '500',
  },
  additionalNotesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  additionalNotesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  additionalNotesText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  pingButton: {
    backgroundColor: theme.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  pingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  //others

  // addActivityButtonText: {
  //   marginLeft: 6,
  //   color: theme.primary,
  //   fontWeight: '600',
  //   fontSize: 13,
  // },
  userActivities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  activityChip: {
    backgroundColor: theme.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  activityChipText: {
    fontSize: 11,
    color: theme.textSecondary,
    fontWeight: '500',
  },
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
  // addActivityButton: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   backgroundColor: theme.gray50,
  //   paddingHorizontal: 12,
  //   paddingVertical: 8,
  //   borderWidth: 1,
  //   borderColor: theme.border,
  // },
  addInterestButtonText: {
    marginLeft: 6,
    color: theme.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  filterTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  filterTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  filterTypeButtonActive: {
    backgroundColor: theme.primary + '20',
  },
  filterTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  filterTypeButtonTextActive: {
    color: theme.primary,
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
    paddingHorizontal: 8,
    paddingVertical: 12,
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

  moreActivities: {
    fontSize: 11,
    color: theme.primary,
    fontWeight: '600',
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
  pingActivity: {
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
    gap: 8,
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
  pingBackButton: {
    backgroundColor: theme.accent,
  },
  pingBackButtonText: {
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
