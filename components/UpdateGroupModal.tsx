import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
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
  Calendar,
  ChevronDown, // Keep this
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateGroup } from '@/contexts/group.api';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator } from 'react-native';
import { ImageIcon } from 'lucide-react-native';
import { uploadFile } from '@/contexts/file.api';
import { TimeSelectInput } from './TimeSelectInput';

interface Group {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  meetingLocation: string | null;
  meetingDetails: string | null;
  meetingDate: string | null;
  meetingTime: string | null;
  creator: {
    id: string;
    email: string;
    name: string;
  };
}

interface EditGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (groupData: any) => void;
  group: Group | null;
}

export function EditGroupModal({
  visible,
  onClose,
  onSubmit,
  group,
}: EditGroupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    // Meeting details
    hasMeetingDetails: false,
    meetingDate: null as Date | null,
    meetingTime: '',
    meetingLocation: '',
  });
  
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [showNativeDatePicker, setShowNativeDatePicker] = useState(false);

  const resetForm = () => {
    if (group) {
      const hasMeetingInfo = !!(group.meetingDate || group.meetingTime || group.meetingLocation);
      
      setFormData({
        name: group.name || '',
        description: group.description || '',
        isPrivate: group.isPrivate || false,
        hasMeetingDetails: hasMeetingInfo,
        meetingDate: group.meetingDate ? new Date(group.meetingDate) : null,
        meetingTime: group.meetingTime || '',
        meetingLocation: group.meetingLocation || '',
      });
      setImageUrl(group.imageUrl || '');
    } else {
      setFormData({
        name: '',
        description: '',
        isPrivate: false,
        hasMeetingDetails: false,
        meetingDate: null,
        meetingTime: '',
        meetingLocation: '',
      });
      setImageUrl('');
    }
    setFocusedInput(null);
    setShowNativeDatePicker(false);
  };

  useEffect(() => {
    if (visible && group) {
      resetForm();
    } else if (!visible) {
      setFocusedInput(null);
      setShowNativeDatePicker(false);
    }
  }, [visible, group]);

  const uploadFileMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      console.log('File uploaded successfully:', data);
      setImageUrl(data.url);
    },
    onError: (error) => {
      console.error('Error uploading file:', error);
      Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
    },
  });

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

  const onNativeDateChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || formData.meetingDate;
    setShowNativeDatePicker(Platform.OS === 'ios');
    setFormData({ ...formData, meetingDate: currentDate });
  };

  const validateTimeFormat = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(time);
  };

  const validateTime = (time: string): { isValid: boolean; error?: string } => {
    if (!time) return { isValid: true };

    if (!validateTimeFormat(time)) {
      return { isValid: false, error: 'Use HH:MM format (24-hour)' };
    }

    const [hours, minutes] = time.split(':').map(Number);

    if (hours > 23) {
      return { isValid: false, error: 'Hours must be 00-23' };
    }

    if (minutes > 59) {
      return { isValid: false, error: 'Minutes must be 00-59' };
    }

    return { isValid: true };
  };

  const updateGroupMutation = useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: any }) => 
      updateGroup(groupId, data),
    onSuccess: (data, variables) => {
      console.log('Group updated successfully:', data);

      queryClient.invalidateQueries({ queryKey: ['counts'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', group?.id] });

      Alert.alert('Success', 'Group updated successfully!');

      onSubmit(variables.data);
      setIsSubmitting(false);
      onClose();
    },
    onError: (error: any) => {
      console.error('Error updating Group:', error);
      setIsSubmitting(false);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update group. Please try again.';
      Alert.alert('Error', errorMessage);
    },
  });

  const handleSubmit = async () => {
    if (!group) {
      Alert.alert('Error', 'Group data not available.');
      return;
    }

    if (!formData.name || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    // Validate meeting details if enabled
    if (formData.hasMeetingDetails && formData.meetingTime) {
      const timeValidation = validateTime(formData.meetingTime);
      if (!timeValidation.isValid) {
        Alert.alert(
          'Invalid Time',
          timeValidation.error ||
            'Please enter a valid meeting time in HH:MM format.'
        );
        return;
      }
    }

    setIsSubmitting(true);
    
    const groupData: any = {
      name: formData.name,
      description: formData.description,
      isPrivate: formData.isPrivate,
      imageUrl: imageUrl,
    };

    // Only include meeting details if the toggle is enabled
    if (formData.hasMeetingDetails) {
      if (formData.meetingDate) {
        groupData.meetingDate = formData.meetingDate.toISOString();
      }
      if (formData.meetingTime) groupData.meetingTime = formData.meetingTime;
      if (formData.meetingLocation) groupData.meetingLocation = formData.meetingLocation;
    } else {
      // Clear meeting details if toggle is disabled
      groupData.meetingDate = null;
      groupData.meetingTime = null;
      groupData.meetingLocation = null; 
    }
    
    console.log('Updating group with data:', groupData);
    updateGroupMutation.mutate({ groupId: group.id, data: groupData });
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
            editable={!isSubmitting && !updateGroupMutation.isPending}
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

  if (!visible || !group) return null;

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
            <Text style={styles.title}>Edit Group</Text>
            <Text style={styles.subtitle}>
              Update your group information and settings
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
                  true
                )}

                {/* Group Image */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Group Image</Text>

                  {!imageUrl && (
                    <TouchableOpacity
                      style={[
                        styles.uploadButton,
                        (uploadFileMutation.isPending || isSubmitting) &&
                          styles.uploadButtonDisabled,
                      ]}
                      onPress={pickImage}
                      disabled={isSubmitting || uploadFileMutation.isPending || updateGroupMutation.isPending}
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
                              isSubmitting || uploadFileMutation.isPending || updateGroupMutation.isPending
                            }
                          >
                            <X size={16} color="#FFFFFF" />
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Meeting Details (Optional)</Text>
                  <TouchableOpacity
                    style={styles.meetingToggleContainer}
                    onPress={() => setFormData({ ...formData, hasMeetingDetails: !formData.hasMeetingDetails })}
                    disabled={isSubmitting || updateGroupMutation.isPending }
                  >
                    <View style={styles.meetingToggleButton}>
                      <Text style={styles.meetingToggleText}>
                        {formData.hasMeetingDetails ? 'Hide Meeting Details' : 'Add Meeting Details'}
                      </Text>
                      <ChevronDown
                        size={20}
                        color="#6366F1"
                        style={[
                          styles.chevronIcon,
                          formData.hasMeetingDetails && styles.chevronIconRotated
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Meeting Details Fields */}
                {formData.hasMeetingDetails && (
                  <View style={styles.meetingDetailsContainer}>
                    {/* Meeting Day */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Meeting Day (Optional)</Text>
                      <TouchableOpacity
                        onPress={() => setShowNativeDatePicker(true)}
                        disabled={isSubmitting || updateGroupMutation.isPending}
                      >
                        <View
                          style={[
                            styles.inputWrapper,
                            formData.meetingDate && styles.inputWrapperValid,
                          ]}
                        >
                          <Calendar
                            size={20}
                            color="#6366F1"
                            style={styles.inputIcon}
                          />
                          <Text style={[
                            styles.inputText,
                            !formData.meetingDate && { color: '#94A3B8' }
                          ]}>
                            {formData.meetingDate 
                              ? formData.meetingDate.toLocaleDateString()
                              : 'Select meeting day'
                            }
                          </Text>
                          {formData.meetingDate && (
                            <TouchableOpacity
                              onPress={() => setFormData({ ...formData, meetingDate: null })}
                              style={styles.clearDateButton}
                              disabled={isSubmitting || updateGroupMutation.isPending}
                            >
                              <X size={16} color="#6B7280" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </TouchableOpacity>

                      {showNativeDatePicker && (
                        <DateTimePicker
                          value={formData.meetingDate || new Date()}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={onNativeDateChange}
                          minimumDate={new Date()}
                        />
                      )}
                    </View>

                    {/* Meeting Time */}
                    <TimeSelectInput
                      value={formData.meetingTime}
                      onTimeChange={(time) =>
                        setFormData({ ...formData, meetingTime: time })
                      }
                      label="Meeting Time (Optional)"
                      placeholder="Select meeting time"
                      disabled={isSubmitting || updateGroupMutation.isPending}
                      required={false}
                    />

                    {/* Meeting Location */}
                    {renderInput(
                      'Meeting Location (Optional)',
                      formData.meetingLocation,
                      (text) => setFormData({ ...formData, meetingLocation: text }),
                      'e.g., Student Union Room 101',
                      <MapPin size={16} color="#6366F1" />,
                      false,
                      false
                    )}
                  </View>
                )}

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
                      disabled={isSubmitting || updateGroupMutation.isPending}
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
                      disabled={isSubmitting || updateGroupMutation.isPending}
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
              </LinearGradient>
            </BlurView>
          </View>
        </ScrollView>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isSubmitting || updateGroupMutation.isPending}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (isSubmitting || updateGroupMutation.isPending) && styles.primaryButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || updateGroupMutation.isPending}
          >
            <LinearGradient
              colors={
                isSubmitting || updateGroupMutation.isPending 
                  ? ['#94A3B8', '#64748B'] 
                  : ['#6366F1', '#8B5CF6']
              }
              style={styles.buttonGradient}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.primaryButtonText}>
                  {isSubmitting || updateGroupMutation.isPending ? 'Updating...' : 'Update Group'}
                </Text>
                {!isSubmitting && !updateGroupMutation.isPending && (
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
  meetingToggleContainer: {
    marginBottom: 16,
  },
  meetingToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F3F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#CDD2D8',
  },
  meetingToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  chevronIcon: {
    transform: [{ rotate: '0deg' }],
  },
  chevronIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  meetingDetailsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
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
  clearDateButton: {
    padding: 4,
    marginLeft: 8,
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