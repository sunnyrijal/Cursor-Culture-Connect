import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { StyleSheet } from 'react-native';
import { X, Trash2, ToggleLeft, ToggleRight, MapPin, Plus, Package, Car, Edit } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyActivityPreferences, deleteUserInterest, toggleUserInterestStatus } from '../contexts/userInterest.api';
import { CreateInterestPreferenceModal } from './CreateUserPreferenceModal';
import { useAlert } from '@/contexts/AlertContext';

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
  publicPreference: boolean;
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
  const { showAlert } = useAlert();
  const [isPreferenceModalVisible, setIsPreferenceModalVisible] = useState(false);
  const [editingPreference, setEditingPreference] = useState<ActivityPreference | null>(null);

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
      showAlert({ title: 'Success', message: 'Preference deleted successfully' });
    },
    onError: (error) => {
      showAlert({ title: 'Error', message: 'Failed to delete preference' });
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
      showAlert({ title: 'Error', message: 'Failed to toggle preference status' });
      console.error('Toggle error:', error);
    },
  });

  const preferences: ActivityPreference[] = preferencesData?.data || [];

  const handleDelete = (id: string, activityName: string) => {
    showAlert({
      title: 'Delete Preference',
      message: `Are you sure you want to delete your ${activityName} preference?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(id),
        },
      ],
    });
  };

  const handleToggle = (id: string) => {
    toggleMutation.mutate(id);
  };

  const handleEdit = (preference: ActivityPreference) => {
    // Transform the preference data to match the modal's expected format
    const preferenceForEdit = {
      ...preference,
      interestId: preference.activityId, // Map activityId to interestId for the modal
    };
    
    setEditingPreference(preferenceForEdit);
    setIsPreferenceModalVisible(true);
  };

  const handleAddNew = () => {
    setEditingPreference(null);
    setIsPreferenceModalVisible(true);
  };

  const handleModalClose = () => {
    setIsPreferenceModalVisible(false);
    setEditingPreference(null);
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
      <View key={preference.id} style={styles.preferenceCard}>
        <View style={styles.cardHeader}>
          <View style={styles.activityInfo}>
            <Text style={styles.activityName}>{preference.activity.name}</Text>
            <Text style={styles.interestCategory}>{preference.activity.interest.name}</Text>
          </View>

          {!preference.isActive && (
            <View style={[styles.skillBadge, { backgroundColor: '#EF4444', marginRight: 8 }]}>
              <Text style={styles.skillBadgeText}>Inactive</Text>
            </View>
          )}
          
          <View style={[styles.skillBadge, { backgroundColor: getSkillLevelColor(preference.skillLevel) }]}>
            <Text style={styles.skillBadgeText}>{preference.skillLevel}</Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Package size={14} color="#6B7280" />
            {preference.hasEquipment ? (
              <Text style={[styles.detailText, styles.hasDetail]}>Has Equipment</Text>
            ) : (
              <Text style={[styles.detailText, styles.needsDetail]} numberOfLines={1}>
                Needs: {preference.equipmentNeeded || 'Equipment'}
              </Text>
            )}
          </View>

          <View style={styles.detailItem}>
            <Car size={14} color="#6B7280" />
            {preference.hasTransport ? (
              <Text style={[styles.detailText, styles.hasDetail]}>Has Transport</Text>
            ) : (
              <Text style={[styles.detailText, styles.needsDetail]} numberOfLines={1}>
                Needs: {preference.transportDetails || 'Transport'}
              </Text>
            )}
          </View>

          <View style={styles.detailItem}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.detailText}>Within {preference.locationRadius} miles</Text>
          </View>
        </View>

        {preference.additionalNotes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesText}>{preference.additionalNotes}</Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <TouchableOpacity
            onPress={() => handleEdit(preference)}
            style={styles.actionButton}
          >
            <Edit size={20} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleToggle(preference.id)}
            disabled={isToggling}
            style={styles.actionButton}
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
            style={styles.actionButton}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#F44336" />
            ) : (
              <Trash2 size={20} color="#F44336" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
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
              onPress={handleAddNew}
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
                <TouchableOpacity onPress={handleAddNew} style={styles.addFirstButton}>
                  <Text style={styles.addFirstButtonText}>Add Your First Preference</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.preferencesContainer}>
                {preferences.map(renderPreferenceCard)}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Preference Modal (Create/Edit) */}
      <CreateInterestPreferenceModal
        visible={isPreferenceModalVisible}
        onClose={handleModalClose}
        editingPreference={editingPreference}
        onSubmit={() => {
          // Refresh the list after successful create/update
          queryClient.invalidateQueries({ queryKey: ['myActivityPreferences'] });
        }}
      />
    </>
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
    paddingHorizontal: 20,
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
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  preferencesContainer: {
    padding: 16,
    gap: 16,
  },
  preferenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityInfo: {
    flex: 1,
    marginRight: 8,
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  interestCategory: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  skillBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skillBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
    flexShrink: 1,
  },
  hasDetail: {
    color: '#059669',
  },
  needsDetail: {
    color: '#D97706',
  },
  notesSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  notesText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default MyPreferencesModal;