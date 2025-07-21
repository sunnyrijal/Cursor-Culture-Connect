import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal, Platform, ActivityIndicator } from 'react-native';
import { X, Calendar, Clock, MapPin, Users, DollarSign, GraduationCap, ChevronDown, Check, CircleAlert as AlertCircle, Globe, Lock } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { theme, spacing, typography, borderRadius } from './theme';
import { useAuth } from '@/data/authContext';
import { useGroups } from '@/data/groupContext';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => void;
}

const categories = [
  'Cultural Celebration', 'Food & Culture', 'Workshop', 'Performance', 'Academic', 'Social',
  'Religious', 'Arts', 'Music', 'Dance', 'Language Exchange', 'Networking', 'Sports', 'Community Service'
];

export function CreateEventModal({ visible, onClose, onSubmit }: CreateEventModalProps) {
  const { user } = useAuth();
  const { userGroups, loading: groupsLoading, fetchUserGroups } = useGroups();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    time: '',
    location: '',
    category: ['Cultural Celebration'],
    maxAttendees: '',
    price: '',
    isPublic: true,
    universityOnly: false,
    allowedUniversity: '',
    groupId: null as string | null,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(new Date().getMonth());
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track if groups have been fetched
  const [groupsFetched, setGroupsFetched] = useState(false);
  
  // Add debug logging to the effect that loads user groups
  useEffect(() => {
    if (visible) {
      setFormData({
        title: '',
        description: '',
        date: new Date(),
        time: '',
        location: '',
        category: ['Cultural Celebration'],
        maxAttendees: '',
        price: '',
        isPublic: true,
        universityOnly: false,
        allowedUniversity: '',
        groupId: null
      });
      
      console.log('Modal opened, current userGroups:', userGroups.length);
      console.log('Modal opened, groupsLoading state:', groupsLoading);
      console.log('Modal opened, groupsFetched state:', groupsFetched);
      
      // Always fetch user groups when the modal opens to ensure fresh data
      if (!groupsLoading) {
        console.log('Fetching fresh user groups for event creation');
        fetchUserGroups();
        setGroupsFetched(true);
      }
    } else {
      // Reset the flag when modal closes
      setGroupsFetched(false);
    }
  }, [visible]);

  const hasPermission = useMemo(() => {
    if (!formData.groupId) return true;
    const group = userGroups.find(g => g.id === formData.groupId);
    if (!group) return false;
    
    // Check if user is president/admin of the group
    // This would need to be updated based on your actual data structure
    return group.presidentId === user?.id || 
           (group.officers && group.officers.some(officer => officer.id === user?.id));
  }, [formData.groupId, userGroups, user]);

  const validate = () => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter an event title");
      return false;
    }
    
    if (!formData.description.trim()) {
      Alert.alert("Error", "Please enter an event description");
      return false;
    }
    
    if (!formData.time.trim()) {
      Alert.alert("Error", "Please enter an event time");
      return false;
    }
    
    if (!formData.location.trim()) {
      Alert.alert("Error", "Please enter an event location");
      return false;
    }
    
    if (!formData.groupId) {
      Alert.alert("Error", "Please select a group for this event");
      return false;
    }
    
    // Validate numeric fields
    if (formData.maxAttendees && isNaN(Number(formData.maxAttendees))) {
      Alert.alert("Error", "Maximum attendees must be a valid number");
      return false;
    }
    
    if (formData.price && isNaN(Number(formData.price))) {
      Alert.alert("Error", "Price must be a valid number");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    if (!hasPermission) {
      Alert.alert(
        "Permission Notice", 
        "You are not an admin of this group. The event will be sent for approval.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Submit Anyway", onPress: () => submitEvent() }
        ]
      );
      return;
    }
    
    submitEvent();
  };
  
  // Add more detailed submit event function
  const submitEvent = async () => {
    try {
      console.log('Starting event submission with form data:', formData);
      console.log('Selected group ID:', formData.groupId);
      console.log('Available user groups:', userGroups.map(g => ({id: g.id, name: g.name})));
      
      setIsSubmitting(true);
      
      // Format date for API
      const eventDate = formData.date.toISOString().split('T')[0];
      
      // Format numeric fields - convert empty strings to null or proper numbers
      const maxAttendees = formData.maxAttendees 
        ? parseInt(formData.maxAttendees.toString(), 10) 
        : null;
      
      const price = formData.price 
        ? parseFloat(formData.price.toString()) 
        : 0;
      
      // Prepare data for submission with properly formatted numeric fields
      const eventData = {
        ...formData,
        date: eventDate,
        maxAttendees: maxAttendees,
        price: price,
      };
      
      console.log('Submitting event with data:', eventData);
      await onSubmit(eventData);
      console.log('Event successfully submitted');
      onClose();
    } catch (error) {
      console.error('Error submitting event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!visible) return null;
  
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();
  const monthName = new Date(displayYear, displayMonth).toLocaleString('default', { month: 'long' });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create New Event</Text>
          <TouchableOpacity onPress={onClose} disabled={isSubmitting} style={styles.closeButton}>
            <X size={24} color={theme.gray500} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.field}>
              <Text style={styles.label}>Event Title *</Text>
              <TextInput 
                style={styles.input} 
                value={formData.title} 
                onChangeText={text => setFormData({...formData, title: text})} 
                placeholder="e.g. Diwali Celebration"
                editable={!isSubmitting}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Description *</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                value={formData.description} 
                onChangeText={text => setFormData({...formData, description: text})} 
                placeholder="Describe your event" 
                multiline
                editable={!isSubmitting}
              />
            </View>
            <View style={styles.row}>
                <View style={[styles.field, styles.halfField]}>
                <Text style={styles.label}>Date *</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} disabled={isSubmitting}>
                    <View style={styles.inputWithIcon}>
                    <Calendar size={16} color={theme.gray500} />
                    <Text style={[styles.inputText]}>{formData.date.toLocaleDateString()}</Text>
                    </View>
                </TouchableOpacity>
                </View>
                 <View style={[styles.field, styles.halfField]}>
                  <Text style={styles.label}>Time *</Text>
                   <View style={styles.inputWithIcon}>
                      <Clock size={16} color={theme.gray500} />
                      <TextInput
                        style={styles.inputText}
                        value={formData.time}
                        onChangeText={(text) => setFormData({ ...formData, time: text })}
                        placeholder="HH:MM AM/PM"
                        editable={!isSubmitting}
                      />
                    </View>
                </View>
            </View>
             <View style={styles.field}>
                <Text style={styles.label}>Location *</Text>
                <View style={styles.inputWithIcon}>
                  <MapPin size={16} color={theme.gray500} />
                  <TextInput
                    style={styles.inputText}
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                    placeholder="e.g., Student Union"
                    editable={!isSubmitting}
                  />
                </View>
            </View>
            <View style={styles.field}>
                <Text style={styles.label}>Associated Group *</Text>
                 <TouchableOpacity onPress={() => setShowGroupPicker(true)} disabled={isSubmitting || groupsLoading}>
                    <View style={styles.inputWithIcon}>
                        <Users size={16} color={theme.gray500} />
                        {groupsLoading ? (
                          <ActivityIndicator size="small" color={theme.primary} style={{marginLeft: 12}} />
                        ) : (
                          <Text style={[styles.inputText, !formData.groupId && {color: theme.gray400}]}>
                            {formData.groupId 
                              ? userGroups.find(g => g.id === formData.groupId)?.name || "Unknown group"
                              : "Select a group"
                            }
                          </Text>
                        )}
                    </View>
                </TouchableOpacity>
                {formData.groupId && !hasPermission && (
                    <Text style={styles.permissionWarning}>You are not an admin of this group. The event will be sent for approval.</Text>
                )}
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Event Visibility</Text>
              <View style={styles.row}>
                <TouchableOpacity 
                  style={[styles.visibilityButton, formData.isPublic && !formData.universityOnly && styles.visibilityButtonActive]} 
                  onPress={() => setFormData(f => ({...f, isPublic: true, universityOnly: false}))}
                  disabled={isSubmitting}
                >
                    <Globe size={16} color={formData.isPublic && !formData.universityOnly ? theme.white : theme.primary}/>
                    <Text style={[styles.visibilityButtonText, formData.isPublic && !formData.universityOnly && styles.visibilityButtonTextActive]}>Public</Text>
                </TouchableOpacity>
                 <TouchableOpacity 
                   style={[styles.visibilityButton, formData.universityOnly && styles.visibilityButtonActive]} 
                   onPress={() => setFormData(f => ({...f, isPublic: false, universityOnly: true}))}
                   disabled={isSubmitting}
                 >
                    <GraduationCap size={16} color={formData.universityOnly ? theme.white : theme.primary}/>
                    <Text style={[styles.visibilityButtonText, formData.universityOnly && styles.visibilityButtonTextActive]}>University Only</Text>
                </TouchableOpacity>
              </View>
            </View>
        </ScrollView>
        <View style={styles.actions}>
            <Button 
              title="Cancel" 
              variant="outline" 
              onPress={onClose} 
              style={styles.actionButton}
              disabled={isSubmitting}
            />
            <Button 
              title={isSubmitting ? "Creating..." : "Create Event"} 
              onPress={handleSubmit} 
              style={styles.actionButton}
              disabled={isSubmitting}
            >
              {isSubmitting && <ActivityIndicator color="white" />}
            </Button>
        </View>

        <Modal visible={showDatePicker} transparent animationType='fade'>
            <TouchableOpacity style={styles.datePickerOverlay} onPress={() => setShowDatePicker(false)} activeOpacity={1}>
                <View style={styles.datePickerContainer}>
                    <View style={styles.datePickerHeader}>
                        <TouchableOpacity onPress={() => setDisplayYear(y => y - 1)}><Text style={styles.navButton}>{"<<"}</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => setDisplayMonth(m => m > 0 ? m - 1 : 11)}><Text style={styles.navButton}>{"<"}</Text></TouchableOpacity>
                        <Text style={styles.datePickerHeaderText}>{monthName} {displayYear}</Text>
                        <TouchableOpacity onPress={() => setDisplayMonth(m => m < 11 ? m + 1 : 0)}><Text style={styles.navButton}>{">"}</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => setDisplayYear(y => y + 1)}><Text style={styles.navButton}>{">>"}</Text></TouchableOpacity>
                    </View>
                    <View style={styles.calendarGrid}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <Text key={d} style={styles.calendarWeekday}>{d}</Text>)}
                        {Array(firstDayOfMonth).fill(null).map((_, i) => <View key={`empty-${i}`} style={styles.calendarDay} />)}
                        {[...Array(daysInMonth).keys()].map(day => (
                            <TouchableOpacity key={day} style={styles.calendarDay} onPress={() => {
                                const newDate = new Date(displayYear, displayMonth, day + 1);
                                setFormData({...formData, date: newDate });
                                setShowDatePicker(false);
                            }}>
                                <Text>{day + 1}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
        
        <Modal visible={showGroupPicker} transparent animationType='fade'>
             <TouchableOpacity style={styles.datePickerOverlay} onPress={() => setShowGroupPicker(false)} activeOpacity={1}>
                <View style={styles.datePickerContainer}>
                    <Text style={styles.datePickerHeaderText}>Select Your Group</Text>
                    {groupsLoading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.primary} />
                        <Text style={styles.loadingText}>Loading groups...</Text>
                      </View>
                    ) : userGroups.length === 0 ? (
                      <View style={styles.emptyState}>
                        <Text>You haven't joined any groups yet</Text>
                        <Text style={styles.emptyStateSubtext}>Join a group first to create an event</Text>
                      </View>
                    ) : (
                      <ScrollView>
                        {userGroups.map(group => (
                            <TouchableOpacity key={group.id} style={styles.groupPickerItem} onPress={() => {
                                setFormData({...formData, groupId: group.id});
                                setShowGroupPicker(false);
                            }}>
                                <Text>{group.name}</Text>
                            </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: theme.border },
  title: { fontSize: 20, fontWeight: 'bold', color: theme.textPrimary },
  closeButton: { padding: 4 },
  content: { flex: 1, padding: 20 },
  field: { marginBottom: 24 },
  row: { flexDirection: 'row', gap: 16 },
  halfField: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600', color: theme.textPrimary, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 16, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 16, height: 58 },
  inputText: { flex: 1, paddingLeft: 12, fontSize: 16, color: theme.textPrimary },
  actions: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: theme.border, gap: 12 },
  actionButton: { flex: 1 },
  datePickerOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  datePickerContainer: { backgroundColor: 'white', borderRadius: 10, padding: 20, width: '90%', maxHeight: '80%' },
  datePickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  datePickerHeaderText: { fontSize: 18, fontWeight: 'bold' },
  navButton: { fontSize: 18, color: theme.primary, paddingHorizontal: 10 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  calendarWeekday: { width: '14.2%', textAlign: 'center', marginBottom: 10, color: theme.gray500, fontWeight: 'bold' },
  calendarDay: { width: '14.2%', height: 40, justifyContent: 'center', alignItems: 'center' },
  visibilityButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.border, gap: 8 },
  visibilityButtonActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  visibilityButtonText: { color: theme.textPrimary, fontWeight: '600' },
  visibilityButtonTextActive: { color: theme.white },
  permissionWarning: { color: theme.warning, marginTop: 8, fontSize: 12 },
  groupPickerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: theme.textSecondary,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateSubtext: {
    marginTop: 8,
    color: theme.textSecondary,
    fontSize: 14,
  }
});