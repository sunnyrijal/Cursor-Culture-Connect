import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal, Platform, ActivityIndicator, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { X, Calendar, Clock, MapPin, Users, ChevronDown, Check, CircleAlert as AlertCircle, Globe, GraduationCap, Image as ImageIcon, Plus, Sparkles } from 'lucide-react-native';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => void;
}

interface Group {
  id: number;
  name: string;
  president_id?: string | number;
  is_joined?: boolean;
}

const currentUser = { id: 1 };

export function CreateEventModal({ visible, onClose, onSubmit }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    startTime: '',
    endTime: '',
    location: '',
    groupId: null as number | null,
    images: [] as string[],
    isPublic: true,
    universityOnly: false,
  });

  const [groups, setGroups] = useState<Group[]>([
    { id: 1, name: 'Cultural Club', president_id: 1, is_joined: true },
    { id: 2, name: 'Tech Society', president_id: 2, is_joined: true },
    { id: 3, name: 'Art Community', president_id: 1, is_joined: true },
  ]);
  
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(new Date().getMonth());
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear());
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setFormData({
        title: '',
        description: '',
        date: new Date(),
        startTime: '',
        endTime: '',
        location: '',
        groupId: null,
        images: [],
        isPublic: true,
        universityOnly: false,
      });
      setCurrentImageUrl('');
      setFocusedField(null);
    }
  }, [visible]);

  const hasPermission = useMemo(() => {
    if (!formData.groupId) return true;
    const group = groups.find(g => g.id === formData.groupId);
    if (!group) return false;
    return group.president_id === currentUser.id;
  }, [formData.groupId, groups]);

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
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create New Event</Text>
            <Text style={styles.subtitle}>Bring your community together with an amazing event</Text>
             <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                          <X size={24} color="#64748B" />
                        </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <BlurView intensity={25} style={styles.blurView}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
                style={styles.formGradient}
              >
                {/* Event Title */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Event Title *</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'title' && styles.inputWrapperFocused,
                    formData.title && styles.inputWrapperValid
                  ]}>
                    <Sparkles size={20} color="#6366F1" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input}
                      value={formData.title}
                      onChangeText={text => setFormData({...formData, title: text})}
                      placeholder="e.g. Diwali Celebration"
                      onFocus={() => setFocusedField('title')}
                      onBlur={() => setFocusedField(null)}
                      placeholderTextColor="#9CA3AF"
                    />
                    {formData.title && (
                      <Check size={20} color="#10B981" style={styles.validIcon} />
                    )}
                  </View>
                </View>

                {/* Description */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Description *</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'description' && styles.inputWrapperFocused,
                    formData.description && styles.inputWrapperValid
                  ]}>
                    <TextInput 
                      style={[styles.input, styles.textArea]}
                      value={formData.description}
                      onChangeText={text => setFormData({...formData, description: text})}
                      placeholder="Describe your event..."
                      multiline
                      numberOfLines={4}
                      onFocus={() => setFocusedField('description')}
                      onBlur={() => setFocusedField(null)}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* Images section */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Event Images</Text>
                  <View style={styles.imageInputContainer}>
                    <View style={[styles.inputWrapper, { flex: 1 }]}>
                      <ImageIcon size={20} color="#6366F1" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={currentImageUrl}
                        onChangeText={setCurrentImageUrl}
                        placeholder="Enter image URL"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                    <TouchableOpacity style={styles.addImageButton} onPress={addImageUrl}>
                      <LinearGradient
                        colors={['#6366F1', '#8B5CF6']}
                        style={styles.addImageButtonGradient}
                      >
                        <Plus size={20} color="#FFFFFF" />
                      </LinearGradient>
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
                              <X size={16} color="#FFFFFF" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Date */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Date *</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <View style={[styles.inputWrapper, formData.date && styles.inputWrapperValid]}>
                      <Calendar size={20} color="#6366F1" style={styles.inputIcon} />
                      <Text style={styles.inputText}>{formData.date.toLocaleDateString()}</Text>
                      <Check size={20} color="#10B981" style={styles.validIcon} />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Time Fields */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.inputLabel}>Start Time *</Text>
                    <View style={[
                      styles.inputWrapper,
                      focusedField === 'startTime' && styles.inputWrapperFocused,
                      formData.startTime && styles.inputWrapperValid
                    ]}>
                      <Clock size={20} color="#6366F1" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={formData.startTime}
                        onChangeText={(text) => setFormData({ ...formData, startTime: text })}
                        placeholder="e.g., 7:40 AM"
                        onFocus={() => setFocusedField('startTime')}
                        onBlur={() => setFocusedField(null)}
                        placeholderTextColor="#9CA3AF"
                      />
                      {formData.startTime && (
                        <Check size={20} color="#10B981" style={styles.validIcon} />
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.halfWidth}>
                    <Text style={styles.inputLabel}>End Time *</Text>
                    <View style={[
                      styles.inputWrapper,
                      focusedField === 'endTime' && styles.inputWrapperFocused,
                      formData.endTime && styles.inputWrapperValid
                    ]}>
                      <Clock size={20} color="#6366F1" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={formData.endTime}
                        onChangeText={(text) => setFormData({ ...formData, endTime: text })}
                        placeholder="e.g., 10:00 AM"
                        onFocus={() => setFocusedField('endTime')}
                        onBlur={() => setFocusedField(null)}
                        placeholderTextColor="#9CA3AF"
                      />
                      {formData.endTime && (
                        <Check size={20} color="#10B981" style={styles.validIcon} />
                      )}
                    </View>
                  </View>
                </View>

                {/* Location */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Location *</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'location' && styles.inputWrapperFocused,
                    formData.location && styles.inputWrapperValid
                  ]}>
                    <MapPin size={20} color="#6366F1" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.location}
                      onChangeText={(text) => setFormData({ ...formData, location: text })}
                      placeholder="e.g., Student Union"
                      onFocus={() => setFocusedField('location')}
                      onBlur={() => setFocusedField(null)}
                      placeholderTextColor="#9CA3AF"
                    />
                    {formData.location && (
                      <Check size={20} color="#10B981" style={styles.validIcon} />
                    )}
                  </View>
                </View>

                {/* Associated Group */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Associated Group</Text>
                  <TouchableOpacity onPress={() => setShowGroupPicker(true)}>
                    <View style={styles.inputWrapper}>
                      <Users size={20} color="#6366F1" style={styles.inputIcon} />
                      <Text style={[styles.inputText, !formData.groupId && {color: '#9CA3AF'}]}>
                        {formData.groupId ? groups.find(g=>g.id === formData.groupId)?.name : "Select a group (optional)"}
                      </Text>
                      <ChevronDown size={20} color="#6366F1" />
                    </View>
                  </TouchableOpacity>
                  {formData.groupId && !hasPermission && (
                    <Text style={styles.validationText}>You are not an admin of this group. The event will be sent for approval.</Text>
                  )}
                </View>

                {/* Event Visibility */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Event Visibility</Text>
                  <View style={styles.rowContainer}>
                    <TouchableOpacity 
                      style={[
                        styles.visibilityButton, 
                        formData.isPublic && !formData.universityOnly && styles.visibilityButtonActive
                      ]} 
                      onPress={() => setFormData(f => ({...f, isPublic: true, universityOnly: false}))}
                    >
                      <LinearGradient
                        colors={formData.isPublic && !formData.universityOnly ? ['#6366F1', '#8B5CF6'] : ['transparent', 'transparent']}
                        style={styles.visibilityButtonGradient}
                      >
                        <Globe size={16} color={formData.isPublic && !formData.universityOnly ? '#FFFFFF' : '#6366F1'}/>
                        <Text style={[
                          styles.visibilityButtonText, 
                          formData.isPublic && !formData.universityOnly && styles.visibilityButtonTextActive
                        ]}>Public</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.visibilityButton, 
                        formData.universityOnly && styles.visibilityButtonActive
                      ]} 
                      onPress={() => setFormData(f => ({...f, isPublic: false, universityOnly: true}))}
                    >
                      <LinearGradient
                        colors={formData.universityOnly ? ['#6366F1', '#8B5CF6'] : ['transparent', 'transparent']}
                        style={styles.visibilityButtonGradient}
                      >
                        <GraduationCap size={16} color={formData.universityOnly ? '#FFFFFF' : '#6366F1'}/>
                        <Text style={[
                          styles.visibilityButtonText, 
                          formData.universityOnly && styles.visibilityButtonTextActive
                        ]}>University Only</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </BlurView>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.buttonGradient}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.primaryButtonText}>Create Event</Text>
                <Sparkles size={20} color="#FFFFFF" style={styles.buttonIcon} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Date Picker Modal */}
        <Modal visible={showDatePicker} transparent animationType='fade'>
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerContainer}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                style={styles.datePickerGradient}
              >
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity onPress={() => setDisplayYear(y => y - 1)}>
                    <Text style={styles.navButton}>{"<<"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setDisplayMonth(m => m > 0 ? m - 1 : 11)}>
                    <Text style={styles.navButton}>{"<"}</Text>
                  </TouchableOpacity>
                  <Text style={styles.datePickerHeaderText}>{monthName} {displayYear}</Text>
                  <TouchableOpacity onPress={() => setDisplayMonth(m => m < 11 ? m + 1 : 0)}>
                    <Text style={styles.navButton}>{">"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setDisplayYear(y => y + 1)}>
                    <Text style={styles.navButton}>{">>"}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.calendarGrid}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => 
                    <Text key={d} style={styles.calendarWeekday}>{d}</Text>
                  )}
                  {Array(firstDayOfMonth).fill(null).map((_, i) => 
                    <View key={`empty-${i}`} style={styles.calendarDay} />
                  )}
                  {[...Array(daysInMonth).keys()].map(day => (
                    <TouchableOpacity key={day} style={styles.calendarDayButton} onPress={() => {
                      const newDate = new Date(displayYear, displayMonth, day + 1);
                      setFormData({...formData, date: newDate });
                      setShowDatePicker(false);
                    }}>
                      <Text style={styles.calendarDayText}>{day + 1}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.closeDatePicker} onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.closeDatePickerText}>Close</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </Modal>

        {/* Group Picker Modal */}
        <Modal visible={showGroupPicker} transparent animationType='fade'>
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowGroupPicker(false)}
          >
            <TouchableOpacity style={styles.groupPickerContainer} activeOpacity={1}>
              <View style={styles.groupPickerContent}>
                <Text style={styles.groupPickerTitle}>Select Your Group</Text>
                
                <ScrollView style={styles.groupList}>
                  {userGroups.map(group => (
                    <TouchableOpacity 
                      key={group.id} 
                      style={styles.groupItem} 
                      onPress={() => {
                        setFormData({...formData, groupId: group.id});
                        setShowGroupPicker(false);
                      }}
                    >
                      <View style={styles.groupItemContent}>
                        <Users size={20} color="#6366F1" />
                        <Text style={styles.groupItemText}>{group.name}</Text>
                        {group.president_id === currentUser.id && (
                          <View style={styles.adminBadge}>
                            <Text style={styles.adminBadgeText}>Admin</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                <TouchableOpacity style={styles.closeGroupPicker} onPress={() => setShowGroupPicker(false)}>
                  <Text style={styles.closeGroupPickerText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F3F7',
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 40,
  },
  headerContainer: {
    marginHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 24,
  },
    closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  formContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  blurView: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  formGradient: {
    padding: 16,
    borderRadius: 24,
  },
  inputContainer: {
    marginTop:6,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F3F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#CDD2D8',
    minHeight: 56,
    shadowColor: '#CDD2D8',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    ...Platform.select({
      android: {
        elevation: 0,
      },
    }),
  },
  inputWrapperFocused: {
    borderColor: '#6366F1',
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    ...Platform.select({
      android: {
        elevation: 0,
      },
    }),
  },
  inputWrapperValid: {
    borderColor: '#10B981',
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    paddingVertical: 16,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    paddingVertical: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  validIcon: {
    marginLeft: 8,
  },
  validationText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  imageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  addImageButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  addImageButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagesPreview: {
    marginTop: 12,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginRight: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  visibilityButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor:'white',
    borderColor: 'rgba(226, 232, 240, 0.8)',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  visibilityButtonActive: {
    borderColor: '#6366F1',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  visibilityButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  visibilityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  visibilityButtonTextActive: {
    color: '#FFFFFF',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 20,
    gap: 16,
    backgroundColor: '#F0F3F7',
    borderTopWidth: 1,
    borderTopColor: '#CDD2D8',
  },
  cancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 2,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  primaryButton: {
    flex: 2,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.2,
        shadowRadius: 30,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  datePickerGradient: {
    padding: 24,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  datePickerHeaderText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  navButton: {
    fontSize: 18,
    color: '#6366F1',
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  calendarWeekday: {
    width: '14.28%',
    textAlign: 'center',
    paddingVertical: 8,
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
  },
  calendarDay: {
    width: '14.28%',
    height: 44,
  },
  calendarDayButton: {
    width: '14.28%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  calendarDayText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  closeDatePicker: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  closeDatePickerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  groupPickerContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
    borderRadius: 24,
  },
  groupPickerContent: {
    backgroundColor: '#F0F3F7',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#CDD2D8',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    ...Platform.select({
      android: {
        elevation: 0,
      },
    }),
  },
  groupPickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 24,
  },
  groupList: {
    flex: 1,
    marginBottom: 24,
  },
  groupItem: {
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#F0F3F7',
    borderWidth: 1,
    borderColor: '#CDD2D8',
    shadowColor: '#CDD2D8',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    ...Platform.select({
      android: {
        elevation: 0,
      },
    }),
  },
  groupItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  groupItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  adminBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  closeGroupPicker: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  closeGroupPickerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});