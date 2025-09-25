import api from './axiosConfig'; // adjust path as needed
import type { 
  CreateGroupRequest, 
  UpdateGroupRequest,
  GroupMember,
  GroupResponse,
  GroupsResponse,
  MemberResponse,
  AddMultipleMembersResponse,
  MessageResponse,
  GroupRole
} from '../types/group.types'; // adjust path as needed

// Group CRUD operations
export const createGroup = async (data: CreateGroupRequest) => {
  try {
    const response = await api.post('/groups/create', data);
    return response.data;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

export const getAllGroups = async () => {
  try {
    const response = await api.get('/groups/all');
    return response.data ;
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }
};

export const getUserGroups = async () => {
  try {
    const response = await api.get('/groups/discover');
    return response.data ;
  } catch (error) {
    console.error('Error fetching user groups:', error);
    throw error;
  }
};
export const getUserMemberGroup = async () => {
  try {
    const response = await api.get('/groups/user');
    return response.data ;
  } catch (error) {
    console.error('Error fetching user groups:', error);
    throw error;
  }
};

export const getGroup = async (groupId: string | null) => {
  try {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching group:', error);
    throw error;
  }
};

export const updateGroup = async (groupId: string, data: UpdateGroupRequest) => {
  try {
    const response = await api.put(`/groups/${groupId}`, data);
    return response.data ;
  } catch (error) {
    console.error('Error updating group:', error);
    throw error;
  }
};

export const deleteGroup = async (groupId: string) => {
  try {
    const response = await api.delete(`/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

// Member management
export const addMember = async (groupId: string, userId: string) => {
  try {
    const response = await api.post(`/groups/${groupId}/members`, { userId });
    return response.data;
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
};

export const addMultipleMembers = async (groupId: string, userIds: string[]) => {
  console.log(userIds)
  try {
    const response = await api.post(`/groups/${groupId}/members/bulk`, { userIds });
    return response.data;
  } catch (error) {
    console.error('Error adding multiple members:', error);
    throw error;
  }
};

export const removeMember = async (groupId: string, userId: string) => {
  try {
    const response = await api.delete(`/groups/${groupId}/members/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing member:', error);
    throw error;
  }
};

export const updateMemberRoleApi = async (groupId: string, userId: string, role: GroupRole) => {
  try {
    const response = await api.put(`/groups/${groupId}/members/${userId}/role`, { role });
    return response.data as MemberResponse;
  } catch (error) {
    console.error('Error updating member role:', error);
    throw error;
  }
};

// Self-service operations
export const leaveGroup = async (groupId: string) => {
  try {
    const response = await api.delete(`/groups/${groupId}/leave`);
    return response.data as MessageResponse;
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};

// Additional utility functions
export const joinGroup = async (groupId: string) => {
  try {
    // This would typically require an invitation system or public groups
    // For now, it's the same as addMember but could be extended
    const response = await api.post(`/groups/${groupId}/join`);
    return response.data as MemberResponse;
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

export const getGroupMembers = async (groupId: string) => {
  try {
    // This uses the existing getGroup endpoint but you might want a dedicated endpoint
    const response = await api.get(`/groups/${groupId}`);
    return response.data.group.members as GroupMember[];
  } catch (error) {
    console.error('Error fetching group members:', error);
    throw error;
  }
};