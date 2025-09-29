import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { StyleSheet } from 'react-native';
import { X, Trash2, ToggleLeft, ToggleRight, MapPin, Clock, SlidersHorizontal, Plus } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyActivityPreferences, deleteUserInterest, toggleUserInterestStatus } from '../contexts/userInterest.api';
import { CreateInterestPreferenceModal } from './CreateUserPreferenceModal';

interface MyPreferencesModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ActivityPreference {
  id: string;
  userId: string;
  activityId: string;
  hasEquipment: boolean;
  needsEquipment: boolean;
  equipmentNeeded: string | null;
  hasTransport: boolean;
  needsTransport: boolean;
  transportDetails: string | null;
  skillLevel: string;
  locationRadius: number;
  availableDays: string[];
  preferredTimes: string[];
  additionalNotes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  activity: {
    id: string;
    name: string;
    description: string;
    interest: {
      name: string;
    };
  };
}

const MyPreferencesModal: React.FC<MyPreferencesModalProps> = ({
  visible,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [isPreferenceModalVisible, setIsPreferenceModalVisible] = useState(
    false
  );

  // Fetch user preferences
  const {
    data: preferencesData,
    isLoading,
    error,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['myActivityPreferences'],
    queryFn: getMyActivityPreferences,
    enabled: visible,
  });

  // Delete preference mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUserInterest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myActivityPreferences'] });
      Alert.alert('Success', 'Preference deleted successfully');
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to delete preference');
      console.error('Delete error:', error);
    },
  });

  // Toggle status mutation
  const toggleMutation = useMutation({
    mutationFn: toggleUserInterestStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myActivityPreferences'] });
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to toggle preference status');
      console.error('Toggle error:', error);
    },
  });

  const preferences: ActivityPreference[] = preferencesData?.data || [];

  const handleDelete = (id: string, activityName: string) => {
    Alert.alert(
      'Delete Preference',
      `Are you sure you want to delete your ${activityName} preference?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(id),
        },
      ]
    );
  };

  const handleToggle = (id: string) => {
    toggleMutation.mutate(id);
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#757575';
    }
  };

  const renderPreferenceCard = (preference: ActivityPreference) => {
    const isToggling = toggleMutation.isPending;
    const isDeleting = deleteMutation.isPending;

    return (
      <View key={preference.id} style={[
        styles.preferenceCard,
        !preference.isActive && styles.inactiveCard
      ]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.activityInfo}>
            <Text style={styles.activityName}>{preference.activity.name}</Text>
            <Text style={styles.interestCategory}>{preference.activity.interest.name}</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => handleToggle(preference.id)}
              disabled={isToggling}
              style={styles.toggleButton}
            >
              {preference.isActive ? (
                <ToggleRight size={24} color="#4CAF50" />
              ) : (
                <ToggleLeft size={24} color="#757575" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(preference.id, preference.activity.name)}
              disabled={isDeleting}
              style={styles.deleteButton}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#F44336" />
              ) : (
                <Trash2 size={20} color="#F44336" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Skill Level Badge */}
        <View style={[
          styles.skillBadge,
          { backgroundColor: getSkillLevelColor(preference.skillLevel) }
        ]}>
          <Text style={styles.skillBadgeText}>{preference.skillLevel}</Text>
        </View>

        {/* Equipment & Transport */}
        <View style={styles.preferencesSection}>
          <View style={styles.preferenceRow}>
            {preference.hasEquipment ? (
              <View style={styles.hasTag}>
                <Text style={styles.hasTagText}>Has Equipment</Text>
              </View>
            ) : (
              <View style={styles.needsTag}>
                <Text style={styles.needsTagText}>
                  Needs: {preference.equipmentNeeded || 'Equipment'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.preferenceRow}>
            {preference.hasTransport ? (
              <View style={styles.hasTag}>
                <Text style={styles.hasTagText}>Has Transport</Text>
              </View>
            ) : (
              <View style={styles.needsTag}>
                <Text style={styles.needsTagText}>
                  Transport: {preference.transportDetails || 'Needed'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Location & Time Info */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <MapPin size={16} color="#666" />
            <Text style={styles.detailText}>
              Within {preference.locationRadius} miles
            </Text>
          </View>
          
          {preference.availableDays.length > 0 && (
            <View style={styles.detailRow}>
              <Clock size={16} color="#666" />
              <Text style={styles.detailText}>
                {preference.availableDays.join(', ')}
              </Text>
            </View>
          )}
          
          {preference.preferredTimes.length > 0 && (
            <Text style={styles.detailText}>
              Times: {preference.preferredTimes.join(', ')}
            </Text>
          )}
        </View>

        {/* Additional Notes */}
        {preference.additionalNotes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{preference.additionalNotes}</Text>
          </View>
        )}

        {/* Inactive Overlay */}
        {!preference.isActive && (
          <View style={styles.inactiveOverlay}>
            <Text style={styles.inactiveText}>Inactive</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Activity Preferences</Text>
          <TouchableOpacity
            style={styles.addPreferenceButton}
            onPress={() => setIsPreferenceModalVisible(true)}
          >
            <Plus size={16} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading preferences...</Text>
            </View>
          ) : isError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load preferences</Text>
              <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : preferences.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No activity preferences yet</Text>
              <Text style={styles.emptySubtext}>
                Add some activities to get started!
              </Text>
            </View>
          ) : (
            <View style={styles.preferencesContainer}>
              {preferences.map(renderPreferenceCard)}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

       <CreateInterestPreferenceModal
              visible={isPreferenceModalVisible} // Use the new state here
              onClose={() => setIsPreferenceModalVisible(false)}
            />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  addPreferenceButton: {
    position: 'absolute',
    right: 60,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#EFEFF4',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
  },
  preferencesContainer: {
    padding: 16,
    gap: 16,
  },
  preferenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  inactiveCard: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  interestCategory: {
    fontSize: 14,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  skillBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  skillBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  preferencesSection: {
    gap: 8,
    marginBottom: 12,
  },
  preferenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hasTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  hasTagText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  needsTag: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  needsTagText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '500',
  },
  detailsSection: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  notesSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  inactiveOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inactiveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default MyPreferencesModal;