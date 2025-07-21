import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from './api';
import { Alert } from 'react-native';

// Define types
type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored token on mount
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        console.log('Loading auth state from storage...');
        const token = await AsyncStorage.getItem('token');
        
        if (token) {
          console.log('Token found in storage, fetching user data...');
          try {
            // Fetch current user data
            const userData = await api.getCurrentUser();
            console.log('User data fetched successfully:', userData);
            setUser(userData.user);
          } catch (error) {
            console.error('Error fetching user data with stored token:', error);
            // Clear invalid token
            await AsyncStorage.removeItem('token');
          }
        } else {
          console.log('No token found in storage');
        }
      } catch (error) {
        console.error('Failed to restore authentication state:', error);
        // Clear potentially invalid token
        await AsyncStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with email:', email);
      const response = await api.login({ email, password });
      
      if (!response || !response.token) {
        throw new Error('No token received from server');
      }
      
      console.log('Login successful, storing token...');
      await AsyncStorage.setItem('token', response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      console.log('Attempting registration with data:', { ...userData, password: '[REDACTED]' });
      const response = await api.register(userData);
      
      if (!response || !response.token) {
        throw new Error('No token received from server');
      }
      
      console.log('Registration successful, storing token...');
      await AsyncStorage.setItem('token', response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      console.log('Logging out, clearing token...');
      await AsyncStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Logout Error', 'There was a problem logging out.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<User>) => {
    try {
      console.log('Updating user profile...');
      const response = await api.updateProfile(userData);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('Update user failed:', error);
      Alert.alert('Update Failed', 'There was a problem updating your profile.');
      throw error;
    }
  };

  // Value object to be passed through context
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 