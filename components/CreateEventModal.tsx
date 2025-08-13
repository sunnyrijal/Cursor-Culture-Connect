import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal, Platform, ActivityIndicator, Image } from 'react-native';
import { X, Calendar, Clock, MapPin, Users, DollarSign, GraduationCap, ChevronDown, Check, CircleAlert as AlertCircle, Globe, Lock, Image as ImageIcon, Plus } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { theme, spacing, typography, borderRadius } from './theme';
// Import currentUser but not mockGroups
import { currentUser } from '@/data/mockData';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => void;
}

// Define the Group interface
interface Group {
  id: number;
  name: string;
  president_id?: string | number;
  is_joined?: boolean; // for compatibility with existing code
}

const categories = [
  'Cultural Celebration', 'Food & Culture', 'Workshop', 'Performance', 'Academic', 'Social',
  'Religious', 'Arts', 'Music', 'Dance', 'Language Exchange', 'Networking', 'Sports', 'Community Service'
];

export function CreateEventModal({ visible, onClose, onSubmit }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    startTime: '',
    endTime: '',
    location: '',
    category: [],
    maxAttendees: '',
    price: '',
    isPublic: true,
    universityOnly: false,
    allowedUniversity: '',
    groupId: null as number | null,
    // Add images array for multiple images
    images: [] as string[],
  });

  // Add state for groups from database
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);
  
  // Add state for image management
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(new Date().getMonth());
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear());

  // Reset form when modal is closed
  useEffect(() => {
    if (!visible) {
      setFormData({
        title: '',
        description: '',
        date: new Date(),
        startTime: '',
        endTime: '',
        location: '',
        category: [],
        maxAttendees: '',
        price: '',
        isPublic: true,
        universityOnly: false,
        allowedUniversity: '',
        groupId: null,
        images: [],
      });
      setCurrentImageUrl('');
    }
  }, [visible]);

  // Fetch groups from API when modal is opened
  useEffect(() => {
    if (visible) {
      fetchGroups();
    }
  }, [visible]);

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      setGroupError(null);
      
      console.log('Fetching groups from API...');
      const response = await fetch('http://localhost:3001/api/groups');
      
      if (!response.ok) {
        console.error('Error response from groups API:', response.status, response.statusText);
        throw new Error(`Failed to fetch groups: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched groups:', data, 'Count:', data.length);
      
      // Add is_joined property for compatibility with existing code
      const processedGroups = data.map((group: any) => ({
        ...group,
        is_joined: true // Assuming all returned groups are joined by the user
      }));
      
      setGroups(processedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroupError('Failed to load groups');
    } finally {
      setLoadingGroups(false);
    }
  };
  
  const hasPermission = useMemo(() => {
    if (!formData.groupId) return true;
    const group = groups.find(g => g.id === formData.groupId);
    if (!group) return false;
    // Check if current user is the president
    return group.president_id === currentUser.id;
  }, [formData.groupId, groups]);

  // Add an image URL to the event images array
  const addImageUrl = () => {
    if (!currentImageUrl.trim()) {
      Alert.alert("Invalid URL", "Please enter a valid image URL");
      return;
    }
    
    setFormData({
      ...formData,
      images: [...formData.images, currentImageUrl.trim()]
    });
    
    setCurrentImageUrl('');
  };

  // Remove an image from the images array
  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      images: newImages
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.startTime || !formData.endTime || !formData.location) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    if (formData.groupId && !hasPermission) {
      Alert.alert("Permission Denied", "You are not authorized to create an event for this group. Your submission will be sent for approval.");
      return;
    }
    
    // Make sure to include at least one image for backward compatibility
    const eventData = {
      ...formData,
      image: formData.images.length > 0 ? formData.images[0] : null,
    };
    
    onSubmit(eventData);
    onClose();
  };
  
  if (!visible) return null;
  
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();
  const monthName = new Date(displayYear, displayMonth).toLocaleString('default', { month: 'long' });
  const userGroups = groups.filter(g => g.is_joined);

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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.gray500} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.field}>
              <Text style={styles.label}>Event Title *</Text>
              <TextInput style={styles.input} value={formData.title} onChangeText={text => setFormData({...formData, title: text})} placeholder="e.g. Diwali Celebration"/>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Description *</Text>
              <TextInput style={[styles.input, styles.textArea]} value={formData.description} onChangeText={text => setFormData({...formData, description: text})} placeholder="Describe your event" multiline/>
            </View>
            
            {/* Images section */}
            <View style={styles.field}>
              <Text style={styles.label}>Event Images</Text>
              <View style={styles.imageInputContainer}>
                <View style={styles.inputWithIcon}>
                  <ImageIcon size={16} color={theme.gray500} />
                  <TextInput
                    style={styles.inputText}
                    value={currentImageUrl}
                    onChangeText={setCurrentImageUrl}
                    placeholder="Enter image URL"
                  />
                </View>
                <TouchableOpacity style={styles.addImageButton} onPress={addImageUrl}>
                  <Plus size={20} color={theme.white} />
                </TouchableOpacity>
              </View>
              
              {formData.images.length > 0 && (
                <View style={styles.imagesPreview}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {formData.images.map((url, index) => (
                      <View key={`image-${index}`} style={styles.imagePreviewContainer}>
                        <Image source={{ uri: url }} style={styles.imagePreview} />
                        <TouchableOpacity 
                          style={styles.removeImageButton} 
                          onPress={() => removeImage(index)}
                        >
                          <X size={16} color={theme.white} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            
            {/* Fix date field for mobile */}
            <View style={styles.field}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <View style={styles.inputWithIcon}>
                  <Calendar size={16} color={theme.gray500} />
                  <Text style={styles.inputText}>{formData.date.toLocaleDateString()}</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            {/* Fix time fields for mobile */}
            <View style={styles.timeFieldsContainer}>
              <View style={styles.timeField}>
                <Text style={styles.label}>Start Time *</Text>
                <View style={styles.inputWithIcon}>
                  <Clock size={16} color={theme.gray500} />
                  <TextInput
                    style={styles.inputText}
                    value={formData.startTime}
                    onChangeText={(text) => setFormData({ ...formData, startTime: text })}
                    placeholder="e.g., 7:40 AM"
                  />
                </View>
              </View>
              
              <View style={styles.timeField}>
                <Text style={styles.label}>End Time *</Text>
                <View style={styles.inputWithIcon}>
                  <Clock size={16} color={theme.gray500} />
                  <TextInput
                    style={styles.inputText}
                    value={formData.endTime}
                    onChangeText={(text) => setFormData({ ...formData, endTime: text })}
                    placeholder="e.g., 10:00 AM"
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
                  />
                </View>
            </View>
            <View style={styles.field}>
                <Text style={styles.label}>Associated Group</Text>
                 <TouchableOpacity onPress={() => setShowGroupPicker(true)}>
                    <View style={styles.inputWithIcon}>
                        <Users size={16} color={theme.gray500} />
                        {loadingGroups ? (
                            <View style={styles.inlineLoadingContainer}>
                                <ActivityIndicator size="small" color={theme.gray400} />
                                <Text style={[styles.inputText, {color: theme.gray400}]}>Loading groups...</Text>
                            </View>
                        ) : (
                            <Text style={[styles.inputText, !formData.groupId && {color: theme.gray400}]}>
                                {formData.groupId ? groups.find(g=>g.id === formData.groupId)?.name : "Select a group (optional)"}
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
                <TouchableOpacity style={[styles.visibilityButton, formData.isPublic && !formData.universityOnly && styles.visibilityButtonActive]} onPress={() => setFormData(f => ({...f, isPublic: true, universityOnly: false}))}>
                    <Globe size={16} color={formData.isPublic && !formData.universityOnly ? theme.white : theme.primary}/>
                    <Text style={[styles.visibilityButtonText, formData.isPublic && !formData.universityOnly && styles.visibilityButtonTextActive]}>Public</Text>
                </TouchableOpacity>
                 <TouchableOpacity style={[styles.visibilityButton, formData.universityOnly && styles.visibilityButtonActive]} onPress={() => setFormData(f => ({...f, isPublic: false, universityOnly: true}))}>
                    <GraduationCap size={16} color={formData.universityOnly ? theme.white : theme.primary}/>
                    <Text style={[styles.visibilityButtonText, formData.universityOnly && styles.visibilityButtonTextActive]}>University Only</Text>
                </TouchableOpacity>
              </View>
            </View>
        </ScrollView>
        <View style={styles.actions}>
            <Button title="Cancel" variant="outline" onPress={onClose} style={styles.actionButton}/>
            <Button title="Create Event" onPress={handleSubmit} style={styles.actionButton} />
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
              
              {loadingGroups ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <Text style={styles.loadingText}>Loading groups...</Text>
                </View>
              ) : groupError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{groupError}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={fetchGroups}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : userGroups.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No groups found.</Text>
                  <Text style={styles.emptySubText}>You must create or join a group before associating it with an event.</Text>
                </View>
              ) : (
                <ScrollView>
                  {userGroups.map(group => (
                    <TouchableOpacity 
                      key={group.id} 
                      style={styles.groupPickerItem} 
                      onPress={() => {
                        setFormData({...formData, groupId: group.id});
                        setShowGroupPicker(false);
                      }}
                    >
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
  row: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  halfField: { flex: 1, minWidth: '45%' },
  label: { fontSize: 16, fontWeight: '600', color: theme.textPrimary, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 16, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  inputWithIcon: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: theme.border, 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    height: 58,
    width: '100%'
  },
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
  timeFieldsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  timeField: {
    flex: 1,
    minWidth: Platform.OS === 'ios' ? '45%' : '40%',
    marginBottom: 8,
  },
  loadingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: theme.gray500,
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: theme.warning,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: theme.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: theme.gray500,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  emptySubText: {
    color: theme.gray400,
    fontSize: 14,
    textAlign: 'center',
  },
  inlineLoadingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    gap: 8,
  },
  // New styles for image handling
  imageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  addImageButton: {
    backgroundColor: theme.primary,
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagesPreview: {
    marginTop: 10,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginRight: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});