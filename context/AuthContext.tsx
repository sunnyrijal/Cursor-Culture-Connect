import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  university?: string;
  culturalBackground?: string;
  avatar?: string;
  bio?: string;
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

// API base URL - directly set to the working port
const API_BASE_URL = 'http://localhost:5002';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(API_BASE_URL);

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
      console.log(`Attempting login with ${apiBaseUrl}/api/auth/login`);
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Login failed:', data.message);
        setIsLoading(false);
        return false;
      }

      console.log('Login successful, storing data');
      
      // Store user data
      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));

      // Update context state
      setToken(data.token);
      setUser(data.user);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Signup function
  const signup = async (userData: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log(`Attempting signup with ${apiBaseUrl}/api/auth/register`);
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Signup failed:', data.message);
        setIsLoading(false);
        return false;
      }

      console.log('Signup successful, storing data');
      
      // Store user data
      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));

      // Update context state
      setToken(data.token);
      setUser(data.user);
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      console.log('Logging out user');
      setIsLoading(true);
      
      // Call logout API
      try {
        await fetch(`${apiBaseUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Logout API call successful');
      } catch (apiError) {
        // Even if API fails, continue with local logout
        console.warn('Logout API call failed but continuing with local logout', apiError);
      }
      
      // Clear storage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      // Update context state
      setToken(null);
      setUser(null);
      
      console.log('User logged out, clearing state complete');
      
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
      safeNavigate('/login');
    }
  }, [isAuthenticated, isLoading]);
  
  if (isLoading) {
    return null; // Or a loading indicator
  }
  
  return isAuthenticated ? <>{children}</> : null;
}; 