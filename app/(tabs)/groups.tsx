import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FilterSystem } from '@/components/FilterSystem';
import { theme } from '@/components/theme';
import { Users, Search, PlusCircle } from 'lucide-react-native';
import SearchBar from '@/components/ui/SearchBar';
import { getAllGroups, createGroup } from '@/data/services/groupService';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { useAuth } from '@/context/AuthContext';

// Group categories for filtering
const groupCategories = [
  'All', 'Cultural', 'Academic', 'Professional', 'Sports', 'Arts', 'Social', 'Religious', 'Volunteer'
];

export default function GroupsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState(['All']);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  
  useEffect(() => {
    fetchGroups();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [groups, searchQuery, activeFilters]);
  
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await getAllGroups();
      if (response && response.groups) {
        setGroups(response.groups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups();
  };
  
  const applyFilters = () => {
    let result = [...groups];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply category filters
    if (!activeFilters.includes('All')) {
      result = result.filter(group => 
        activeFilters.some(filter => 
          group.category === filter || 
          (group.tags && group.tags.includes(filter))
        )
      );
    }
    
    setFilteredGroups(result);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreateGroup = async (groupData) => {
    try {
      setLoading(true);
      const result = await createGroup(groupData);
      if (result.success) {
        await fetchGroups();
      }
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
      setShowCreateGroupModal(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading groups...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{
        headerShown: false
      }} />
      <Tabs.Screen options={{
        title: 'Groups',
        tabBarIcon: ({ color }) => <Users size={24} color={color} />
      }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Groups</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateGroupModal(true)}
        >
          <PlusCircle size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <SearchBar 
          placeholder="Search groups..." 
          onSearch={handleSearch} 
          style={styles.searchBar}
        />
      </View>
      
      <FilterSystem
        categories={groupCategories}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
        groupCount={filteredGroups.length}
      />
      
      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.groupCard}
            onPress={() => router.push(`/group/${item.id}`)}
          >
            <Image 
              source={{ uri: item.image || 'https://via.placeholder.com/100' }} 
              style={styles.groupImage} 
            />
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{item.name}</Text>
              <Text style={styles.groupDetails}>
                {item.members ? `${item.members.length} members` : '0 members'} • {item.category || 'Uncategorized'}
              </Text>
              <Text numberOfLines={2} style={styles.groupDescription}>
                {item.description || 'No description available'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || activeFilters.length > 0 && !activeFilters.includes('All')
                ? 'No groups match your search or filters'
                : 'No groups available'}
            </Text>
          </View>
        }
      />

      {/* Create Group Modal */}
      <CreateGroupModal 
        isVisible={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onSubmit={handleCreateGroup}
      />
    </SafeAreaView>
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
    fontSize: 16,
    color: theme.textSecondary,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
  },
  createButton: {
    padding: 8,
    borderRadius: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
  },
  groupCard: {
    flexDirection: 'row',
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  groupImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  groupDetails: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});