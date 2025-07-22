import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { loginUser, signupUser, logoutUser, getCurrentUser } from '@/data/services/authService';
import { API_BASE_URL } from '@/data/apiConfig';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  university?: string;
  culturalBackground?: string;
  avatar?: string;
  bio?: string;
  languages?: string[];
  heritage?: string[];
  major?: string;
  year?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  apiBaseUrl: string;
}

// API base URL
const apiBaseUrl = API_BASE_URL;

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Debug current path
  useEffect(() => {
    console.log("AuthProvider initialized, checking for stored credentials");
  }, []);

  // Check if the user is logged in on startup
  useEffect(() => {
    const init = async () => {
      try {
        // Get stored auth data
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUserData = await AsyncStorage.getItem('userData');
        
        if (storedToken && storedUserData) {
          console.log('Found stored auth data, setting user and token');
          setToken(storedToken);
          setUser(JSON.parse(storedUserData));
        } else {
          console.log('No stored auth data found');
        }
      } catch (error) {
        console.error('Error during initialization:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Monitor authentication state and redirect when it changes
  useEffect(() => {
    if (!isLoading) {
      if (token) {
        console.log('Auth state changed: User is authenticated');
      } else {
        console.log('Auth state changed: User is NOT authenticated');
      }
    }
  }, [token, isLoading]);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log(`Attempting login with ${email}`);
      const data = await loginUser({ email, password });

      if (data && data.token) {
        console.log('Login successful, data received:', !!data);
        
        // Update context state
        setToken(data.token);
        setUser(data.user);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (userData: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log(`Attempting signup with ${userData.email}`);
      const data = await signupUser(userData);

      if (data && data.token) {
        console.log('Signup successful');
        
        // Update context state
        setToken(data.token);
        setUser(data.user);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      console.log('Logging out user');
      setIsLoading(true);
      
      // Call logout service
      await logoutUser();
      
      // Clear state
      setToken(null);
      setUser(null);
      
      // Navigate to login screen
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!token,
        apiBaseUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth route component to protect routes
interface AuthRouteProps {
  children: ReactNode;
}

export const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading]);
  
  if (isLoading) {
    return null; // Or a loading indicator
  }
  
  return isAuthenticated ? <>{children}</> : null;
}; 