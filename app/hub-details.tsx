// project/app/hub-details.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { theme, spacing, typography } from '@/components/theme';
import { ArrowLeft, MessageCircle, Users, Calendar, User } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { getHubDetails } from '@/contexts/user.api';

export default function HubDetails() {
  const [activeTab, setActiveTab] = useState('friends');

  const { data: res, isLoading, error } = useQuery({
    queryKey: ['hubDetails'],
    queryFn: () => getHubDetails(),
  });

  const navigateToChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const renderFriends = () => {
    const friends = res?.data?.friends || [];
    
    if (friends.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No friends found</Text>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {friends.map((friend: any) => (
          <View key={friend.id} style={styles.friendCard}>
            <View style={styles.friendInfo}>
              {friend.profilePicture ? (
                <Image source={{ uri: friend.profilePicture }} style={styles.friendAvatar} />
              ) : (
                <View style={styles.friendAvatarPlaceholder}>
                  <User size={24} color={theme.textSecondary} />
                </View>
              )}
              <View style={styles.friendDetails}>
                <Text style={styles.friendName}>
                  {friend.firstName} {friend.lastName}
                </Text>
                <Text style={styles.friendEmail}>{friend.email}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => navigateToChat(friend.chatId)}
              activeOpacity={0.7}
            >
              <MessageCircle size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderGroups = () => {
    const groups = res?.data?.groups || [];
    
    if (groups.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No groups found</Text>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {groups.map((group: any) => (
          <TouchableOpacity
            key={group.id}
            onPress={() => router.push(`/group/${group.id}`)}
            activeOpacity={0.8}>
          <View key={group.id} style={styles.groupCard}>
            <View style={styles.groupHeader}>
              {group.imageUrl ? (
                <Image source={{ uri: group.imageUrl }} style={styles.groupImage} />
              ) : (
                <View style={styles.groupImagePlaceholder}>
                  <Users size={24} color={theme.textSecondary} />
                </View>
              )}
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupDescription} numberOfLines={2}>
                  {group.description || 'No description available'}
                </Text>
                <View style={styles.groupMeta}>
                  <Text style={styles.groupMembers}>
                    {group._count.members} member{group._count.members !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.groupCreator}>
                    Created by {group.creator.name}
                  </Text>
                </View>
              </View>
            </View>
            {group.meetingLocation && (
              <Text style={styles.groupLocation}>📍 {group.meetingLocation}</Text>
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
          <Text style={styles.emptyText}>No events found</Text>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {events.map((event: any) => (
          <TouchableOpacity
            key={event.id}
            onPress={() => router.push(`/event/${event.id}`)}
            activeOpacity={0.8}>
          <View key={event.id} style={styles.eventCard}>
            {event.imageUrl && (
              <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
            )}
            <View style={styles.eventContent}>
              <Text style={styles.eventName}>{event.name}</Text>
              <Text style={styles.eventDescription} numberOfLines={2}>
                {event.description}
              </Text>
              <View style={styles.eventMeta}>
                <Text style={styles.eventLocation}>📍 {event.location}</Text>
                <Text style={styles.eventDate}>
                  📅 {new Date(event.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.eventOrganizer}>
                Organized by {event.user.name}
              </Text>
              <Text style={styles.eventAttendees}>
                {event.attendingUsers?.length || 0} attending
              </Text>
            </View>
          </View>
          </TouchableOpacity>
        ))}
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
          <Text style={styles.errorText}>Failed to load hub details</Text>
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

  const getTabCount = () => {
    if (!res?.data) return '';
    
    switch (activeTab) {
      case 'friends':
        return res.data.friends?.length || 0;
      case 'groups':
        return res.data.groups?.length || 0;
      case 'events':
        return res.data.events?.length || 0;
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Hub Details</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
          onPress={() => setActiveTab('groups')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>
            Groups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
            Events
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.white,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  headerContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
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
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  countText: {
    fontSize: 15,
    color: theme.gray500,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F0F3F7',
    marginHorizontal: spacing.md,
    borderRadius: 16,
    padding: 4,
    marginVertical: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#A3B1C6',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: theme.primary,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tabText: {
    fontSize: 14,
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
    paddingBottom: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    fontSize: 16,
    color: theme.gray500,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  errorText: {
    fontSize: 16,
    color: theme.gray500,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: theme.gray500,
  },
  // Friends styles
  friendCard: {
    backgroundColor: theme.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.md,
  },
  friendAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
    marginBottom: 4,
  },
  friendEmail: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
  },
  chatButton: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: theme.gray50,
  },
  // Groups styles
  groupCard: {
    backgroundColor: theme.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  groupHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  groupImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: spacing.md,
  },
  groupImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: theme.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    marginBottom: spacing.xs,
  },
  groupMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  groupMembers: {
    fontSize: typography.fontSize.xs,
    color: theme.primary,
    fontWeight: '600',
  },
  groupCreator: {
    fontSize: typography.fontSize.xs,
    color: theme.textSecondary,
  },
  groupLocation: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    marginTop: spacing.xs,
  },
  // Events styles
  eventCard: {
    backgroundColor: theme.white,
    borderRadius: 12,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  eventImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  eventContent: {
    padding: spacing.md,
  },
  eventName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    marginBottom: spacing.sm,
  },
  eventMeta: {
    marginBottom: spacing.xs,
  },
  eventLocation: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  eventDate: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
  },
  eventOrganizer: {
    fontSize: typography.fontSize.xs,
    color: theme.textSecondary,
    marginTop: spacing.xs,
  },
  eventAttendees: {
    fontSize: typography.fontSize.xs,
    color: theme.primary,
    fontWeight: '600',
    marginTop: 2,
  },
});