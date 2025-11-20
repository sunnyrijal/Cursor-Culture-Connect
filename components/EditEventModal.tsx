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
  Modal,
  Image,
  Platform,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  Edit3,
} from 'lucide-react-native';
import { updateEvent, getEvent } from '@/contexts/event.api';

import * as ImagePicker from 'expo-image-picker';
import { TimeSelectInput } from './TimeSelectInput';
import { uploadFile } from '@/contexts/file.api';
import api, { API_URL } from '@/contexts/axiosConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getUserGroups, getUserMemberGroup } from '@/contexts/group.api';
import { typography } from './theme';
import { useAlert } from '@/contexts/AlertContext';

interface EditEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => void;
  eventId: string;
}

export function EditEventModal({
  visible,
  onClose,
  onSubmit,
  eventId,
}: EditEventModalProps) {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

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
    requiresTravel: false,
  });

  // Fetch event data
  const {
    data: eventResponse,
    isLoading: eventLoading,
    isError: eventError,
    error,
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId as string),
    enabled: !!eventId && visible, // Only run query if eventId exists and modal is visible
  });
  const event = eventResponse?.event;

  // Fetch groups data
  const { data: groupResponse, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => getUserMemberGroup(),
    enabled: visible, // Only fetch when modal is visible
  });
  const groups = groupResponse?.groups || [];

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(new Date().getMonth());
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear());
  const [showNativeDatePicker, setShowNativeDatePicker] = useState(false);

  // Update form data when event data is loaded
  useEffect(() => {
    if (event && visible) {
      setFormData({
        title: event.name || '',
        description: event.description || '',
        date: event.date ? new Date(event.date) : new Date(),
        eventTimes:
          event.eventTimes && event.eventTimes.length > 0
            ? event.eventTimes.map((timeSlot: any) => ({
                startTime: timeSlot.startTime
                  ? new Date(timeSlot.startTime).toTimeString().slice(0, 5)
                  : '',
                endTime: timeSlot.endTime
                  ? new Date(timeSlot.endTime).toTimeString().slice(0, 5)
                  : '',
              }))
            : [{ startTime: '', endTime: '' }],
        location: event.location || '',
        groupId: event.associatedGroupId || null,
        images: event.imageUrl ? [event.imageUrl] : [],
        isPublic: event.isPublic !== undefined ? event.isPublic : true,
        universityOnly:
          event.UniversityOnly !== undefined ? event.UniversityOnly : false,
        requiresTravel: event.requiresTravel || false,
      });
    }
  }, [event, visible]);

  const uploadFileMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      console.log('File uploaded successfully:', data);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, data.url],
      }));
    },
    onError: (error) => {
      console.error('Error uploading file:', error);
      showAlert({
        title: 'Upload Error',
        message: 'Failed to upload image. Please try again.',
      });
    },
  });

  // Update Event Mutation
  const updateEventMutation = useMutation({
    mutationFn: ({ eventId, eventData }: { eventId: string; eventData: any }) =>
      updateEvent(eventId, eventData),
    onSuccess: (data, variables) => {
      console.log('Event updated successfully:', data);

      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['counts'] });

      showAlert({ title: 'Success', message: 'Event updated successfully!' });

      onSubmit(variables.eventData);
      onClose();
    },
    onError: (error: any) => {
      console.error('Error updating event:', error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update event. Please try again.';
      showAlert({ title: 'Error', message: errorMessage });
    },
  });

  const onNativeDateChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || formData.date;
    if (Platform.OS === 'android') {
      setShowNativeDatePicker(false);
    }
    setFormData({ ...formData, date: currentDate });
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert({
          title: 'Permission needed',
          message: 'Sorry, we need camera roll permissions to make this work!',
        });
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
        uploadFileMutation.mutate({
          uri: asset.uri,
          type: asset.type,
          mimeType: asset.mimeType,
          fileName: asset.fileName || 'image.jpg',
        });
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      showAlert({
        title: 'Error',
        message: `Failed to pick image: ${error.message}`,
      });
    }
  };

  useEffect(() => {
    if (!visible) {
      setShowNativeDatePicker(false);
    }
  }, [visible]);

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
    const cleaned = input.replace(/[^\d:]/g, '');

    if (cleaned.length === 0) {
      return '';
    } else if (cleaned.length === 1) {
      const firstDigit = cleaned[0];
      if (firstDigit > '2') {
        return '';
      }
      return cleaned;
    } else if (cleaned.length === 2 && !cleaned.includes(':')) {
      const firstDigit = cleaned[0];
      const secondDigit = cleaned[1];
      if (firstDigit === '2' && secondDigit > '3') {
        return cleaned[0];
      }
      return cleaned + ':';
    } else if (cleaned.includes(':')) {
      const parts = cleaned.split(':');
      const hours = parts[0].slice(0, 2);
      const minutes = parts[1] ? parts[1].slice(0, 2) : '';

      if (hours.length === 2) {
        if (hours[0] === '2' && hours[1] > '3') {
          return hours[0] + ':' + minutes;
        }
      }

      if (minutes.length > 0 && minutes[0] > '5') {
        return hours + ':';
      }

      return hours + ':' + minutes;
    }

    return cleaned.slice(0, 5);
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
      showAlert({
        title: 'Missing Fields',
        message: 'Please fill in all required fields including all time slots.',
      });
      return;
    }

    if (hasInvalidTimes) {
      showAlert({
        title: 'Invalid Time Format',
        message:
          'Please use 24-hour format (HH:MM) with valid hours (00-23) and minutes (00-59).',
      });
      return;
    }

    if (hasEndTimeBeforeStartTime) {
      showAlert({
        title: 'Invalid Time Slot',
        message: 'The end time for a time slot must be after its start time.',
      });
      return;
    }

    const eventData = {
      name: formData.title,
      description: formData.description,
      eventTimes: formData.eventTimes.map((slot) => {
        const [startHours, startMinutes] = slot.startTime
          .split(':')
          .map(Number);
        const [endHours, endMinutes] = slot.endTime.split(':').map(Number);

        const startDate = new Date(formData.date);
        startDate.setHours(startHours, startMinutes, 0, 0);

        const endDate = new Date(formData.date);
        endDate.setHours(endHours, endMinutes, 0, 0);

        return {
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        };
      }),
      imageUrl: formData.images.length > 0 ? formData.images[0] : null,
      location: formData.location,
      date: formData.date.toISOString(),
      ...(formData.groupId && { associatedGroupId: formData.groupId }),
      isPublic: formData.isPublic,
      UniversityOnly: formData.universityOnly,
      requiresTravel: formData.requiresTravel,
    };

    updateEventMutation.mutate({ eventId, eventData });
  };

  if (!visible) return null;

  // Show loading state while fetching event data
  if (eventLoading) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Loading event details...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  // Show error state if event fetch failed
  if (eventError) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load event details</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onClose}>
              <Text style={styles.retryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

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
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Edit Event</Text>
            <Text style={styles.subtitle}>
              Update your event details to keep your community informed
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <BlurView intensity={25} style={styles.blurView}>
              <View style={styles.formGradient}>
                {/* Event Title */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Event Title  <Text style={styles.required}>*</Text></Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      formData.title && styles.inputWrapperValid,
                    ]}
                  >
                    <Edit3 size={20} color="#6366F1" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.title}
                      onChangeText={(text) =>
                        setFormData({ ...formData, title: text })
                      }
                      placeholder="e.g. Diwali Celebration"
                      placeholderTextColor="#9CA3AF"
                      editable={!updateEventMutation.isPending}
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
                  <Text style={styles.inputLabel}>Description  <Text style={styles.required}>*</Text></Text>
                  <View
                    style={[
                      styles.inputWrapper,
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
                      placeholderTextColor="#9CA3AF"
                      editable={!updateEventMutation.isPending}
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
                        updateEventMutation.isPending ||
                        uploadFileMutation.isPending
                      }
                    >
                      <View style={[styles.uploadButtonGradient, { backgroundColor: uploadFileMutation.isPending ? '#9CA3AF' : '#6366F1' }]}>
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
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* Images Preview */}
                  {(formData.images.length > 0 ||
                    uploadFileMutation.isPending) && (
                    <View style={styles.imagesPreview}>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
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
                                updateEventMutation.isPending ||
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
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Date *</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setShowNativeDatePicker(!showNativeDatePicker)
                    }
                    disabled={updateEventMutation.isPending}
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
                    Platform.OS === 'ios' ? (
                      <View style={styles.iosPickerContainer}>
                        <View style={styles.iosPickerWrapper}>
                          <DateTimePicker
                            value={formData.date}
                            mode="date"
                            display="spinner"
                            themeVariant="light"
                            textColor="black"
                            onChange={onNativeDateChange}
                            minimumDate={new Date()}
                          />
                        </View>
                        <TouchableOpacity
                          style={styles.iosConfirmButton}
                          onPress={() => setShowNativeDatePicker(false)}
                        >
                          <Text style={styles.iosConfirmButtonText}>Done</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <DateTimePicker
                        value={formData.date}
                        mode="date"
                        themeVariant="light"
                        textColor="black"
                        display="default"
                        onChange={onNativeDateChange}
                        minimumDate={new Date()}
                      />
                    )
                  )}
                </View>

                {/* Event Times */}
                <View style={styles.inputContainer}>
                  <View style={styles.timeSlotsHeader}>
                    <Text style={styles.inputLabel}>Event Times  <Text style={styles.required}>*</Text></Text>
                    <TouchableOpacity
                      style={styles.addTimeSlotButton}
                      onPress={addTimeSlot}
                      disabled={updateEventMutation.isPending}
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
                            disabled={updateEventMutation.isPending}
                          >
                            <Minus size={16} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>

                      <TimeSelectInput
                        value={timeSlot.startTime}
                        onTimeChange={(time) =>
                          updateTimeSlot(index, 'startTime', time)
                        }
                        label="Start Time"
                        placeholder="Select start time"
                        disabled={updateEventMutation.isPending}
                        required
                      />

                      <TimeSelectInput
                        value={timeSlot.endTime}
                        onTimeChange={(time) =>
                          updateTimeSlot(index, 'endTime', time)
                        }
                        label="End Time"
                        placeholder="Select end time"
                        disabled={updateEventMutation.isPending}
                        required
                      />
                    </View>
                  ))}
                </View>

                {/* Location */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Location  <Text style={styles.required}>*</Text></Text>
                  <View
                    style={[
                      styles.inputWrapper,
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
                      placeholderTextColor="#9CA3AF"
                      editable={!updateEventMutation.isPending}
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

                {/* Travel Requirement - Simplified */}
                <View style={styles.inputContainer}>
                  <View style={styles.rowContainer}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>
                        Does this Event Require Travel?
                      </Text>
                      <Text style={styles.inputSubLabel}>
                        {formData.requiresTravel
                          ? 'Yes, attendees need to travel to the event.'
                          : "No, it's a local event."}
                      </Text>
                    </View>
                    <Switch
                      trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                      thumbColor={
                        formData.requiresTravel ? '#6366F1' : '#f4f3f4'
                      }
                      ios_backgroundColor="#E5E7EB"
                      onValueChange={(value) =>
                        setFormData({ ...formData, requiresTravel: value })
                      }
                      value={formData.requiresTravel}
                      disabled={updateEventMutation.isPending}
                    />
                  </View>
                </View>

                {/* Associated Group */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Associated Group</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowGroupPicker(true);
                    }}
                    disabled={updateEventMutation.isPending}
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
                      disabled={updateEventMutation.isPending}
                    >
                      <View style={[styles.visibilityButtonGradient, { backgroundColor: formData.isPublic && !formData.universityOnly ? '#6366F1' : 'transparent' }]}>
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
                      </View>
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
                      disabled={updateEventMutation.isPending}
                    >
                      <View style={[styles.visibilityButtonGradient, { backgroundColor: formData.universityOnly ? '#6366F1' : 'transparent' }]}>
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
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </BlurView>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={updateEventMutation.isPending}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              updateEventMutation.isPending && styles.primaryButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={updateEventMutation.isPending}
          >
            <View style={[styles.buttonGradient, { backgroundColor: updateEventMutation.isPending ? '#9CA3AF' : '#6366F1' }]}>
              <View style={styles.buttonContent}>
                <Text style={styles.primaryButtonText}>
                  {updateEventMutation.isPending
                    ? 'Updating...'
                    : 'Update Event'}
                </Text>
                <Edit3 size={20} color="#FFFFFF" style={styles.buttonIcon} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker && !updateEventMutation.isPending}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerGradient}>
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
              </View>
            </View>
          </View>
        </Modal>

        {/* Group Picker Modal */}
        <Modal
          visible={showGroupPicker && !updateEventMutation.isPending}
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
      </SafeAreaView>
    </Modal>
  );
}

