'use client';

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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  X,
  MapPin,
  Check,
  Sparkles,
  Zap,
  Clock,
  Users,
} from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { createQuickEvent } from '@/contexts/quickEvent.api';
import { TimerPicker } from 'react-native-timer-picker';
import { TimeSelectInput } from './TimeSelectInput'; // Adjust path as needed

interface CreateQuickEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => void;
}

export function CreateQuickEventModal({
  visible,
  onClose,
  onSubmit,
}: CreateQuickEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    time: '', // Added time field
    max: '', // Added max people field
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formatTimeInput = (input: string): string => {
    // Remove any non-digit or colon characters
    const cleaned = input.replace(/[^\d:]/g, '');

    if (cleaned.length === 1) {
      // First digit of hours: only allow 0, 1, 2
      const firstDigit = cleaned[0];
      if (firstDigit > '2') {
        return ''; // Don't allow first digit greater than 2
      }
      return cleaned;
    } else if (cleaned.length === 2) {
      // Second digit of hours: if first digit is 2, only allow 0-3
      const firstDigit = cleaned[0];
      const secondDigit = cleaned[1];
      if (firstDigit === '2' && secondDigit > '3') {
        return cleaned[0]; // Don't allow hours > 23
      }
      return cleaned;
    } else if (cleaned.length === 3) {
      // Add colon after 2 digits if not present
      if (cleaned[2] !== ':') {
        return cleaned.slice(0, 2) + ':' + cleaned.slice(2);
      }
      return cleaned;
    } else if (cleaned.length === 4) {
      // First digit of minutes: only allow 0-5
      const parts = cleaned.split(':');
      if (parts.length === 2) {
        const minuteFirstDigit = parts[1][0];
        if (minuteFirstDigit > '5') {
          return parts[0] + ':'; // Don't allow minutes > 59
        }
      }
      return cleaned;
    } else if (cleaned.length <= 5) {
      // Ensure colon is in the right place and validate complete time
      const parts = cleaned.split(':');
      if (parts.length === 1) {
        const formatted = parts[0].slice(0, 2) + ':' + parts[0].slice(2, 4);
        const minutePart = parts[0].slice(2, 4);
        if (minutePart.length > 0 && minutePart[0] > '5') {
          return parts[0].slice(0, 2) + ':'; // Don't allow minutes > 59
        }
        return formatted;
      }

      // Validate minutes don't exceed 59
      if (parts[1] && parts[1].length === 2) {
        const minutes = Number.parseInt(parts[1]);
        if (minutes > 59) {
          return parts[0] + ':' + parts[1][0]; // Keep only first digit of minutes
        }
      }

      return parts[0].slice(0, 2) + ':' + parts[1].slice(0, 2);
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

  useEffect(() => {
    if (!visible) {
      setFormData({
        title: '',
        description: '',
        location: '',
        time: '', // Reset time field
        max: '', // Reset max field
      });
      setFocusedField(null);
    }
  }, [visible]);

  const createEventMutation = useMutation({
    mutationFn: createQuickEvent,
    onSuccess: (data, variables) => {
      console.log('Quick Event created successfully:', data);

      // queryClient.invalidateQueries({ queryKey: ["events"] })

      Alert.alert('Success', 'Quick Event created successfully!');

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

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.location.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    if (formData.time && !validateTime(formData.time).isValid) {
      Alert.alert('Invalid Time', validateTime(formData.time).error);
      return;
    }

    if (
      formData.max &&
      (isNaN(Number(formData.max)) || Number(formData.max) <= 0)
    ) {
      Alert.alert(
        'Invalid Max People',
        'Please enter a valid number for max people.'
      );
      return;
    }

    const eventData = {
      name: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      time: formData.time,
      max: formData.max,
    };

    createEventMutation.mutate(eventData);
  };

  const handleTimeConfirm = (pickedTime: { hour: number; minute: number }) => {
    setFormData({
      ...formData,
      time: `${String(pickedTime.hour).padStart(2, '0')}:${String(
        pickedTime.minute
      ).padStart(2, '0')}`,
    });
    setShowTimePicker(false);
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
        >
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Quick Event</Text>
            <Text style={styles.subtitle}>Create an event in seconds</Text>
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
                      placeholder="e.g. Coffee Chat"
                      onFocus={() => setFocusedField('title')}
                      onBlur={() => setFocusedField(null)}
                      placeholderTextColor="#9CA3AF"
                      maxLength={100}
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
                  <Text style={styles.inputLabel}>Description</Text>
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
                      placeholder="Brief description of your event..."
                      multiline
                      numberOfLines={3}
                      onFocus={() => setFocusedField('description')}
                      onBlur={() => setFocusedField(null)}
                      placeholderTextColor="#9CA3AF"
                      maxLength={300}
                    />
                  </View>
                  <Text style={styles.characterCount}>
                    {formData.description.length}/300
                  </Text>
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
                      placeholder="e.g. Library Cafe"
                      onFocus={() => setFocusedField('location')}
                      onBlur={() => setFocusedField(null)}
                      placeholderTextColor="#9CA3AF"
                      maxLength={100}
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

                <TimeSelectInput
                  value={formData.time}
                  onTimeChange={(time) => setFormData({ ...formData, time })}
                  label="Time"
                  placeholder="Select a time"
                  disabled={createEventMutation.isPending}
                />

                {/* <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Time</Text>
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(true)}
                    disabled={createEventMutation.isPending}
                  >
                    <View
                      style={[
                        styles.inputWrapper,
                        formData.time && styles.inputWrapperValid,
                      ]}
                    >
                      <Clock
                        size={20}
                        color="#6366F1"
                        style={styles.inputIcon}
                      />
                      <Text
                        style={[
                          styles.input,
                          !formData.time && { color: '#9CA3AF' },
                        ]}
                      >
                        {formData.time || 'Select a time'}
                      </Text>
                      {formData.time && (
                        <Check
                          size={20}
                          color="#10B981"
                          style={styles.validIcon}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                  {formData.time && !validateTime(formData.time).isValid && (
                    <Text style={styles.errorText}>
                      {validateTime(formData.time).error}
                    </Text>
                  )}
                </View> */}

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Max People</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === 'max' && styles.inputWrapperFocused,
                      formData.max &&
                        !isNaN(Number(formData.max)) &&
                        Number(formData.max) > 0 &&
                        styles.inputWrapperValid,
                    ]}
                  >
                    <Users size={20} color="#6366F1" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={formData.max}
                      onChangeText={(text) =>
                        setFormData({
                          ...formData,
                          max: text.replace(/[^0-9]/g, ''),
                        })
                      }
                      placeholder="e.g., 10"
                      onFocus={() => setFocusedField('max')}
                      onBlur={() => setFocusedField(null)}
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      maxLength={4}
                    />
                    {formData.max &&
                      !isNaN(Number(formData.max)) &&
                      Number(formData.max) > 0 && (
                        <Check
                          size={20}
                          color="#10B981"
                          style={styles.validIcon}
                        />
                      )}
                  </View>
                </View>

                {/* Quick Event Info */}
                <View style={styles.infoContainer}>
                  <LinearGradient
                    colors={[
                      'rgba(99, 102, 241, 0.1)',
                      'rgba(139, 92, 246, 0.1)',
                    ]}
                    style={styles.infoGradient}
                  >
                    <Zap size={16} color="#6366F1" />
                    <Text style={styles.infoText}>
                      Quick events are created instantly and visible to everyone
                      immediately!
                    </Text>
                  </LinearGradient>
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
                {createEventMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : null}
                <Text style={styles.primaryButtonText}>
                  {createEventMutation.isPending
                    ? 'Creating...'
                    : 'Create Quick Event'}
                </Text>
                {!createEventMutation.isPending && (
                  <Zap size={20} color="#FFFFFF" style={styles.buttonIcon} />
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Time Picker Modal */}
        {/* <Modal visible={showTimePicker} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTimePicker(false)}>
            <TouchableOpacity activeOpacity={1} style={styles.timePickerContainer}>
              <TimerPicker
                onConfirm={handleTimeConfirm}
                onCancel={() => setShowTimePicker(false)}
                hourLabel="H"
                minuteLabel="M"
                confirmText="Confirm"
                cancelText="Cancel"
                hideSeconds
                styles={{
                  theme: "light",
                  pickerItem: {
                    fontSize: 24,
                  },
                  pickerLabel: {
                    fontSize: 20,
                    marginTop: 8,
                  },
                  btnConfirm: {
                    backgroundColor: "#6366F1",
                    color: "#FFFFFF",
                  },
                }}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal> */}
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
    marginBottom: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
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
    padding: 24,
    borderRadius: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F3F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 1,
    borderWidth: 2,
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
  inputWrapperError: {
    borderColor: '#EF4444',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  validIcon: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
    marginRight: 4,
  },
  infoContainer: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
    lineHeight: 20,
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
  primaryButtonDisabled: {
    opacity: 0.7,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
