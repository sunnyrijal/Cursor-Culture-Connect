import api from './axiosConfig';
import { AxiosResponse } from 'axios';

export interface Interest {
  id: string;
  name: string;
  createdAt: string;
}

export interface CreateInterestData {
  name: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  profilePicture?: string;
  interests: string[];
  major?: string;
  classYear: string;
  bio?: string;
  createdAt: string;
}

export interface UsersByInterestResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface InterestPing {
  id: string;
  senderId: string;
  receiverId: string;
  interestId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  response?: string;
  respondedAt?: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    profilePicture?: string;
  };
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    profilePicture?: string;
  };
  interest: Interest;
}

export interface SendPingData {
  receiverId: string;
  interestName: string;
  message?: string;
}

export interface SendActivityPingData {
  receiverId: string;
  activityId: string;
  message?: string;
}

export interface UpdatePingData {
  status: 'accepted' | 'declined';
  response?: string;
}

export interface UserPingsResponse {
  sent?: InterestPing[];
  received?: InterestPing[];
  all?: {
    sent: InterestPing[];
    received: InterestPing[];
    all: InterestPing[];
  };
}

export const createInterest = async (interestData: CreateInterestData) => {
  try {
    const response: AxiosResponse = await api.post(
      '/interests/create',
      interestData
    );
    return response.data;
  } catch (error) {
    console.error('Error creating interest:', error);
    throw error;
  }
};

export const getInterests = async () => {
  try {
    const response: AxiosResponse = await api.get(
      '/interests/all'
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching interests:', error);
    throw error;
  }
};

export const deleteInterest = async (interestId: string) => {
  try {
    const response: AxiosResponse = await api.delete(
      `/interests/${interestId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting interest:', error);
    throw error;
  }
};

// Interest matching operations
export const getUsersByInterest = async (
  interestName: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const response: AxiosResponse = await api.get(
      `/interests/${encodeURIComponent(interestName)}/users?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching users by interest:', error);
    throw error;
  }
};

// Ping operations
export const sendInterestPing = async (pingData: SendPingData) => {
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

export const updateInterestPing = async (
  pingId: string,
  updateData: UpdatePingData
) => {
  try {
    console.log(updateData)
    const response: AxiosResponse = await api.patch(
      `/interests/ping/${pingId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating interest ping:', error);
    throw error;
  }
};

export const getUserPings = async (type: 'sent' | 'received' | 'all' = 'all') => {
  try {
    const response: AxiosResponse = await api.get(
      `/interests/pings?type=${type}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user pings:', error);
    throw error;
  }
};