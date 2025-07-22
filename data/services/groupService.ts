import { GROUP_API } from '../apiConfig';
import { getAuthToken } from './authService';

// Common request function with authentication
const authRequest = async (url: string, method: string, body?: any) => {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  const options: RequestInit = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Get all groups
export const getAllGroups = async () => {
  try {
    return await authRequest(GROUP_API.all, 'GET');
  } catch (error) {
    console.error('Get all groups error:', error);
    throw error;
  }
};

// Get user's groups
export const getUserGroups = async () => {
  try {
    return await authRequest(GROUP_API.myGroups, 'GET');
  } catch (error) {
    console.error('Get user groups error:', error);
    throw error;
  }
};

// Get group by ID
export const getGroupById = async (groupId: string | number) => {
  try {
    return await authRequest(GROUP_API.details(groupId), 'GET');
  } catch (error) {
    console.error('Get group by ID error:', error);
    throw error;
  }
};

// Create a new group
export const createGroup = async (groupData: any) => {
  try {
    return await authRequest(GROUP_API.create, 'POST', groupData);
  } catch (error) {
    console.error('Create group error:', error);
    throw error;
  }
};

// Request to join a group
export const requestJoinGroup = async (groupId: string | number, message?: string) => {
  try {
    return await authRequest(GROUP_API.join(groupId), 'POST', { message });
  } catch (error) {
    console.error('Request join group error:', error);
    throw error;
  }
};

// Get pending join requests for a group
export const getPendingJoinRequests = async (groupId: string | number) => {
  try {
    return await authRequest(GROUP_API.joinRequests(groupId), 'GET');
  } catch (error) {
    console.error('Get pending join requests error:', error);
    throw error;
  }
};

// Respond to join request (approve/reject)
export const respondToJoinRequest = async (requestId: string, status: 'approved' | 'rejected') => {
  try {
    return await authRequest(GROUP_API.respondToJoinRequest(requestId), 'PUT', { status });
  } catch (error) {
    console.error('Respond to join request error:', error);
    throw error;
  }
};

// Add admin to group
export const addGroupAdmin = async (groupId: string | number, userId: string) => {
  try {
    return await authRequest(GROUP_API.addAdmin(groupId, userId), 'POST');
  } catch (error) {
    console.error('Add group admin error:', error);
    throw error;
  }
};

// Remove admin from group
export const removeGroupAdmin = async (groupId: string | number, userId: string) => {
  try {
    return await authRequest(GROUP_API.removeAdmin(groupId, userId), 'DELETE');
  } catch (error) {
    console.error('Remove group admin error:', error);
    throw error;
  }
}; 