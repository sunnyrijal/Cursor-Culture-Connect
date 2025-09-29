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
  Globe,
  GraduationCap,
  UserRoundCog,
} from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateQuickEvent } from '@/contexts/quickEvent.api';
import { TimeSelectInput } from './TimeSelectInput';

interface QuickEvent {
  id: string;
  name: string;
  description: string;
  location: string;
  time: string | null;
  max: string | null;
  isPublic: boolean;
}

interface EditQuickEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => void;
  quickEvent: QuickEvent | null;
}

export function EditQuickEventModal({
  visible,
  onClose,
  onSubmit,
  quickEvent,
}: EditQuickEventModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    time: '',
    max: '',
    isPublic: true,
  });
  
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const resetForm = () => {
    if (quickEvent) {
      setFormData({
        name: quickEvent.name || '',
        description: quickEvent.description || '',
        location: quickEvent.location || '',
        time: quickEvent.time || '',
        max: quickEvent.max || '',
        isPublic: quickEvent.isPublic,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        location: '',
        time: '',
        max: '',
        isPublic: true,
      });
    }
    setFocusedInput(null);
  };

  useEffect(() => {
    if (visible && quickEvent) {
      resetForm();
    } else if (!visible) {
      setFocusedInput(null);
    }
  }, [visible, quickEvent]);

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

  const updateQuickEventMutation = useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: any }) => 
      updateQuickEvent(eventId, data),
    onSuccess: (data, variables) => {
      console.log('Quick Event updated successfully:', data);

      queryClient.invalidateQueries({ queryKey: ['quick-events'] });
      queryClient.invalidateQueries({ queryKey: ['quick-event', quickEvent?.id] });

      Alert.alert('Success', 'Quick Event updated successfully!');

      onSubmit(variables.data);
      setIsSubmitting(false);
      onClose();
    },
    onError: (error: any) => {
      console.error('Error updating Quick Event:', error);
      setIsSubmitting(false);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update event. Please try again.';
      Alert.alert('Error', errorMessage);
    },
  });

  const handleSubmit = async () => {
    if (!quickEvent) {
      Alert.alert('Error', 'Event data not available.');
      return;
    }

    if (!formData.name || !formData.location) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    // Validate time if provided
    if (formData.time) {
      const timeValidation = validateTime(formData.time);
      if (!timeValidation.isValid) {
        Alert.alert(
          'Invalid Time',
          timeValidation.error ||
            'Please enter a valid time in HH:MM format.'
        );
        return;
      }
    }

    // Validate max people if provided
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

    setIsSubmitting(true);
    
    const eventData: any = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      time: formData.time || null,
      max: formData.max || null,
      isPublic: formData.isPublic,
    };
    
    console.log('Updating quick event with data:', eventData);
    updateQuickEventMutation.mutate({ eventId: quickEvent.id, data: eventData });
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    icon?: React.ReactNode,
    multiline = false,
    required = false,
    keyboardType: 'default' | 'numeric' = 'default',
    maxLength?: number
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
            numberOfLines={multiline ? 3 : 1}
            onFocus={() => setFocusedInput(inputKey)}
            onBlur={() => setFocusedInput(null)}
            editable={!isSubmitting && !updateQuickEventMutation.isPending}
            keyboardType={keyboardType}
            maxLength={maxLength}
          />
          {hasValue && (
            <View style={styles.validIcon}>
              <Check size={16} color="#10B981" />
            </View>
          )}
        </View>
        {label === 'Description' && (
          <Text style={styles.characterCount}>
            {value.length}/{maxLength || 300}
          </Text>
        )}
      </View>
    );
  };

  if (!visible || !quickEvent) return null;

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
            <Text style={styles.title}>Edit Quick Event</Text>
            <Text style={styles.subtitle}>
              Update your event information
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
                {/* Event Title */}
                {renderInput(
                  'Event Title',
                  formData.name,
                  (text) => setFormData({ ...formData, name: text }),
                  'Enter event title',
                  <Sparkles size={16} color="#6366F1" />,
                  false,
                  true,
                  'default',
                  100
                )}

                {/* Description */}
                {renderInput(
                  'Description',
                  formData.description,
                  (text) => setFormData({ ...formData, description: text }),
                  'Brief description of your event...',
                  undefined,
                  true,
                  false,
                  'default',
                  300
                )}

                {/* Location */}
                {renderInput(
                  'Location',
                  formData.location,
                  (text) => setFormData({ ...formData, location: text }),
                  'Enter event location',
                  <MapPin size={16} color="#6366F1" />,
                  false,
                  true,
                  'default',
                  100
                )}

                {/* Time */}
                <TimeSelectInput
                  value={formData.time}
                  onTimeChange={(time) => setFormData({ ...formData, time })}
                  label="Time"
                  placeholder="Select a time"
                  disabled={isSubmitting || updateQuickEventMutation.isPending}
                  required={false}
                />

                {/* Max People */}
                {renderInput(
                  'Max People',
                  formData.max,
                  (text) => setFormData({
                    ...formData,
                    max: text.replace(/[^0-9]/g, ''),
                  }),
                  'e.g., 10',
                  <UserRoundCog size={16} color="#6366F1" />,
                  false,
                  false,
                  'numeric',
                  4
                )}

                {/* Visibility Settings */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Event Visibility <Text style={{ color: '#EF4444' }}>*</Text>
                  </Text>
                  <View style={styles.rowContainer}>
                    <TouchableOpacity
                      style={[
                        styles.visibilityButton,
                        formData.isPublic && styles.visibilityButtonActive,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, isPublic: true })
                      }
                      disabled={isSubmitting || updateQuickEventMutation.isPending}
                    >
                      <LinearGradient
                        colors={
                          formData.isPublic
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
                          color={formData.isPublic ? '#FFFFFF' : '#374151'}
                        />
                        <Text
                          style={[
                            styles.visibilityButtonText,
                            formData.isPublic &&
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
                        !formData.isPublic && styles.visibilityButtonActive,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, isPublic: false })
                      }
                      disabled={isSubmitting || updateQuickEventMutation.isPending}
                    >
                      <LinearGradient
                        colors={
                          !formData.isPublic
                            ? ['#6366F1', '#8B5CF6']
                            : [
                                'rgba(255, 255, 255, 0.9)',
                                'rgba(248, 250, 252, 0.8)',
                              ]
                        }
                        style={styles.visibilityButtonGradient}
                      >
                        <GraduationCap
                          size={16}
                          color={!formData.isPublic ? '#FFFFFF' : '#374151'}
                        />
                        <Text
                          style={[
                            styles.visibilityButtonText,
                            !formData.isPublic &&
                              styles.visibilityButtonTextActive,
                          ]}
                        >
                          University Only
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Info Container */}
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
                      Changes to your quick event will be visible immediately!
                    </Text>
                  </LinearGradient>
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
            disabled={isSubmitting || updateQuickEventMutation.isPending}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (isSubmitting || updateQuickEventMutation.isPending) && styles.primaryButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || updateQuickEventMutation.isPending}
          >
            <LinearGradient
              colors={
                isSubmitting || updateQuickEventMutation.isPending 
                  ? ['#94A3B8', '#64748B'] 
                  : ['#6366F1', '#8B5CF6']
              }
              style={styles.buttonGradient}
            >
              <View style={styles.buttonContent}>
                {(isSubmitting || updateQuickEventMutation.isPending) && (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                )}
                <Text style={styles.primaryButtonText}>
                  {isSubmitting || updateQuickEventMutation.isPending ? 'Updating...' : 'Update Event'}
                </Text>
                {!isSubmitting && !updateQuickEventMutation.isPending && (
                  <Zap
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
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  validIcon: {
    marginLeft: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
    marginRight: 4,
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
});