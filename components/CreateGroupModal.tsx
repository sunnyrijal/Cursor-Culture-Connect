import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Switch,
  Platform,
  Image,
} from 'react-native';
import {
  X,
  Globe,
  Lock,
  GraduationCap,
  Check,
  MapPin,
  Sparkles,
  LocateIcon,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGroup } from '@/contexts/group.api';

import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator } from 'react-native';
import { Plus, ImageIcon } from 'lucide-react-native'; // Add ImageIcon if not imported
import { uploadFile } from '@/contexts/file.api';

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (groupData: any) => void;
}

export function CreateGroupModal({
  visible,
  onClose,
  onSubmit,
}: CreateGroupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isPrivate: false, // Default to public
    universityOnly: false,
    allowedUniversity: '',
    meetingDetails: '',
  });
  const queryClient = useQueryClient();

  // const [meetings, setMeetings] = useState<Meeting[]>([{ date: '', time: '', location: ''}]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [useLocation, setUseLocation] = useState(true);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      isPrivate: false,
      universityOnly: false,
      allowedUniversity: '',
      meetingDetails: '',
    });
    setImageUrl('');
  };

  // const handleAddMeeting = () => {
  //   setMeetings([...meetings, { date: '', time: '', location: '' }]);
  // };

  // const handleRemoveMeeting = (index: number) => {
  //   const newMeetings = meetings.filter((_, i) => i !== index);
  //   setMeetings(newMeetings);
  // };

  // const handleMeetingChange = (index: number, field: keyof Meeting, value: string) => {
  //   const newMeetings = [...meetings];
  //   newMeetings[index][field] = value;
  //   setMeetings(newMeetings);
  // };

  const uploadFileMutation = useMutation({
    mutationFn: uploadFile, // Make sure you import uploadFile function
    onSuccess: (data) => {
      console.log('File uploaded successfully:', data);
      // Set the uploaded image URL
      setImageUrl(data.url);
    },
    onError: (error) => {
      console.error('Error uploading file:', error);
      Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
    },
  });

  // 4. ADD THESE FUNCTIONS after your handleSubmit function
  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Sorry, we need camera roll permissions to make this work!'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        console.log('Asset details:', asset);

        uploadFileMutation.mutate({
          uri: asset.uri,
          type: asset.type,
          mimeType: asset.mimeType,
          fileName: asset.fileName || 'image.jpg',
        });
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Error', `Failed to pick image: ${error.message}`);
    }
  };

  const removeImage = () => {
    setImageUrl('');
  };

  const createGroupMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: (data, variables) => {
      console.log('Group created successfully:', data);

      queryClient.invalidateQueries({ queryKey: ['counts'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });

      Alert.alert('Success', 'Group created successfully!');

      onSubmit(variables);
      setIsSubmitting(false);
      resetForm();
      // Close modal
      onClose();
    },
    onError: (error: any) => {
      console.error('Error creating Group:', error);
      setIsSubmitting(false);

      // Show user-friendly error message
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create event. Please try again.';
      Alert.alert('Error', errorMessage);
    },
  });

  const handleSubmit = async () => {
    // Alert.alert('Error', 'Please fill in all required fields.');
    // return;
    setIsSubmitting(true);
    const groupData = {
      name: formData.name,
      description: formData.description,
      isPrivate: formData.isPrivate,
      imageUrl: imageUrl,
      meetingDetails: formData.meetingDetails,
    };
    console.log(groupData);
    createGroupMutation.mutate(groupData);
    return;

    // setIsSubmitting(true);
    // await new Promise(resolve => setTimeout(resolve, 1000));

    // if (!useLocation && (!city || !state)) {
    //   Alert.alert('Error', 'Please enter both city and state, or enable location.');
    //   setIsSubmitting(false);
    //   return;
    // }

    // const groupData = {
    //   ...formData,
    //   // meetings,
    //   imageUrl,
    //   location: useLocation ? 'Current Location' : `${city}, ${state}`,
    // };

    // onSubmit(groupData);
    // setIsSubmitting(false);
    // onClose();
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    icon?: React.ReactNode,
    multiline = false,
    required = false
  ) => {
    const inputKey = `${label.toLowerCase().replace(/\s+/g, '_')}`;
    const isFocused = focusedInput === inputKey;
    const hasValue = value.length > 0;

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {label} {required && <Text style={{ color: '#EF4444' }}>*</Text>}
        </Text>
        <View
          style={[
            styles.inputWrapper,
            isFocused && styles.inputWrapperFocused,
            hasValue && styles.inputWrapperValid,
          ]}
        >
          {icon && <View style={styles.inputIcon}>{icon}</View>}
          <TextInput
            style={[styles.inputText, multiline && styles.textArea]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            multiline={multiline}
            onFocus={() => setFocusedInput(inputKey)}
            onBlur={() => setFocusedInput(null)}
          />
          {hasValue && (
            <View style={styles.validIcon}>
              <Check size={16} color="#10B981" />
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create New Group</Text>
            <Text style={styles.subtitle}>
              Build your community and connect with like-minded people
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <BlurView intensity={20} style={styles.blurView}>
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.9)',
                  'rgba(248, 250, 252, 0.8)',
                ]}
                style={styles.formGradient}
              >
                {/* Basic Info */}
                {renderInput(
                  'Group Name',
                  formData.name,
                  (text) => setFormData({ ...formData, name: text }),
                  'Enter a catchy group name',
                  <Sparkles size={16} color="#6366F1" />,
                  false,
                  true
                )}

                {renderInput(
                  'Description',
                  formData.description,
                  (text) => setFormData({ ...formData, description: text }),
                  'Tell people what your group is about...',
                  <GraduationCap size={16} color="#6366F1" />,
                  true,
                  false
                )}

                {renderInput(
                  'Meeting Details',
                  formData.meetingDetails,
                  (text) => setFormData({ ...formData, meetingDetails: text }),
                  'e.g., Every Tuesday at 7 PM in Room 101',
                  <LocateIcon size={16} color="#6366F1" />,
                  true,
                  false
                )}

                {/* {renderInput(
                  'Image URL',
                  imageUrl,
                  setImageUrl,
                  'Enter image URL for group cover (optional)',
                  <Image size={16} color="#6366F1" />,
                  false,
                  false
                )} */}

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Group Image</Text>

                  {!imageUrl && (
                    <TouchableOpacity
                      style={[
                        styles.uploadButton,
                        uploadFileMutation.isPending &&
                          styles.uploadButtonDisabled,
                      ]}
                      onPress={pickImage}
                      disabled={isSubmitting || uploadFileMutation.isPending}
                    >
                      <LinearGradient
                        colors={
                          uploadFileMutation.isPending
                            ? ['#9CA3AF', '#6B7280']
                            : ['#6366F1', '#8B5CF6']
                        }
                        style={styles.uploadButtonGradient}
                      >
                        {uploadFileMutation.isPending ? (
                          <>
                            <ActivityIndicator size="small" color="#FFFFFF" />
                            <Text style={styles.uploadButtonText}>
                              Uploading...
                            </Text>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={20} color="#FFFFFF" />
                            <Text style={styles.uploadButtonText}>
                              Upload Image
                            </Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  {/* Image Preview */}
                  {(imageUrl || uploadFileMutation.isPending) && (
                    <View style={styles.imagePreviewContainer}>
                      {uploadFileMutation.isPending ? (
                        <View
                          style={[
                            styles.imagePreview,
                            styles.imagePreviewLoading,
                          ]}
                        >
                          <ActivityIndicator size="small" color="#6366F1" />
                          <Text style={styles.loadingImageText}>
                            Uploading...
                          </Text>
                        </View>
                      ) : (
                        <>
                          <Image
                            source={{ uri: imageUrl }}
                            style={styles.imagePreview}
                          />
                          <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={removeImage}
                            disabled={
                              isSubmitting || uploadFileMutation.isPending
                            }
                          >
                            <X size={16} color="#FFFFFF" />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  )}
                </View>

                {/* Visibility Settings */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Group Visibility <Text style={{ color: '#EF4444' }}>*</Text>
                  </Text>
                  <View style={styles.rowContainer}>
                    <TouchableOpacity
                      style={[
                        styles.visibilityButton,
                        !formData.isPrivate && styles.visibilityButtonActive,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, isPrivate: false })
                      }
                    >
                      <LinearGradient
                        colors={
                          !formData.isPrivate
                            ? ['#6366F1', '#8B5CF6']
                            : [
                                'rgba(255, 255, 255, 0.9)',
                                'rgba(248, 250, 252, 0.8)',
                              ]
                        }
                        style={styles.visibilityButtonGradient}
                      >
                        <Globe
                          size={16}
                          color={!formData.isPrivate ? '#FFFFFF' : '#374151'}
                        />
                        <Text
                          style={[
                            styles.visibilityButtonText,
                            !formData.isPrivate &&
                              styles.visibilityButtonTextActive,
                          ]}
                        >
                          Public
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.visibilityButton,
                        formData.isPrivate && styles.visibilityButtonActive,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, isPrivate: true })
                      }
                    >
                      <LinearGradient
                        colors={
                          formData.isPrivate
                            ? ['#6366F1', '#8B5CF6']
                            : [
                                'rgba(255, 255, 255, 0.9)',
                                'rgba(248, 250, 252, 0.8)',
                              ]
                        }
                        style={styles.visibilityButtonGradient}
                      >
                        <Lock
                          size={16}
                          color={formData.isPrivate ? '#FFFFFF' : '#374151'}
                        />
                        <Text
                          style={[
                            styles.visibilityButtonText,
                            formData.isPrivate &&
                              styles.visibilityButtonTextActive,
                          ]}
                        >
                          Private
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Location</Text>
                  <View style={styles.locationToggle}>
                    <Switch
                      value={useLocation}
                      onValueChange={setUseLocation}
                      trackColor={{ false: '#E2E8F0', true: '#6366F1' }}
                      thumbColor={useLocation ? '#FFFFFF' : '#94A3B8'}
                    />
                    <Text style={styles.locationToggleText}>
                      Use my current location
                    </Text>
                  </View>

                  {!useLocation && (
                    <View style={styles.rowContainer}>
                      {renderInput(
                        '',
                        city,
                        setCity,
                        'City',
                        <MapPin size={16} color="#6366F1" />
                      )}
                      {renderInput(
                        '',
                        state,
                        setState,
                        'State',
                        <MapPin size={16} color="#6366F1" />
                      )}
                    </View>
                  )}
                </View> */}

                {/* Meeting Details - Commented Out */}
                {/* <View style={styles.sectionDivider} />
                <Text style={styles.sectionTitle}>Meeting Schedule (Optional)</Text>
                
                {meetings.map((meeting, index) => (
                  <View key={index} style={styles.meetingCard}>
                    <View style={styles.meetingHeader}>
                      <Text style={styles.meetingTitle}>Meeting {index + 1}</Text>
                      {index > 0 && (
                        <TouchableOpacity 
                          onPress={() => handleRemoveMeeting(index)}
                          style={styles.removeMeetingButton}
                        >
                          <MinusCircle color="#EF4444" size={20} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {renderInput(
                      'Day/Date',
                      meeting.date,
                      (text) => handleMeetingChange(index, 'date', text),
                      'e.g., Every Tuesday, First Monday',
                      <Calendar size={16} color="#6366F1" />
                    )}

                    {renderInput(
                      'Time',
                      meeting.time,
                      (text) => handleMeetingChange(index, 'time', text),
                      'e.g., 7:00 PM',
                      <Clock size={16} color="#6366F1" />
                    )}

                    {renderInput(
                      'Location',
                      meeting.location,
                      (text) => handleMeetingChange(index, 'location', text),
                      'e.g., Student Union Room 210',
                      <MapPin size={16} color="#6366F1" />
                    )}
                  </View>
                ))}

                <TouchableOpacity style={styles.addMeetingButton} onPress={handleAddMeeting}>
                  <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    style={styles.addMeetingButtonGradient}
                  >
                    <PlusCircle color="#FFFFFF" size={20} />
                    <Text style={styles.addMeetingText}>Add Another Meeting Time</Text>
                  </LinearGradient>
                </TouchableOpacity> */}
              </LinearGradient>
            </BlurView>
          </View>
        </ScrollView>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={
                isSubmitting ? ['#94A3B8', '#64748B'] : ['#6366F1', '#8B5CF6']
              }
              style={styles.buttonGradient}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.primaryButtonText}>
                  {isSubmitting ? 'Creating...' : 'Create Group'}
                </Text>
                {!isSubmitting && (
                  <Sparkles
                    size={16}
                    color="#FFFFFF"
                    style={styles.buttonIcon}
                  />
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  uploadButton: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  imageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  addImageButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  addImageButtonGradient: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginTop: 12,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  imagePreviewLoading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingImageText: {
    marginTop: 8,
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '500',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 20,
    padding: 6,
  },

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
    position: 'relative',
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
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
    marginTop: 6,
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
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  visibilityButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'white',
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
  locationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  locationToggleText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 24,
    marginHorizontal: -16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  meetingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#CDD2D8',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    ...Platform.select({
      android: {
        elevation: 2,
      },
    }),
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  removeMeetingButton: {
    padding: 4,
  },
  addMeetingButton: {
    marginTop: 8,
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
  addMeetingButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  addMeetingText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
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
});
