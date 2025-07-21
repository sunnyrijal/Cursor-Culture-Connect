import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, Users, Calendar, MapPin, Plus, Lock, Globe, GraduationCap } from 'lucide-react-native';
import { ShareButton } from '@/components/ui/ShareButton';
import { FilterSystem } from '@/components/FilterSystem';
import { mockGroups } from '@/data/mockData';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { useGroups } from '@/data/groupContext';
import { useAuth } from '@/data/authContext';
import placeholderImg from '@/assets/images/icon.png';

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

interface FilterOptions {
  location: {
    country: string;
    state: string;
    city: string;
  };
  university: string;
  visibility: 'all' | 'my-university' | 'my-heritage' | 'filter-by-state';
  ethnicity: string[];
  groupType: 'all' | 'public' | 'private';
  selectedUniversity: string;
  filterBy: string;
}

export default function Groups() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [initialLoading, setInitialLoading] = useState(true);
  const { groups, userGroups, loading, error, fetchGroups, fetchUserGroups, joinGroup, leaveGroup, createGroup } = useGroups();
  const { user } = useAuth();
  
  const [filters, setFilters] = useState<FilterOptions>({
    location: { country: '', state: '', city: '' },
    university: '',
    visibility: 'all',
    ethnicity: [],
    groupType: 'all',
    selectedUniversity: '',
    filterBy: 'all'
  });

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchGroups();
        await fetchUserGroups();
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadData();
  }, []);

  const filteredGroups = useMemo(() => {
    let tempGroups = [...groups];
    
    // Filter by search query
    if (searchQuery) {
      tempGroups = tempGroups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.category && typeof group.category === 'string' && 
         group.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Unified filterBy logic
    switch (filters.filterBy) {
      case 'public':
        tempGroups = tempGroups.filter(group => group.isPublic);
        break;
      case 'private':
        tempGroups = tempGroups.filter(group => !group.isPublic);
        break;
      case 'my-university':
        if (user?.university) {
          tempGroups = tempGroups.filter(group => 
            group.location === user.university ||
            (group.allowedUniversity && group.allowedUniversity === user.university)
          );
        }
        break;
      case 'my-heritage':
        const userHeritages = user?.heritage || [];
        if (userHeritages.length > 0) {
          tempGroups = tempGroups.filter(group => 
            userHeritages.some(heritage => 
              group.category && group.category.toLowerCase().includes(heritage.toLowerCase())
            )
          );
        }
        break;
      case 'filter-by-state':
        if (filters.location.state) {
          tempGroups = tempGroups.filter(group => 
            group.location && group.location.includes(filters.location.state)
          );
        }
        if (filters.location.city) {
          tempGroups = tempGroups.filter(group => 
            group.location && group.location.toLowerCase().includes(filters.location.city.toLowerCase())
          );
        }
        break;
      // 'all' does not filter
    }

    // Filter by ethnicity
    if (filters.ethnicity.length > 0) {
      tempGroups = tempGroups.filter(group => 
        group.category && filters.ethnicity.includes(group.category)
      );
    }

    // Filter by selected university
    if (filters.selectedUniversity) {
      tempGroups = tempGroups.filter(group => 
        group.location === filters.selectedUniversity ||
        (group.allowedUniversity && group.allowedUniversity === filters.selectedUniversity)
      );
    }

    return tempGroups;
  }, [groups, searchQuery, filters, user]);

  const handleJoinGroup = async (groupId: string) => {
    try {
      // Check if the user is already a member of this group
      const isJoined = userGroups.some(g => g.id === groupId);
      
      if (isJoined) {
        await leaveGroup(groupId);
      } else {
        await joinGroup(groupId);
      }
      
      // Refresh groups
      await fetchGroups();
      await fetchUserGroups();
    } catch (error) {
      console.error("Error toggling group membership:", error);
    }
  };

  const handleCreateGroup = async (groupData: any) => {
    try {
      console.log("Creating new group with data:", groupData);
      await createGroup(groupData);
      
      // Refresh groups after creation
      await fetchGroups();
      await fetchUserGroups();
      
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const generateGroupShareContent = (group: any) => {
    return {
      title: `${group.name} - Culture Connect`,
      message: `Check out ${group.name} on Culture Connect!\n\n${group.description}\n\n📍 ${group.location}\n👥 ${group.memberCount} members\n\nJoin our cultural community!`,
      url: `https://cultureconnect.app/group/${group.id}`
    };
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Show loading state for initial load
  if (initialLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading groups...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CreateGroupModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={handleCreateGroup} />
      
      {/* Sticky Header */}
      <View style={styles.stickyHeader}>
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: scrollY.interpolate({
                inputRange: [0, 50],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
              transform: [{
                translateY: scrollY.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, -30],
                  extrapolate: 'clamp',
                }),
              }],
            },
          ]}
        >
          <Text style={styles.title}>Cultural Groups</Text>
          <Text style={styles.subtitle}>Find your community and connect with like-minded students</Text>
        </Animated.View>

        <Animated.View
          style={[
            { zIndex: 10 },
            {
              transform: [
                {
                  translateY: scrollY.interpolate({
                    inputRange: [0, 50],
                    outputRange: [0, -60], // Move up into title space
                    extrapolate: 'clamp',
                  }),
                },
              ],
              opacity: scrollY.interpolate({
                inputRange: [0, 30],
                outputRange: [1, 1], // Always visible
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color={theme.gray400} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search groups..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={theme.gray400}
              />
            </View>
            <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
              <Plus size={20} color={theme.white} />
            </TouchableOpacity>
          </View>

          {/* Enhanced Filter System - Always Visible */}
          <View style={styles.filterSystemContainer}>
            <FilterSystem
              onFiltersChange={handleFiltersChange}
              contentType="groups"
              showPresets={true}
              groupCount={filteredGroups.length}
              filterLabel={(() => {
                if (filters.filterBy === 'my-university') return 'My University';
                if (filters.filterBy === 'my-heritage') return 'My Heritage';
                if (filters.filterBy === 'filter-by-state') return 'By State';
                if (filters.filterBy === 'public') return 'Public Groups';
                if (filters.filterBy === 'private') return 'Private Groups';
                return 'All';
              })()}
            />
          </View>
        </Animated.View>
      </View>

      {loading && !initialLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : null}

      <Animated.ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={{paddingHorizontal: 20, paddingTop: 8}} 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {filteredGroups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No groups found</Text>
            <Text style={styles.emptyStateMessage}>Try changing your filters or create a new group!</Text>
          </View>
        ) : (
          <View style={styles.groupsGrid}>
            {filteredGroups.map((group) => {
              // Check if user is a member of this group
              const isJoined = userGroups.some(g => g.id === group.id);
              
              return (
                <TouchableOpacity key={group.id} style={styles.groupCard} onPress={() => router.push(`/group/${group.id}`)}>
                  <View style={styles.groupImageContainer}>
                    <Image source={{ uri: group.image || undefined }} defaultSource={placeholderImg} style={styles.groupImage} />
                    <View style={styles.badgeContainer}>
                      {group.isPublic && <View style={[styles.badge, styles.publicBadge]}><Text style={styles.badgeText}>Public</Text></View>}
                      {!group.isPublic && <View style={[styles.badge, styles.privateBadge]}><Text style={styles.badgeText}>Private</Text></View>}
                    </View>
                    <View style={styles.groupActions}>
                      <ShareButton
                        {...generateGroupShareContent(group)}
                        size={16}
                        color={theme.white}
                        style={styles.shareButton}
                      />
                    </View>
                  </View>
                  
                  <View style={styles.groupContent}>
                    <Text style={styles.groupName} numberOfLines={2}>{group.name}</Text>
                    <View style={styles.groupCategoryContainer}>
                      <Text style={styles.groupCategory}>{group.category}</Text>
                    </View>
                    <View style={styles.groupLocation}>
                      <MapPin size={12} color={theme.gray500} />
                      <Text style={styles.groupLocationText} numberOfLines={1}>
                        {group.location}
                      </Text>
                    </View>
                    <Text style={styles.groupDescription} numberOfLines={2}>{group.description}</Text>
                    
                    <View style={styles.groupStats}>
                      <View style={styles.groupStat}>
                        <Users size={12} color={theme.gray500} />
                        <Text style={styles.groupStatText}>{group.memberCount || 0} members</Text>
                      </View>
                      <View style={styles.groupStat}>
                        <Calendar size={12} color={theme.gray500} />
                        <Text style={styles.groupStatText}>{group.upcomingEvents || 0} events</Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity
                      style={[
                        styles.joinButton,
                        isJoined ? styles.joinedButton : styles.notJoinedButton
                      ]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleJoinGroup(group.id);
                      }}
                    >
                      <Text style={[
                        styles.joinButtonText,
                        isJoined ? styles.joinedButtonText : styles.notJoinedButtonText
                      ]}>
                        {isJoined ? 'Joined' : 'Join'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  stickyHeader: { 
    backgroundColor: theme.background,
    zIndex: 1000,
    elevation: 5,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: theme.textSecondary, textAlign: 'center' },
  searchContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 12, gap: 12 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.white, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: theme.border, gap: 12 },
  searchInput: { flex: 1, fontSize: 16, color: theme.textPrimary },
  createButton: { width: 48, height: 48, borderRadius: 12, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
  filterSystemContainer: { paddingHorizontal: 20, marginBottom: 0 },
  resultsHeader: { paddingHorizontal: 20, marginBottom: 16 },
  resultsCount: { fontSize: 14, fontWeight: '500', color: theme.textSecondary },
  scrollView: { flex: 1 },
  groupsGrid: { paddingBottom: 20 },
  groupCard: { width: '100%', backgroundColor: theme.white, borderRadius: 16, marginBottom: 16, overflow: 'hidden', shadowColor: theme.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  groupImageContainer: { position: 'relative', height: 200 },
  groupImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  badgeContainer: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  publicBadge: { backgroundColor: 'rgba(16, 185, 129, 0.9)', borderColor: '#10B981' },
  privateBadge: { backgroundColor: 'rgba(245, 158, 11, 0.9)', borderColor: '#F59E0B' },
  badgeText: { fontSize: 10, fontWeight: '600', color: theme.white },
  groupActions: { position: 'absolute', top: 12, right: 12 },
  shareButton: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8 },
  groupContent: { padding: 16 },
  groupName: { fontSize: 18, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 8 },
  groupCategoryContainer: { marginBottom: 8 },
  groupCategory: { fontSize: 12, fontWeight: '600', color: theme.primary, backgroundColor: theme.gray100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  groupLocation: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 4 },
  groupLocationText: { fontSize: 12, color: theme.gray500, flex: 1 },
  groupDescription: { fontSize: 14, color: theme.textSecondary, marginBottom: 12, lineHeight: 20 },
  groupStats: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  groupStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  groupStatText: { fontSize: 12, color: theme.gray500 },
  joinButton: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  joinedButton: { backgroundColor: theme.gray100, borderWidth: 1, borderColor: theme.border },
  notJoinedButton: { backgroundColor: theme.primary },
  joinButtonText: { fontSize: 16, fontWeight: '600' },
  joinedButtonText: { color: theme.textSecondary },
  notJoinedButtonText: { color: theme.white },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.textSecondary,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  }
});