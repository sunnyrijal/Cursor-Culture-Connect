import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGroups } from '@/data/groupContext';
import { useEvents } from '@/data/eventContext';
import { Button } from '@/components/ui/Button';
import { router } from 'expo-router';
import { theme } from '@/components/theme';

export default function DebugEventsScreen() {
  const { groups, userGroups, loading: groupsLoading, error: groupsError, fetchGroups, fetchUserGroups } = useGroups();
  const { events, loading: eventsLoading, error: eventsError, createEvent, fetchEvents } = useEvents();
  
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [eventTitle, setEventTitle] = useState('Debug Test Event');
  const [eventDescription, setEventDescription] = useState('This is a test event created from the debug page');
  const [eventDate, setEventDate] = useState('2025-07-30');
  const [eventTime, setEventTime] = useState('14:00');
  const [eventLocation, setEventLocation] = useState('Test Location');
  
  useEffect(() => {
    fetchGroups();
    fetchUserGroups();
    fetchEvents();
  }, []);
  
  const handleCreateEvent = async () => {
    if (!selectedGroupId) {
      Alert.alert('Error', 'Please select a group first');
      return;
    }
    
    try {
      // Format numeric fields properly
      const maxAttendees = null; // Set to null instead of empty string
      const price = 0; // Set to 0 instead of empty string
      
      const eventData = {
        title: eventTitle,
        description: eventDescription,
        date: eventDate,
        time: eventTime,
        location: eventLocation,
        groupId: selectedGroupId,
        category: ['Test'],
        maxAttendees,
        price
      };
      
      console.log('Creating test event with data:', eventData);
      
      const result = await createEvent(eventData);
      
      console.log('Event created successfully:', result);
      Alert.alert('Success', 'Event created successfully!');
    } catch (error: any) {
      console.error('Failed to create event:', error);
      
      // Extract more detailed error information
      const errorDetails = error.message || 'Unknown error';
      let fullErrorMessage = `Failed to create event: ${errorDetails}`;
      
      if (error.details) {
        fullErrorMessage += `\n\nDetails: ${error.details}`;
      }
      
      Alert.alert('Error', fullErrorMessage);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Event Debugging</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Groups Status</Text>
          <Text>Groups loaded: {groups.length}</Text>
          <Text>User groups: {userGroups.length}</Text>
          <Text>Loading: {groupsLoading ? 'Yes' : 'No'}</Text>
          <Text>Error: {groupsError || 'None'}</Text>
          
          <TouchableOpacity style={styles.refreshButton} onPress={() => { fetchGroups(); fetchUserGroups(); }}>
            <Text style={styles.refreshButtonText}>Refresh Groups</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Group</Text>
          <ScrollView style={styles.groupList} horizontal>
            {userGroups.map(group => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.groupItem,
                  selectedGroupId === group.id && styles.selectedGroupItem
                ]}
                onPress={() => setSelectedGroupId(group.id)}
              >
                <Text style={styles.groupItemText}>{group.name}</Text>
              </TouchableOpacity>
            ))}
            {userGroups.length === 0 && !groupsLoading && (
              <Text style={styles.noGroupsText}>No groups found. You need to join or create a group first.</Text>
            )}
          </ScrollView>
          
          <Text style={styles.selectedText}>
            Selected Group: {selectedGroupId ? userGroups.find(g => g.id === selectedGroupId)?.name || 'Unknown' : 'None'}
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Data</Text>
          
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={eventTitle}
            onChangeText={setEventTitle}
            placeholder="Event Title"
          />
          
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={eventDescription}
            onChangeText={setEventDescription}
            placeholder="Event Description"
            multiline
          />
          
          <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={eventDate}
            onChangeText={setEventDate}
            placeholder="YYYY-MM-DD"
          />
          
          <Text style={styles.label}>Time</Text>
          <TextInput
            style={styles.input}
            value={eventTime}
            onChangeText={setEventTime}
            placeholder="HH:MM"
          />
          
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={eventLocation}
            onChangeText={setEventLocation}
            placeholder="Event Location"
          />
        </View>
        
        <Button 
          title="Create Test Event" 
          onPress={handleCreateEvent} 
          disabled={!selectedGroupId || eventsLoading}
        />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Events Status</Text>
          <Text>Events loaded: {events.length}</Text>
          <Text>Loading: {eventsLoading ? 'Yes' : 'No'}</Text>
          <Text>Error: {eventsError || 'None'}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Events</Text>
          {events.slice(0, 3).map(event => (
            <View key={event.id} style={styles.eventItem}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text>{event.date} - {event.time}</Text>
              <Text>{event.location}</Text>
            </View>
          ))}
          {events.length === 0 && !eventsLoading && (
            <Text>No events found</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: theme.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: theme.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: theme.textPrimary,
  },
  refreshButton: {
    marginTop: 8,
    backgroundColor: theme.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  refreshButtonText: {
    color: theme.white,
    fontWeight: '500',
  },
  groupList: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  groupItem: {
    backgroundColor: theme.gray100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedGroupItem: {
    backgroundColor: theme.primary,
  },
  groupItemText: {
    color: theme.textPrimary,
  },
  noGroupsText: {
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
  selectedText: {
    marginTop: 8,
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    marginTop: 12,
    color: theme.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.white,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  eventItem: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  eventTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
}); 