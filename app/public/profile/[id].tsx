'use client';

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  MapPin,
  GraduationCap,
  CheckCircle,
  Globe,
  Users,
  Heart,
  MessageCircle,
  UserPlus,
  UserCheck,
  UserX,
  AlertCircle,
  RefreshCw,
  Briefcase,
  Calendar,
  Clock,
  User,
} from 'lucide-react-native';
import { getUserById } from '@/contexts/user.api';
import {
  sendFriendRequest,
  respondToFriendRequest,
  cancelFriendRequest,
  removeFriend,
} from '@/contexts/friend.api';
import SocialMediaLinks from '@/components/SocialMediaLinks';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const theme = {
  white: 'white',
  background: '#F0F0F3',
  cardBackground: '#F0F0F3',
  shadowLight: '#FFFFFF',
  shadowDark: '#D1D9E6',
  primary: '#667eea',
  accent: '#764ba2',
  success: '#48BB78',
  error: '#ff6b6b',
  warning: '#feca57',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
};

const FriendshipStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  BLOCKED: 'BLOCKED',
};

const EventCard = ({ event, onPress }: { event: any; onPress: (id: string) => void }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Card style={styles.eventCard}>
      <TouchableOpacity onPress={() => onPress(event.id)} activeOpacity={0.8}>
        <View style={styles.eventCardHeader}>
          <Image
            source={event.imageUrl ? { uri: event.imageUrl } : require('../../../assets/logo.png')}
            style={styles.eventCardImage}
            defaultSource={require('../../../assets/logo.png')}
          />
          <View style={styles.eventCardInfo}>
            <Text style={styles.eventCardTitle} numberOfLines={2}>{event.name}</Text>
            <View style={styles.eventCardMeta}>
              <Calendar size={12} color={theme.textSecondary} />
              <Text style={styles.eventCardMetaText}>{formatDate(event.date)}</Text>
            </View>
            <View style={styles.eventCardMeta}>
              <MapPin size={12} color={theme.textSecondary} />
              <Text style={styles.eventCardMetaText} numberOfLines={1}>{event.location}</Text>
            </View>
            {event.eventTimes && event.eventTimes.length > 0 && (
              <View style={styles.eventCardMeta}>
                <Clock size={12} color={theme.textSecondary} />
                <Text style={styles.eventCardMetaText}>
                  {formatTime(event.eventTimes[0].startTime)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const GroupCard = ({ group, onPress }: { group: any; onPress: (id: string) => void }) => {
  console.log(group)
  return (
    <Card style={styles.groupCard}>
      <TouchableOpacity onPress={() => onPress(group.id)} activeOpacity={0.8}>
        <View style={styles.groupHeader}>
          <Image
            source={group.imageUrl ? { uri: group.imageUrl } : require('../../../assets/logo.png')}
            style={styles.groupImage}
            defaultSource={require('../../../assets/logo.png')}
          />
          <View style={styles.groupInfo}>
            <Text style={styles.groupName} numberOfLines={2}>{group.name}</Text>
            <View style={styles.groupMeta}>
              <Users size={12} color={theme.textSecondary} />
              <Text style={styles.groupMetaText}>{group?._count?.members || 0} members</Text>
            </View>
            {group.meetingLocation && (
              <View style={styles.groupMeta}>
                <MapPin size={12} color={theme.textSecondary} />
                <Text style={styles.groupMetaText} numberOfLines={2}>{group.meetingLocation}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.groupBadges}>
          {group.isPrivate !== undefined && <Badge
            label={!group.isPrivate ? "Public" : "Private"}
            variant={!group.isPrivate ? "success" : "warning"}
            size="md"
          />}
        </View>
        {group.description && (
          <Text style={styles.groupDescription} numberOfLines={2}>
            {group.description}
          </Text>
        )}
      </TouchableOpacity>
    </Card>
  );
};

const FriendCard = ({ friend, onPress }: { friend: any; onPress: (id: string) => void }) => {
  return (
    <TouchableOpacity onPress={() => onPress(friend.id)} style={styles.friendCard}>
      <Image
        source={friend.profilePicture ? { uri: friend.profilePicture } : require('../../../assets/user.png')}
        style={styles.friendImage}
        defaultSource={require('../../../assets/user.png')}
      />
      <Text style={styles.friendName} numberOfLines={2}>
        {friend.firstName} {friend.lastName}
      </Text>
    </TouchableOpacity>
  );
};

export default function UserProfilePage() {
  const { id , sameuser} = useLocalSearchParams<{ id: string , sameuser?:string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');

  const {
    data: userResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userProfile', id],
    queryFn: () => getUserById(id as string),
    enabled: !!id,
  });

  const userData = userResponse?.data;

  console.log(userData)

  const sendRequestMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: (data, variables) => {
      setModalVisible(false);
      setMessage('');
      Alert.alert('Success', 'Friend request sent!');
      queryClient.invalidateQueries({ queryKey: ['userProfile', id] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'Failed to send friend request.');
    },
  });

  const respondRequestMutation = useMutation({
    mutationFn: respondToFriendRequest,
    onSuccess: (data, variables) => {
      Alert.alert('Success', `Request ${variables.action}ed.`);
      queryClient.invalidateQueries({ queryKey: ['userProfile', id] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });

    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'Failed to respond to request.');
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: cancelFriendRequest,
    onSuccess: () => {
      Alert.alert('Success', 'Friend request cancelled.');
      queryClient.invalidateQueries({ queryKey: ['userProfile', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
    onError: (err: any) => {
      Alert.alert(
        'Error',
        err.message || 'Failed to cancel friend request.'
      );
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: removeFriend,
    onSuccess: () => {
      Alert.alert('Success', 'Friend removed.');
      queryClient.invalidateQueries({ queryKey: ['userProfile', id] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'Failed to remove friend.');
    },
  });

  const handleSendRequest = () => {
    if (!userData?.id) return;
    setModalVisible(true);
  };

  const handleSendWithMessageHandler = () => {
    if (!userData?.id) return;
    sendRequestMutation.mutate({
      receiverId: userData.id,
      message: message.trim(),
    });
  };

  const handleRespondRequest = (action: 'accept' | 'decline') => {
    // NOTE: The public user profile endpoint needs to return the `friendshipId`
    // when a request is pending to make this action possible from this page.
    Alert.alert(
      'Action Unavailable',
      'Please respond to friend requests from the "Requests" tab.'
    );
  };

  const handleCancelRequest = (receiverId: string, userName: string) => {
    Alert.alert(
      'Cancel Request',
      `Are you sure you want to cancel the friend request to ${userName}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => cancelRequestMutation.mutate({ receiverId }),
        },
      ]
    );
  };

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

  const handleEventPress = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  const handleGroupPress = (groupId: string) => {
    router.push(`/group/${groupId}`);
  };

  const handleFriendPress = (friendId: string) => {
    router.push(`/public/profile/${friendId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getActionButtons = () => {
    if (!userData) return null;

    const { friendshipStatus, isFriendRequestSender, chatId } = userData;

    // Priority 1: If friendship is accepted, show Message button
    if (friendshipStatus === FriendshipStatus.ACCEPTED) {
      return (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionPrimaryButton}
            onPress={() => router.push(`/chat/${chatId}`)}
          >
            <MessageCircle size={20} color={theme.white} />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionDeclineButton}
            onPress={() => handleRemoveFriend(userData.id, userData.name)}
            disabled={removeFriendMutation.isPending}
          >
            <UserX size={20} color={theme.textPrimary} />
            <Text
              style={[styles.actionButtonText, { color: theme.textPrimary }]}
            >
              Remove
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Priority 2: Handle pending friendship requests
    if (friendshipStatus === FriendshipStatus.PENDING) {
      if (isFriendRequestSender) {
        return ( // I sent the request
          <TouchableOpacity
            style={[styles.actionPrimaryButton, styles.cancelButton]}
            onPress={() => handleCancelRequest(userData.id, userData.name)}
            disabled={cancelRequestMutation.isPending}
          >
            <UserX size={20} color={theme.white} />
            <Text style={styles.actionButtonText}>Cancel Request</Text>
          </TouchableOpacity>
        );
      } else {
        return ( // I received the request
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionAcceptButton}
              onPress={() => handleRespondRequest('accept')}
            >
              <UserCheck size={20} color={theme.white} />
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionDeclineButton}
              onPress={() => handleRespondRequest('decline')}
            >
              <UserX size={20} color={theme.textPrimary} />
              <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>
                Decline
              </Text>
            </TouchableOpacity>
          </View>
        );
      }
    }

    // Priority 3: If friendship is declined or blocked, show appropriate message
    if (friendshipStatus === FriendshipStatus.DECLINED) {
      return (
        <View style={[styles.actionPrimaryButton, styles.disabledButton]}>
          <UserX size={20} color={theme.white} />
          <Text style={styles.actionButtonText}>Request Declined</Text>
        </View>
      );
    }

    if (friendshipStatus === FriendshipStatus.BLOCKED) {
      return (
        <View style={[styles.actionPrimaryButton, styles.blockedButton]}>
          <AlertCircle size={20} color={theme.white} />
          <Text style={styles.actionButtonText}>User Blocked</Text>
        </View>
      );
    }

    // Priority 4: Default - Show Add Friend button
    return ( // No friendship status
      <TouchableOpacity
        style={styles.actionPrimaryButton}
        onPress={handleSendRequest}
        disabled={sendRequestMutation.isPending || sameuser === 'true'}
      >
        {sendRequestMutation.isPending ? (
          <ActivityIndicator color={theme.white} />
        ) : (
          <UserPlus size={20} color={theme.white} />
        )}
        <Text style={styles.actionButtonText}>Add Friend</Text>
      </TouchableOpacity>
    );
  };

  const LoadingScreen = () => (
    <View style={styles.centeredContainer}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={styles.loadingText}>Loading Profile...</Text>
    </View>
  );

  const ErrorScreen = () => (
    <View style={styles.centeredContainer}>
      <AlertCircle size={48} color={theme.error} />
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorMessage} numberOfLines={2}>
        {error?.message || 'Failed to load profile data'}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
        <RefreshCw size={20} color={theme.primary} />
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) return <LoadingScreen />;
  if (isError) return <ErrorScreen />;
  if (!userData) return <ErrorScreen />;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {userData.name}'s Profile
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
        >
          <View style={styles.profileSection}>
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
                    Send a friend request to {userData?.name}?
                  </Text>
                  <TextInput
                    style={styles.messageInput}
                    placeholder="Add an optional message..."
                    placeholderTextColor={theme.textMuted}
                    value={message}
                    onChangeText={setMessage}
                    multiline
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={() => setModalVisible(false)}>
                      <Text style={[styles.textStyle, { color: theme.textPrimary }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.buttonSend]} onPress={handleSendWithMessageHandler}>
                      <Text style={styles.textStyle}>Send</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
            <View style={styles.profileImageContainer}>
              <Image
                source={
                  userData.profilePicture
                    ? { uri: userData.profilePicture }
                    : require('../../../assets/user.png')
                }
                style={styles.profileImage}
                defaultSource={require('../../../assets/user.png')}
              />
              {userData.isVerified && (
                <View style={styles.verificationBadge}>
                  <CheckCircle size={20} color={theme.success} />
                </View>
              )}
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userData.name}</Text>
              {userData.pronouns && (
                <Text style={styles.userPronouns}>{userData.pronouns}</Text>
              )}
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userData.friendsCount || 0}</Text>
                <Text style={styles.statLabel}>Friends</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userData.groupsCount || 0}</Text>
                <Text style={styles.statLabel}>Groups</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userData.eventsCount || 0}</Text>
                <Text style={styles.statLabel}>Events</Text>
              </View>
            </View>

            <View style={styles.actionsContainer}>{getActionButtons()}</View>
          </View>

          {userData.socialMedia && (
            <SocialMediaLinks socialMedia={userData.socialMedia} />
          )}

          {userData.bio && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>About Me</Text>
              <View style={styles.infoCard}>
                <Text style={styles.bioText}>{userData.bio}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.infoCard}>
              {userData.university && (
                <View style={styles.infoItem}>
                  <GraduationCap size={18} color={theme.primary} />
                  <Text style={styles.infoValue}>
                    {userData.university.name}
                  </Text>
                </View>
              )}
              {userData.major && (
                <View style={styles.infoItem}>
                  <Briefcase size={18} color={theme.primary} />
                  <Text style={styles.infoValue}>{userData.major}</Text>
                </View>
              )}
              {userData.classYear && (
                <View style={styles.infoItem}>
                  <Calendar size={18} color={theme.primary} />
                  <Text style={styles.infoValue}>
                   {userData.classYear}
                  </Text>
                </View>
              )}
              {(userData.city || userData.state) && (
                <View style={styles.infoItem}>
                  <MapPin size={18} color={theme.primary} />
                  <Text style={styles.infoValue}>
                    {userData.city && userData.state 
                      ? `${userData.city}, ${userData.state}`
                      : userData.city || userData.state
                    }
                  </Text>
                </View>
              )}
              {userData.countryOfOrigin && (
                <View style={styles.infoItem}>
                  <Globe size={18} color={theme.primary} />
                  <Text style={styles.infoValue}>
                    From {userData.countryOfOrigin}
                  </Text>
                </View>
              )}
              {userData.ethnicity?.length > 0 && (
                <View style={styles.infoItem}>
                  <Users size={18} color={theme.primary} />
                  <Text style={styles.infoValue}>
                    {userData.ethnicity.join(', ')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {userData.interests?.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Interests & Hobbies</Text>
              <View style={styles.tagsContainer}>
                {userData.interests.map((interest: string, index: number) => (
                  <View key={index} style={styles.tag}>
                    <Heart size={12} color={theme.primary} />
                    <Text style={styles.tagText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {userData.languagesSpoken?.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Languages Spoken</Text>
              <View style={styles.tagsContainer}>
                {userData.languagesSpoken.map((lang: string, index: number) => (
                  <View key={index} style={[styles.tag, styles.languageTag]}>
                    <Globe size={12} color={theme.accent} />
                    <Text style={[styles.tagText, styles.languageTagText]}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase()}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {userData.friends?.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Friends ({userData.friends.length})</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContainer}
              >
                {userData.friends.map((friend: any) => (
                  <FriendCard key={friend.id} friend={friend} onPress={handleFriendPress} />
                ))}
              </ScrollView>
            </View>
          )}

          {userData.attendingEvents?.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Attending Events</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContainer}
              >
                {userData.attendingEvents.map((event:any) => (
                  <EventCard key={event.id} event={event} onPress={handleEventPress} />
                ))}
              </ScrollView>
            </View>
          )}

          {userData.groups?.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Groups</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContainer}
              >
                {userData.groups.map((group:any) => (
                  <GroupCard key={group.id} group={group} onPress={handleGroupPress} />
                ))}
              </ScrollView>
            </View>
          )}

          {userData.createdAt && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Member Since</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoItem}>
                  <Calendar size={18} color={theme.primary} />
                  <Text style={styles.infoValue}>
                    {new Date(userData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  safeArea: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    textAlign: 'center',
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.cardBackground,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: theme.shadowDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  retryButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: theme.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.background,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.shadowDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 8,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadowDark,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.7,
        shadowRadius: 5,
      },
      android: { elevation: 5 },
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.shadowDark,
  },
  profileImageContainer: {
    position: 'relative',
    backgroundColor: theme.cardBackground,
    padding: 8,
    borderRadius: 70,
    shadowColor: theme.shadowDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: theme.cardBackground,
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.shadowDark,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 24,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  userPronouns: {
    fontSize: 16,
    color: theme.textSecondary,
    fontWeight: '500',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    paddingVertical: 16,
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    shadowColor: theme.shadowDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.primary,
  },
  statLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 4,
  },
  actionsContainer: {
    marginTop: 24,
    width: '100%',
  },
  actionPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    paddingVertical: 16,
    paddingHorizontal:16,
    borderRadius: 16,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
    }),
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  actionButtonText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionDeclineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    shadowColor: theme.shadowDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.error,
  },
  cancelButton: {
    backgroundColor: theme.warning,
  },
  actionAcceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: theme.success,
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 7,
  },
  disabledButton: {
    backgroundColor: theme.textMuted,
    opacity: 0.7,
  },
  blockedButton: {
    backgroundColor: theme.error,
  },
  infoSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadowDark,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.6,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.05)',
      },
    }),
  },
  bioText: {
    fontSize: 15,
    color: theme.textSecondary,
    lineHeight: 22,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoValue: {
    fontSize: 15,
    color: theme.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadowDark,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
    elevation: 2,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.primary,
    marginLeft: 6,
  },
  languageTag: {
    backgroundColor: '#F3E8FF',
  },
  languageTagText: {
    color: theme.accent,
  },
  horizontalScrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 16,
  },
  eventCard: {
    width: 300,
    backgroundColor: theme.white,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventCardImage: {
    width: 80,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
  },
  eventCardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  eventCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 6,
  },
  eventCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventCardMetaText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textSecondary,
    marginLeft: 6,
    flex: 1,
  },
  groupCard: {
    width: 300,
    backgroundColor: theme.white,
    position: 'relative',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  groupImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  groupName: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.primary,
    marginBottom: 6,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  groupMetaText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
    marginLeft: spacing.sm,
  },
  groupDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: theme.textSecondary,
    lineHeight: 21,
    marginVertical: 8,
  },
  groupBadges: {
    position: 'absolute',
    top: 2,
    right: 2,
    flexDirection: 'row',
    gap: 4,
  },
  friendCard: {
    alignItems: 'center',
    width: 110,
    padding: spacing.sm,
    backgroundColor: theme.white,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  friendImage: {
    width: 60,
    height: 60,
    borderRadius: 40,
    marginBottom: spacing.sm,
    backgroundColor: theme.background,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
    textAlign: 'center',
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
    backgroundColor: theme.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.shadowDark,
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
    backgroundColor: theme.background,
  },
  buttonSend: {
    backgroundColor: theme.primary,
  },
  textStyle: {
    color: theme.white,
    fontWeight: '600',
    textAlign: 'center',
  },
})