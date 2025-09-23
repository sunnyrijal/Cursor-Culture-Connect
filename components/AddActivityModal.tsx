'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Sparkles,
  ChevronDown,
  Zap,
  ClipboardList,
  FileText,
} from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createActivity,
  updateActivity,
  deleteActivity,
  CreateActivityData,
  UpdateActivityData,
  ActivityResponse,
} from '@/contexts/activity.api';
import { getInterests, Interest } from '@/contexts/interest.api';

interface CreateActivityModalProps {
  visible: boolean;
  onClose: () => void;
  editingActivity?: ActivityResponse | null;
}

export function CreateActivityModal({
  visible,
  onClose,
  editingActivity = null,
}: CreateActivityModalProps) {
  const [formData, setFormData] = useState<
    CreateActivityData & { interestId: string }
  >({
    name: '',
    description: '',
    interestId: '',
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showInterestDropdown, setShowInterestDropdown] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState<Interest | null>(
    null
  );

  const queryClient = useQueryClient();

  const { data: interestsData, isLoading: interestsLoading } = useQuery({
    queryKey: ['interests'],
    queryFn: getInterests,
  });

  const interests = interestsData?.data || [];

  // Reset form when modal opens/closes or when switching between create/edit modes
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      interestId: '',
    });
    setSelectedInterest(null);
    setFocusedField(null);
    setShowInterestDropdown(false);
  }, []);

  // Handle editing activity setup
  useEffect(() => {
    if (!visible) {
      return;
    }

    if (editingActivity && interests.length > 0) {
      setFormData({
        name: editingActivity.name,
        description: editingActivity.description || '',
        interestId: editingActivity.interestId,
      });
      const interest = interests.find(
        (i: Interest) => i.id === editingActivity.interestId
      );
      if (interest) {
        setSelectedInterest(interest);
      }
    } else if (!editingActivity) {
      resetForm();
    }
  }, [visible, editingActivity?.id, interests.length, resetForm]); // Only depend on the ID and length, not the entire arrays

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible, resetForm]);

  const createActivityMutation = useMutation({
    mutationFn: createActivity,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      Alert.alert('Success', 'Activity created successfully!');
      onClose();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create activity.';
      Alert.alert('Error', errorMessage);
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: ({
      id,
      updateData,
    }: {
      id: string;
      updateData: UpdateActivityData;
    }) => updateActivity(id, updateData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      Alert.alert('Success', 'Activity updated successfully!');
      onClose();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update activity.';
      Alert.alert('Error', errorMessage);
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      Alert.alert('Success', 'Activity deleted successfully!');
      onClose();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete activity.';
      Alert.alert('Error', errorMessage);
    },
  });

  const isPending =
    createActivityMutation.isPending ||
    updateActivityMutation.isPending ||
    deleteActivityMutation.isPending;

  const handleSubmit = async () => {
    if (!formData.name || !formData.name.trim()) {
      Alert.alert('Missing Name', 'Please enter an activity name.');
      return;
    }
    if (!formData.interestId) {
      Alert.alert('Missing Interest', 'Please select an interest.');
      return;
    }

    const submissionData = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
    };

    if (editingActivity) {
      updateActivityMutation.mutate({
        id: editingActivity.id,
        updateData: submissionData,
      });
    } else {
      createActivityMutation.mutate(submissionData as CreateActivityData);
    }
  };

  const handleDelete = () => {
    if (!editingActivity) return;

    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteActivityMutation.mutate(editingActivity.id),
        },
      ]
    );
  };

  const selectInterest = useCallback((interest: Interest) => {
    setSelectedInterest(interest);
    setFormData(prev => ({ ...prev, interestId: interest.id }));
    setShowInterestDropdown(false);
  }, []);

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
            <Text style={styles.title}>
              {editingActivity ? 'Edit Activity' : 'Create Activity'}
            </Text>
            <Text style={styles.subtitle}>
              {editingActivity
                ? 'Update the activity details'
                : 'Add a new activity for users to engage in'}
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
                {/* Activity Name */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Activity Name *</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === 'name' && styles.inputWrapperFocused,
                    ]}
                  >
                    <ClipboardList
                      size={20}
                      color="#6366F1"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={formData.name}
                      onChangeText={(text) =>
                        setFormData(prev => ({ ...prev, name: text }))
                      }
                      placeholder="e.g., Basketball, Hiking, Coding"
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* Interest Selection */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Related Interest *</Text>
                  <TouchableOpacity
                    onPress={() => setShowInterestDropdown(!showInterestDropdown)}
                    disabled={isPending || interestsLoading}
                  >
                    <View
                      style={[
                        styles.inputWrapper,
                        selectedInterest && styles.inputWrapperValid,
                      ]}
                    >
                      <Sparkles
                        size={20}
                        color="#6366F1"
                        style={styles.inputIcon}
                      />
                      <Text
                        style={[
                          styles.input,
                          !selectedInterest && { color: '#9CA3AF' },
                        ]}
                      >
                        {selectedInterest
                          ? selectedInterest.name
                          : 'Select an interest'}
                      </Text>
                      <ChevronDown size={20} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>

                  {showInterestDropdown && (
                    <View style={styles.dropdown}>
                      <ScrollView
                        style={styles.dropdownScroll}
                        nestedScrollEnabled
                      >
                        {interests.map((interest: Interest) => (
                          <TouchableOpacity
                            key={interest.id}
                            style={styles.dropdownItem}
                            onPress={() => selectInterest(interest)}
                          >
                            <Text style={styles.dropdownItemText}>
                              {interest.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Description */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === 'description' &&
                        styles.inputWrapperFocused,
                    ]}
                  >
                    <FileText
                      size={20}
                      color="#6366F1"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={formData.description}
                      onChangeText={(text) =>
                        setFormData(prev => ({ ...prev, description: text }))
                      }
                      placeholder="A short description of the activity..."
                      multiline
                      numberOfLines={3}
                      onFocus={() => setFocusedField('description')}
                      onBlur={() => setFocusedField(null)}
                      placeholderTextColor="#9CA3AF"
                      maxLength={500}
                    />
                  </View>
                </View>
              </LinearGradient>
            </BlurView>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {editingActivity && (
            <View style={styles.editActionsRow}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={isPending}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.mainActionsRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isPending}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                isPending && styles.primaryButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isPending}
            >
              <LinearGradient
                colors={
                  isPending ? ['#9CA3AF', '#6B7280'] : ['#6366F1', '#8B5CF6']
                }
                style={styles.buttonGradient}
              >
                <View style={styles.buttonContent}>
                  {isPending && (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  )}
                  <Text style={styles.primaryButtonText}>
                    {isPending
                      ? 'Saving...'
                      : editingActivity
                      ? 'Update Activity'
                      : 'Create Activity'}
                  </Text>
                  {!isPending && (
                    <Zap size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F3F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#CDD2D8',
    minHeight: 56,
  },
  inputWrapperFocused: {
    borderColor: '#6366F1',
    backgroundColor: '#FFFFFF',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
    maxHeight: 200,
    elevation: 4,
  },
  dropdownScroll: {
    maxHeight: 180,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 20,
    backgroundColor: '#F0F3F7',
    borderTopWidth: 1,
    borderTopColor: '#CDD2D8',
  },
  editActionsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  mainActionsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  deleteButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
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
    elevation: 8,
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
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

