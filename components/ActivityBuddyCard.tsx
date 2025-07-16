// project/components/ActivityBuddyCard.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Users, 
  MapPin, 
  Car, 
  Package, 
  Star, 
  MessageCircle, 
  Phone, 
  X,
  Clock,
  Calendar,
  Heart,
  Bell
} from 'lucide-react-native';
import { ActivityQuestionnaire } from '@/types/activity';
import { getActivityById } from '@/data/activityData';

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

interface ActivityBuddyCardProps {
  userPreferences: ActivityQuestionnaire[];
  userName: string;
  userImage: string;
  onContact: (activityId: string, method: 'message' | 'ping') => void;
}

export default function ActivityBuddyCard({ 
  userPreferences, 
  userName, 
  userImage, 
  onContact 
}: ActivityBuddyCardProps) {
  const [selectedActivity, setSelectedActivity] = useState<ActivityQuestionnaire | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  if (!userPreferences || userPreferences.length === 0) {
    return null;
  }

  const handleActivityPress = (preference: ActivityQuestionnaire) => {
    setSelectedActivity(preference);
    setShowDetailsModal(true);
  };

  const handleContact = (method: 'message' | 'ping') => {
    if (!selectedActivity) return;
    
    const activity = getActivityById(selectedActivity.activityId);
    const activityName = activity?.name || 'this activity';
    
    Alert.alert(
      `Contact ${userName}`,
      method === 'message' 
        ? `Would you like to message ${userName} about ${activityName}?`
        : `Would you like to show interest in doing ${activityName} with ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: method === 'message' ? 'Send Message' : 'Show Interest', 
          onPress: () => onContact(selectedActivity.activityId, method)
        }
      ]
    );
  };

  const renderActivityCard = (preference: ActivityQuestionnaire) => {
    const activity = getActivityById(preference.activityId);
    if (!activity) return null;

    return (
      <TouchableOpacity
        key={preference.activityId}
        style={styles.activityCard}
        onPress={() => handleActivityPress(preference)}
      >
        <View style={styles.activityHeader}>
          <Text style={styles.activityIcon}>{activity.icon}</Text>
          <View style={styles.activityInfo}>
            <Text style={styles.activityName}>{activity.name}</Text>
            <Text style={styles.activityDescription}>{activity.description}</Text>
          </View>
        </View>
        
        <View style={styles.activityDetails}>
          <View style={styles.detailRow}>
            <Star size={14} color={theme.primary} />
            <Text style={styles.detailText}>
              {preference.skillLevel.charAt(0).toUpperCase() + preference.skillLevel.slice(1)} level
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <MapPin size={14} color={theme.primary} />
            <Text style={styles.detailText}>
              Within {preference.locationRadius} miles
            </Text>
          </View>

          {activity.equipment && activity.equipment.length > 0 && (
            <View style={styles.detailRow}>
              <Package size={14} color={preference.hasEquipment ? theme.success : theme.warning} />
              <Text style={styles.detailText}>
                {preference.hasEquipment ? 'Has equipment' : 'Needs equipment'}
              </Text>
            </View>
          )}

          {activity.transportation && (
            <View style={styles.detailRow}>
              <Car size={14} color={preference.hasTransportation ? theme.success : theme.warning} />
              <Text style={styles.detailText}>
                {preference.hasTransportation ? 'Has transportation' : 'Needs transportation'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.messageButton]}
            onPress={() => onContact(preference.activityId, 'message')}
          >
            <MessageCircle size={16} color={theme.white} />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.pingButton]}
            onPress={() => onContact(preference.activityId, 'ping')}
          >
            <Heart size={16} color={theme.white} />
            <Text style={styles.actionButtonText}>I'm Interested</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailsModal = () => {
    if (!selectedActivity) return null;
    
    const activity = getActivityById(selectedActivity.activityId);
    if (!activity) return null;

    return (
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
              <X size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Activity Details</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalActivityHeader}>
              <Text style={styles.modalActivityIcon}>{activity.icon}</Text>
              <View>
                <Text style={styles.modalActivityName}>{activity.name}</Text>
                <Text style={styles.modalActivityDescription}>{activity.description}</Text>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Your Preferences</Text>
              
              <View style={styles.detailItem}>
                <Star size={16} color={theme.primary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Skill Level</Text>
                  <Text style={styles.detailValue}>
                    {selectedActivity.skillLevel.charAt(0).toUpperCase() + selectedActivity.skillLevel.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <MapPin size={16} color={theme.primary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Location Radius</Text>
                  <Text style={styles.detailValue}>{selectedActivity.locationRadius} miles</Text>
                </View>
              </View>

              {activity.equipment && activity.equipment.length > 0 && (
                <View style={styles.detailItem}>
                  <Package size={16} color={selectedActivity.hasEquipment ? theme.success : theme.warning} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Equipment</Text>
                    <Text style={styles.detailValue}>
                      {selectedActivity.hasEquipment ? 'I have the equipment' : 'I need equipment'}
                    </Text>
                    {selectedActivity.equipmentDetails && (
                      <Text style={styles.detailSubtext}>{selectedActivity.equipmentDetails}</Text>
                    )}
                  </View>
                </View>
              )}

              {activity.transportation && (
                <View style={styles.detailItem}>
                  <Car size={16} color={selectedActivity.hasTransportation ? theme.success : theme.warning} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Transportation</Text>
                    <Text style={styles.detailValue}>
                      {selectedActivity.hasTransportation ? 'I have transportation' : 'I need transportation'}
                    </Text>
                    {selectedActivity.transportationDetails && (
                      <Text style={styles.detailSubtext}>{selectedActivity.transportationDetails}</Text>
                    )}
                  </View>
                </View>
              )}

              {selectedActivity.additionalNotes && (
                <View style={styles.detailItem}>
                  <MessageCircle size={16} color={theme.primary} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Additional Notes</Text>
                    <Text style={styles.detailValue}>{selectedActivity.additionalNotes}</Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.messageButton]}
              onPress={() => {
                setShowDetailsModal(false);
                handleContact('message');
              }}
            >
              <MessageCircle size={20} color={theme.white} />
              <Text style={styles.modalButtonText}>Send Message</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.pingButton]}
              onPress={() => {
                setShowDetailsModal(false);
                handleContact('ping');
              }}
            >
              <Heart size={20} color={theme.white} />
              <Text style={styles.modalButtonText}>I'm Interested</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>🤝</Text>
          <View>
            <Text style={styles.headerTitle}>Activity Buddy</Text>
            <Text style={styles.headerSubtitle}>
              {userName} is open to these activities
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.activitiesContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {userPreferences.map(renderActivityCard)}
      </ScrollView>

      {renderDetailsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.white,
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  activitiesContainer: {
    flexDirection: 'row',
  },
  activityCard: {
    backgroundColor: theme.gray50,
    borderRadius: 12,
    padding: 14,
    marginRight: 10,
    minWidth: 240,
    maxWidth: 280,
    borderWidth: 1,
    borderColor: theme.border,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 3,
  },
  activityDescription: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 16,
  },
  activityDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 11,
    color: theme.textSecondary,
    marginLeft: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    minHeight: 36,
  },
  messageButton: {
    backgroundColor: theme.primary,
  },
  pingButton: {
    backgroundColor: theme.accent,
  },
  actionButtonText: {
    fontSize: 11,
    color: theme.white,
    fontWeight: '500',
    marginLeft: 3,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalActivityIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  modalActivityName: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  modalActivityDescription: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  detailsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  detailSubtext: {
    fontSize: 12,
    color: theme.gray500,
    marginTop: 4,
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.white,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 16,
    color: theme.white,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 