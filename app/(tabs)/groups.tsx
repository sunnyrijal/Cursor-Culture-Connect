import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, Users, Calendar, MapPin, Plus, Lock, Globe, GraduationCap } from 'lucide-react-native';
import { ShareButton } from '@/components/ui/ShareButton';
import { FilterSystem } from '@/components/FilterSystem';
import { currentUser } from '@/data/mockData';
const placeholderImg = 'https://via.placeholder.com/150';
import { CreateGroupModal } from '@/components/CreateGroupModal';

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
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#4B5563',
  gray900: '#111827',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  border: '#E5E7EB',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const spacing = {
  sm: 8,
  md: 16,
  lg: 24,
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
  heritage?: string;
}

interface ApiGroup {
  id: number;
  name: string;
  description: string;
  category: string | string[];
  location: string;
  isPublic: boolean;
  universityOnly: boolean;
  allowedUniversity: string;
  presidentId: number;
  meetings: any[];
  memberCount: number;
  recentActivity: string;
  upcomingEvents: number;
  image: string;
  isJoined: boolean;
  heritage?: string;
}

export default function Groups() {
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [filters, setFilters] = useState<FilterOptions>({
    location: { country: '', state: '', city: '' },
    university: '',
    visibility: 'all',
    ethnicity: [],
    groupType: 'all',
    selectedUniversity: '',
    filterBy: 'all'
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/groups');
      const data = await response.json();
      console.log('Fetched groups:', data);
      setGroups(data.map(group => ({
        ...group,
        // Map database field names to frontend field names
        isPublic: group.is_public,
        universityOnly: group.university_only,
        allowedUniversity: group.allowed_university,
        presidentId: group.president_id,
        memberCount: group.member_count || 1,
        // Add default values for UI fields
        recentActivity: 'just now',
        upcomingEvents: 0,
        image: 'https://images.unsplash.com/photo-1578836537282-3171d77f8632?q=80&w=300',
        isJoined: group.president_id === currentUser?.id
      })));
    } catch (error) {
      console.error('Error fetching groups:', error);
      Alert.alert('Error', 'Failed to load groups. Please try again.');
    }
  };

  const filteredGroups = useMemo(() => {
    let tempGroups = [...groups];
    
    // Filter by search query
    if (searchQuery) {
      tempGroups = tempGroups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(group.category) ? group.category.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase())) : group.category.toLowerCase().includes(searchQuery.toLowerCase()))
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
        tempGroups = tempGroups.filter(group => 
          group.location === currentUser.university ||
          (group.allowedUniversity && group.allowedUniversity === currentUser.university)
        );
        break;
      case 'my-heritage':
        const userHeritages = currentUser.heritage || [];
        tempGroups = tempGroups.filter(group => 
          userHeritages.some(heritage => 
            (Array.isArray(group.category) ? group.category.some(cat => cat.toLowerCase().includes(heritage.toLowerCase())) : group.category.toLowerCase().includes(heritage.toLowerCase()))
          )
        );
        break;
      case 'filter-by-state':
        if (filters.location.state) {
          tempGroups = tempGroups.filter(group => 
            group.location.includes(filters.location.state)
          );
        }
        if (filters.location.city) {
          tempGroups = tempGroups.filter(group => 
            group.location.toLowerCase().includes(filters.location.city.toLowerCase())
          );
        }
        break;
      // 'all' does not filter
    }

    // Filter by ethnicity
    if (filters.ethnicity.length > 0) {
      tempGroups = tempGroups.filter(group => 
        Array.isArray(group.category) ? group.category.some(cat => filters.ethnicity.includes(cat)) : filters.ethnicity.includes(group.category)
      );
    }

    // Filter by selected university
    if (filters.selectedUniversity) {
      tempGroups = tempGroups.filter(group => 
        group.location === filters.selectedUniversity ||
        (group.allowedUniversity && group.allowedUniversity === filters.selectedUniversity)
      );
    }

    // Filter by heritage (if any selected)
    if (filters.heritage && filters.heritage.length > 0) {
      tempGroups = tempGroups.filter(group => {
        // Assuming group has a 'heritage' property
        return group.heritage === filters.heritage;
      });
    }

    return tempGroups;
  }, [groups, searchQuery, filters]);

  const handleJoinGroup = (groupId: number) => {
    setGroups(currentGroups => 
        currentGroups.map(g => g.id === groupId ? {...g, isJoined: !g.isJoined} : g)
    );
  };

  const handleCreateGroup = async (groupData: any) => {
    try {
      console.log("Creating new group:", groupData);
      
      // Format the data to match backend expectations
      const formattedData = {
        name: groupData.name,
        description: groupData.description,
        category: groupData.category || "",
        location: groupData.location || "",
        isPublic: groupData.isPublic,
        universityOnly: groupData.universityOnly,
        allowedUniversity: groupData.allowedUniversity,
        presidentId: currentUser?.id,
        meetings: groupData.meetings
      };
      
      // Call the backend API
      const response = await fetch('http://localhost:3001/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        throw new Error(`Error creating group: ${response.status}`);
      }
      
      const newGroup = await response.json();
      console.log("Group created successfully:", newGroup);
      
      // Refresh the groups list to include the newly created group
      await fetchGroups();
      Alert.alert('Success', 'Group created successfully!');
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create group:", error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    }
  };

  const generateGroupShareContent = (group: ApiGroup) => {
    return {
      title: `${group.name} - Culture Connect`,
      message: `Check out ${group.name} on Culture Connect!\n\n${group.description}\n\n📍 ${group.location}\n👥 ${group.memberCount} members\n\nJoin our cultural community!`,
      url: `https://cultureconnect.app/group/${group.id}`
    };
  };

  const handleFiltersChange = (filters: FilterOptions) => {
    setFilters(filters);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CreateGroupModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
      />
      
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
        <View style={styles.groupsGrid}>
          {filteredGroups.map((group) => (
            <TouchableOpacity key={group.id} style={styles.groupCard} onPress={() => router.push(`/group/${group.id}`)}>
                <View style={styles.groupImageContainer}>
                    <Image source={{ uri: group.image || undefined }} defaultSource={{ uri: placeholderImg }} style={styles.groupImage} />
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
                    <Text style={styles.groupCategory}>{Array.isArray(group.category) ? group.category.join(', ') : group.category}</Text>
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
                    <Text style={styles.groupStatText}>{group.memberCount} members</Text>
                  </View>
                  <View style={styles.groupStat}>
                    <Calendar size={12} color={theme.gray500} />
                    <Text style={styles.groupStatText}>{group.upcomingEvents} events</Text>
                  </View>
                </View>
                
                <TouchableOpacity
                    style={[
                      styles.joinButton,
                      group.isJoined ? styles.joinedButton : styles.notJoinedButton
                    ]}
                    onPress={(e) => {
                        e.stopPropagation();
                        handleJoinGroup(group.id)
                    }}
                  >
                    <Text style={[
                      styles.joinButtonText,
                      group.isJoined ? styles.joinedButtonText : styles.notJoinedButtonText
                    ]}>
                      {group.isJoined ? 'Joined' : 'Join'}
                    </Text>
                  </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
});