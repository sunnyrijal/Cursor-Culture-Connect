import api from './axiosConfig'; // adjust path as needed
import { AxiosResponse } from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?:string
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Get current user's data
export const getMyData = async () => {
  try {
    const response = await api.get('/user/me');
    return response.data
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get('/user/all');
    return response.data
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (profileData: UpdateProfileData) => {
  try {
    const response = await api.put('/user/update', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

