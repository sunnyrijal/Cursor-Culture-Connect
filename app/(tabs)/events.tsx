import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, Animated, FlatList, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, Plus, MapPin, Calendar, Users, Heart, Star, Clock, LayoutGrid, List as ListIcon } from 'lucide-react-native';
import { ShareButton } from '@/components/ui/ShareButton';
import { FilterSystem } from '@/components/FilterSystem';
import { currentUser } from '@/data/mockData';
import { CreateEventModal } from '@/components/CreateEventModal';
// Update placeholder image to use require instead of import
const placeholderImg = require('@/assets/images/icon.png');
import { theme, spacing, borderRadius, typography, neomorphColors } from '@/components/theme';
import { useQuery } from '@tanstack/react-query';
import { getEvents } from '@/contexts/event.api';

// Add import for date formatting
import { format } from 'date-fns';

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
  filterBy: 'all' | 'public' | 'private' | 'my-university' | 'my-heritage' | 'filter-by-state';
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
    selectedUniversity: ''
  });
  const [showHelper, setShowHelper] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedHeritage, setSelectedHeritage] = useState('');

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
  const universityOptions = ['Stanford University', 'Harvard University', 'UT Austin', 'UMN'];
  const heritageOptions = ['South Asian', 'East Asian', 'African', 'Latino', 'European', 'Middle Eastern', 'Other'];

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
    refetch
  } = useQuery({
    queryKey: ['events'],
    queryFn: () => getEvents(),
  });

  const events = eventsResponse?.events || [];

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
      tempEvents = tempEvents.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filters
    if (activeFilter === 'cultural') {
      tempEvents = tempEvents.filter(event =>
        event.category?.some(cat => [
          'Chinese', 'East Asian', 'Vietnamese', 'Indian', 'South Asian', 'Hindu', 'Cultural'
        ].includes(cat))
      );
    } else if (activeFilter === 'sports') {
      tempEvents = tempEvents.filter(event => event.category?.includes('Sports'));
    } else if (activeFilter === 'music') {
      tempEvents = tempEvents.filter(event => event.category?.includes('Music'));
    } else if (activeFilter === 'games') {
      tempEvents = tempEvents.filter(event => event.category?.includes('Games'));
    } else if (activeFilter === 'career') {
      tempEvents = tempEvents.filter(event => event.category?.includes('Career'));
    } else if (activeFilter === 'wellness') {
      tempEvents = tempEvents.filter(event => event.category?.includes('Wellness'));
    } else if (activeFilter === 'social') {
      tempEvents = tempEvents.filter(event => event.category?.includes('Social'));
    }

    // Advanced filters from FilterSystem
    switch (filters.filterBy) {
      case 'my-university':
        tempEvents = tempEvents.filter(event =>
          event.location.includes(currentUser.university) ||
          event.organizer?.university === currentUser.university
        );
        break;
      case 'my-heritage':
        const userHeritages = currentUser.heritage || [];
        if (Array.isArray(userHeritages)) {
          tempEvents = tempEvents.filter(event =>
            userHeritages.some((heritage: string) =>
              event.category?.some((cat: string) => cat.toLowerCase().includes(heritage.toLowerCase()))
            )
          );
        }
        break;
      case 'filter-by-state':
        if (filters.location.state) {
          tempEvents = tempEvents.filter(event =>
            event.location.includes(filters.location.state)
          );
        }
        if (filters.location.city) {
          tempEvents = tempEvents.filter(event =>
            event.location.toLowerCase().includes(filters.location.city.toLowerCase())
          );
        }
        break;
    }

    // Filter by ethnicity/heritage
    if (filters.ethnicity.length > 0) {
      tempEvents = tempEvents.filter(event =>
        filters.ethnicity.some(ethnicity =>
          event.category?.some(cat => cat.toLowerCase().includes(ethnicity.toLowerCase()))
        )
      );
    }

    // Filter by selected university
    if (filters.selectedUniversity) {
      tempEvents = tempEvents.filter(event =>
        event.location.includes(filters.selectedUniversity) ||
        event.organizer?.university === filters.selectedUniversity
      );
    }

    return tempEvents;
  }, [events, searchQuery, activeFilter, filters]);

  const handleCreateEvent = async (eventData: any) => {
    console.log("New Event Data:", eventData);
    
    try {
      // Format the data for the API
      const formattedData = {
        ...eventData,
        // Ensure date is properly serialized
        date: eventData.date instanceof Date ? eventData.date.toISOString() : eventData.date,
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
          'Accept': 'application/json',
        },
        body: JSON.stringify(formattedData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create event:', errorData);
        throw new Error(`Failed to create event: ${errorData.details || response.statusText}`);
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

  const handleRSVP = async (eventId: number) => {
    try {
      // Get current RSVP status for the event
      const currentEvent = events.find(event => event.id === eventId);
      if (!currentEvent) return;
      
      const newRSVPStatus = !currentEvent.isRSVPed;
      
      // Send update to backend
      const response = await fetch(`http://localhost:3001/api/events/${eventId}/rsvp`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ isRSVPed: newRSVPStatus })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update RSVP: ${response.statusText}`);
      }
      
      console.log(`Successfully ${newRSVPStatus ? 'RSVP\'d to' : 'cancelled RSVP for'} event ${eventId}`);
      
      // Refresh events after successful RSVP
      refetch();
      
    } catch (error) {
      console.error('Error updating RSVP:', error);
      // Refresh events to revert any potential state inconsistency
      refetch();
    }
  };

  const generateEventShareContent = (event: Event) => {
    const formattedDate = formatEventDate(event.date);
    const formattedTime = formatEventTime(event.time);
    
    return {
      title: `${event.title} - Culture Connect`,
      message: `Join me at ${event.title}!\n\n📅 ${formattedDate} at ${formattedTime}\n📍 ${event.location}\n\nDiscover amazing cultural events on Culture Connect!`,
      url: `https://cultureconnect.app/event/${event.id}`
    };
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Add state for tracking active image indexes for each event
  const [activeImageIndexes, setActiveImageIndexes] = useState<Record<number, number>>({});

  return (
    <SafeAreaView style={styles.container}>
        <CreateEventModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={handleCreateEvent} />
        
        {/* Sticky Header */}
        <View style={styles.stickyHeader}>
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: scrollY.interpolate({
                  inputRange: [0, 50],
                  outputRange: [1, 0],
                  extrapolate: 'clamp',
                }),
                transform: [{
                  translateY: scrollY.interpolate({
                    inputRange: [0, 50],
                    outputRange: [0, -30],
                    extrapolate: 'clamp',
                  }),
                }],
              },
            ]}
          >
            <Text style={styles.title}>TRiVO</Text>
            <Text style={styles.subtitle}>Discover and participate in cultural celebrations</Text>
          </Animated.View>

          <Animated.View
            style={[
              { zIndex: 10 },
              {
                transform: [
                  {
                    translateY: scrollY.interpolate({
                      inputRange: [0, 50],
                      outputRange: [0, -60], // Move up into title space
                      extrapolate: 'clamp',
                    }),
                  },
                ],
                opacity: scrollY.interpolate({
                  inputRange: [0, 30],
                  outputRange: [1, 1], // Always visible
                  extrapolate: 'clamp',
                }),
              },
            ]}
          >
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Search size={20} color={theme.gray400} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search events..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor={theme.gray400}
                />
              </View>
              <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
                <Plus size={20} color={theme.white} />
              </TouchableOpacity>
            </View>

            {/* Enhanced Filter System - Always Visible */}
            <View style={styles.filterSystemContainer}>
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
            </View>

            {/* Quick Filter Buttons - Always Visible */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickFilterBar} contentContainerStyle={styles.quickFilterBarContent}>
              {quickFilters.map(f => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.quickFilterButton, quickFilter === f.key && styles.quickFilterButtonActive]}
                  onPress={() => setQuickFilter(f.key)}
                >
                  <Text style={[styles.quickFilterButtonText, quickFilter === f.key && styles.quickFilterButtonTextActive]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </View>

        <Modal visible={showCategoryModal} animationType="slide" transparent onRequestClose={() => setShowCategoryModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.filterLabel}>Category</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={pendingCategory}
                  onValueChange={setPendingCategory}
                  style={styles.picker}
                >
                  {categoryOptions.map(opt => (
                    <Picker.Item key={opt.key} label={opt.label} value={opt.key} />
                  ))}
                </Picker>
              </View>
              <TouchableOpacity style={styles.applyFiltersButton} onPress={() => {
                setSelectedCategory(pendingCategory);
                setShowCategoryModal(false);
              }}>
                <Text style={styles.applyFiltersButtonText}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Show loading state */}
        {isLoading ? (
          <View style={styles.section}>
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : error ? (
          /* Show error state */
          <View style={styles.section}>
            <Text style={styles.errorText}>Failed to load events</Text>
          </View>
        ) : (
          <Animated.ScrollView 
            style={styles.eventsList} 
            contentContainerStyle={{paddingHorizontal: 20, paddingTop: 8}} 
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          >
              {filteredEvents.map((event) => {
                  // Get event time data
                  const eventTime = event.eventTimes?.[0];
                  const formattedDate = eventTime ? formatDate(eventTime.startTime) : 'TBA';
                  const formattedTime = eventTime ? formatTime(eventTime.startTime) : 'TBA';
                  
                  // Use imageUrl from API response or fallback to placeholder
                  const eventImageUrl = event.imageUrl || placeholderImg;
                  
                  // Static data for UI (since not in API response yet)
                  const attendees = event.attendees || Math.floor(Math.random() * 50) + 1; // Random for demo
                  const isRSVPed = event.isRSVPed || false;
                  
                  return (
                  <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => router.push(`/event/${event.id}`)}>
                      <View style={styles.eventImageContainer}>
                          <Image 
                            source={event.imageUrl ? { uri: event.imageUrl } : placeholderImg} 
                            style={styles.eventImage} 
                          />
                          <View style={styles.eventActions}>
                              <ShareButton
                                  title={`${event.name} - Culture Connect`}
                                  message={`Join me at ${event.name}!\n\n📅 ${formattedDate} at ${formattedTime}\n📍 ${event.location}\n\nDiscover amazing cultural events on Culture Connect!`}
                                  url={`https://cultureconnect.app/event/${event.id}`}
                                  size={16}
                                  color={theme.white}
                                  style={styles.shareButton}
                              />
                          </View>
                      </View>
                      <View style={styles.eventContent}>
                          <Text style={styles.eventTitle} numberOfLines={2}>{event.name}</Text>
                          <View style={styles.eventMeta}>
                              <Calendar size={12} color={theme.gray500} />
                              <Text style={styles.eventMetaText}>{formattedDate}</Text>
                          </View>
                          <View style={styles.eventMeta}>
                              <Clock size={12} color={theme.gray500} />
                              <Text style={styles.eventMetaText}>{formattedTime}</Text>
                          </View>
                          <View style={styles.eventMeta}>
                              <MapPin size={12} color={theme.gray500} />
                              <Text style={styles.eventMetaText} numberOfLines={1}>{event.location}</Text>
                          </View>
                          {/* Organizer info */}
                          <View style={styles.eventMeta}>
                              <Users size={12} color={theme.gray500} />
                              <Text style={styles.eventMetaText} numberOfLines={1}>by {event.user?.name}</Text>
                          </View>
                          {/* Attendees count (static for now) */}
                          {/* <View style={styles.eventAttendeesRow}>
                              <Users size={12} color={theme.gray500} />
                              <Text style={styles.eventAttendeesText}>{attendees} going</Text>
                          </View> */}
                          {/* RSVP button (static for now) */}
                          <View style={styles.eventFooter}>
                              <TouchableOpacity
                              style={[
                                  styles.rsvpButton,
                                  isRSVPed ? styles.rsvpedButton : styles.notRsvpedButton
                              ]}
                              onPress={(e) => {
                                  e.stopPropagation();
                                  // For now just toggle local state since RSVP not implemented in API
                                  console.log('RSVP clicked for event:', event.id);
                              }}
                              >
                              <Text style={[
                                  styles.rsvpButtonText,
                                  isRSVPed ? styles.rsvpedButtonText : styles.notRsvpedButtonText
                              ]}>
                                  {isRSVPed ? "RSVP'd" : 'RSVP'}
                              </Text>
                              </TouchableOpacity>
                          </View>
                      </View>
                  </TouchableOpacity>
              )})}
          </Animated.ScrollView>
        )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  section: {
    marginBottom: spacing.lg,
    backgroundColor: neomorphColors.background,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
    width: '100%',
    // Light inner border
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: theme.textSecondary,
    fontFamily: typography.fontFamily.regular,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: theme.error,
    fontFamily: typography.fontFamily.regular,
  },
  stickyHeader: { 
    backgroundColor: theme.background,
    zIndex: 1000,
    elevation: 5,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm, alignItems: 'center' },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: 'bold', color: theme.textPrimary, marginBottom: spacing.sm, fontFamily: typography.fontFamily.bold, textAlign: 'left', alignSelf: 'flex-start' },
  subtitle: { fontSize: typography.fontSize.md, color: theme.textSecondary, textAlign: 'left', alignSelf: 'flex-start', lineHeight: typography.fontSize.md * typography.lineHeight.normal },
  searchContainer: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.sm, gap: spacing.md },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.white, borderRadius: borderRadius.card, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderWidth: 1, borderColor: theme.border, gap: spacing.md },
  searchInput: { flex: 1, fontSize: typography.fontSize.base, color: theme.textPrimary, fontFamily: typography.fontFamily.regular },
  createButton: { width: 48, height: 48, borderRadius: borderRadius.lg, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
    marginLeft: 36,
    paddingLeft: 0,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: theme.white,
    borderRadius: borderRadius.card,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: borderRadius.lg, backgroundColor: theme.gray100, marginRight: spacing.sm },
  activeFilterButton: { backgroundColor: theme.primary },
  filterButtonText: { fontWeight: '600', color: theme.textSecondary, fontFamily: typography.fontFamily.medium },
  activeFilterButtonText: { color: theme.white },
  resultsHeader: {
    paddingHorizontal: spacing.lg,
    // REMOVED: marginBottom is now handled by the element above for better control.
  },
  resultsCount: { fontSize: typography.fontSize.sm, fontWeight: '500', color: theme.textSecondary, fontFamily: typography.fontFamily.medium },
  eventsList: { flex: 1, paddingHorizontal: spacing.lg },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: theme.white,
    borderRadius: borderRadius.card,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
  },
  eventImageContainer: {
    width: 120,
    height: '100%',
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: borderRadius.card,
    borderBottomLeftRadius: borderRadius.card,
    resizeMode: 'cover',
  },
  eventActions: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
  },
  shareButton: {
    padding: 2,
  },
  eventContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  eventTitle: { fontSize: typography.fontSize.lg, fontWeight: 'bold', color: theme.textPrimary, marginBottom: spacing.sm, fontFamily: typography.fontFamily.bold, textAlign: 'left', lineHeight: typography.fontSize.lg * typography.lineHeight.normal },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  eventMetaText: { fontSize: typography.fontSize.sm, color: theme.textSecondary, fontFamily: typography.fontFamily.regular },
  eventFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: theme.border },
  eventAttendees: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  eventAttendeesText: { fontSize: typography.fontSize.sm, color: theme.textSecondary, fontFamily: typography.fontFamily.regular },
  rsvpButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  notRsvpedButton: { backgroundColor: theme.primary },
  rsvpedButton: { backgroundColor: theme.white, borderWidth: 1, borderColor: theme.primary },
  rsvpButtonText: { fontSize: typography.fontSize.sm, fontWeight: '600', fontFamily: typography.fontFamily.medium },
  notRsvpedButtonText: { color: theme.white },
  rsvpedButtonText: { color: theme.primary },
  filterSystemContainer: {
    paddingHorizontal: spacing.lg,
    // REMOVED: marginBottom is now handled by the element above for better control.
  },
  activeFilter: { backgroundColor: theme.primary },
  activeFilterText: { color: theme.white },
  filterDropdownOutline: {
    borderWidth: 1,
    borderColor: theme.primary,
    backgroundColor: theme.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
    height: 36,
    minWidth: 100,
  },
  pillDropdown: {
    backgroundColor: theme.gray100,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.gray100,
    height: 36,
    paddingHorizontal: spacing.lg,
    fontWeight: '600',
    color: theme.textSecondary,
    marginRight: spacing.sm,
  },
  categoryFilterSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  categoryFilterLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.semiBold,
  },
  categoryHelperText: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily.regular,
    opacity: 0.85,
  },
  categoryFilterCard: {
    backgroundColor: theme.white,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  collapsibleFilterBarContainer: {
    paddingHorizontal: spacing.lg,
  },
  showFiltersButton: {
    backgroundColor: theme.primary,
    borderRadius: borderRadius.card,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  showFiltersButtonText: {
    color: theme.white,
    fontWeight: 'bold',
    fontSize: typography.fontSize.md,
  },
  filterCard: {
    backgroundColor: theme.white,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  filterLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: theme.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.medium,
  },
  pickerWrapper: {
    backgroundColor: theme.gray100,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  picker: {
    width: '100%',
    height: 44,
  },
  applyFiltersButton: {
    backgroundColor: theme.primary,
    borderRadius: borderRadius.card,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  applyFiltersButtonText: {
    color: theme.white,
    fontWeight: 'bold',
    fontSize: typography.fontSize.md,
  },
  quickFilterBar: {
    flexGrow: 0, // ADDED: Prevents the ScrollView from expanding to fill extra space.
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg, // ADDED: Creates consistent space below the filter bar.
    // Removed explicit padding top/bottom to let content define height
  },
  quickFilterBarContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  quickFilterButton: {
    backgroundColor: theme.gray100,
    borderRadius: borderRadius.lg,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: spacing.sm,
  },
  quickFilterButtonActive: {
    backgroundColor: theme.primary,
  },
  quickFilterButtonText: {
    color: theme.textPrimary,
    fontWeight: '600',
    fontSize: 14, // Reduce font size for better fit on mobile
  },
  quickFilterButtonTextActive: {
    color: theme.white,
    fontSize: 14, // Match reduced font size
  },
  categoryFilterTrigger: {
    backgroundColor: theme.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginLeft: spacing.md,
  },
  categoryFilterTriggerText: {
    color: theme.white,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: theme.white,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButton: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.textSecondary,
    fontWeight: 'bold',
    fontSize: typography.fontSize.md,
  },
  eventAttendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  imagePagination: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activePaginationDot: {
    backgroundColor: theme.white,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
