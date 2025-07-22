import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/components/theme';
import { Users, MapPin, Search, PlusCircle } from 'lucide-react-native';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { getAllGroups, createGroup } from '@/data/services/groupService';
import { useAuth } from '@/context/AuthContext';
import { FilterSystem } from '@/components/FilterSystem';

// Interface for groups
interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  location?: string;
  category?: string;
  isPublic?: boolean;
  isJoined?: boolean;
  recentActivity?: string;
  image: string;
  upcomingEvents?: number;
  universityOnly?: boolean;
  allowedUniversity?: string;
}

export default function GroupsScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const { user } = useAuth();

  // Filters
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const categories = [
    'All', 'South Asian', 'East Asian', 'European', 'African', 'Middle Eastern', 
    'Hispanic/Latino', 'Pacific Islander', 'Native American', 'Mixed Heritage'
  ];

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAllGroups();
        if (response.success && response.groups) {
          setGroups(response.groups);
          setFilteredGroups(response.groups);
        } else {
          setError('Failed to fetch groups');
        }
      } catch (err) {
        console.error('Error fetching groups:', err);
        setError('Failed to fetch groups');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Filter groups based on search and category filters
  useEffect(() => {
    let result = groups;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        group => 
          group.name.toLowerCase().includes(query) || 
          (group.description && group.description.toLowerCase().includes(query))
      );
    }

    // Apply category filters
    if (activeFilters.length > 0 && !activeFilters.includes('All')) {
      result = result.filter(group => 
        group.category && activeFilters.includes(group.category)
      );
    }

    setFilteredGroups(result);
  }, [searchQuery, activeFilters, groups]);

  const handleCreateGroup = async (groupData: any) => {
    try {
      setIsLoading(true);
      const result = await createGroup(groupData);
      if (result.success) {
        // Refresh the groups list
        const response = await getAllGroups();
        if (response.success) {
          setGroups(response.groups);
          setFilteredGroups(response.groups);
        }
      }
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group');
    } finally {
      setIsLoading(false);
      setShowCreateGroupModal(false);
    }
  };

  if (isLoading && groups.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading groups...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TouchableOpacity 
            style={styles.searchInput}
            onPress={() => router.push('/search')}
          >
            <Text style={styles.searchPlaceholder}>Search groups...</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateGroupModal(true)}
        >
          <PlusCircle size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Category filters */}
      <FilterSystem 
        categories={categories}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
      />

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            onPress={() => router.reload()}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Groups list */}
      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.groupCard}
            onPress={() => router.push(`/group/${item.id}`)}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.groupImage}
            />
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{item.name}</Text>
              
              <View style={styles.memberContainer}>
                <Users size={14} color={theme.textSecondary} />
                <Text style={styles.memberCount}>{item.memberCount} members</Text>
              </View>

              {item.location && (
                <View style={styles.locationContainer}>
                  <MapPin size={14} color={theme.textSecondary} />
                  <Text style={styles.location}>{item.location}</Text>
                </View>
              )}
              
              {item.allowedUniversity && (
                <View style={styles.universityBadge}>
                  <Text style={styles.universityText}>{item.allowedUniversity}</Text>
                </View>
              )}
              
              {item.isJoined && (
                <View style={styles.joinedBadge}>
                  <Text style={styles.joinedText}>Joined</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />

      <CreateGroupModal 
        isVisible={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onSubmit={handleCreateGroup}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingText: {
    marginTop: 12,
    color: theme.textSecondary,
    fontSize: 16,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: theme.error,
    marginBottom: 8,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.primary,
    borderRadius: 4,
  },
  retryText: {
    color: 'white',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: theme.text,
  },
  searchPlaceholder: {
    color: theme.textSecondary,
  },
  searchIcon: {
    marginRight: 8,
  },
  createButton: {
    marginLeft: 12,
    padding: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  groupCard: {
    flexDirection: 'row',
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  groupImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  groupInfo: {
    flex: 1,
    padding: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  memberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  memberCount: {
    fontSize: 14,
    color: theme.textSecondary,
    marginLeft: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: theme.textSecondary,
    marginLeft: 6,
  },
  universityBadge: {
    backgroundColor: theme.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  universityText: {
    fontSize: 12,
    color: theme.accent,
  },
  joinedBadge: {
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  joinedText: {
    fontSize: 12,
    color: theme.primary,
  },
});