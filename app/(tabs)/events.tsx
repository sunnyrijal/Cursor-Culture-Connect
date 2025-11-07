'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RefreshControl } from 'react-native-gesture-handler';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Search, Users, Clock, PlusCircle, Zap } from 'lucide-react-native';
import Checkbox from 'expo-checkbox';
import { ShareButton } from '@/components/ui/ShareButton';
import { useQuery } from '@tanstack/react-query';
import { deleteEvent, getEvents, joinEvent, leaveEvent } from '@/contexts/event.api';
import AnimatedTabPage from '@/components/AnimatedTabPage';
// Add import for date formatting
import getDecodedToken from '@/utils/getMyData';
import { theme } from '@/components/theme';
import {
  getQuickEvents,
  addInterestedUser,
  removeInterestedUser,
  deleteQuickEvent,
} from '@/contexts/quickEvent.api';
import { CreateQuickEventModal } from '@/components/CreateQuickEventModal';
import React from 'react';
import { EventCard } from '@/components/EventCard';
import { QuickEventCard } from '@/components/QuickEventCard';

import { SlidersHorizontal } from 'lucide-react-native';
import { FilterModal } from '@/components/EventFilterModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { CreateEventModal } from '@/components/CreateEventModal';

const FAB_SIZE = 60;       // matches styles.fabMain width/height
const FAB_GAP  = 8;        // desired space between main FAB and menu

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
  endTime?: string;
  isPublic:boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
}

