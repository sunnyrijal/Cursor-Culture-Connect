import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_API } from '../apiConfig';

// Types
interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  university?: string;
  culturalBackground?: string;
}

// Helper function to get the auth token
export const getAuthToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('userToken');
};

// Helper function for authenticated requests
const authRequest = async (url: string, method: string, body?: any) => {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
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

export const loginUser = async (credentials: LoginRequest) => {
  try {
    const response = await fetch(AUTH_API.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Store auth data
    if (data.token) {
      await AsyncStorage.setItem('userToken', data.token);
      if (data.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      }
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signupUser = async (userData: SignupRequest) => {
  try {
    const response = await fetch(AUTH_API.register, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }
    
    // Store auth data
    if (data.token) {
      await AsyncStorage.setItem('userToken', data.token);
      if (data.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      }
    }
    
    return data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // Call logout API
    try {
      await authRequest(AUTH_API.logout, 'POST');
    } catch (error) {
      console.warn('Logout API error (continuing with local logout):', error);
    }
    
    // Clear storage regardless of API success
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    return await authRequest(AUTH_API.me, 'GET');
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem('userToken');
  return !!token;
}; 