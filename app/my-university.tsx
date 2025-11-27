// project/app/my-university.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { theme, spacing, typography } from '@/components/theme';
import { ArrowLeft, Calendar, Users, MapPin, User } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { getMyUniversity } from '@/contexts/university.api';

const formatDate = (dateString: string) => {
  if (!dateString) return 'TBA';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTime = (dateString: string) => {
  if (!dateString) return 'TBA';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

export default function MyUniversity() {
  const [activeTab, setActiveTab] = useState('events');
  const [activeEventTab, setActiveEventTab] = useState<'upcoming' | 'past'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: res,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['myUniversity'],
    queryFn: () => getMyUniversity(),
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  }, [refetch]);

  const renderEvents = () => {
    const allEvents = res?.data?.events || [];
    const now = new Date();

    const upcomingEvents = allEvents
      .filter((event: any) => new Date(event.eventTimes?.[0]?.startTime) >= now)
      .sort(
        (a: any, b: any) =>
          new Date(a.eventTimes?.[0]?.startTime).getTime() -
          new Date(b.eventTimes?.[0]?.startTime).getTime()
      );

    const pastEvents = allEvents
      .filter((event: any) => new Date(event.eventTimes?.[0]?.startTime) < now)
      .sort(
        (a: any, b: any) =>
          new Date(b.eventTimes?.[0]?.startTime).getTime() -
          new Date(a.eventTimes?.[0]?.startTime).getTime()
      );

    const eventsToDisplay = activeEventTab === 'upcoming' ? upcomingEvents : pastEvents;

    const renderEventList = (events: any[]) => {
      let lastDate: string | null = null;

      return events.map((event: any) => {
        const eventDate = new Date(event.eventTimes?.[0]?.startTime).toDateString();
        const showHeader = eventDate !== lastDate;
        lastDate = eventDate;
        const organizerName = event.associatedGroup?.name || event.user?.name || 'Unknown';

        return (
          <View key={event.id}>
            {showHeader && (
              <Text style={styles.dateHeader}>
                {new Date(event.eventTimes?.[0]?.startTime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            )}
            <TouchableOpacity
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
                    source={event.imageUrl ? { uri: event.imageUrl } : require('../assets/logo.png')}
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
          </View>
        );
      });
    };

    if (allEvents.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <Calendar size={48} color={theme.primary} style={{ opacity: 0.3 }} />
            <Text style={styles.emptyText}>No events found</Text>
            <Text style={styles.emptySubtext}>Check back later for upcoming events</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        <View style={styles.eventTabContainer}>
          <TouchableOpacity
            style={[styles.eventTab, activeEventTab === 'upcoming' && styles.activeEventTab]}
            onPress={() => setActiveEventTab('upcoming')}
            activeOpacity={0.7}
          >
            <Text style={[styles.eventTabText, activeEventTab === 'upcoming' && styles.activeEventTabText]}>
              Upcoming ({upcomingEvents.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.eventTab, activeEventTab === 'past' && styles.activeEventTab]}
            onPress={() => setActiveEventTab('past')}
            activeOpacity={0.7}
          >
            <Text style={[styles.eventTabText, activeEventTab === 'past' && styles.activeEventTabText]}>
              Past ({pastEvents.length})
            </Text>
          </TouchableOpacity>
        </View>
        {eventsToDisplay.length > 0 ? (
          renderEventList(eventsToDisplay)
        ) : (
          <Text style={styles.noEventsInCategoryText}>No {activeEventTab} events.</Text>
        )}
      </View>
    );
  };

  const renderGroups = () => {
    const groups = res?.data?.groups || [];

    if (groups.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <Users size={48} color={theme.primary} style={{ opacity: 0.3 }} />
            <Text style={styles.emptyText}>No groups found</Text>
            <Text style={styles.emptySubtext}>Join groups to see them here</Text>
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
                  <Text style={styles.groupName} numberOfLines={2}>
                    {group.name}
                  </Text>
                  <View style={styles.groupMetaRow}>
                    <View style={styles.groupMemberBadge}>
                      <Users size={14} color={theme.primary} />
                      <Text style={styles.groupMembers}>
                        {group._count?.members || 0} member{group._count?.members !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.groupCreator}>
                    by {group.creator?.name || 'Unknown'}
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

  const renderPeople = () => {
    const people = res?.data?.people || [];

    if (people.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <Users size={48} color={theme.primary} style={{ opacity: 0.3 }} />
            <Text style={styles.emptyText}>No people found</Text>
            <Text style={styles.emptySubtext}>Connect with people from your university</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {people.map((person: any) => (
          <TouchableOpacity
            key={person.id}
            onPress={() => router.push(`/public/profile/${person.id}`)}
            activeOpacity={0.7}
            style={styles.personCard}
          >
            <View style={styles.personCardInner}>
              {person.profilePicture ? (
                <Image
                  source={{ uri: person.profilePicture }}
                  style={styles.personAvatar}
                />
              ) : (
                <View style={styles.personAvatarPlaceholder}>
                  <User size={26} color={theme.primary} />
                </View>
              )}
              <View style={styles.personDetails}>
                <Text style={styles.personName}>
                  {person.name} 
                </Text>
                {person.major && (
                  <Text style={styles.personMeta}>🎓 {person.major}</Text>
                )}
                {person.classYear && (
                  <Text style={styles.personYear}>{person.classYear}</Text>
                )}
                {(person.countryOfOrigin || person.city) && (
                  <Text style={styles.personLocation}>
                    📍 {person.countryOfOrigin || person.city}
                  </Text>
                )}
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
          <Text style={styles.loadingText}>Loading university data...</Text>
        </View>
      );
    }

    if (error || !res?.data) {
      return (
        <View style={styles.errorContainer}>
          <View style={styles.emptyCard}>
            <Text style={styles.errorText}>Failed to load university data</Text>
            <Text style={styles.emptySubtext}>Please try again later</Text>
          </View>
        </View>
      );
    }

    switch (activeTab) {
      case 'events':
        return renderEvents();
      case 'groups':
        return renderGroups();
      case 'people':
        return renderPeople();
      default:
        return null;
    }
  };

  const getTabCount = () => {
    if (!res?.data) return '';

    switch (activeTab) {
      case 'events':
        return res.data.events?.length || 0;
      case 'groups':
        return res.data.groups?.length || 0;
      case 'people':
        return res.data.people?.length || 0;
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
        <Text style={styles.title}>
          {res?.data?.university?.name || 'University'} Hub
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.headerContainer}>
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {getTabCount()} {activeTab}
          </Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
            Events
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
          style={[styles.tab, activeTab === 'people' && styles.activeTab]}
          onPress={() => setActiveTab('people')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'people' && styles.activeTabText]}>
            People
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
    fontWeight:500

  },
  placeholder: {
    width: 15,
  },
  headerContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#A3B1C6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
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
    fontSize: 16,
    color: theme.gray500,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: spacing.md,
    borderRadius: 20,
    padding: 6,
    marginBottom: spacing.md,
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
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  // Event Card Styles
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
    zIndex: 10,
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
  // Group Card Styles
  eventTabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.white,
    borderRadius: 16,
    padding: 4,
    marginBottom: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#A3B1C6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  eventTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeEventTab: {
    backgroundColor: theme.primary,
  },
  eventTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  activeEventTabText: {
    color: theme.white,
  },
  dateHeader: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  noEventsInCategoryText: {
    textAlign: 'center',
    color: theme.textSecondary,
    marginTop: spacing.xl,
  },
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
  // People Card Styles
  personCard: {
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
  personCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  personAvatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    marginRight: spacing.md,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  personAvatarPlaceholder: {
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
  personDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 17,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
    marginBottom: 6,
  },
  personMeta: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 3,
  },
  personYear: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  personLocation: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
});