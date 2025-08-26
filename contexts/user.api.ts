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

// // Alternative version with PATCH method if your backend uses PATCH for partial updates
// export const updateProfilePatch = async (profileData: Partial<UpdateProfileData>): Promise<User> => {
//   try {
//     const response = await api.patch('/user/profile', profileData);
//     return response.data.data;
//   } catch (error) {
//     console.error('Error updating profile:', error);
//     throw error;
//   }
// };

// Usage examples:

// Get user data
// const userData: User = await getMyData();

// Update profile
// const updatedProfile: User = await updateProfile({
//   name: 'John Doe',
//   email: 'john@example.com',
//   phone: '+1234567890'
// });

// Update only specific fields (if using PATCH)
// const updatedProfile: User = await updateProfilePatch({
//   name: 'New Name'
// });

// Example usage in a React Native component:
/*
import React, { useState, useEffect } from 'react';
import { getMyData, updateProfile, User, UpdateProfileData } from './path/to/your/api/functions';

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await getMyData();
        setUser(userData);
      } catch (error) {
        // Handle error (show toast, etc.)
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateProfile = async (formData: UpdateProfileData) => {
    try {
      setLoading(true);
      const updatedUser = await updateProfile(formData);
      setUser(updatedUser);
      // Show success message
    } catch (error) {
      // Handle error
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Your component JSX
  );
};
*/