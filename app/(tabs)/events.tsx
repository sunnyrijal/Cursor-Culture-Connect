'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { RefreshControl } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, Users, Clock, PlusCircle, Zap } from 'lucide-react-native';
import Checkbox from 'expo-checkbox';
import { ShareButton } from '@/components/ui/ShareButton';
import { CreateEventModal } from '@/components/CreateEventModal';
import { useQuery } from '@tanstack/react-query';
import { getEvents, joinEvent, leaveEvent } from '@/contexts/event.api';

// Add import for date formatting
import getDecodedToken from '@/utils/getMyData';
import { theme } from '@/components/theme';
import {
  getQuickEvents,
  addInterestedUser,
  removeInterestedUser,
} from '@/contexts/quickEvent.api';
import { CreateQuickEventModal } from '@/components/CreateQuickEventModal';
import React from 'react';
import { EventCard } from '@/components/EventCard';
import { formatTime, formatTo12Hour } from '@/utils/formatDate';

import { Filter } from 'lucide-react-native';
import { FilterModal } from '@/components/EventFilterModal';

const filterOptions = [
  { key: 'all', label: 'All' },
  { key: 'cultural', label: 'Cultural' },
  { key: 'sports', label: 'Sports' },
  { key: 'music', label: 'Music' },
  { key: 'games', label: 'Games' },
  { key: 'career', label: 'Career' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'social', label: 'Social' },
];

interface FilterOptions {
  location: {
    country: string;
    state: string;
    city: string;
  };
  university: string;
  filterBy:
    | 'all'
    | 'public'
    | 'private'
    | 'my-university'
    | 'my-heritage'
    | 'filter-by-state';
  ethnicity: string[];
  selectedUniversity: string;
}

interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  imageUrl?: string | null;
  userId: string;
  attendingUsers: any;
  eventTimes: {
    id: number;
    eventId: string;
    startTime: string;
    endTime: string;
  }[];
  user: {
    id: string;
    email: string;
    name: string;
  };
  // Static fields for UI
  attendees?: number;
  isRSVPed?: boolean;
  category?: string[];
}

interface QuickEvent {
  id: string;
  name: string;
  description: string;
  max: string;
  location: string;
  interestedUsers: { id: string }[];
  time: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [eventsView, setEventsView] = useState<'grid' | 'list'>('list');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [filters, setFilters] = useState<FilterOptions>({
    location: { country: '', state: '', city: '' },
    university: '',
    filterBy: 'all',
    ethnicity: [],
    selectedUniversity: '',
  });
  const [showHelper, setShowHelper] = useState(true);
  const [includeNotInterested, setIncludeNotInterested] = useState(false);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [eventFilters, setEventFilters] = useState<{
    ofMyUniversity?: boolean;
    myGroups?: boolean;
    timeFrame?: 'thisWeek' | 'thisMonth';
    sortBy?: 'date' | 'name';
    sortOrder?: 'asc' | 'desc';
  }>({});

  const [refreshing, setRefreshing] = useState(false);
  const [mutatingQuickEventId, setMutatingQuickEventId] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState<'events' | 'quickEvents'>(
    'events'
  );
  const [showCreateQuickEventModal, setShowCreateQuickEventModal] =
    useState(false);

