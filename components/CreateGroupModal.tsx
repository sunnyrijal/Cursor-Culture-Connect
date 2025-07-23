// sunnyrijal/cursor-culture-connect/Cursor-Culture-Connect-dev4/components/CreateGroupModal.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal, Switch } from 'react-native';
import { X, Globe, Lock, GraduationCap, ChevronDown, Check, AlertCircle, Calendar, Clock, MapPin, PlusCircle, MinusCircle } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { theme, spacing, typography, borderRadius } from './theme';
import { Meeting } from '@/types/group';

interface CreateGroupModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (groupData: any) => void;
}

export function CreateGroupModal({ isVisible, onClose, onSubmit }: CreateGroupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '', // Add category to the form state
    isPublic: true,
    universityOnly: false,
    allowedUniversity: '',
  });

  const [meetings, setMeetings] = useState<Meeting[]>([{ date: '', time: '', location: ''}]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [useLocation, setUseLocation] = useState(true);
  const detectedLocation = "Detected Location"; // Placeholder for location detection

  const handleAddMeeting = () => {
      setMeetings([...meetings, { date: '', time: '', location: '' }]);
  };
  
  const handleRemoveMeeting = (index: number) => {
      const newMeetings = meetings.filter((_, i) => i !== index);
      setMeetings(newMeetings);
  };

  const handleMeetingChange = (index: number, field: keyof Meeting, value: string) => {
      const newMeetings = [...meetings];
      newMeetings[index][field] = value;
      setMeetings(newMeetings);
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!useLocation && (!city || !state)) {
      Alert.alert('Please enter both city and state, or enable location.');
      setIsSubmitting(false); // Make sure to stop submitting on error
      return;
    }
    // Add validation for required fields
    if (!formData.name || !formData.description || !formData.category) {
      Alert.alert('Please fill in all required fields: Name, Description, and Category.');
      setIsSubmitting(false);
      return;
    }
    const groupData = {
      ...formData,
      meetings,
      location: useLocation ? detectedLocation : `${city}, ${state}`,
    };
    onSubmit(groupData);
    setIsSubmitting(false);
    onClose();
  };


  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create New Group</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.gray500} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.field}>
            <Text style={styles.label}>Group Name *</Text>
            <TextInput style={styles.input} value={formData.name} onChangeText={text => setFormData({...formData, name: text})} placeholder="Enter group name" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Description *</Text>
            <TextInput style={[styles.input, styles.textArea]} value={formData.description} onChangeText={text => setFormData({...formData, description: text})} placeholder="Describe your group" multiline/>
          </View>
          {/* Add Category Input */}
          <View style={styles.field}>
            <Text style={styles.label}>Category *</Text>
            <TextInput style={styles.input} value={formData.category} onChangeText={text => setFormData({...formData, category: text})} placeholder="e.g., Cultural, Academic, Sports" />
          </View>

          <Text style={styles.sectionTitle}>Meeting Details (Optional)</Text>
          
          {meetings.map((meeting, index) => (
            <View key={index} style={styles.meetingContainer}>
               <View style={styles.meetingHeader}>
                 <Text style={styles.meetingTitle}>Meeting {index + 1}</Text>
                 {index > 0 && (
                    <TouchableOpacity onPress={() => handleRemoveMeeting(index)}>
                        <MinusCircle color={theme.error} size={20} />
                    </TouchableOpacity>
                 )}
               </View>

              <View style={styles.field}>
                <Text style={styles.label}>Meeting Day/Date</Text>
                <View style={styles.inputWithIcon}>
                  <Calendar size={16} color={theme.gray500} />
                  <TextInput
                    style={styles.inputText}
                    value={meeting.date}
                    onChangeText={(text) => handleMeetingChange(index, 'date', text)}
                    placeholder="e.g., Every Tuesday, First Monday"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Meeting Time</Text>
                <View style={styles.inputWithIcon}>
                  <Clock size={16} color={theme.gray500} />
                  <TextInput
                    style={styles.inputText}
                    value={meeting.time}
                    onChangeText={(text) => handleMeetingChange(index, 'time', text)}
                    placeholder="e.g., 7:00 PM"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Meeting Location</Text>
                <View style={styles.inputWithIcon}>
                  <MapPin size={16} color={theme.gray500} />
                  <TextInput
                    style={styles.inputText}
                    value={meeting.location}
                    onChangeText={(text) => handleMeetingChange(index, 'location', text)}
                    placeholder="e.g., Student Union Room 210"
                  />
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addMeetingButton} onPress={handleAddMeeting}>
            <PlusCircle color={theme.primary} size={20} />
            <Text style={styles.addMeetingText}>Add Another Meeting Time</Text>
          </TouchableOpacity>

          <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>Location</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Switch value={useLocation} onValueChange={setUseLocation} />
              <Text style={{ marginLeft: 8 }}>Use my current location</Text>
            </View>
            {!useLocation && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="City"
                  value={city}
                  onChangeText={setCity}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="State"
                  value={state}
                  onChangeText={setState}
                />
              </View>
            )}
          </View>
        </ScrollView>
        <View style={styles.actions}>
            <Button title="Cancel" variant="outline" onPress={onClose} style={styles.actionButton} disabled={isSubmitting}/>
            <Button title={isSubmitting ? "Creating..." : "Create Group"} onPress={handleSubmit} style={styles.actionButton} disabled={isSubmitting}/>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: theme.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.textPrimary,
    backgroundColor: theme.white,
  },
  textArea: {
      height: 100,
      textAlignVertical: 'top'
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.white,
  },
  inputText: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: theme.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    marginTop: 24,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 16,
  },
  meetingContainer: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  meetingHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
  },
  meetingTitle: {
      fontSize: 16,
      fontWeight: 'bold',
  },
  addMeetingButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.primary,
      borderStyle: 'dashed',
      gap: 8,
  },
  addMeetingText: {
      color: theme.primary,
      fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});