// Additional styles for the EditEventModal
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    position: 'relative',
  },
  title: {
    fontSize: typography.fontSize.xl,

    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
    inputWrapperValid: {
    borderColor: '#10B981',
    backgroundColor: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 24,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  formContainer: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  blurView: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  formGradient: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputSubLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  validIcon: {
    marginLeft: 8,
  },
  uploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  imagesPreview: {
    marginTop: 12,
  },
    required: {
    color: '#EF4444',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginRight: 12,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  imagePreviewLoading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingImageText: {
    fontSize: 10,
    color: '#6366F1',
    marginTop: 4,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  uploadingBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingContent: {
    alignItems: 'center',
  },
  uploadingText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  uploadingSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
  },
  timeSlotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addTimeSlotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  addTimeSlotText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  timeSlotContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    borderRadius: 4,
    backgroundColor: '#FEE2E2',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  visibilityButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  visibilityButtonActive: {
    borderColor: '#6366F1',
  },
  visibilityButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  visibilityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 6,
  },
  visibilityButtonTextActive: {
    color: '#FFFFFF',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 12,
    ...Platform.select({
      android: { paddingBottom: 24 },
      default: { paddingBottom: 16 },
    }),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  primaryButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  datePickerGradient: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarWeekday: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    paddingVertical: 8,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  calendarDayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  calendarDayText: {
    fontSize: 16,
    color: '#374151',
  },
  closeDatePicker: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#6366F1',
    borderRadius: 8,
    alignItems: 'center',
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
  },
  navButton: {
    fontSize: 18,
    color: '#6366F1',
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  groupPickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 24,
  },
  closeGroupPickerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  iosPickerContainer: {
    marginTop: 12,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  iosPickerWrapper: {
    alignItems: 'center',
    paddingTop: 16,
  },
  iosConfirmButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  iosConfirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
