import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, Plus, MapPin, Calendar, Users, Heart, Star, Clock } from 'lucide-react-native';
import { ShareButton } from '@/components/ui/ShareButton';
import { FilterSystem } from '@/components/FilterSystem';
import { mockEvents, currentUser, MockEvent } from '@/data/mockData';
import { CreateEventModal } from '@/components/CreateEventModal';
import placeholderImg from '@/assets/images/icon.png';
import { theme, spacing, borderRadius, typography } from '@/components/theme';

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

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState(mockEvents);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    location: { country: '', state: '', city: '' },
    university: '',
    filterBy: 'all',
    ethnicity: [],
    selectedUniversity: ''
  });

  const stateOptions = ['California', 'New York', 'Texas', 'Minnesota'];
  const cityOptions = ['Palo Alto', 'New York City', 'Austin', 'Minneapolis'];
  const universityOptions = ['Stanford University', 'Harvard University', 'UT Austin', 'UMN'];

  const filteredEvents = useMemo(() => {
    let tempEvents = [...events];

    // Filter by search query
    if (searchQuery) {
      tempEvents = tempEvents.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        tempEvents = tempEvents.filter(event => 
          userHeritages.some(heritage => 
            event.category?.some(cat => cat.toLowerCase().includes(heritage.toLowerCase()))
          )
        );
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

  const handleCreateEvent = (eventData: any) => {
    console.log("New Event Data:", eventData);
    setEvents(prevEvents => {
        // Calculate a truly unique ID by finding the maximum existing ID and incrementing it
        const maxId = prevEvents.length > 0 ? Math.max(...prevEvents.map(event => event.id)) : 0;
        const newId = maxId + 1;
        return [{...eventData, id: newId, attendees: 1, isRSVPed: true }, ...prevEvents];
    });
    setShowCreateModal(false);
  };

  const handleRSVP = (eventId: number) => {
    setEvents(prevEvents => 
      prevEvents.map(event => event.id === eventId ? {...event, isRSVPed: !event.isRSVPed, attendees: event.isRSVPed ? event.attendees - 1 : event.attendees + 1} : event)
    );
  };

  const generateEventShareContent = (event: MockEvent) => {
    return {
      title: `${event.title} - Culture Connect`,
      message: `Join me at ${event.title}!\n\n📅 ${event.date} at ${event.time}\n📍 ${event.location}\n\nDiscover amazing cultural events on Culture Connect!`,
      url: `https://cultureconnect.app/event/${event.id}`
    };
  };
  
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <SafeAreaView style={styles.container}>
        <CreateEventModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={handleCreateEvent} />
        <View style={styles.header}>
            <Text style={styles.title}>Cultural Events</Text>
            <Text style={styles.subtitle}>Discover and participate in cultural celebrations</Text>
        </View>

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
        
        <View style={styles.filterBar}>
          {filterOptions.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.filterButton, activeFilter === opt.key && styles.activeFilter]}
              onPress={() => setActiveFilter(opt.key)}
            >
              <Text style={[styles.filterButtonText, activeFilter === opt.key && styles.activeFilterText]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Enhanced Filter System */}
        <View style={styles.filterSystemContainer}>
          <FilterSystem
            onFiltersChange={handleFiltersChange}
            contentType="events"
            showPresets={true}
          />
        </View>

        <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>{filteredEvents.length} events found</Text>
        </View>

        <ScrollView style={styles.eventsList} contentContainerStyle={{paddingHorizontal: 20}} showsVerticalScrollIndicator={false}>
            {filteredEvents.map((event) => (
                <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => router.push(`/event/${event.id}`)}>
                    <View style={styles.eventImageContainer}>
                        <Image source={{ uri: event.image || undefined }} defaultSource={placeholderImg} style={styles.eventImage} />
                        <View style={styles.eventActions}>
                            <ShareButton
                                {...generateEventShareContent(event)}
                                size={16}
                                color={theme.white}
                                style={styles.shareButton}
                            />
                        </View>
                    </View>
                    <View style={styles.eventContent}>
                        <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                        <View style={styles.eventMeta}>
                            <Calendar size={12} color={theme.gray500} />
                            <Text style={styles.eventMetaText}>{event.date}</Text>
                        </View>
                        <View style={styles.eventMeta}>
                            <Clock size={12} color={theme.gray500} />
                            <Text style={styles.eventMetaText}>{event.time}</Text>
                        </View>
                        <View style={styles.eventMeta}>
                            <MapPin size={12} color={theme.gray500} />
                            <Text style={styles.eventMetaText} numberOfLines={1}>{event.location}</Text>
                        </View>
                        <View style={styles.eventFooter}>
                            <View style={styles.eventAttendees}>
                                <Users size={12} color={theme.gray500} />
                                <Text style={styles.eventAttendeesText}>{event.attendees} going</Text>
                            </View>
                            <TouchableOpacity
                            style={[
                                styles.rsvpButton,
                                event.isRSVPed ? styles.rsvpedButton : styles.notRsvpedButton
                            ]}
                            onPress={(e) => {
                                e.stopPropagation();
                                handleRSVP(event.id);
                            }}
                            >
                            <Text style={[
                                styles.rsvpButtonText,
                                event.isRSVPed ? styles.rsvpedButtonText : styles.notRsvpedButtonText
                            ]}>
                                {event.isRSVPed ? "RSVP'd" : 'RSVP'}
                            </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.lg, alignItems: 'center' },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: 'bold', color: theme.textPrimary, marginBottom: spacing.sm, fontFamily: typography.fontFamily.bold, textAlign: 'left', alignSelf: 'flex-start' },
  subtitle: { fontSize: typography.fontSize.md, color: theme.textSecondary, textAlign: 'left', alignSelf: 'flex-start', lineHeight: typography.fontSize.md * typography.lineHeight.normal },
  searchContainer: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.md },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.white, borderRadius: borderRadius.card, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderWidth: 1, borderColor: theme.border, gap: spacing.md },
  searchInput: { flex: 1, fontSize: typography.fontSize.base, color: theme.textPrimary, fontFamily: typography.fontFamily.regular },
  createButton: { width: 48, height: 48, borderRadius: borderRadius.lg, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
    marginLeft: 36, // aligns with search input start
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
  resultsHeader: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
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
    width: '100%', // Ensure each card takes full width
  },
  eventImageContainer: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: borderRadius.card,
    borderBottomLeftRadius: borderRadius.card,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
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
    marginBottom: spacing.lg,
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
});