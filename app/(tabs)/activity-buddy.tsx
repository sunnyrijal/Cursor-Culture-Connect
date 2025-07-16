// project/app/(tabs)/activity-buddy.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Plus,
  MessageCircle,
  Phone,
  Star,
  Package,
  Car
} from 'lucide-react-native';
import { router } from 'expo-router';
import ActivityBuddyModal from '@/components/ActivityBuddyModal';
import ActivityBuddyCard from '@/components/ActivityBuddyCard';
import { ActivityQuestionnaire } from '@/types/activity';
import { activities, getActivitiesByCategory } from '@/data/activityData';
import { currentUser } from '@/data/mockData';

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

// Mock data for other users with activity preferences
const mockUsers = [
  {
    id: '1',
    name: 'Sarah Chen',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    university: 'Stanford University',
    location: 'Palo Alto, CA',
    activityPreferences: [
      {
        activityId: 'tennis',
        hasEquipment: true,
        hasTransportation: true,
        skillLevel: 'intermediate' as const,
        locationRadius: 15,
        additionalNotes: 'Looking for tennis partners on weekends!'
      },
      {
        activityId: 'hiking',
        hasEquipment: false,
        hasTransportation: true,
        skillLevel: 'beginner' as const,
        locationRadius: 25,
        additionalNotes: 'New to hiking, would love to explore trails together'
      }
    ]
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    university: 'UC Berkeley',
    location: 'Berkeley, CA',
    activityPreferences: [
      {
        activityId: 'basketball',
        hasEquipment: true,
        hasTransportation: false,
        skillLevel: 'advanced' as const,
        locationRadius: 10,
        additionalNotes: 'Play pickup games at local courts'
      },
      {
        activityId: 'volunteering',
        hasEquipment: false,
        hasTransportation: true,
        skillLevel: 'beginner' as const,
        locationRadius: 20,
        additionalNotes: 'Interested in community service projects'
      }
    ]
  },
  {
    id: '3',
    name: 'Aisha Patel',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    university: 'UCLA',
    location: 'Los Angeles, CA',
    activityPreferences: [
      {
        activityId: 'yoga',
        hasEquipment: true,
        hasTransportation: false,
        skillLevel: 'intermediate' as const,
        locationRadius: 8,
        additionalNotes: 'Looking for yoga buddies for morning sessions'
      },
      {
        activityId: 'cultural_cooking',
        hasEquipment: false,
        hasTransportation: false,
        skillLevel: 'beginner' as const,
        locationRadius: 12,
        additionalNotes: 'Want to learn cooking from different cultures'
      }
    ]
  }
];

export default function ActivityBuddyPage() {
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userPreferences, setUserPreferences] = useState<ActivityQuestionnaire[]>([]);
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);

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

  useEffect(() => {
    filterUsers();
  }, [searchQuery, selectedCategory]);

  const filterUsers = () => {
    let filtered = mockUsers;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by activity category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(user =>
        user.activityPreferences.some(pref => {
          const activity = activities.find(a => a.id === pref.activityId);
          return activity?.category === selectedCategory;
        })
      );
    }

    setFilteredUsers(filtered);
  };

  const handleActivityBuddySave = (preferences: ActivityQuestionnaire[]) => {
    setUserPreferences(preferences);
    Alert.alert('Success', 'Your activity preferences have been saved!');
  };

  const handleContact = (userId: string, activityId: string, method: 'message' | 'ping') => {
    const user = mockUsers.find(u => u.id === userId);
    const activity = activities.find(a => a.id === activityId);
    
    Alert.alert(
      `Contact ${user?.name}`,
      method === 'message' 
        ? `Would you like to message ${user?.name} about ${activity?.name}?`
        : `Would you like to show interest in doing ${activity?.name} with ${user?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: method === 'message' ? 'Send Message' : 'Show Interest', 
          onPress: () => {
            // In a real app, this would open messaging/calling
            if (method === 'message') {
              Alert.alert('Message Sent', `Message sent to ${user?.name} about ${activity?.name}!`);
            } else {
              Alert.alert('Interest Shown', `You've shown interest in doing ${activity?.name} with ${user?.name}! They'll be notified.`);
            }
          }
        }
      ]
    );
  };

  const renderUserCard = (user: typeof mockUsers[0]) => (
    <View key={user.id} style={styles.userCard}>
      <View style={styles.userHeader}>
        <Image source={{ uri: user.image }} style={styles.userImage} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userUniversity}>{user.university}</Text>
          <View style={styles.userLocation}>
            <MapPin size={14} color={theme.gray500} />
            <Text style={styles.userLocationText}>{user.location}</Text>
          </View>
        </View>
      </View>

      <ActivityBuddyCard
        userPreferences={user.activityPreferences}
        userName={user.name}
        userImage={user.image}
        onContact={(activityId, method) => handleContact(user.id, activityId, method)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity Buddy</Text>
        <TouchableOpacity 
          style={styles.setupButton}
          onPress={() => setShowSetupModal(true)}
        >
          <Plus size={18} color={theme.white} />
          <Text style={styles.setupButtonText}>Setup</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={theme.gray500} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, university, or location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.gray400}
          />
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollContent}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={0.7}
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

      {/* Results */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyStateTitle}>No matches found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try adjusting your search or filters to find activity buddies
            </Text>
          </View>
        ) : (
          <View>
            <Text style={styles.resultsCount}>
              {filteredUsers.length} {filteredUsers.length === 1 ? 'person' : 'people'} found
            </Text>
            {filteredUsers.map(renderUserCard)}
          </View>
        )}
      </ScrollView>

      <ActivityBuddyModal
        visible={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onSave={handleActivityBuddySave}
      />
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  setupButtonText: {
    fontSize: 13,
    color: theme.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.gray50,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: theme.textPrimary,
  },
  categoryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  categoryScrollContent: {
    paddingRight: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.gray50,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.border,
    minHeight: 36,
  },
  categoryChipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  categoryChipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 13,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: theme.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  resultsCount: {
    fontSize: 15,
    color: theme.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  userCard: {
    backgroundColor: theme.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  userUniversity: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 3,
  },
  userLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userLocationText: {
    fontSize: 11,
    color: theme.gray500,
    marginLeft: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 