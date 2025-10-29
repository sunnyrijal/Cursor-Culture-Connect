// project/app/hub-details.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { theme, spacing, typography } from '@/components/theme';
import {
  ArrowLeft,
  MessageCircle,
  Users,
  Calendar,
  User,
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { getHubDetails } from '@/contexts/user.api';

const formatDate = (dateString: string) => {
  if (!dateString) return 'TBA';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTime = (dateString: string) => {
  if (!dateString) return 'TBA';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export default function HubDetails() {
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'events' | 'groups' | 'friends'>(
    () => {
      const tabParam = params.tab;
      if (tabParam === 'groups' || tabParam === 'friends') return tabParam;
      return 'events';
    }
  );

  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['hubDetails'],
    queryFn: () => getHubDetails(),
  });
  const navigateToChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const handleTabChange = (tab: 'events' | 'groups' | 'friends') => {
    setActiveTab(tab);
    router.setParams({ tab });
  };

  const renderFriends = () => {
    const friends = res?.data?.friends || [];

    if (friends.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <Users size={48} color={theme.primary} style={{ opacity: 1 }} />
            <Text style={styles.emptyText}>No friends found</Text>
            <Text style={styles.emptySubtext}>
              Connect with people to see them here
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {friends.map((friend: any) => (
          <TouchableOpacity
            onPress={() => router.push(`/public/profile/${friend.id}`)}
            key={friend.id}
            style={styles.friendCard}
            activeOpacity={0.7}
          >
            <View style={styles.friendCardInner}>
              <View style={styles.friendInfo}>
                {friend.profilePicture ? (
                  <Image
                    source={{ uri: friend.profilePicture }}
                    style={styles.friendAvatar}
                  />
                ) : (
                  <View style={styles.friendAvatarPlaceholder}>
                    <User size={26} color={theme.primary} />
                  </View>
                )}
                <View style={styles.friendDetails}>
                  <Text style={styles.friendName}>
                    {friend.firstName} {friend.lastName}
                  </Text>
                  {friend.major && (
                    <Text style={styles.friendMeta}>{friend.major}</Text>
                  )}
                  {friend.university && (
                    <Text style={styles.friendMeta}>
                     {friend.university.name}
                    </Text>
                  )}
                  {friend.classYear && (
                    <Text style={styles.friendYear}>
                      {friend.classYear}
                    </Text>
                  )}
                  {(friend.countryOfOrigin || friend.city) && (
                    <Text style={styles.friendLocation}>
                      {friend.countryOfOrigin || friend.city}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => navigateToChat(friend.chatId)}
                activeOpacity={0.7}
              >
                <MessageCircle size={20} color={theme.white} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderGroups = () => {
    const groups = res?.data?.groups || [];

    if (groups.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <Users
              size={48}
              color={theme.textSecondary}
              style={{ opacity: 0.3 }}
            />
            <Text style={styles.emptyText}>No groups found</Text>
            <Text style={styles.emptySubtext}>
              Join groups to see them here
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {groups.map((group: any) => (
          <TouchableOpacity
            key={group.id}
            onPress={() => router.push(`/group/${group.id}`)}
            activeOpacity={0.8}
            style={styles.groupCard}
          >
            <View style={styles.groupCardInner}>
              <View style={styles.groupHeader}>
                {group.imageUrl ? (
                  <View style={styles.groupImageContainer}>
                    <Image
                      source={{ uri: group.imageUrl }}
                      style={styles.groupImage}
                    />
                  </View>
                ) : (
                  <View style={styles.groupImagePlaceholder}>
                    <Users size={28} color={theme.primary} />
                  </View>
                )}
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <View style={styles.groupMetaRow}>
                    <View style={styles.groupMemberBadge}>
                      <Users size={14} color={theme.primary} />
                      <Text style={styles.groupMembers}>
                        {group._count.members} member
                        {group._count.members !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.groupCreator}>
                    by {group.creator.name}
                  </Text>
                </View>
              </View>
              <Text style={styles.groupDescription} numberOfLines={2}>
                {group.description || 'No description available'}
              </Text>
              {group.meetingLocation && (
                <View style={styles.locationBadge}>
                  <Text style={styles.groupLocation}>
                    📍 {group.meetingLocation}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderEvents = () => {
    const events = res?.data?.events || [];

    if (events.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <Calendar
              size={48}
              color={theme.textSecondary}
              style={{ opacity: 0.3 }}
            />
            <Text style={styles.emptyText}>No events found</Text>
            <Text style={styles.emptySubtext}>
              Check back later for upcoming events
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {events.map((event: any) => {
          const organizerName = event.associatedGroup?.name || event.user.name;

          return (
            <TouchableOpacity
              key={event.id}
              onPress={() => router.push(`/event/${event.id}`)}
              activeOpacity={0.8}
              style={styles.eventCard}
            >
              <View style={styles.eventCardInner}>
                <View style={styles.eventDateBadge}>
                  <Text style={styles.eventDateText}>
                    {formatDate(event.eventTimes?.[0]?.startTime).split(' ')[0]}
                  </Text>
                  <Text style={styles.eventDateNumber}>
                    {formatDate(event.eventTimes?.[0]?.startTime).split(' ')[1]}
                  </Text>
                </View>
                <View style={styles.eventImageContainer}>
                  <Image
                    source={
                      event.imageUrl
                        ? { uri: event.imageUrl }
                        : require('../assets/logo.png')
                    }
                    style={styles.eventImage}
                  />
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {event.name}
                  </Text>
                  <View style={styles.eventMetaRow}>
                    <Text style={styles.eventTime}>
                      🕒 {formatTime(event.eventTimes?.[0]?.startTime)}
                    </Text>
                  </View>
                  <Text style={styles.eventLocation} numberOfLines={1}>
                    📍 {event.location}
                  </Text>
                  <View style={styles.eventFooter}>
                    <Text style={styles.eventHost} numberOfLines={1}>
                      by {organizerName}
                    </Text>
                    <View style={styles.eventAttendees}>
                      <Users size={14} color={theme.primary} />
                      <Text style={styles.eventAttendeesText}>
                        {event.attendingUsers?.length || 0}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading hub details...</Text>
        </View>
      );
    }

    if (error || !res?.data) {
      return (
        <View style={styles.errorContainer}>
          <View style={styles.emptyCard}>
            <Text style={styles.errorText}>Failed to load hub details</Text>
            <Text style={styles.emptySubtext}>Please try again later</Text>
          </View>
        </View>
      );
    }

    switch (activeTab) {
      case 'friends':
        return renderFriends();
      case 'groups':
        return renderGroups();
      case 'events':
        return renderEvents();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Hub Details</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => handleTabChange('events')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'events' && styles.activeTabText,
            ]}
          >
            Events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
          onPress={() => handleTabChange('groups')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'groups' && styles.activeTabText,
            ]}
          >
            Groups
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => handleTabChange('friends')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'friends' && styles.activeTabText,
            ]}
          >
            Friends
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: theme.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
    fontWeight:500
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: spacing.md,
    borderRadius: 20,
    padding: 6,
    marginVertical: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#A3B1C6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: theme.primary,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  tabText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textSecondary,
  },
  activeTabText: {
    color: theme.white,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: theme.gray500,
    marginTop: 16,
    fontFamily: typography.fontFamily.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: spacing.md,
  },
  errorText: {
    fontSize: 18,
    color: theme.textPrimary,
    fontFamily: typography.fontFamily.semiBold,
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: spacing.md,
  },
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    ...Platform.select({
      ios: {
        shadowColor: '#A3B1C6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emptyText: {
    fontSize: 18,
    color: theme.textPrimary,
    fontFamily: typography.fontFamily.semiBold,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: 'transparent',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  // Enhanced Friends styles
  friendCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#A3B1C6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  friendCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: spacing.md,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  friendAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(87, 108, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 17,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
    marginBottom: 6,
  },
  friendMeta: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 3,
  },
  friendYear: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  friendLocation: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  chatButton: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: theme.primary,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  // Enhanced Groups styles
  groupCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#A3B1C6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  groupCardInner: {
    padding: spacing.md,
  },
  groupHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  groupImageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  groupImage: {
    width: 70,
    height: 70,
    borderRadius: 16,
  },
  groupImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: 'rgba(87, 108, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  groupInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  groupName: {
    fontSize: 18,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
    marginBottom: 8,
  },
  groupMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  groupMemberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(87, 108, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  groupMembers: {
    fontSize: 13,
    color: theme.primary,
    fontWeight: '700',
  },
  groupCreator: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  groupDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  locationBadge: {
    backgroundColor: 'rgba(87, 108, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  groupLocation: {
    fontSize: 13,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  // Enhanced Events styles
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#A3B1C6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  eventCardInner: {
    flexDirection: 'row',
  },
  eventImageContainer: {
    width: 120,
    height: 140,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventDateBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  eventDateText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.primary,
    textTransform: 'uppercase',
  },
  eventDateNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.textPrimary,
    marginTop: 2,
  },
  eventDetails: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
    marginBottom: 8,
    lineHeight: 22,
    width:"80%"

  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 13,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  eventLocation: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  eventHost: {
    fontSize: 12,
    color: theme.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  eventAttendees: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(87, 108, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  eventAttendeesText: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '700',
  },
});