  const { data: myData } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getDecodedToken(),
  });

  const queryClient = useQueryClient();

  const { mutate: joinEventMutation, isPending: isJoining } = useMutation({
    mutationFn: (eventId: string) => joinEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error('Error joining event:', error);
    },
  });

  const { mutate: leaveEventMutation, isPending: isLeaving } = useMutation({
    mutationFn: (eventId: string) => leaveEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error('Error leaving event:', error);
    },
  });

  const { mutate: addInterestMutation, isPending: isAddingInterest } =
    useMutation({
      mutationFn: async (quickEventId: string) => {
        setMutatingQuickEventId(quickEventId);
        return addInterestedUser(quickEventId);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['quick-events'] });
      },
      onError: (error) => {
        console.error('Error adding interest:', error);
      },
      onSettled: () => {
        setMutatingQuickEventId(null);
      },
    });

  const { mutate: removeInterestMutation, isPending: isRemovingInterest } =
    useMutation({
      mutationFn: async (quickEventId: string) => {
        setMutatingQuickEventId(quickEventId);
        return removeInterestedUser(quickEventId);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['quick-events'] });
      },
      onError: (error) => {
        console.error('Error removing interest:', error);
      },
      onSettled: () => {
        setMutatingQuickEventId(null);
      },
    });

  const {
    data: eventsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['events', eventFilters],
    queryFn: () => getEvents(eventFilters),
  });

  const events = eventsResponse?.events || [];

  const handleFilterChange = (newFilters: typeof eventFilters) => {
    setEventFilters(newFilters);
  };

  const handleApplyFilters = () => {
    setShowFilterModal(false);
    refetch(); // This will refetch with new filters
  };

  const hasActiveFilters = Object.keys(eventFilters).length > 0;

  const {
    data: quickEventsResponse,
    isLoading: isLoadingQuickEvents,
    error: quickEventsError,
    refetch: refetchQuickEvents,
  } = useQuery({
    queryKey: ['quick-events', { includeNotInterested }],
    queryFn: () => getQuickEvents({ includeNotInterested }),
  });

  const quickEvents = quickEventsResponse?.data || [];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([refetch(), refetchQuickEvents()]).then(() => {
      setRefreshing(false);
    });
  }, [refetch, refetchQuickEvents]);

  useEffect(() => {
    if (showHelper) {
      const timer = setTimeout(() => setShowHelper(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showHelper]);

  const filteredEvents = useMemo(() => {
    let tempEvents = [...events];

    if (searchQuery) {
      tempEvents = tempEvents.filter(
        (event) =>
          event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return tempEvents;
  }, [events, searchQuery, activeFilter, filters]);

  console.log(filteredEvents)

  const filteredQuickEvents = useMemo(() => {
    let tempQuickEvents = [...quickEvents];

    // Filter by search query
    if (searchQuery) {
      tempQuickEvents = tempQuickEvents.filter(
        (event: QuickEvent) =>
          event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return tempQuickEvents;
  }, [quickEvents, searchQuery]);

  const handleCreateEvent = async (eventData: any) => {
    setShowCreateModal(false);
  };

  const handleCreateQuickEvent = (eventData: any) => {
    setShowCreateQuickEventModal(false);
  };

  if (
    (activeTab === 'events' && isLoading) ||
    (activeTab === 'quickEvents' && isLoadingQuickEvents)
  ) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>
                {activeTab === 'events'
                  ? 'Discovering Events...'
                  : 'Loading Quick Events...'}
              </Text>
              <Text style={styles.loadingSubtext}>
                {activeTab === 'events'
                  ? 'Finding amazing cultural celebrations for you'
                  : 'Finding quick meetups and activities'}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (
    (activeTab === 'events' && error) ||
    (activeTab === 'quickEvents' && quickEventsError)
  ) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>Oops! Something went wrong</Text>
              <Text style={styles.errorSubtext}>
                {activeTab === 'events'
                  ? 'Unable to load events right now'
                  : 'Unable to load quick events right now'}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() =>
                  activeTab === 'events' ? refetch() : refetchQuickEvents()
                }
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CreateEventModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateEvent}
      />

      <CreateQuickEventModal
        visible={showCreateQuickEventModal}
        onClose={() => handleCreateQuickEvent(false)}
        onSubmit={handleCreateQuickEvent}
      />

      <View style={styles.heroSection}>
        <View style={styles.heroOverlay}>
          <View style={styles.headerContainer}>
            <View style={styles.headerRow}>
              {/* <Text style={styles.heroTitle}>Discover</Text> */}
              <Text style={styles.heroSubtitle}>
                Discover and participate in cultural celebrations
              </Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.createButtonHero}
                  onPress={() => setShowCreateQuickEventModal(true)}
                  activeOpacity={0.7}
                >
                  <Zap size={24} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createButtonHero}
                  onPress={() => setShowCreateModal(true)}
                  activeOpacity={0.7}
                >
                  <PlusCircle size={28} color={theme.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'events' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('events')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'events' && styles.activeTabButtonText,
            ]}
          >
            Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'quickEvents' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('quickEvents')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'quickEvents' && styles.activeTabButtonText,
            ]}
          >
            Quick Events
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder={
              activeTab === 'events'
                ? 'Search events...'
                : 'Search quick events...'
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748B"
          />
          {activeTab === 'events' && (
            <TouchableOpacity
              style={[
                styles.filterButton,
                hasActiveFilters && styles.activeFilterButton,
              ]}
              onPress={() => setShowFilterModal(true)}
              activeOpacity={0.7}
            >
              <Filter
                size={20}
                color={hasActiveFilters ? '#FFFFFF' : '#64748B'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {activeTab === 'quickEvents' && (
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIncludeNotInterested(!includeNotInterested)}
          activeOpacity={0.8}
        >
          <Checkbox
            style={styles.checkbox}
            value={includeNotInterested}
            onValueChange={setIncludeNotInterested}
            color={includeNotInterested ? theme.primary : undefined}
          />
          <Text style={styles.checkboxLabel}>
            Include events I'm not interested in
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView
        style={styles.eventsList}
        contentContainerStyle={styles.eventsListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        // onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        // scrollEventThrottle={16}
      >
        {activeTab === 'events' ? (
          <>
            {filteredEvents.map((event: Event, index: number) => (
              <EventCard
                key={event.id}
                event={event}
                myUserId={myData?.userId}
                isFirst={index === 0}
                isLast={index === filteredEvents.length - 1}
                onPress={() => router.push(`/event/${event.id}`)}
                onRSVP={() => {
                  const isAttending = event.attendingUsers.some(
                    (u: any) => u.id === myData?.userId
                  );
                  isAttending
                    ? leaveEventMutation(event.id)
                    : joinEventMutation(event.id);
                }}
                isLoading={isJoining || isLeaving}
              />
            ))}

            {filteredEvents.length === 0 && (
              <View style={styles.emptyState}>
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No Events Found</Text>
                  <Text style={styles.emptyText}>
                    Be the first to create a cultural event and start building
                    your community!
                  </Text>
                </View>
              </View>
            )}
          </>
        ) : (
          // Quick Events
          <>
            {filteredQuickEvents.map(
              (quickEvent: QuickEvent, index: number) => {
                const isInterested = quickEvent.interestedUsers.some(
                  (user) => user.id === myData?.userId
                );
                const isMutating =
                  (isAddingInterest || isRemovingInterest) &&
                  mutatingQuickEventId === quickEvent.id;
                return (
                  <TouchableOpacity
                    key={quickEvent.id}
                    style={[
                      styles.quickEventCard,
                      index === 0 && styles.firstCard,
                      index === filteredQuickEvents.length - 1 &&
                        styles.lastCard,
                    ]}
                    onPress={() => router.push(`/quickevent/${quickEvent.id}`)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.quickEventContent}>
                      <View style={styles.quickEventHeader}>
                        <Text style={styles.quickEventTitle} numberOfLines={2}>
                          {quickEvent.name} at {quickEvent.location}
                        </Text>
                        <View style={styles.quickEventBadge}>
                          <Text style={styles.quickEventBadgeText}>Quick</Text>
                        </View>
                      </View>
                      <Text
                        style={styles.quickEventDescription}
                        numberOfLines={2}
                      >
                        {quickEvent.description}
                      </Text>
                      <View style={styles.quickEventMeta}>
                        <Clock size={16} color="#F59E0B" />
                        <Text style={styles.quickEventMetaText}>
                          {formatTo12Hour(quickEvent.time)}
                        </Text>
                      </View>
                      <View style={styles.quickEventMeta}>
                        <Users size={16} color="#6366F1" />
                        <Text style={styles.quickEventMetaText}>
                          {quickEvent.max
                            ? ` Max ${quickEvent.max} people`
                            : 'No Limit'}
                        </Text>
                      </View>
                      <View style={styles.quickEventActions}>
                        <View style={styles.quickEventCreator}>
                          <View style={styles.creatorAvatar}>
                            <Text style={styles.creatorInitial}>
                              {quickEvent.user.name.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          <View style={styles.creatorDetails}>
                            <Text style={styles.creatorName}>
                              {quickEvent.user.name}
                            </Text>
                            <Text style={styles.creatorRole}>Host</Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.rsvpButtonSmall,
                            isInterested && styles.rsvpedButtonSmall,
                          ]}
                          onPress={() =>
                            !isMutating &&
                            (isInterested
                              ? removeInterestMutation(quickEvent.id)
                              : addInterestMutation(quickEvent.id))
                          }
                          disabled={isMutating}
                        >
                          {isMutating ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            <Text style={styles.rsvpButtonTextSmall}>
                              {isInterested ? 'Interested' : "I'm in"}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }
            )}

            {filteredQuickEvents.length === 0 && (
              <View style={styles.emptyState}>
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No Quick Events Found</Text>
                  <Text style={styles.emptyText}>
                    Quick events are spontaneous meetups and activities. Check
                    back soon for new opportunities!
                  </Text>
                </View>
              </View>
            )}
          </>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={eventFilters}
        onFiltersChange={handleFilterChange}
        onApply={handleApplyFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F3F7', // Updated to match groups page background
  },
  safeArea: {
    flex: 1,
  },

  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeFilterButton: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },

  rsvpButtonSmall: {
    backgroundColor: theme.primary,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },

  rsvpedButtonSmall: {
    backgroundColor: theme.success,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  rsvpButtonTextSmall: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  heroSection: {
    height: 100,
    backgroundColor: '#6366F1',
    position: 'relative',
    overflow: 'hidden',
    paddingTop: 10,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  headerContainer: {
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    width: '66%',
    fontWeight: '600',
  },
  createButtonHero: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#6366F1',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },

  searchWrapper: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight:4,
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
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    paddingVertical: 12,
  },

  filterWrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  // filterButton: {
  //   width: 44,
  //   height: 44,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   borderRadius: 12,
  //   backgroundColor: '#F8FAFC',
  //   borderWidth: 1,
  //   borderColor: '#E2E8F0',
  //   marginLeft: 12,
  // },
  activeFilter: {
    backgroundColor: '#6366F1',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },

  eventsList: {
    flex: 1,
  },
  eventsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  quickEventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  quickEventContent: {
    padding: 20,
  },
  quickEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quickEventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  quickEventBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quickEventBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickEventDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  quickEventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  quickEventMetaText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  quickEventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  quickEventCreator: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
  },

  firstCard: {
    marginTop: 0,
  },
  lastCard: {
    marginBottom: 0,
  },

  creatorSection: {
    marginBottom: 16,
    marginTop: 12,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  creatorInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  creatorDetails: {
    flex: 1,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  creatorRole: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    // ...Platform.select({
    //   ios: {
    //     shadowColor: "#CDD2D8",
    //     shadowOffset: { width: 4, height: 4 },
    //     shadowOpacity: 1,
    //     shadowRadius: 16,
    //   },
    //   android: {
    //     elevation: 8,
    //   },
    // }),
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  loadingSubtext: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  errorSubtext: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },

  bottomSpacing: {
    height: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary,
  },
});
