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
  Users,
  Globe,
  GraduationCap,
  Car,
  Package,
  Star,
  ChevronDown,
  Plus,
} from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateActivityModal } from './AddActivityModal';
import { createUserInterest, updateUserInterest, deleteUserInterest, toggleUserInterestStatus } from '@/contexts/userInterest.api';
import { getInterests } from '@/contexts/interest.api';
import { getActivities } from '@/contexts/activity.api';

interface CreateInterestPreferenceModalProps {
  visible: boolean;
  onClose: () => void;
  editingPreference?: any; // For editing existing preference
  onSubmit?: (preferenceData: any) => void;
}

// Renaming for clarity, as it will now handle activities
interface ActivityOption {
  id: string;
  name: string;
  description?: string;
}

export function CreateInterestPreferenceModal({
  visible,
  onClose,
  editingPreference = null,
  onSubmit,
}: CreateInterestPreferenceModalProps) {
  const [formData, setFormData] = useState({
    activityId: '',
    hasEquipment: true,
    needsEquipment: false,
    equipmentNeeded: '',
    hasTransport: true,
    needsTransport: false,
    transportDetails: '',
    skillLevel: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    locationRadius: 10,
    additionalNotes: '',
    isActive: true,
  });
  
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showInterestDropdown, setShowInterestDropdown] = useState(false);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityOption | null>(null);
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced'];
  const radiusOptions = [5, 10, 15, 20, 25, 30, 50];

  // Fetch interests
  const { data: interestsData, isLoading: interestsLoading } = useQuery({
    queryKey: ['interests'],
    queryFn: getInterests, // This will be commented out as requested
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['activities'], // Changed queryKey to be more specific
    queryFn: () => getActivities(),
  });

  const interests = interestsData?.data || [];
  const activities= activityData?.data || [];
  console.log(activities)

 useEffect(() => {
    if (editingPreference) {
      // Pre-fill form for editing
      setFormData({
        activityId: editingPreference.interestId, // This will now be activityId
        hasEquipment: editingPreference.hasEquipment,
        needsEquipment: editingPreference.needsEquipment,
        equipmentNeeded: editingPreference.equipmentNeeded || '',
        hasTransport: editingPreference.hasTransport,
        needsTransport: editingPreference.needsTransport,
        transportDetails: editingPreference.transportDetails || '',
        skillLevel: editingPreference.skillLevel || 'Beginner',
        locationRadius: editingPreference.locationRadius,
        additionalNotes: editingPreference.additionalNotes || '',
        isActive: editingPreference.isActive,
      });
      
      // Set selected interest
      const activity = activities.find((a: any) => a.id === editingPreference.interestId);
      if (activity) {
        setSelectedActivity(activity);
      }
    } else if (!visible) {
      // Reset form when modal closes
      setFormData({
        activityId: '',
        hasEquipment: true,
        needsEquipment: false,
        equipmentNeeded: '',
        hasTransport: true,
        needsTransport: false,
        transportDetails: '',
        skillLevel: 'Beginner',
        locationRadius: 10,
        additionalNotes: '',
        isActive: true,
      });
      setSelectedActivity(null);
      setFocusedField(null);
    }
  }, [visible, editingPreference, activities]);

  const queryClient = useQueryClient();

  const createPreferenceMutation = useMutation({
    mutationFn: createUserInterest,
    onSuccess: (data) => {
      console.log('Interest preference created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['user-interests'] });
      Alert.alert('Success', 'Interest preference created successfully!');
      onSubmit?.(data);
      onClose();
    },
    onError: (error: any) => {
      console.error('Error creating interest preference:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create preference.';
      Alert.alert('Error', errorMessage);
    },
  });

  const updatePreferenceMutation = useMutation({
    mutationFn: ({ id, updateData }: { id: string; updateData: any }) => 
      updateUserInterest(id, updateData),
    onSuccess: (data) => {
      console.log('Interest preference updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['user-interests'] });
      Alert.alert('Success', 'Interest preference updated successfully!');
      onSubmit?.(data);
      onClose();
    },
    onError: (error: any) => {
      console.error('Error updating interest preference:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update preference.';
      Alert.alert('Error', errorMessage);
    },
  });

  const deletePreferenceMutation = useMutation({
    mutationFn: deleteUserInterest,
    onSuccess: () => {
      console.log('Interest preference deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['user-interests'] });
      Alert.alert('Success', 'Interest preference deleted successfully!');
      onClose();
    },
    onError: (error: any) => {
      console.error('Error deleting interest preference:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete preference.';
      Alert.alert('Error', errorMessage);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: toggleUserInterestStatus,
    onSuccess: (data) => {
      console.log('Interest preference status toggled successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['user-interests'] });
      const status = data.isActive ? 'activated' : 'deactivated';
      Alert.alert('Success', `Interest preference ${status} successfully!`);
      onClose();
    },
    onError: (error: any) => {
      console.error('Error toggling interest preference status:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to toggle status.';
      Alert.alert('Error', errorMessage);
    },
  });

  const isPending = createPreferenceMutation.isPending || updatePreferenceMutation.isPending || 
                   deletePreferenceMutation.isPending || toggleStatusMutation.isPending;

  const handleSubmit = async () => {
    if (!formData.activityId) {
      Alert.alert('Missing Interest', 'Please select an interest.');
      return;
    }

    if (formData.needsEquipment && !formData.equipmentNeeded.trim()) {
      Alert.alert('Equipment Required', 'Please specify what equipment you need.');
      return;
    }

    if (formData.needsTransport && !formData.transportDetails.trim()) {
      Alert.alert('Transport Details Required', 'Please specify your transportation needs.');
      return;
    }

    const submissionData = {
      activityId: formData.activityId, // The backend expects 'interestId', so we map activityId to it here.
      hasEquipment: formData.hasEquipment,
      needsEquipment: formData.needsEquipment,
      equipmentNeeded: formData.needsEquipment ? formData.equipmentNeeded.trim() : undefined,
      hasTransport: formData.hasTransport,
      needsTransport: formData.needsTransport,
      transportDetails: formData.needsTransport ? formData.transportDetails.trim() : undefined,
      skillLevel: formData.skillLevel,
      locationRadius: formData.locationRadius,
      additionalNotes: formData.additionalNotes.trim() || undefined,
      isActive: formData.isActive,
    };

    if (editingPreference) {
      updatePreferenceMutation.mutate({
        id: editingPreference.id,
        updateData: submissionData,
      });
    } else {
      createPreferenceMutation.mutate(submissionData);
    }
  };

  const handleDelete = () => {
    if (!editingPreference) return;
    
    Alert.alert(
      'Delete Preference',
      'Are you sure you want to delete this interest preference?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePreferenceMutation.mutate(editingPreference.id),
        },
      ]
    );
  };

  const handleToggleStatus = () => {
    if (!editingPreference) return;
    
    const action = editingPreference.isActive ? 'deactivate' : 'activate';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Preference`,
      `Are you sure you want to ${action} this interest preference?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: () => toggleStatusMutation.mutate(editingPreference.id),
        },
      ]
    );
  };

  const selectActivity = (activity: ActivityOption) => {
    setSelectedActivity(activity);
    setFormData({ ...formData, activityId: activity.id }); // Use activityId in the form state
    setShowInterestDropdown(false);
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
            <Text style={styles.title}>
              {editingPreference ? 'Edit Interest Preference' : 'Activity Buddy'}
            </Text>
            <Text style={styles.subtitle}>
              {editingPreference ? 'Update your preferences' : 'Set your interest preferences'}
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
                {/* Interest Selection */}
                 <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Activity *</Text>
                  <TouchableOpacity
                    onPress={() => setShowInterestDropdown(!showInterestDropdown)}
                    disabled={isPending || activityLoading}
                  >
                    <View
                      style={[
                        styles.inputWrapper,
                        selectedActivity && styles.inputWrapperValid,
                      ]}
                    >
                      <Sparkles size={20} color="#6366F1" style={styles.inputIcon} />
                      <Text
                        style={[
                          styles.input,
                          !selectedActivity && { color: '#9CA3AF' },
                        ]}
                      >
                        {selectedActivity ? selectedActivity.name : 'Select an activity'}
                      </Text>
                      <ChevronDown size={20} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>
                  
                  {showInterestDropdown && (
                     <View style={styles.dropdown}>
                      <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                        {activities.map((activity: ActivityOption) => (
                          <TouchableOpacity
                            key={activity.id}
                            style={styles.dropdownItem}
                            onPress={() => selectActivity(activity)}
                          >
                            <Text style={styles.dropdownItemText}>{activity.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.addActivityButton}
                    onPress={() => setIsActivityModalVisible(true)}
                  >
                    <Plus size={16} color="#6366F1" />
                    <Text style={styles.addActivityButtonText}>
                      Add New Activity
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Equipment Section */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Equipment</Text>
                  <View style={styles.rowContainer}>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        formData.hasEquipment && styles.optionButtonActive,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, hasEquipment: true, needsEquipment: false, equipmentNeeded: '' })
                      }
                    >
                      <LinearGradient
                        colors={
                          formData.hasEquipment
                            ? ['#10B981', '#059669']
                            : ['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.8)']
                        }
                        style={styles.optionButtonGradient}
                      >
                        <Check size={16} color={formData.hasEquipment ? '#FFFFFF' : '#374151'} />
                        <Text
                          style={[
                            styles.optionButtonText,
                            formData.hasEquipment && styles.optionButtonTextActive,
                          ]}
                        >
                          I have equipment
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        formData.needsEquipment && styles.optionButtonActive,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, hasEquipment: false, needsEquipment: true })
                      }
                    >
                      <LinearGradient
                        colors={
                          formData.needsEquipment
                            ? ['#F59E0B', '#D97706']
                            : ['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.8)']
                        }
                        style={styles.optionButtonGradient}
                      >
                        <Package size={16} color={formData.needsEquipment ? '#FFFFFF' : '#374151'} />
                        <Text
                          style={[
                            styles.optionButtonText,
                            formData.needsEquipment && styles.optionButtonTextActive,
                          ]}
                        >
                          I need equipment
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  {formData.needsEquipment && (
                    <View style={styles.conditionalInput}>
                      <Text style={styles.conditionalLabel}>What equipment do you need?</Text>
                      <View
                        style={[
                          styles.inputWrapper,
                          focusedField === 'equipmentNeeded' && styles.inputWrapperFocused,
                          formData.equipmentNeeded && styles.inputWrapperValid,
                        ]}
                      >
                        <TextInput
                          style={styles.input}
                          value={formData.equipmentNeeded}
                          onChangeText={(text) =>
                            setFormData({ ...formData, equipmentNeeded: text })
                          }
                          placeholder="e.g. Tennis racket, balls"
                          onFocus={() => setFocusedField('equipmentNeeded')}
                          onBlur={() => setFocusedField(null)}
                          placeholderTextColor="#9CA3AF"
                          maxLength={200}
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* Transportation Section */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Transportation</Text>
                  <View style={styles.rowContainer}>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        formData.hasTransport && styles.optionButtonActive,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, hasTransport: true, needsTransport: false, transportDetails: '' })
                      }
                    >
                      <LinearGradient
                        colors={
                          formData.hasTransport
                            ? ['#10B981', '#059669']
                            : ['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.8)']
                        }
                        style={styles.optionButtonGradient}
                      >
                        <Car size={16} color={formData.hasTransport ? '#FFFFFF' : '#374151'} />
                        <Text
                          style={[
                            styles.optionButtonText,
                            formData.hasTransport && styles.optionButtonTextActive,
                          ]}
                        >
                          I have transportation
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        formData.needsTransport && styles.optionButtonActive,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, hasTransport: false, needsTransport: true })
                      }
                    >
                      <LinearGradient
                        colors={
                          formData.needsTransport
                            ? ['#F59E0B', '#D97706']
                            : ['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.8)']
                        }
                        style={styles.optionButtonGradient}
                      >
                        <Users size={16} color={formData.needsTransport ? '#FFFFFF' : '#374151'} />
                        <Text
                          style={[
                            styles.optionButtonText,
                            formData.needsTransport && styles.optionButtonTextActive,
                          ]}
                        >
                          I need transportation
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  {formData.needsTransport && (
                    <View style={styles.conditionalInput}>
                      <Text style={styles.conditionalLabel}>Transportation preferences</Text>
                      <View
                        style={[
                          styles.inputWrapper,
                          focusedField === 'transportDetails' && styles.inputWrapperFocused,
                          formData.transportDetails && styles.inputWrapperValid,
                        ]}
                      >
                        <TextInput
                          style={styles.input}
                          value={formData.transportDetails}
                          onChangeText={(text) =>
                            setFormData({ ...formData, transportDetails: text })
                          }
                          placeholder="e.g. Can pick up from campus"
                          onFocus={() => setFocusedField('transportDetails')}
                          onBlur={() => setFocusedField(null)}
                          placeholderTextColor="#9CA3AF"
                          maxLength={200}
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* Skill Level */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Skill Level</Text>
                  <TouchableOpacity
                    onPress={() => setShowSkillDropdown(!showSkillDropdown)}
                    disabled={isPending}
                  >
                    <View style={[styles.inputWrapper, styles.inputWrapperValid]}>
                      <Star size={20} color="#6366F1" style={styles.inputIcon} />
                      <Text style={styles.input}>{formData.skillLevel}</Text>
                      <ChevronDown size={20} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>
                  
                  {showSkillDropdown && (
                    <View style={styles.dropdown}>
                      {skillLevels.map((level) => (
                        <TouchableOpacity
                          key={level}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setFormData({ ...formData, skillLevel: level as any });
                            setShowSkillDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{level}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Location Radius */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Location Radius</Text>
                  <View style={styles.radiusContainer}>
                    {radiusOptions.map((radius) => (
                      <TouchableOpacity
                        key={radius}
                        style={[
                          styles.radiusButton,
                          formData.locationRadius === radius && styles.radiusButtonActive,
                        ]}
                        onPress={() => setFormData({ ...formData, locationRadius: radius })}
                      >
                        <Text
                          style={[
                            styles.radiusButtonText,
                            formData.locationRadius === radius && styles.radiusButtonTextActive,
                          ]}
                        >
                          {radius} mi
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Additional Notes */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Additional Notes</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === 'additionalNotes' && styles.inputWrapperFocused,
                      formData.additionalNotes && styles.inputWrapperValid,
                    ]}
                  >
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={formData.additionalNotes}
                      onChangeText={(text) =>
                        setFormData({ ...formData, additionalNotes: text })
                      }
                      placeholder="Any additional preferences or information..."
                      multiline
                      numberOfLines={3}
                      onFocus={() => setFocusedField('additionalNotes')}
                      onBlur={() => setFocusedField(null)}
                      placeholderTextColor="#9CA3AF"
                      maxLength={500}
                    />
                  </View>
                  <Text style={styles.characterCount}>
                    {formData.additionalNotes.length}/500
                  </Text>
                </View>

                {/* Active Status Toggle */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Status</Text>
                  <View style={styles.rowContainer}>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        formData.isActive && styles.statusButtonActive,
                      ]}
                      onPress={() => setFormData({ ...formData, isActive: true })}
                    >
                      <LinearGradient
                        colors={
                          formData.isActive
                            ? ['#10B981', '#059669']
                            : ['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.8)']
                        }
                        style={styles.statusButtonGradient}
                      >
                        <Zap size={16} color={formData.isActive ? '#FFFFFF' : '#374151'} />
                        <Text
                          style={[
                            styles.statusButtonText,
                            formData.isActive && styles.statusButtonTextActive,
                          ]}
                        >
                          Active
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        !formData.isActive && styles.statusButtonActive,
                      ]}
                      onPress={() => setFormData({ ...formData, isActive: false })}
                    >
                      <LinearGradient
                        colors={
                          !formData.isActive
                            ? ['#64748B', '#475569']
                            : ['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.8)']
                        }
                        style={styles.statusButtonGradient}
                      >
                        <Text
                          style={[
                            styles.statusButtonText,
                            !formData.isActive && styles.statusButtonTextActive,
                          ]}
                        >
                          Inactive
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
          {editingPreference && (
            <View style={styles.editActionsRow}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={isPending}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toggleButton}
                onPress={handleToggleStatus}
                disabled={isPending}
              >
                <Text style={styles.toggleButtonText}>
                  {editingPreference.isActive ? 'Deactivate' : 'Activate'}
                </Text>
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
                  isPending
                    ? ['#9CA3AF', '#6B7280']
                    : ['#6366F1', '#8B5CF6']
                }
                style={styles.buttonGradient}
              >
                <View style={styles.buttonContent}>
                  {isPending && <ActivityIndicator size="small" color="#FFFFFF" />}
                  <Text style={styles.primaryButtonText}>
                    {isPending
                      ? 'Saving...'
                      : editingPreference
                      ? 'Update Preferences'
                      : 'Save Preferences'}
                  </Text>
                  {!isPending && (
                    <Zap size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        <CreateActivityModal
          visible={isActivityModalVisible}
          onClose={() => setIsActivityModalVisible(false)}
          editingActivity={null}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F3F7',
  },
  addActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  addActivityButtonText: {
    color: '#6366F1',
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F0F3F7',
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
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
    marginRight: 4,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
    maxHeight: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
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
  conditionalInput: {
    marginTop: 16,
  },
  conditionalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
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
  optionButtonActive: {
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
  optionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  optionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  optionButtonTextActive: {
    color: '#FFFFFF',
  },
  statusButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'white',
    borderColor: 'rgba(226, 232, 240, 0.8)',
    overflow: 'hidden',
  },
  statusButtonActive: {
    borderColor: '#6366F1',
  },
  statusButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statusButtonTextActive: {
    color: '#FFFFFF',
  },
  radiusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radiusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  radiusButtonActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  radiusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  radiusButtonTextActive: {
    color: '#FFFFFF',
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
    gap: 12,
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
  toggleButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
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
  }
})