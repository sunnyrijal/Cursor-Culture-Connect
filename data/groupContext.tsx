import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as api from './api';
import { useAuth } from './authContext';
import { Alert } from 'react-native';

// Define Group type
type Group = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  location: string;
  image?: string;
  isJoined?: boolean;
  [key: string]: any;
};

type GroupContextType = {
  groups: Group[];
  userGroups: Group[];
  loading: boolean;
  error: string | null;
  fetchGroups: (filters?: any) => Promise<void>;
  fetchUserGroups: () => Promise<void>;
  fetchGroupById: (id: string) => Promise<Group>;
  createGroup: (groupData: any) => Promise<Group>;
  updateGroup: (id: string, groupData: any) => Promise<Group>;
  joinGroup: (id: string) => Promise<void>;
  leaveGroup: (id: string) => Promise<void>;
  addGroupMedia: (id: string, mediaData: any) => Promise<void>;
};

// Create context with default values
const GroupContext = createContext<GroupContextType>({
  groups: [],
  userGroups: [],
  loading: false,
  error: null,
  fetchGroups: async () => {},
  fetchUserGroups: async () => {},
  fetchGroupById: async () => ({ id: '', name: '', description: '', memberCount: 0, category: '', location: '' }),
  createGroup: async () => ({ id: '', name: '', description: '', memberCount: 0, category: '', location: '' }),
  updateGroup: async () => ({ id: '', name: '', description: '', memberCount: 0, category: '', location: '' }),
  joinGroup: async () => {},
  leaveGroup: async () => {},
  addGroupMedia: async () => {},
});

// Custom hook to use the group context
export const useGroups = () => useContext(GroupContext);

// Provider component
export const GroupProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const FETCH_COOLDOWN_MS = 2000; // Minimum 2 seconds between fetches
  const { isAuthenticated } = useAuth();

  // Fetch all groups
  const fetchGroups = async (filters: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching groups with filters:', filters);
      const response = await api.getGroups(filters);
      console.log('Groups fetched successfully:', response.groups?.length || 0, 'groups');
      setGroups(response.groups || []);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch groups';
      console.error('Error fetching groups:', err);
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Fetch groups joined by the user
  const fetchUserGroups = async () => {
    if (!isAuthenticated) return;

    // Prevent multiple simultaneous calls
    if (loading) {
      console.log('Already fetching user groups, skipping duplicate request');
      return;
    }
    
    // Prevent excessive calls with the same data
    const now = Date.now();
    if (now - lastFetchTime < FETCH_COOLDOWN_MS && userGroups.length > 0) {
      console.log(`Using cached user groups (last fetched ${now - lastFetchTime}ms ago)`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Fetching user groups');
      const response = await api.getUserGroups();
      console.log('User groups fetched successfully:', response.groups?.length || 0, 'groups');
      setUserGroups(response.groups || []);
      setLastFetchTime(now);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch user groups';
      console.error('Error fetching user groups:', err);
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single group by ID
  const fetchGroupById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching group by ID:', id);
      const response = await api.getGroupById(id);
      console.log('Group fetched successfully:', response.group?.name);
      return response.group;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch group';
      console.error('Error fetching group:', err);
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new group
  const createGroup = async (groupData: any) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Creating group with data:', groupData);
      const response = await api.createGroup(groupData);
      console.log('Group created successfully:', response.group?.name);
      await fetchGroups();
      await fetchUserGroups();
      return response.group;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create group';
      console.error('Error creating group:', err);
      setError(errorMsg);
      Alert.alert('Error', 'Failed to create group: ' + errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing group
  const updateGroup = async (id: string, groupData: any) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Updating group with ID:', id, 'data:', groupData);
      const response = await api.updateGroup(id, groupData);
      console.log('Group updated successfully:', response.group?.name);
      await fetchGroups();
      await fetchUserGroups();
      return response.group;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update group';
      console.error('Error updating group:', err);
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Join a group
  const joinGroup = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Joining group with ID:', id);
      await api.joinGroup(id);
      console.log('Group joined successfully');
      await fetchGroups();
      await fetchUserGroups();
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to join group';
      console.error('Error joining group:', err);
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Leave a group
  const leaveGroup = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Leaving group with ID:', id);
      await api.leaveGroup(id);
      console.log('Group left successfully');
      await fetchGroups();
      await fetchUserGroups();
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to leave group';
      console.error('Error leaving group:', err);
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add media to a group
  const addGroupMedia = async (id: string, mediaData: any) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Adding media to group with ID:', id);
      await api.addGroupMedia(id, mediaData);
      console.log('Media added successfully to group');
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to add media to group';
      console.error('Error adding media to group:', err);
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load groups when the component mounts or auth state changes
  useEffect(() => {
    console.log('GroupContext: Auth state changed, isAuthenticated =', isAuthenticated);
    fetchGroups();
    if (isAuthenticated) {
      fetchUserGroups();
    } else {
      setUserGroups([]);
    }
  }, [isAuthenticated]);

  const value = {
    groups,
    userGroups,
    loading,
    error,
    fetchGroups,
    fetchUserGroups,
    fetchGroupById,
    createGroup,
    updateGroup,
    joinGroup,
    leaveGroup,
    addGroupMedia,
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};

export default GroupContext; 