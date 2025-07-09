import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Bell, Share2, Calendar, Users, ChevronRight, Filter, Search, Plus } from 'lucide-react-native';

const theme = {
  primary: '#6366F1',
  accent: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  error: '#EF4444',
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

interface InteractiveElementsProps {
  onCreateEvent?: () => void;
  onShareStory?: () => void;
  onViewAllEvents?: () => void;
  onViewAllGroups?: () => void;
  onViewAllStories?: () => void;
  onFilterChange?: (filter: string) => void;
  onNotificationPress?: () => void;
}

export function InteractiveElements({
  onCreateEvent,
  onShareStory,
  onViewAllEvents,
  onViewAllGroups,
  onViewAllStories,
  onFilterChange,
  onNotificationPress
}: InteractiveElementsProps) {
  const [notificationCount, setNotificationCount] = useState(3);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const handlePress = async (action: () => void, actionName: string) => {
    setIsLoading(actionName);
    try {
      // Simulate loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      action();
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const handleNotificationPress = () => {
    setNotificationCount(0);
    onNotificationPress?.();
  };

  const handleFilterPress = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  return (
    <View style={styles.container}>
      {/* Navigation Components */}
      <View style={styles.navigationSection}>
        <Text style={styles.sectionTitle}>Navigation Components</Text>
        
        {/* Notification Button */}
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={handleNotificationPress}
          activeOpacity={0.7}
        >
          <Bell size={24} color={theme.primary} />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => handlePress(onShareStory || (() => {}), 'share')}
            disabled={isLoading === 'share'}
            activeOpacity={0.8}
          >
            {isLoading === 'share' ? (
              <ActivityIndicator size="small\" color={theme.white} />
            ) : (
              <Share2 size={16} color={theme.white} />
            )}
            <Text style={[styles.actionButtonText, { color: theme.white }]}>
              {isLoading === 'share' ? 'Loading...' : 'Share Story'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.accent }]}
            onPress={() => handlePress(onCreateEvent || (() => {}), 'create')}
            disabled={isLoading === 'create'}
            activeOpacity={0.8}
          >
            {isLoading === 'create' ? (
              <ActivityIndicator size="small\" color={theme.white} />
            ) : (
              <Calendar size={16} color={theme.white} />
            )}
            <Text style={[styles.actionButtonText, { color: theme.white }]}>
              {isLoading === 'create' ? 'Loading...' : 'Create Event'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* View All Links */}
        <View style={styles.viewAllLinks}>
          <TouchableOpacity
            style={styles.viewAllLink}
            onPress={() => handlePress(onViewAllEvents || (() => {}), 'events')}
            disabled={isLoading === 'events'}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>
              {isLoading === 'events' ? 'Loading...' : 'View All Events'}
            </Text>
            {isLoading === 'events' ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <ChevronRight size={16} color={theme.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewAllLink}
            onPress={() => handlePress(onViewAllGroups || (() => {}), 'groups')}
            disabled={isLoading === 'groups'}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>
              {isLoading === 'groups' ? 'Loading...' : 'View All Groups'}
            </Text>
            {isLoading === 'groups' ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <ChevronRight size={16} color={theme.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewAllLink}
            onPress={() => handlePress(onViewAllStories || (() => {}), 'stories')}
            disabled={isLoading === 'stories'}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>
              {isLoading === 'stories' ? 'Loading...' : 'View All Stories'}
            </Text>
            {isLoading === 'stories' ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <ChevronRight size={16} color={theme.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter System */}
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>Filter System</Text>
        
        <View style={styles.filterContainer}>
          {['All', 'Cultural', 'Academic', 'Social', 'Sports'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive
              ]}
              onPress={() => handleFilterPress(filter)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterChipText,
                activeFilter === filter && styles.filterChipTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.filterResults}>
          <Text style={styles.filterResultsText}>
            Showing results for: {activeFilter}
          </Text>
          {isLoading && (
            <ActivityIndicator size="small" color={theme.primary} />
          )}
        </View>
      </View>

      {/* Interactive Cards */}
      <View style={styles.cardsSection}>
        <Text style={styles.sectionTitle}>Interactive Cards</Text>
        
        <TouchableOpacity
          style={styles.interactiveCard}
          onPress={() => Alert.alert('Card Pressed', 'This card is fully interactive!')}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <Users size={20} color={theme.primary} />
            <Text style={styles.cardTitle}>Sample Club</Text>
            <Text style={styles.cardSubtitle}>Tap to view details</Text>
          </View>
          <ChevronRight size={20} color={theme.gray400} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactiveCard}
          onPress={() => Alert.alert('Event Card', 'Event details would open here!')}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <Calendar size={20} color={theme.accent} />
            <Text style={styles.cardTitle}>Sample Event</Text>
            <Text style={styles.cardSubtitle}>Tap to RSVP</Text>
          </View>
          <ChevronRight size={20} color={theme.gray400} />
        </TouchableOpacity>
      </View>

      {/* Status Indicators */}
      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Status Indicators</Text>
        
        <View style={styles.statusIndicators}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
            <Text style={styles.statusText}>All systems operational</Text>
          </View>
          
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: theme.warning }]} />
            <Text style={styles.statusText}>Loading content...</Text>
          </View>
          
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: theme.error }]} />
            <Text style={styles.statusText}>Connection error</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: theme.background,
  },
  navigationSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 16,
  },
  notificationButton: {
    position: 'relative',
    alignSelf: 'flex-start',
    padding: 12,
    backgroundColor: theme.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.white,
  },
  notificationBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.white,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewAllLinks: {
    gap: 12,
  },
  viewAllLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterChipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  filterChipTextActive: {
    color: theme.white,
  },
  filterResults: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.gray50,
    borderRadius: 8,
  },
  filterResultsText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  cardsSection: {
    marginBottom: 32,
  },
  interactiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 12,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  cardSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  statusSection: {
    marginBottom: 32,
  },
  statusIndicators: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
});