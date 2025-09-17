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
} from 'lucide-react-native';
import { getUserById } from '@/contexts/user.api';
import {
  sendFriendRequest,
  respondToFriendRequest,
} from '@/contexts/friend.api';

const theme = {
  white: 'white',
  background: '#F0F0F3',
  cardBackground: '#F0F0F3',
  shadowLight: '#FFFFFF',
  shadowDark: '#D1D9E6',
  primary: '#667eea',
  accent: '#764ba2',
  success: '#4ecdc4',
  error: '#ff6b6b',
  warning: '#feca57',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
};

const FriendshipStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  BLOCKED: 'BLOCKED',
};

export default function UserProfilePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
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

  const getActionButtons = () => {
    if (!userData) return null;

    const { friendshipStatus, isFriendRequestSender, chatId } = userData;

    // Priority 1: If friendship is accepted, show Message button
    if (friendshipStatus === FriendshipStatus.ACCEPTED) {
      return (
        <TouchableOpacity
          style={styles.actionPrimaryButton}
          onPress={() => router.push(`/chat/${chatId}`)}
        >
          <MessageCircle size={20} color={theme.white} />
          <Text style={styles.actionButtonText}>Message</Text>
        </TouchableOpacity>
      );
    }

    // Priority 2: Handle pending friendship requests
    if (friendshipStatus === FriendshipStatus.PENDING) {
      if (isFriendRequestSender) {
        return (
          <View style={[styles.actionPrimaryButton, styles.disabledButton]}>
            <UserCheck size={20} color={theme.white} />
            <Text style={styles.actionButtonText}>Request Sent</Text>
          </View>
        );
      } else {
        return (
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
    return (
      <TouchableOpacity
        style={styles.actionPrimaryButton}
        onPress={handleSendRequest}
        disabled={sendRequestMutation.isPending}
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
                    Class of {userData.classYear}
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
    paddingVertical: 16,
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
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    paddingBottom: 40,
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
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
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
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
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
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
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
    borderRadius: 16,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: theme.textMuted,
    shadowColor: theme.textMuted,
  },
  blockedButton: {
    backgroundColor: theme.error,
    shadowColor: theme.error,
  },
  actionButtonText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionAcceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.success,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: theme.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionDeclineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.cardBackground,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: theme.shadowDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 24,
    padding: 20,
    shadowColor: theme.shadowDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  bioText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textPrimary,
    lineHeight: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textPrimary,
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
    backgroundColor: theme.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.primary,
  },
  languageTag: {
    backgroundColor: theme.accent + '20',
  },
  languageTagText: {
    color: theme.accent,
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
    color: theme.textPrimary,
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
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.shadowDark,
  },
  buttonSend: {
    backgroundColor: theme.primary,
  },
  textStyle: {
    color: theme.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});