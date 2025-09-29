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

export interface SendResetPasswordOtpData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserFilters {
  myUniversity?: boolean;
  universityId?: string;
  major?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
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

export const sendResetPasswordOtp = async (data: SendResetPasswordOtpData) => {
  try {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  } catch (error) {
    console.error('Error sending reset password OTP:', error);
    throw error;
  }
};

export const resetPassword = async (data: ResetPasswordData) => {
  try {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
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

// export const getUsers = async (params?: UserFilters) => {
//   try {
//     const response = await api.get('/user/', {params});
//     return response.data
//   } catch (error) {
//     console.error('Error fetching user data:', error);
//     throw error;
//   }
// };
// In your user.api.ts file
export const getUsers = async (filters?: {
  myUniversity?: boolean;
  major?: string;
  sortBy?: string;
  sortOrder?: string;
  universityId?: string;
}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.myUniversity) params.append('myUniversity', 'true');
      if (filters.major) params.append('major', filters.major);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.universityId) params.append('universityId', filters.universityId);
    }

    const queryString = params.toString();
    const url = queryString ? `/user/?${queryString}` : '/user/';
    
    const response = await api.get(url);
    return response.data;
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
