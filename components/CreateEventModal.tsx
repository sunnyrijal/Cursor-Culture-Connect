'use client';

import { useState, useMemo, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Image,
  Platform,
  ActivityIndicator, // Add this
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronDown,
  Check,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Plus,
  Sparkles,
  Minus,
} from 'lucide-react-native';
import { createEvent } from '@/contexts/event.api';

import * as ImagePicker from 'expo-image-picker';
import { TimeSelectInput } from './TimeSelectInput';
import { uploadFile } from '@/contexts/file.api';
import api, { API_URL } from '@/contexts/axiosConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getUserGroups } from '@/contexts/group.api';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => void;
}

export function CreateEventModal({
  visible,
  onClose,
  onSubmit,
}: CreateEventModalProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    eventTimes: [{ startTime: '', endTime: '' }],
    location: '',
    groupId: null as string | null,
    images: [] as string[],
    isPublic: true,
    universityOnly: false,
  });

  const {
    data: groupResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['groups'],
    queryFn: () => getUserGroups(),
  });
  const groups = groupResponse?.groups || [];

  console.log(groups);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(new Date().getMonth());
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear());
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showNativeDatePicker, setShowNativeDatePicker] = useState(false);

  const uploadFileMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      console.log('File uploaded successfully:', data);
      // Add the returned URL to formData.images
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, data.url],
      }));
    },
    onError: (error) => {
      console.error('Error uploading file:', error);
      Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
    },
  });

  const onNativeDateChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || formData.date;
    setShowNativeDatePicker(Platform.OS === 'ios'); // Keep open on iOS, close on Android
    setFormData({ ...formData, date: currentDate });
  };

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

        // Use the mutation instead of direct API call
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

  // TanStack Query mutation for creating event
  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: (data, variables) => {
      console.log('Event created successfully:', data);

      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['counts'] });

      Alert.alert('Success', 'Event created successfully!');

      onSubmit(variables);

      // Close modal
      onClose();
    },
    onError: (error: any) => {
      console.error('Error creating event:', error);

      // Show user-friendly error message
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create event. Please try again.';
      Alert.alert('Error', errorMessage);
    },
  });

  useEffect(() => {
    if (!visible) {
      setFormData({
        title: '',
        description: '',
        date: new Date(),
        eventTimes: [{ startTime: '', endTime: '' }],
        location: '',
        groupId: null,
        images: [],
        isPublic: true,
        universityOnly: false,
      });
      setFocusedField(null);
      setShowNativeDatePicker(false); // Add this line
    }
  }, [visible]);

  console.log(formData.images);

  const addTimeSlot = () => {
    setFormData({
      ...formData,
      eventTimes: [...formData.eventTimes, { startTime: '', endTime: '' }],
    });
  };

  const removeTimeSlot = (index: number) => {
    if (formData.eventTimes.length > 1) {
      const newEventTimes = formData.eventTimes.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        eventTimes: newEventTimes,
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      images: newImages,
    });
  };

  const formatTimeInput = (input: string): string => {
    // Remove any non-digit or colon characters
    const cleaned = input.replace(/[^\d:]/g, '');

    if (cleaned.length === 0) {
      return '';
    } else if (cleaned.length === 1) {
      // First digit of hours: only allow 0, 1, 2
      const firstDigit = cleaned[0];
      if (firstDigit > '2') {
        return ''; // Don't allow first digit greater than 2
      }
      return cleaned;
    } else if (cleaned.length === 2 && !cleaned.includes(':')) {
      // Two digits without colon - check if valid hour and auto-add colon
      const firstDigit = cleaned[0];
      const secondDigit = cleaned[1];
      if (firstDigit === '2' && secondDigit > '3') {
        return cleaned[0]; // Don't allow hours > 23
      }
      return cleaned + ':';
    } else if (cleaned.includes(':')) {
      // Already has colon, validate the format
      const parts = cleaned.split(':');
      const hours = parts[0].slice(0, 2);
      const minutes = parts[1] ? parts[1].slice(0, 2) : '';

      // Validate hours
      if (hours.length === 2) {
        if (hours[0] === '2' && hours[1] > '3') {
          return hours[0] + ':' + minutes;
        }
      }

      // Validate minutes first digit (0-5)
      if (minutes.length > 0 && minutes[0] > '5') {
        return hours + ':';
      }

      return hours + ':' + minutes;
    }

    // Limit to 5 characters (HH:MM)
    return cleaned.slice(0, 5);
  };

  const validateTimeFormat = (time: string): boolean => {
    // Allow formats like 5:30, 05:30, 15:45, etc.
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(time);
  };

  const validateTime = (time: string): { isValid: boolean; error?: string } => {
    if (!time) return { isValid: true }; // Empty is allowed during typing

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

  const updateTimeSlot = (
    index: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const formattedValue = formatTimeInput(value);
    const newEventTimes = [...formData.eventTimes];
    newEventTimes[index][field] = formattedValue;
    setFormData({
      ...formData,
      eventTimes: newEventTimes,
    });
  };

  const handleSubmit = async () => {
    const hasEmptyTimes = formData.eventTimes.some(
      (time) => !time.startTime || !time.endTime
    );
    const hasInvalidTimes = formData.eventTimes.some(
      (time) =>
        !validateTime(time.startTime).isValid ||
        !validateTime(time.endTime).isValid
    );

    const hasEndTimeBeforeStartTime = formData.eventTimes.some((time) => {
      if (time.startTime && time.endTime) {
        return time.endTime <= time.startTime;
      }
      return false;
    });

    if (
      !formData.title ||
      !formData.description ||
      hasEmptyTimes ||
      !formData.location
    ) {
      Alert.alert(
        'Missing Fields',
        'Please fill in all required fields including all time slots.'
      );
      return;
    }

    if (hasInvalidTimes) {
      Alert.alert(
        'Invalid Time Format',
        'Please use 24-hour format (HH:MM) with valid hours (00-23) and minutes (00-59).'
      );
      return;
    }

    if (hasEndTimeBeforeStartTime) {
      Alert.alert(
        'Invalid Time Slot',
        'The end time for a time slot must be after its start time.'
      );
      return;
    }

    const eventData = {
      name: formData.title,
      description: formData.description,
      eventTimes: formData.eventTimes,
      imageUrl: formData.images.length > 0 ? formData.images[0] : null,
      location: formData.location,
      date: formData.date.toISOString(),
      ...(formData.groupId && { associatedGroupId: formData.groupId }),
      isPublic: formData.isPublic,
      UniversityOnly: formData.universityOnly,
    };
    // Use the TanStack Query mutation
    createEventMutation.mutate(eventData);
  };

  if (!visible) return null;

  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();
  const monthName = new Date(displayYear, displayMonth).toLocaleString(
    'default',
    { month: 'long' }
  );

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
        >
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create New Event</Text>
            <Text style={styles.subtitle}>
              Bring your community together with an amazing event
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <BlurView intensity={25} style={styles.blurView}>
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.9)',
                  'rgba(255, 255, 255, 0.7)',
                ]}
                style={styles.formGradient}
              >
                {/* Event Title */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Event Title *</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === 'title' && styles.inputWrapperFocused,
                      formData.title && styles.inputWrapperValid,
                    ]}
                  >
                    <Sparkles
                      size={20}
                      color="#6366F1"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={formData.title}
                      onChangeText={(text) =>
                        setFormData({ ...formData, title: text })
                      }
                      placeholder="e.g. Diwali Celebration"
                      onFocus={() => setFocusedField('title')}
                      onBlur={() => setFocusedField(null)}
                      placeholderTextColor="#9CA3AF"
                      editable={!createEventMutation.isPending}
                    />
                    {formData.title && (
                      <Check
                        size={20}
                        color="#10B981"
                        style={styles.validIcon}
                      />
                    )}
                  </View>
                </View>

                {/* Description */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Description *</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === 'description' &&
                        styles.inputWrapperFocused,
                      formData.description && styles.inputWrapperValid,
                    ]}
                  >
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={formData.description}
                      onChangeText={(text) =>
                        setFormData({ ...formData, description: text })
                      }
                      placeholder="Describe your event..."
                      multiline
                      numberOfLines={4}
                      onFocus={() => setFocusedField('description')}
                      onBlur={() => setFocusedField(null)}
                      placeholderTextColor="#9CA3AF"
                      editable={!createEventMutation.isPending}
                    />
                  </View>
                </View>

                {/* Images section */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Event Images</Text>

                  {formData.images.length < 1 && (
                    <TouchableOpacity
                      style={[
                        styles.uploadButton,
                        uploadFileMutation.isPending &&
                          styles.uploadButtonDisabled,
                      ]}
                      onPress={pickImage}
                      disabled={
                        createEventMutation.isPending ||
                        uploadFileMutation.isPending
                      }
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

                  {/* Images Preview (keep existing) */}
                  {/* Images Preview */}
                  {(formData.images.length > 0 ||
                    uploadFileMutation.isPending) && (
                    <View style={styles.imagesPreview}>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        {/* Show loading placeholder while uploading */}
                        {uploadFileMutation.isPending && (
                          <View style={styles.imagePreviewContainer}>
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
                          </View>
                        )}

                        {/* Existing images */}
                        {formData.images.map((url, index) => (
                          <View
                            key={`image-${index}`}
                            style={styles.imagePreviewContainer}
                          >
                            <Image
                              source={{ uri: url }}
                              style={styles.imagePreview}
                            />
                            <TouchableOpacity
                              style={styles.removeImageButton}
                              onPress={() => removeImage(index)}
                              disabled={
                                createEventMutation.isPending ||
                                uploadFileMutation.isPending
                              }
                            >
                              <X size={16} color="#FFFFFF" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Loading Overlay for Upload */}
                {uploadFileMutation.isPending && (
                  <View style={styles.uploadingOverlay}>
                    <BlurView intensity={10} style={styles.uploadingBlur}>
                      <View style={styles.uploadingContent}>
                        <ActivityIndicator size="large" color="#6366F1" />
                        <Text style={styles.uploadingText}>
                          Uploading image...
                        </Text>
                        <Text style={styles.uploadingSubtext}>Please wait</Text>
                      </View>
                    </BlurView>
                  </View>
                )}

                {/* Date */}
                {/* <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Date *</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    disabled={createEventMutation.isPending}
                  >
                    <View
                      style={[
                        styles.inputWrapper,
                        formData.date && styles.inputWrapperValid,
                      ]}
                    >
                      <Calendar
                        size={20}
                        color="#6366F1"
                        style={styles.inputIcon}
                      />
                      <Text style={styles.inputText}>
                        {formData.date.toLocaleDateString()}
                      </Text>
                      <Check
                        size={20}
                        color="#10B981"
                        style={styles.validIcon}
                      />
                    </View>
                  </TouchableOpacity>
                </View> */}

                {/* Date */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Date *</Text>
                  <TouchableOpacity
                    onPress={() => setShowNativeDatePicker(true)}
                    disabled={createEventMutation.isPending}
                  >
                    <View
                      style={[
                        styles.inputWrapper,
                        formData.date && styles.inputWrapperValid,
                      ]}
                    >
                      <Calendar
                        size={20}
                        color="#6366F1"
                        style={styles.inputIcon}
                      />
                      <Text style={styles.inputText}>
                        {formData.date.toLocaleDateString()}
                      </Text>
                      <Check
                        size={20}
                        color="#10B981"
                        style={styles.validIcon}
                      />
                    </View>
                  </TouchableOpacity>

                  {showNativeDatePicker && (
                    <DateTimePicker
                      value={formData.date}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onNativeDateChange}
                      minimumDate={new Date()} // Prevent past dates for events
                    />
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.timeSlotsHeader}>
                    <Text style={styles.inputLabel}>Event Times *</Text>
                    <TouchableOpacity
                      style={styles.addTimeSlotButton}
                      onPress={addTimeSlot}
                      disabled={createEventMutation.isPending}
                    >
                      <Plus size={16} color="#6366F1" />
                      <Text style={styles.addTimeSlotText}>Add Time Slot</Text>
                    </TouchableOpacity>
                  </View>

                  {formData.eventTimes.map((timeSlot, index) => (
                    <View key={index} style={styles.timeSlotContainer}>
                      <View style={styles.timeSlotHeader}>
                        <Text style={styles.timeSlotLabel}>
                          Time Slot {index + 1}
                        </Text>
                        {formData.eventTimes.length > 1 && (
                          <TouchableOpacity
                            style={styles.removeTimeSlotButton}
                            onPress={() => removeTimeSlot(index)}
                            disabled={createEventMutation.isPending}
                          >
                            <Minus size={16} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>

                      <View style={styles.rowContainer}>
                        <View style={styles.halfWidth}>
                          <TimeSelectInput
                            value={timeSlot.startTime}
                            onTimeChange={(time) =>
                              updateTimeSlot(index, 'startTime', time)
                            }
                            label="Start Time *"
                            placeholder="Select start time"
                            disabled={createEventMutation.isPending}
                            required
                          />
                        </View>

                        <View style={styles.halfWidth}>
                          <TimeSelectInput
                            value={timeSlot.endTime}
                            onTimeChange={(time) =>
                              updateTimeSlot(index, 'endTime', time)
                            }
                            label="End Time *"
                            placeholder="Select end time"
                            disabled={createEventMutation.isPending}
                            required
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Location */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Location *</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === 'location' && styles.inputWrapperFocused,
                      formData.location && styles.inputWrapperValid,
                    ]}
                  >
                    <MapPin
                      size={20}
                      color="#6366F1"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={formData.location}
                      onChangeText={(text) =>
                        setFormData({ ...formData, location: text })
                      }
                      placeholder="e.g., Student Union"
                      onFocus={() => setFocusedField('location')}
                      onBlur={() => setFocusedField(null)}
                      placeholderTextColor="#9CA3AF"
                      editable={!createEventMutation.isPending}
                    />
                    {formData.location && (
                      <Check
                        size={20}
                        color="#10B981"
                        style={styles.validIcon}
                      />
                    )}
                  </View>
                </View>

                {/* Associated Group */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Associated Group</Text>
                  <TouchableOpacity
                    onPress={() => setShowGroupPicker(true)}
                    disabled={createEventMutation.isPending}
                  >
                    <View style={styles.inputWrapper}>
                      <Users
                        size={20}
                        color="#6366F1"
                        style={styles.inputIcon}
                      />
                      <Text
                        style={[
                          styles.inputText,
                          !formData.groupId && { color: '#9CA3AF' },
                        ]}
                      >
                        {formData.groupId
                          ? groups.find((g: any) => g.id === formData.groupId)
                              ?.name
                          : 'Select a group (optional)'}
                      </Text>
                      <ChevronDown size={20} color="#6366F1" />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Event Visibility */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Event Visibility</Text>
                  <View style={styles.rowContainer}>
                    <TouchableOpacity
                      style={[
                        styles.visibilityButton,
                        formData.isPublic &&
                          !formData.universityOnly &&
                          styles.visibilityButtonActive,
                      ]}
                      onPress={() =>
                        setFormData((f) => ({
                          ...f,
                          isPublic: true,
                          universityOnly: false,
                        }))
                      }
                      disabled={createEventMutation.isPending}
                    >
                      <LinearGradient
                        colors={
                          formData.isPublic && !formData.universityOnly
                            ? ['#6366F1', '#8B5CF6']
                            : ['transparent', 'transparent']
                        }
                        style={styles.visibilityButtonGradient}
                      >
                        <Globe
                          size={16}
                          color={
                            formData.isPublic && !formData.universityOnly
                              ? '#FFFFFF'
                              : '#6366F1'
                          }
                        />
                        <Text
                          style={[
                            styles.visibilityButtonText,
                            formData.isPublic &&
                              !formData.universityOnly &&
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
                        formData.universityOnly &&
                          styles.visibilityButtonActive,
                      ]}
                      onPress={() =>
                        setFormData((f) => ({
                          ...f,
                          isPublic: false,
                          universityOnly: true,
                        }))
                      }
                      disabled={createEventMutation.isPending}
                    >
                      <LinearGradient
                        colors={
                          formData.universityOnly
                            ? ['#6366F1', '#8B5CF6']
                            : ['transparent', 'transparent']
                        }
                        style={styles.visibilityButtonGradient}
                      >
                        <GraduationCap
                          size={16}
                          color={
                            formData.universityOnly ? '#FFFFFF' : '#6366F1'
                          }
                        />
                        <Text
                          style={[
                            styles.visibilityButtonText,
                            formData.universityOnly &&
                              styles.visibilityButtonTextActive,
                          ]}
                        >
                          University Only
                        </Text>
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
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={createEventMutation.isPending}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              createEventMutation.isPending && styles.primaryButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={createEventMutation.isPending}
          >
            <LinearGradient
              colors={
                createEventMutation.isPending
                  ? ['#9CA3AF', '#6B7280']
                  : ['#6366F1', '#8B5CF6']
              }
              style={styles.buttonGradient}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.primaryButtonText}>
                  {createEventMutation.isPending
                    ? 'Creating...'
                    : 'Create Event'}
                </Text>
                <Sparkles size={20} color="#FFFFFF" style={styles.buttonIcon} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker && !createEventMutation.isPending}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerContainer}>
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.95)',
                  'rgba(255, 255, 255, 0.85)',
                ]}
                style={styles.datePickerGradient}
              >
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity
                    onPress={() => setDisplayYear((y) => y - 1)}
                  >
                    <Text style={styles.navButton}>{'<<'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setDisplayMonth((m) => (m > 0 ? m - 1 : 11))}
                  >
                    <Text style={styles.navButton}>{'<'}</Text>
                  </TouchableOpacity>
                  <Text style={styles.datePickerHeaderText}>
                    {monthName} {displayYear}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setDisplayMonth((m) => (m < 11 ? m + 1 : 0))}
                  >
                    <Text style={styles.navButton}>{'>'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setDisplayYear((y) => y + 1)}
                  >
                    <Text style={styles.navButton}>{'>>'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.calendarGrid}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                    <Text key={d} style={styles.calendarWeekday}>
                      {d}
                    </Text>
                  ))}
                  {Array(firstDayOfMonth)
                    .fill(null)
                    .map((_, i) => (
                      <View key={`empty-${i}`} style={styles.calendarDay} />
                    ))}
                  {[...Array(daysInMonth).keys()].map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={styles.calendarDayButton}
                      onPress={() => {
                        const newDate = new Date(
                          displayYear,
                          displayMonth,
                          day + 1
                        );
                        setFormData({ ...formData, date: newDate });
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={styles.calendarDayText}>{day + 1}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.closeDatePicker}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.closeDatePickerText}>Close</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </Modal>

        {/* Group Picker Modal */}
        <Modal
          visible={showGroupPicker && !createEventMutation.isPending}
          transparent
          animationType="fade"
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowGroupPicker(false)}
          >
            <TouchableOpacity
              style={styles.groupPickerContainer}
              activeOpacity={1}
            >
              <View style={styles.groupPickerContent}>
                <Text style={styles.groupPickerTitle}>Select Your Group</Text>

                <ScrollView
                  style={styles.groupList}
                  showsVerticalScrollIndicator={false}
                >
                  {groups.map((group: any) => (
                    <TouchableOpacity
                      key={group.id}
                      style={styles.groupItem}
                      onPress={() => {
                        setFormData({ ...formData, groupId: group.id });
                        setShowGroupPicker(false);
                      }}
                    >
                      <Image
                        source={
                          group.imageUrl
                            ? { uri: group.imageUrl }
                            : require('../assets/user.png')
                        }
                        style={styles.groupImage}
                      />
                      <View style={styles.groupInfo}>
                        <Text style={styles.groupItemText} numberOfLines={1}>
                          {group.name}
                        </Text>
                        <Text style={styles.groupCreatorText}>
                          By {group.creator.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={styles.closeGroupPicker}
                  onPress={() => setShowGroupPicker(false)}
                >
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
  // Add this to your CreateEventModal styles
  scrollContainer: {
    flex: 1,
    paddingBottom: 40,
    zIndex: 1, // Add this to lower the scroll container's z-index
  },

  formContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    zIndex: 1, // Add this
  },
  primaryButtonDisabled: {},
  timeSlotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  uploadButtonDisabled: {
    opacity: 0.7,
  },

  // Loading overlay styles
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    borderRadius: 16,
  },
  uploadingBlur: {
    flex: 1,
    borderRadius: 16,
  },
  uploadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
  },
  uploadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
  },
  uploadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  // Loading image placeholder styles
  imagePreviewLoading: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  loadingImageText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },

  uploadButton: {
    marginBottom: 12,
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
    borderWidth: 2,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  addTimeSlotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  addTimeSlotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 4,
  },
  timeSlotContainer: {
    marginBottom: 16,
    // backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    // borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  timeSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeSlotLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  removeTimeSlotButton: {
    padding: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },

  container: {
    flex: 1,
    backgroundColor: '#F0F3F7',
  },
  // scrollContainer: {
  //   flex: 1,
  //   paddingBottom: 40,
  // },
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
  // formContainer: {
  //   marginHorizontal: 20,
  //   marginBottom: 24,
  // },
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
    marginBottom: 24,
    maxHeight: 400,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  groupImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  groupInfo: {
    flex: 1,
  },
  groupCreatorText: {
    fontSize: 12,
    color: '#6B7280',
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
