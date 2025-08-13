import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout as storeLogout } from '@/data/store';
import { apiClient, API_URL } from './api';

type AuthState = {
  authenticated: boolean;
  token: string | null;
  userId: string | null;
};

interface SignupData {
  email: string;
  password: string;
  fullName?: string;
  university?: string;
  state?: string;
  city?: string;
  mobileNumber?: string;
  dateOfBirth?: Date;
}

type AuthContextType = {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    authenticated: false,
    token: null,
    userId: null,
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if there's an active session on the server
        const response = await fetch(`${API_URL}/auth/check-session`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            // Get token from storage if available
            const token = await AsyncStorage.getItem('token');
            
            setAuthState({
              authenticated: true,
              token,
              userId: data.userId,
            });
            return;
          }
        }
        
        // If no active session, check local storage as fallback
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
        if (token && userId) {
          setAuthState({
            authenticated: true,
            token,
            userId,
          });
        }
      } catch (error) {
        console.error('Session check error:', error);
        // Fallback to local storage if session check fails
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
        if (token && userId) {
          setAuthState({
            authenticated: true,
            token,
            userId,
          });
        }
      }
    };
    
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Validate email domain
      if (!email.endsWith('.edu')) {
        throw new Error('Only .edu email addresses are allowed');
      }
      
      const response = await apiClient.login(email, password);
      const { token, id } = response;
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userId', id.toString());
      
      setAuthState({
        authenticated: true,
        token,
        userId: id.toString(),
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      await apiClient.signup(email, password);
      // After successful signup, log the user in
      await login(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call server logout endpoint to destroy session
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Server logout error:', error);
      // Continue with client-side logout even if server logout fails
    }
    
    // Clear local storage
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userId');
    
    // Reset store
    storeLogout();
    
    // Update auth state
    setAuthState({
      authenticated: false,
      token: null,
      userId: null,
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
