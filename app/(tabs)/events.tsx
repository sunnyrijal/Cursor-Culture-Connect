import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Picker } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, Plus, MapPin, Calendar, Users, Heart, Star, Clock } from 'lucide-react-native';
import { ShareButton } from '@/components/ui/ShareButton';
import { mockEvents, currentUser, MockEvent } from '@/data/mockData';
import { CreateEventModal } from '@/components/CreateEventModal';
import placeholderImg from '@/assets/images/icon.png';

const theme = {
  primary: '#6366F1',
  accent: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  background: '#FAFAFA',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray900: '#111827',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const filterOptions = [
    { key: 'all', label: 'All Events' },
    { key: 'my_heritage', label: 'My Heritage' },
    { key: 'my_university', label: 'My University' },
    { key: 'this_week', label: 'This Week' },
];

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState(mockEvents);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');

  const stateOptions = ['California', 'New York', 'Texas', 'Minnesota'];
  const cityOptions = ['Palo Alto', 'New York City', 'Austin', 'Minneapolis'];
  const universityOptions = ['Stanford University', 'Harvard University', 'UT Austin', 'UMN'];

  const filteredEvents = useMemo(() => {
    let tempEvents = [...events];

    // Category Filters
    if (activeFilter === "my_heritage" && currentUser?.heritage) {
        tempEvents = tempEvents.filter(event =>
            event.category?.some(cat => currentUser.heritage.includes(cat))
        );
    } else if (activeFilter === "my_university" && currentUser?.university) {
        tempEvents = tempEvents.filter(event => event.allowedUniversity === currentUser.university || !event.universityOnly);
    } else if (activeFilter === "this_week") {
        const now = new Date();
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(now.getDate() + 7);
        tempEvents = tempEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= now && eventDate <= oneWeekFromNow;
        });
    }

    // Search Query Filter
    if (searchQuery) {
      return tempEvents.filter(event =>
        (event.title && event.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return tempEvents;
  }, [events, searchQuery, activeFilter]);

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
          <TouchableOpacity style={[styles.filterButton, activeFilter === 'heritage' && styles.activeFilter]} onPress={() => setActiveFilter('heritage')}>
            <Text style={[styles.filterButtonText, activeFilter === 'heritage' && styles.activeFilterText]}>My Heritage</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, activeFilter === 'university' && styles.activeFilter]} onPress={() => setActiveFilter('university')}>
            <Text style={[styles.filterButtonText, activeFilter === 'university' && styles.activeFilterText]}>My University</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, activeFilter === 'week' && styles.activeFilter]} onPress={() => setActiveFilter('week')}>
            <Text style={[styles.filterButtonText, activeFilter === 'week' && styles.activeFilterText]}>This Week</Text>
          </TouchableOpacity>
          <Picker
            selectedValue={selectedState}
            onValueChange={setSelectedState}
            style={[styles.filterDropdown, styles.filterDropdownOutline]}
            itemStyle={{ fontSize: 13 }}
          >
            <Picker.Item label="State" value="" />
            {stateOptions.map(state => <Picker.Item key={state} label={state} value={state} />)}
          </Picker>
          <Picker
            selectedValue={selectedCity}
            onValueChange={setSelectedCity}
            style={[styles.filterDropdown, styles.filterDropdownOutline]}
            itemStyle={{ fontSize: 13 }}
          >
            <Picker.Item label="City" value="" />
            {cityOptions.map(city => <Picker.Item key={city} label={city} value={city} />)}
          </Picker>
          <Picker
            selectedValue={selectedUniversity}
            onValueChange={setSelectedUniversity}
            style={[styles.filterDropdown, styles.filterDropdownUniversity, styles.filterDropdownOutline]}
            itemStyle={{ fontSize: 13 }}
          >
            <Picker.Item label="University" value="" />
            {universityOptions.map(u => <Picker.Item key={u} label={u} value={u} />)}
          </Picker>
          <TouchableOpacity style={[styles.filterButton, activeFilter === 'all' && styles.activeFilter]} onPress={() => setActiveFilter('all')}>
            <Text style={[styles.filterButtonText, activeFilter === 'all' && styles.activeFilterText]}>All Events</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>{filteredEvents.length} events found</Text>
        </View>

        <ScrollView style={styles.eventsList} contentContainerStyle={{paddingHorizontal: 20}} showsVerticalScrollIndicator={false}>
            <View style={styles.eventsGrid}>
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
            </View>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: theme.textSecondary, textAlign: 'center' },
  searchContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 12 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.white, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: theme.border, gap: 12 },
  searchInput: { flex: 1, fontSize: 16, color: theme.textPrimary },
  createButton: { width: 48, height: 48, borderRadius: 12, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: theme.white,
    borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
  },
  filterDropdown: {
    width: 120,
    height: 36,
    backgroundColor: theme.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    justifyContent: 'center',
  },
  filterDropdownUniversity: {
    width: 140,
  },
  filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: theme.gray100, marginRight: 10 },
  activeFilterButton: { backgroundColor: theme.primary },
  filterButtonText: { fontWeight: '600', color: theme.textSecondary },
  activeFilterButtonText: { color: theme.white },
  resultsHeader: { paddingHorizontal: 20, marginBottom: 8 },
  resultsCount: { fontSize: 14, fontWeight: '500', color: theme.textSecondary },
  eventsList: { flex: 1, paddingHorizontal: 20 },
  eventsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 20 },
  eventCard: { width: '100%', backgroundColor: theme.white, borderRadius: 16, marginBottom: 16, overflow: 'hidden', shadowColor: theme.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, flexDirection: 'row' },
  eventImageContainer: { width: 100, height: '100%', position: 'relative' },
  eventImage: { width: '100%', height: '100%' },
  eventActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    padding: 6,
  },
  shareButton: {
    padding: 2,
  },
  eventContent: { padding: 12, flex: 1, justifyContent: 'space-between' },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 8 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  eventMetaText: { fontSize: 12, color: theme.textSecondary },
  eventFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border },
  eventAttendees: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventAttendeesText: { fontSize: 12, color: theme.textSecondary },
  rsvpButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  notRsvpedButton: { backgroundColor: theme.primary },
  rsvpedButton: { backgroundColor: theme.white, borderWidth: 1, borderColor: theme.primary },
  rsvpButtonText: { fontSize: 12, fontWeight: '600' },
  notRsvpedButtonText: { color: theme.white },
  rsvpedButtonText: { color: theme.primary },
  activeFilter: { backgroundColor: theme.primary },
  activeFilterText: { color: theme.white },
  filterDropdownOutline: {
    borderWidth: 1,
    borderColor: theme.primary,
    backgroundColor: theme.white,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 0,
    height: 36,
    minWidth: 100,
  },
});