const getTimeAgo = (dateString: string) => {
  const now = new Date();
  const pastDate = new Date(dateString);
  const diffInMinutes = Math.floor(
    (now.getTime() - pastDate.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

export default function Events() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [filters, setFilters] = useState<FilterOptions>({
    location: { country: '', state: '', city: '' },
    university: '',
    filterBy: 'all',
    ethnicity: [],
    selectedUniversity: '',
  });
  const [showHelper, setShowHelper] = useState(true);
  const [includeNotInterested, setIncludeNotInterested] = useState(true);

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

  // normalize tab param from router (params?.tab can be string | string[])
  const [activeTab, setActiveTab] = useState<'events' | 'quickEvents'>('events');

  useEffect(() => {
    const t = params?.tab;
    const tab = Array.isArray(t) ? t[0] : t;
    if (tab === 'quickevent') {
      setActiveTab('quickEvents');
    } else {
      setActiveTab('events');
    }
  }, [params?.tab]);
  const [showCreateQuickEventModal, setShowCreateQuickEventModal] =
    useState(false);

  const { data: myData } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getDecodedToken(),
  });

  const queryClient = useQueryClient();

  const { mutate: joinEventMutation, isPending: isJoining } = useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data?: any }) =>
      joinEvent(eventId, data),
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

  const { mutate: deleteEventMutation, isPending: isDeletingEvent } = useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      // Optionally show an alert on success
      // showAlert({ title: 'Success', message: 'Event deleted successfully.' });
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
    },
  });

  const { mutate: deleteQuickEventMutation, isPending: isDeletingQuickEvent } =
    useMutation({
      mutationFn: async (quickEventId: string) => {
        setMutatingQuickEventId(quickEventId);
        return deleteQuickEvent(quickEventId);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['quick-events'] });
      },
      onError: (error) => {
        console.error('Error deleting quick event:', error);
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

  const handleTabChange = (tab: 'events' | 'quickEvents') => {
    setActiveTab(tab);
    router.setParams({ tab: tab === 'events' ? 'event' : 'quickevent' });
  };

  return (
     <AnimatedTabPage style={{ flex: 1,marginTop:12}}>
    <GestureHandlerRootView style={{ flex: 1 }}>
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

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'events' && styles.activeTabButton,
          ]}
          onPress={() => handleTabChange('events')}
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
          onPress={() => handleTabChange('quickEvents')}
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
              <SlidersHorizontal
                size={20}
                color={hasActiveFilters ? '#FFFFFF' : '#64748B'}
              />
            </TouchableOpacity>
          )}
        </View>
        {activeTab === 'quickEvents' && (
          <TouchableOpacity
            style={styles.checkboxInline}
            onPress={() => setIncludeNotInterested(!includeNotInterested)}
            activeOpacity={0.8}
          >
            <Text style={styles.checkboxLabel}>
              {includeNotInterested ? ' All Events' : 'Interested Events'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

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
        {activeTab === 'events' && (
          <>
            {isLoading ? (
              <View style={styles.inlineFeedbackContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.loadingText}>Loading Events...</Text>
              </View>
            ) : error ? (
              <View style={styles.inlineFeedbackContainer}>
                <Text style={styles.errorText}>
                  Oops! Something went wrong.
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => refetch()}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((event: Event, index: number) => (
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
                      : joinEventMutation({ eventId: event.id, data: {} });
                  }}
                  onOpenTransportModal={() =>
                    router.push(
                      `/event/${event.id}?openTransportationModal=true`
                    )
                  }
                  isLoading={isJoining || isLeaving || (isDeletingEvent && event.id === (deleteEventMutation as any).variables)}
                  onDelete={() => deleteEventMutation(event.id)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No Events Found</Text>
                <Text style={styles.emptyText}>
                  Be the first to create a cultural event and start building
                  your community!
                </Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'quickEvents' && (
          <>
            {isLoadingQuickEvents ? (
              <View style={styles.inlineFeedbackContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.loadingText}>Loading Quick Events...</Text>
              </View>
            ) : quickEventsError ? (
              <View style={styles.inlineFeedbackContainer}>
                <Text style={styles.errorText}>
                  Oops! Something went wrong.
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => refetchQuickEvents()}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : filteredQuickEvents.length > 0 ? (
              filteredQuickEvents.map(
                (quickEvent: QuickEvent, index: number) => {
                  return (
                    <QuickEventCard
                      key={quickEvent.id}
                      quickEvent={quickEvent}
                      myUserId={myData?.userId}
                      isFirst={index === 0}
                      isLast={index === filteredQuickEvents.length - 1}
                      isAddingInterest={isAddingInterest}
                      isRemovingInterest={isRemovingInterest}
                      isDeletingQuickEvent={isDeletingQuickEvent}
                      mutatingQuickEventId={mutatingQuickEventId}
                      onAddInterest={addInterestMutation}
                      onRemoveInterest={removeInterestMutation}
                      onDeleteQuickEvent={deleteQuickEventMutation}
                    />
                  )
                })
            
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No Quick Events Found</Text>
                <Text style={styles.emptyText}>
                  Quick events are spontaneous meetups and activities. Check
                  back soon for new opportunities!
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCreateQuickEventModal(true)}
                >
                  <Text style={styles.createQuickEventText}>
                    Or create a quick event
                  </Text>
                </TouchableOpacity>
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

      {/* this is button block  */}

      {/* FAB Backdrop (tap to close) */}
      {/* FAB backdrop */}
{showFabMenu && (
  <TouchableOpacity
    activeOpacity={1}
    onPress={() => setShowFabMenu(false)}
    style={styles.fabBackdrop}
  />
)}

{/* Floating Action Button + Speed Dial */}
<View
  pointerEvents="box-none"
  style={[
    styles.fabContainer,
    {
        right: 20,
        bottom: tabBarHeight + 20,
    },
  ]}
>

  {/* Speed dial list (labels to the LEFT of the FAB) */}
  {showFabMenu && (
    <View
    style={[
      styles.fabMenu,
      // BEFORE: { bottom: 72 + Math.max(0, tabBarHeight - 16) }
      { bottom: FAB_SIZE + FAB_GAP } // e.g., 60 + 8 = 68 (tight)
    ]}
  >
      {/* Quick Event */}
      <TouchableOpacity
        style={styles.fabItem}
        activeOpacity={0.9}
        onPress={() => {
          setShowFabMenu(false);
          setShowCreateQuickEventModal(true);
        }}
        accessibilityRole="button"
        accessibilityLabel="Create Quick Event"
      >
        <View style={styles.fabLabelPill}>
          <Text style={styles.fabLabelText}>Quick Event</Text>
        </View>
        <View style={styles.fabIconButton}>
          <Zap size={22} color={theme.primary} />
        </View>
      </TouchableOpacity>

      {/* Create Event */}
      <TouchableOpacity
        style={[styles.fabItem, { marginTop: 8 }]}
        activeOpacity={0.9}
        onPress={() => {
          setShowFabMenu(false);
          setShowCreateModal(true);
        }}
        accessibilityRole="button"
        accessibilityLabel="Create Event"
      >
        <View style={styles.fabLabelPill}>
          <Text style={styles.fabLabelText}>Create Event</Text>
        </View>
        <View style={styles.fabIconButton}>
          <PlusCircle size={24} color={theme.primary} />
        </View>
      </TouchableOpacity>
    </View>
  )}

  {/* Main FAB */}
  <TouchableOpacity
    accessibilityLabel={showFabMenu ? 'Close creation menu' : 'Open creation menu'}
    accessibilityHint="Opens actions to create an event"
    style={styles.fabMain}
    activeOpacity={0.95}
    onPress={() => setShowFabMenu((s) => !s)}
  >
    {showFabMenu ? (
      <Text style={styles.fabMainPlus}>×</Text>
    ) : (
      <PlusCircle size={28} color="#FFFFFF" />
    )}
  </TouchableOpacity>
</View>

    </GestureHandlerRootView>
    </AnimatedTabPage>
  );
}

const styles = StyleSheet.create({
  checkboxInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: theme.primary,
    color: 'white',
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#F0F3F7', // Updated to match groups page background
  },
  safeArea: {
    flex: 1,
    
  },
  fabContainer: {
    position: 'absolute',
    alignItems: 'flex-end',
    zIndex: 50,
    ...Platform.select({ android: { elevation: 50 } }),
  },
  createButton: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...Platform.select({
      ios: {
        shadowColor: '#6d7075',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
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

  deleteButton: {
    backgroundColor: theme.error,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  endedButtonSmall: {
    backgroundColor: theme.gray400,
    borderColor: theme.gray400,
  },
  endedBadge: {
    backgroundColor: theme.gray400,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  endedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
    // marginBottom: 16, // Removed to allow subtitle to be centered
  },

  fabBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  fabMain: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6365f1',
    ...Platform.select({
      ios: {
        shadowColor: '#6365f1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: { elevation: 10 },
    }),
  },
  
  fabMainPlus: {
    color: 'white',
    fontSize: 40,
    lineHeight: 40,
    fontWeight: '700',
  },
  fabMenu: {
    position: 'absolute',
    right: 0,                 // anchor menu to the right side of the container
    bottom: 72,               // stack above the main FAB
    alignItems: 'flex-end',   // labels grow to the left
  },
  fabItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabLabelPill: {
    backgroundColor: '#6365f1',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 10,
    minWidth: 140,            // ensures full label is readable
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#111827',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  
  fabLabelText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  fabIconButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignContent: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    width: '70%',
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
    display: 'flex',
    flexDirection: 'row',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 4,
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
    paddingBottom: 140,

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
  hostBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },

  hostBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
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
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  createQuickEventText: {
    marginTop: 16,
    color: theme.primary,
    fontSize: 16,
    fontWeight: '600',
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
    color: theme.white,
  },
  inlineFeedbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
});
