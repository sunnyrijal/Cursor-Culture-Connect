import { AxiosResponse } from 'axios';
import api from './axiosConfig';
import { SendActivityPingData, SendPingData } from './interest.api';

// Types for Activity operations
export interface CreateActivityData {
  name: string;
  description?: string;
  interestId: string;
  minParticipants?: number;
  maxParticipants?: number;
  typicalDuration?: number;
  indoorOutdoor?: string;
  commonEquipment?: string[];
}

export interface UpdateActivityData {
  name?: string;
  description?: string;
  minParticipants?: number;
  maxParticipants?: number;
  typicalDuration?: number;
  indoorOutdoor?: string;
  commonEquipment?: string[];
}

export interface ActivityResponse {
  id: string;
  name: string;
  description?: string;
  interestId: string;
  minParticipants: number;
  maxParticipants?: number;
  typicalDuration?: number;
  indoorOutdoor?: string;
  commonEquipment: string[];
  createdAt: string;
  updatedAt: string;
  interest?: {
    id: string;
    name: string;
  };
}

export interface ActivityApiResponse {
  success: boolean;
  data: ActivityResponse;
  message: string;
}

export interface ActivityListApiResponse {
  success: boolean;
  data: ActivityResponse[];
  message: string;
}

// Frontend API Functions

export const createActivity = async (activityData: CreateActivityData) => {
  try {
    const response = await api.post(
      '/activities',
      activityData
    );
    return response.data;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
};

export const getActivities = async (interestId?: string) => {
  try {
    const params = interestId ? { interestId } : {};
    const response = await api.get(
      '/activities',
      { params }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

export const getActivityById = async (activityId: string) => {
  try {
    const response = await api.get(
      `/activities/${activityId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching activity:', error);
    throw error;
  }
};

export const updateActivity = async (activityId: string, updateData: UpdateActivityData) => {
  try {
    const response = await api.put(
      `/activities/${activityId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
};

export const getUsersByActivity = async (
  id: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const response: AxiosResponse = await api.get(
      `/activities/${id}/users?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching users by interest:', error);
    throw error;
  }
};

export const deleteActivity = async (activityId: string) => {
  try {
    const response = await api.delete(
      `/activities/${activityId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
};

export const getActivitiesByInterest = async (interestId: string) => {
  try {
    return await getActivities(interestId);
  } catch (error) {
    console.error('Error fetching activities by interest:', error);
    throw error;
  }
};

export const sendActivityPing = async (pingData: SendActivityPingData) => {
  try {
    const response: AxiosResponse = await api.post(
      '/interests/ping',
      pingData
    );
    return response.data;
  } catch (error) {
    console.error('Error sending interest ping:', error);
    throw error;
  }
};

