// api/userInterest.api.ts

import type { AxiosResponse } from 'axios';
import type {
  CreateUserInterestData,
  UpdateUserInterestData,
  UserInterestApiResponse,
  GetUserInterestsResponse,
  GetUserInterestsParams,
  DeleteUserInterestResponse,
} from '../types/userInterest.types';
import api from './axiosConfig';


// Create a new user interest preference
export const createUserInterest = async (interestData: CreateUserInterestData) => {
  try {
    const response: AxiosResponse<UserInterestApiResponse> = await api.post(
      '/user-interests',
      interestData
    );
    return response.data;
  } catch (error) {
    console.error('Error creating user interest preference:', error);
    throw error;
  }
};

// Get current user's interest preferences
export const getUserInterests = async (params?: GetUserInterestsParams) => {
  try {
    const response: AxiosResponse<GetUserInterestsResponse> = await api.get(
      '/user-interests/my-interests',
      { params }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user interest preferences:', error);
    throw error;
  }
};

// Get all user interest preferences (for search/matching)
export const getAllUserInterests = async (params?: GetUserInterestsParams) => {
  try {
    const response: AxiosResponse<GetUserInterestsResponse> = await api.get(
      '/user-interests/all',
      { params }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching all user interest preferences:', error);
    throw error;
  }
};

// Get specific user interest preference by ID
export const getUserInterestById = async (id: string) => {
  try {
    const response: AxiosResponse<UserInterestApiResponse> = await api.get(
      `/user-interests/${id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user interest preference by ID:', error);
    throw error;
  }
};

// Update user interest preference
export const updateUserInterest = async (id: string, updateData: UpdateUserInterestData) => {
  try {
    const response: AxiosResponse<UserInterestApiResponse> = await api.put(
      `/user-interests/${id}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating user interest preference:', error);
    throw error;
  }
};

// Delete user interest preference
export const deleteUserInterest = async (id: string) => {
  try {
    const response: AxiosResponse<DeleteUserInterestResponse> = await api.delete(
      `/user-interests/${id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting user interest preference:', error);
    throw error;
  }
};

export const getMyActivityPreferences = async () => {
  try {
    const response = await api.get(
      '/user-interests/my-preferences'
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user activity preferences:', error);
    throw error;
  }
};

// Toggle user interest preference status
export const toggleUserInterestStatus = async (id: string) => {
  try {
    const response: AxiosResponse<UserInterestApiResponse> = await api.patch(
      `/user-interests/${id}/toggle`
    );
    return response.data;
  } catch (error) {
    console.error('Error toggling user interest preference status:', error);
    throw error;
  }
};

// Find potential matches for a specific interest
export const findInterestMatches = async (interestId: string, params?: {
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  maxRadius?: number;
  hasEquipment?: boolean;
  hasTransport?: boolean;
}) => {
  try {
    const response: AxiosResponse<GetUserInterestsResponse> = await api.get(
      '/user-interests/all',
      {
        params: {
          interestId,
          isActive: true,
          ...params,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error finding interest matches:', error);
    throw error;
  }
};

// Get user interests by skill level
export const getUserInterestsBySkillLevel = async (skillLevel: 'Beginner' | 'Intermediate' | 'Advanced') => {
  try {
    const response: AxiosResponse<GetUserInterestsResponse> = await api.get(
      '/user-interests/my-interests',
      {
        params: { skillLevel, isActive: true },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user interests by skill level:', error);
    throw error;
  }
};