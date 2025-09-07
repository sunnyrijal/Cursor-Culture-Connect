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
} from 'react-native';
// import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Clock,
  PlusCircle,
} from 'lucide-react-native';
import { ShareButton } from '@/components/ui/ShareButton';
import { CreateEventModal } from '@/components/CreateEventModal';
import { useQuery } from '@tanstack/react-query';
import { getEvents } from '@/contexts/event.api';

// Add import for date formatting
import { format } from 'date-fns';
import { theme } from '@/components/theme';
import { getQuickEvents } from '@/contexts/quickEvent.api';

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

// Helper function to format time
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

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
  location:string;
  time: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Helper function to format dates
const formatEventDate = (date: string | Date): string => {
  if (date instanceof Date) {
    return format(date, 'MMM d, yyyy');
  }
  return date;
};

// Helper function to format times
const formatEventTime = (time: string | Date): string => {
  if (time instanceof Date) {
    return format(time, 'h:mm a');
  }
  return time;
};

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
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedHeritage, setSelectedHeritage] = useState('');

  const [activeTab, setActiveTab] = useState<'events' | 'quickEvents'>(
    'events'
  );

  // Add local state for pending filter selections
  const [pendingCategory, setPendingCategory] = useState('all');
  const [pendingState, setPendingState] = useState('');
  const [pendingCity, setPendingCity] = useState('');
  const [pendingUniversity, setPendingUniversity] = useState('');
  const [pendingHeritage, setPendingHeritage] = useState('');

  // When Apply Filters is pressed, update the actual filter state
  const applyFilters = () => {
    setSelectedCategory(pendingCategory);
    setSelectedState(pendingState);
    setSelectedCity(pendingCity);
    setSelectedUniversity(pendingUniversity);
    setSelectedHeritage(pendingHeritage);
    setShowFilters(false);
  };

  // Example options (replace with real data as needed)
  const categoryOptions = [
    { key: 'all', label: 'All' },
    { key: 'cultural', label: 'Cultural' },
    { key: 'sports', label: 'Sports' },
    { key: 'music', label: 'Music' },
    { key: 'games', label: 'Games' },
    { key: 'career', label: 'Career' },
    { key: 'wellness', label: 'Wellness' },
    { key: 'social', label: 'Social' },
  ];
  const stateOptions = ['California', 'New York', 'Texas', 'Minnesota'];
  const cityOptionsByState = {
    California: ['Palo Alto', 'Los Angeles', 'San Francisco'],
    'New York': ['New York City', 'Buffalo'],
    Texas: ['Austin', 'Houston'],
    Minnesota: ['Minneapolis', 'St. Paul'],
  };
  const universityOptions = [
    'Stanford University',
    'Harvard University',
    'UT Austin',
    'UMN',
  ];
  const heritageOptions = [
    'South Asian',
    'East Asian',
    'African',
    'Latino',
    'European',
    'Middle Eastern',
    'Other',
  ];

  // Quick filter state
  const [quickFilter, setQuickFilter] = useState('all'); // 'all', 'thisWeek', 'myUniversity', 'myGroups', 'nearMe'

  // Quick filter buttons
  const quickFilters = [
    { key: 'thisWeek', label: 'This Week' },
    { key: 'myUniversity', label: 'My University' },
    { key: 'myGroups', label: 'My Groups' },
    { key: 'nearMe', label: 'Near Me' },
  ];

  // Use Tanstack Query to fetch events
  const {
    data: eventsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['events'],
    queryFn: () => getEvents(),
  });

  const events = eventsResponse?.events || [];

  const {
    data: quickEventsResponse,
    isLoading: isLoadingQuickEvents,
    error: quickEventsError,
    refetch: refetchQuickEvents,
  } = useQuery({
    queryKey: ['quick-events'],
    queryFn: () => getQuickEvents(),
  });

  const quickEvents = quickEventsResponse?.data || [];

  useEffect(() => {
    if (showHelper) {
      const timer = setTimeout(() => setShowHelper(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showHelper]);

  const filteredEvents = useMemo(() => {
    let tempEvents = [...events];

    // Filter by search query
    if (searchQuery) {
      tempEvents = tempEvents.filter(
        (event) =>
          event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // // Category filters
    // if (activeFilter === 'cultural') {
    //   tempEvents = tempEvents.filter(event =>
    //     event.category?.some(cat => [
    //       'Chinese', 'East Asian', 'Vietnamese', 'Indian', 'South Asian', 'Hindu', 'Cultural'
    //     ].includes(cat))
    //   );
    // } else if (activeFilter === 'sports') {
    //   tempEvents = tempEvents.filter(event => event.category?.includes('Sports'));
    // } else if (activeFilter === 'music') {
    //   tempEvents = tempEvents.filter(event => event.category?.includes('Music'));
    // } else if (activeFilter === 'games') {
    //   tempEvents = tempEvents.filter(event => event.category?.includes('Games'));
    // } else if (activeFilter === 'career') {
    //   tempEvents = tempEvents.filter(event => event.category?.includes('Career'));
    // } else if (activeFilter === 'wellness') {
    //   tempEvents = tempEvents.filter(event => event.category?.includes('Wellness'));
    // } else if (activeFilter === 'social') {
    //   tempEvents = tempEvents.filter(event => event.category?.includes('Social'));
    // }

    // Advanced filters from FilterSystem
    // switch (filters.filterBy) {
    //   case 'my-university':
    //     tempEvents = tempEvents.filter(event =>
    //       event.location.includes(currentUser.university) ||
    //       event.organizer?.university === currentUser.university
    //     );
    //     break;
    //   case 'my-heritage':
    //     const userHeritages = currentUser.heritage || [];
    //     if (Array.isArray(userHeritages)) {
    //       tempEvents = tempEvents.filter(event =>
    //         userHeritages.some((heritage: string) =>
    //           event.category?.some((cat: string) => cat.toLowerCase().includes(heritage.toLowerCase()))
    //         )
    //       );
    //     }
    //     break;
    //   case 'filter-by-state':
    //     if (filters.location.state) {
    //       tempEvents = tempEvents.filter(event =>
    //         event.location.includes(filters.location.state)
    //       );
    //     }
    //     if (filters.location.city) {
    //       tempEvents = tempEvents.filter(event =>
    //         event.location.toLowerCase().includes(filters.location.city.toLowerCase())
    //       );
    //     }
    //     break;
    // }

    // Filter by ethnicity/heritage
    // if (filters.ethnicity.length > 0) {
    //   tempEvents = tempEvents.filter(event =>
    //     filters.ethnicity.some(ethnicity =>
    //       event.category?.some(cat => cat.toLowerCase().includes(ethnicity.toLowerCase()))
    //     )
    //   );
    // }

    // // Filter by selected university
    // if (filters.selectedUniversity) {
    //   tempEvents = tempEvents.filter(event =>
    //     event.location.includes(filters.selectedUniversity) ||
    //     event.organizer?.university === filters.selectedUniversity
    //   );
    // }

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

  console.log(quickEvents);

  const handleCreateEvent = async (eventData: any) => {
    console.log('New Event Data:', eventData);

    try {
      // Format the data for the API
      const formattedData = {
        ...eventData,
        // Ensure date is properly serialized
        date:
          eventData.date instanceof Date
            ? eventData.date.toISOString()
            : eventData.date,
        // Keep both combined time and individual start/end time fields
        time: `${eventData.startTime} - ${eventData.endTime}`,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        // Map category properly
        categories: eventData.category || [],
        // Handle multiple images
        images: eventData.images || (eventData.image ? [eventData.image] : []),
        // Include group association if available
        groupId: eventData.groupId,
      };

      // Send the data to the backend
      const response = await fetch('http://localhost:3001/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create event:', errorData);
        throw new Error(
          `Failed to create event: ${errorData.details || response.statusText}`
        );
      }

      // Get the created event from the response
      const createdEvent = await response.json();
      console.log('Event created successfully:', createdEvent);

      // Refresh the events list using refetch
      refetch();
    } catch (error) {
      console.error('Error creating event:', error);
      // For now, just show an error - in a real app you might show a toast
    }

    setShowCreateModal(false);
  };

  // const handleRSVP = async (eventId: number) => {
  //   try {
  //     // Get current RSVP status for the event
  //     const currentEvent = events.find((event: any) => event.id === eventId)
  //     if (!currentEvent) return

  //     const newRSVPStatus = !currentEvent.isRSVPed

  //     // Send update to backend
  //     const response = await fetch(`http://localhost:3001/api/events/${eventId}/rsvp`, {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //       },
  //       body: JSON.stringify({ isRSVPed: newRSVPStatus }),
  //     })

  //     if (!response.ok) {
  //       throw new Error(`Failed to update RSVP: ${response.statusText}`)
  //     }

  //     console.log(`Successfully ${newRSVPStatus ? "RSVP'd to" : "cancelled RSVP for"} event ${eventId}`)

  //     // Refresh events after successful RSVP
  //     refetch()
  //   } catch (error) {
  //     console.error("Error updating RSVP:", error)
  //     // Refresh events to revert any potential state inconsistency
  //     refetch()
  //   }
  // }

  // const handleFiltersChange = (newFilters: FilterOptions) => {
  //   setFilters(newFilters)
  // }

  // Add state for tracking active image indexes for each event
  const [activeImageIndexes, setActiveImageIndexes] = useState<
    Record<number, number>
  >({});

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

      <View style={styles.heroSection}>
        <View style={styles.heroOverlay}>
          <View style={styles.headerContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.heroTitle}>Events</Text>
              <TouchableOpacity
                style={styles.createButtonHero}
                onPress={() => setShowCreateModal(true)}
                activeOpacity={0.7}
              >
                <PlusCircle size={28} color={theme.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.heroSubtitle}>
              Discover and participate in cultural celebrations
            </Text>
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
        </View>
      </View>

      {/* Enhanced Filter System - Always Visible */}
      {/* <View style={styles.filterSystemContainer}>
          <FilterSystem
            onFiltersChange={handleFiltersChange}
            contentType="events"
            showPresets={true}
            eventCount={filteredEvents.length}
            filterLabel={(() => {
              if (filters.filterBy === 'my-university') return 'My University';
              if (filters.filterBy === 'my-heritage') return 'My Heritage';
              if (filters.filterBy === 'filter-by-state') return 'By State';
              return 'All';
            })()}
          />
        </View> */}

      {/* {activeTab === "events" && (
        <View style={styles.filterWrapper}>
          <View style={styles.filterContainer}>
            {quickFilters.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterButton, quickFilter === f.key && styles.activeFilter]}
                onPress={() => setQuickFilter(f.key)}
              >
                <View style={styles.filterButtonContent}>
                  <Text style={[styles.filterText, quickFilter === f.key && styles.activeFilterText]}>{f.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )} */}

      {/* <Modal visible={showCategoryModal} animationType="slide" transparent onRequestClose={() => setShowCategoryModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.categoryFilterLabel}>Filter by Category</Text>
              <Text style={styles.categoryHelperText}>Select categories to filter events</Text>
              
              <ScrollView style={{ maxHeight: 300, width: '100%' }}>
                {filterOptions.map(option => (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.filterButton, selectedCategories.includes(option.key) && styles.activeFilterButton]}
                    onPress={() => toggleCategory(option.key)}
                  >
                    <Text style={[styles.filterButtonText, selectedCategories.includes(option.key) && styles.activeFilterButtonText]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <TouchableOpacity style={styles.applyFiltersButton} onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.applyFiltersButtonText}>Apply Filters</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal> */}

      <ScrollView
        style={styles.eventsList}
        contentContainerStyle={styles.eventsListContent}
        showsVerticalScrollIndicator={false}
        // onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        // scrollEventThrottle={16}
      >
        {activeTab === 'events' ? (
          // Regular Events
          <>
            {filteredEvents.map((event: Event, index: number) => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.eventCard,
                  index === 0 && styles.firstCard,
                  index === filteredEvents.length - 1 && styles.lastCard,
                ]}
                onPress={() => router.push(`/event/${event.id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.eventImageContainer}>
                  <Image
                    source={{
                      uri: event.imageUrl || 'https://via.placeholder.com/150',
                    }}
                    style={styles.eventImage}
                  />
                  <View style={styles.imageOverlay} />

                  <View style={styles.eventActions}>
                    <ShareButton
                    //@ts-ignore
                      eventId={event.id}
                      eventName={event.name}
                      style={styles.shareButton}
                    />
                  </View>
                </View>

                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {event.name}
                    </Text>
                  </View>

                  <View style={styles.eventMeta}>
                    <MapPin size={16} color="#64748B" />
                    <Text style={styles.eventMetaText} numberOfLines={1}>
                      {event.location}
                    </Text>
                  </View>

                  {event.eventTimes && event.eventTimes.length > 0 && (
                    <View style={styles.eventMeta}>
                      <Calendar size={16} color="#6366F1" />
                      <Text style={styles.eventMetaText}>
                        {formatDate(event.eventTimes[0].startTime)} at{' '}
                        {formatTime(event.eventTimes[0].startTime)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.creatorSection}>
                    <View style={styles.creatorInfo}>
                      <View style={styles.creatorAvatar}>
                        <Text style={styles.creatorInitial}>
                          {event.user.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.creatorDetails}>
                        <Text style={styles.creatorName}>
                          {event.user.name}
                        </Text>
                        <Text style={styles.creatorRole}>Event Organizer</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.statsSection}>
                    <View style={styles.statCard}>
                      <Users size={16} color="#6366F1" />
                      <Text style={styles.statText}>
                        {event.attendees || 0} attending
                      </Text>
                    </View>

                    <View style={styles.statCard}>
                      <Clock size={16} color="#F59E0B" />
                      <Text style={styles.statText}>
                        {event.eventTimes && event.eventTimes.length > 0
                          ? formatTime(event.eventTimes[0].startTime)
                          : 'TBA'}
                      </Text>
                    </View>
                  </View>

                  {/* <View style={styles.eventFooter}>
                      <View style={styles.eventAttendees}>
                        <Users size={16} color="#64748B" />
                        <Text style={styles.eventAttendeesText}>
                          {event.attendees || 0} attending
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.rsvpButton,
                          event.isRSVPed ? styles.rsvpedButton : styles.notRsvpedButton,
                        ]}
                        onPress={() => handleRSVP(event.id)}
                      >
                        <Text
                          style={[
                            styles.rsvpButtonText,
                            event.isRSVPed ? styles.rsvpedButtonText : styles.notRsvpedButtonText,
                          ]}
                        >
                          {event.isRSVPed ? 'Going' : 'RSVP'}
                        </Text>
                      </TouchableOpacity>
                    </View> */}
                </View>
              </TouchableOpacity>
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
              (quickEvent: QuickEvent, index: number) => (
                <TouchableOpacity
                  key={quickEvent.id}
                  style={[
                    styles.quickEventCard,
                    index === 0 && styles.firstCard,
                    index === filteredQuickEvents.length - 1 && styles.lastCard,
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
                        {quickEvent.time}
                      </Text>
                    </View>
                    <View style={styles.quickEventMeta}>
                      <Users size={16} color="#6366F1" />
                      <Text style={styles.quickEventMetaText}>
                        Max {quickEvent.max} people
                      </Text>
                    </View>
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
                  </View>
                </TouchableOpacity>
              )
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

  heroSection: {
    height: 140,
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
    marginBottom: 20,
    lineHeight: 22,
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
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 52,
    gap: 12,
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
  filterButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
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

  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
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
  quickEventCreator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  firstCard: {
    marginTop: 0,
  },
  lastCard: {
    marginBottom: 0,
  },

  eventImageContainer: {
    height: 120,
    position: 'relative',
    backgroundColor: '#6366F1',
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#94A3B8',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },

  eventActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  shareButton: {
    padding: 4,
  },

  eventContent: {
    padding: 20,
  },
  eventHeader: {
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 24,
    letterSpacing: -0.3,
  },

  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  eventMetaText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
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

  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
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
});
