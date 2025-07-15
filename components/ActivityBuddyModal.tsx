// project/components/ActivityBuddyModal.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ChevronRight, MapPin, Clock, Users, Car, Package, Star } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { Activity, ActivityQuestionnaire, EquipmentStatus, TransportationStatus } from '@/types/activity';
import { activities, getActivitiesByCategory } from '@/data/activityData';

const theme = {
  primary: '#6366F1',
  accent: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  background: '#FAFAFA',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray900: '#111827',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

interface ActivityBuddyModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (preferences: ActivityQuestionnaire[]) => void;
}

const { width } = Dimensions.get('window');

export default function ActivityBuddyModal({ visible, onClose, onSave }: ActivityBuddyModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [questionnaires, setQuestionnaires] = useState<ActivityQuestionnaire[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Activities', icon: '🎯' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'fitness', name: 'Fitness', icon: '🏃' },
    { id: 'volunteering', name: 'Volunteering', icon: '🤝' },
    { id: 'outdoor', name: 'Outdoor', icon: '🏔️' },
    { id: 'social', name: 'Social', icon: '🎲' },
    { id: 'cultural', name: 'Cultural', icon: '🗣️' },
    { id: 'hobby', name: 'Hobbies', icon: '🎨' },
  ];

  const filteredActivities = selectedCategory === 'all' 
    ? activities 
    : getActivitiesByCategory(selectedCategory);

  const handleActivityToggle = (activityId: string) => {
    setSelectedActivities(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleNextStep = () => {
    if (currentStep === 0 && selectedActivities.length === 0) {
      Alert.alert('Select Activities', 'Please select at least one activity to continue.');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleSave = () => {
    if (questionnaires.length === 0) {
      Alert.alert('Complete Setup', 'Please complete the activity setup before saving.');
      return;
    }
    onSave(questionnaires);
    onClose();
  };

  const updateQuestionnaire = (activityId: string, updates: Partial<ActivityQuestionnaire>) => {
    setQuestionnaires(prev => {
      const existing = prev.find(q => q.activityId === activityId);
      if (existing) {
        return prev.map(q => q.activityId === activityId ? { ...q, ...updates } : q);
      } else {
        return [...prev, { activityId, ...updates } as ActivityQuestionnaire];
      }
    });
  };

  const renderActivitySelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What activities are you open to?</Text>
      <Text style={styles.stepSubtitle}>Select activities you'd like to do with others</Text>
      
      {/* Category Filter */}
      <View style={styles.categoryFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryChipIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.categoryChipTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Activity Grid */}
      <ScrollView style={styles.activityGrid}>
        {filteredActivities.map(activity => (
          <TouchableOpacity
            key={activity.id}
            style={[
              styles.activityCard,
              selectedActivities.includes(activity.id) && styles.activityCardSelected
            ]}
            onPress={() => handleActivityToggle(activity.id)}
          >
            <Text style={styles.activityIcon}>{activity.icon}</Text>
            <Text style={styles.activityName}>{activity.name}</Text>
            <Text style={styles.activityDescription}>{activity.description}</Text>
            {selectedActivities.includes(activity.id) && (
              <View style={styles.selectedIndicator}>
                <Text style={styles.selectedIndicatorText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuestionnaire = () => {
    const currentActivity = activities.find(a => a.id === selectedActivities[currentStep - 1]);
    if (!currentActivity) return null;

    const questionnaire = questionnaires.find(q => q.activityId === currentActivity.id) || {
      activityId: currentActivity.id,
      hasEquipment: false,
      hasTransportation: false,
      skillLevel: 'beginner' as const,
      preferredTimeSlots: [],
      locationRadius: 10,
    };

    return (
      <View style={styles.stepContainer}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityHeaderIcon}>{currentActivity.icon}</Text>
          <View>
            <Text style={styles.activityHeaderTitle}>{currentActivity.name}</Text>
            <Text style={styles.activityHeaderSubtitle}>{currentActivity.description}</Text>
          </View>
        </View>

        <ScrollView style={styles.questionnaireContainer}>
          {/* Equipment Question */}
          {currentActivity.equipment && currentActivity.equipment.length > 0 && (
            <View style={styles.questionSection}>
              <Text style={styles.questionTitle}>
                <Package size={16} color={theme.primary} /> Equipment
              </Text>
              <Text style={styles.questionText}>
                Do you have the equipment needed for {currentActivity.name}?
              </Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioOption,
                    questionnaire.hasEquipment && styles.radioOptionSelected
                  ]}
                  onPress={() => updateQuestionnaire(currentActivity.id, { hasEquipment: true })}
                >
                  <View style={[
                    styles.radioButton,
                    questionnaire.hasEquipment && styles.radioButtonSelected
                  ]} />
                  <Text style={styles.radioText}>Yes, I have the equipment</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioOption,
                    !questionnaire.hasEquipment && styles.radioOptionSelected
                  ]}
                  onPress={() => updateQuestionnaire(currentActivity.id, { hasEquipment: false })}
                >
                  <View style={[
                    styles.radioButton,
                    !questionnaire.hasEquipment && styles.radioButtonSelected
                  ]} />
                  <Text style={styles.radioText}>No, I need equipment</Text>
                </TouchableOpacity>
              </View>
              {questionnaire.hasEquipment === false && (
                <TextInput
                  style={styles.textInput}
                  placeholder="What equipment do you need?"
                  value={questionnaire.equipmentDetails}
                  onChangeText={(text) => updateQuestionnaire(currentActivity.id, { equipmentDetails: text })}
                  multiline
                />
              )}
            </View>
          )}

          {/* Transportation Question */}
          {currentActivity.transportation && (
            <View style={styles.questionSection}>
              <Text style={styles.questionTitle}>
                <Car size={16} color={theme.primary} /> Transportation
              </Text>
              <Text style={styles.questionText}>
                What's your transportation situation for {currentActivity.name}?
              </Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioOption,
                    questionnaire.hasTransportation && styles.radioOptionSelected
                  ]}
                  onPress={() => updateQuestionnaire(currentActivity.id, { hasTransportation: true })}
                >
                  <View style={[
                    styles.radioButton,
                    questionnaire.hasTransportation && styles.radioButtonSelected
                  ]} />
                  <Text style={styles.radioText}>I have transportation</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioOption,
                    !questionnaire.hasTransportation && styles.radioOptionSelected
                  ]}
                  onPress={() => updateQuestionnaire(currentActivity.id, { hasTransportation: false })}
                >
                  <View style={[
                    styles.radioButton,
                    !questionnaire.hasTransportation && styles.radioButtonSelected
                  ]} />
                  <Text style={styles.radioText}>I need transportation</Text>
                </TouchableOpacity>
              </View>
              {questionnaire.hasTransportation === false && (
                <TextInput
                  style={styles.textInput}
                  placeholder="Any transportation preferences?"
                  value={questionnaire.transportationDetails}
                  onChangeText={(text) => updateQuestionnaire(currentActivity.id, { transportationDetails: text })}
                  multiline
                />
              )}
            </View>
          )}

          {/* Skill Level */}
          <View style={styles.questionSection}>
            <Text style={styles.questionTitle}>
              <Star size={16} color={theme.primary} /> Skill Level
            </Text>
            <Text style={styles.questionText}>
              What's your experience level with {currentActivity.name}?
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={questionnaire.skillLevel}
                onValueChange={(value) => updateQuestionnaire(currentActivity.id, { skillLevel: value })}
                style={styles.picker}
              >
                <Picker.Item label="Beginner" value="beginner" />
                <Picker.Item label="Intermediate" value="intermediate" />
                <Picker.Item label="Advanced" value="advanced" />
              </Picker>
            </View>
          </View>

          {/* Location Radius */}
          <View style={styles.questionSection}>
            <Text style={styles.questionTitle}>
              <MapPin size={16} color={theme.primary} /> Location Radius
            </Text>
            <Text style={styles.questionText}>
              How far are you willing to travel for {currentActivity.name}?
            </Text>
            <View style={styles.radiusContainer}>
              <Text style={styles.radiusValue}>{questionnaire.locationRadius} miles</Text>
              <View style={styles.sliderContainer}>
                <View style={styles.sliderTrack}>
                  <View 
                    style={[
                      styles.sliderFill, 
                      { width: `${(questionnaire.locationRadius / 50) * 100}%` }
                    ]} 
                  />
                </View>
                <TouchableOpacity
                  style={styles.sliderThumb}
                  onPressIn={() => {
                    // Simple slider interaction - in a real app you'd use a proper slider component
                    const newRadius = questionnaire.locationRadius === 50 ? 10 : questionnaire.locationRadius + 10;
                    updateQuestionnaire(currentActivity.id, { locationRadius: newRadius });
                  }}
                />
              </View>
            </View>
          </View>

          {/* Additional Notes */}
          <View style={styles.questionSection}>
            <Text style={styles.questionTitle}>Additional Notes</Text>
            <Text style={styles.questionText}>
              Any other preferences or information for {currentActivity.name}?
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Optional: Share any preferences, restrictions, or additional info..."
              value={questionnaire.additionalNotes}
              onChangeText={(text) => updateQuestionnaire(currentActivity.id, { additionalNotes: text })}
              multiline
              numberOfLines={4}
            />
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderProgress = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${((currentStep + 1) / (selectedActivities.length + 1)) * 100}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>
        Step {currentStep + 1} of {selectedActivities.length + 1}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Activity Buddy</Text>
          <View style={styles.headerSpacer} />
        </View>

        {renderProgress()}

        {/* Content */}
        <View style={styles.content}>
          {currentStep === 0 && renderActivitySelection()}
          {currentStep > 0 && renderQuestionnaire()}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handlePreviousStep}>
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          {currentStep === 0 ? (
            <TouchableOpacity style={styles.primaryButton} onPress={handleNextStep}>
              <Text style={styles.primaryButtonText}>Continue</Text>
              <ChevronRight size={20} color={theme.white} />
            </TouchableOpacity>
          ) : currentStep < selectedActivities.length ? (
            <TouchableOpacity style={styles.primaryButton} onPress={handleNextStep}>
              <Text style={styles.primaryButtonText}>Next Activity</Text>
              <ChevronRight size={20} color={theme.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
              <Text style={styles.primaryButtonText}>Save Preferences</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.gray200,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 24,
  },
  categoryFilter: {
    marginBottom: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.white,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  categoryChipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  categoryChipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  categoryChipTextActive: {
    color: theme.white,
  },
  activityGrid: {
    flex: 1,
  },
  activityCard: {
    backgroundColor: theme.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: theme.border,
    position: 'relative',
  },
  activityCardSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.primary + '10',
  },
  activityIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  activityName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: theme.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicatorText: {
    color: theme.white,
    fontSize: 14,
    fontWeight: '600',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  activityHeaderIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  activityHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  activityHeaderSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  questionnaireContainer: {
    flex: 1,
  },
  questionSection: {
    marginBottom: 24,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.white,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  radioOptionSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.primary + '10',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.gray400,
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.primary,
  },
  radioText: {
    fontSize: 16,
    color: theme.textPrimary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.white,
    color: theme.textPrimary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.white,
  },
  picker: {
    height: 50,
  },
  radiusContainer: {
    alignItems: 'center',
  },
  radiusValue: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 16,
  },
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
  },
  sliderTrack: {
    width: '100%',
    height: 4,
    backgroundColor: theme.gray200,
    borderRadius: 2,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 2,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: theme.primary,
    borderRadius: 10,
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -10,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.white,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    marginRight: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  primaryButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    color: theme.white,
    fontWeight: '600',
    marginRight: 8,
  },
}); 