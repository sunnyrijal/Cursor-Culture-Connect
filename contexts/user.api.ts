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
  name?: string
  email?: string
  phone?: string
  avatar?: string
  bio?: string
  major?: string
  graduationYear?: string
  socialMedia?: { [key: string]: string }
  dateOfBirth?: string
  city?: string
  state?: string
  classYear?: string
  countryOfOrigin?: string
  university?: string
  interests?: string[]
  languagesSpoken?: string[]
  profilePicture?: string
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

export const getUsers = async () => {
  try {
    const response = await api.get('/user/');
    return response.data
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};


  export const getCounts = async () => {
  try {
    const response = await api.get('/user/count');
    return response.data
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

  export const getHubDetails = async () => {
  try {
    const response = await api.get('/user/hub-details');
    return response.data
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (profileData: UpdateProfileData) => {
  try {
    const response = await api.put("/user/update", profileData)
    return response.data
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}


export const getUserById = async (id:string) => {
  try {
    const response = await api.get(`/user/${id}` );
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const deleteMe = async () => {
  try {
    const response = await api.delete(`/user/me` );
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};


