import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout as storeLogout } from '@/data/store';
import { apiClient } from './api';
import { Alert } from 'react-native';
import { useFilterScreenChildren } from 'expo-router/build/layouts/withLayoutContext';
import { API_URL } from './axiosConfig';
import { router } from 'expo-router';
import { SignupData } from '@/types/user';
import { checkAuthStatus } from '@/utils/auth';

type AuthState = {
  authenticated: boolean;
  token: string | null;
  userId: string | null;
};

type AuthContextType = {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  signup: (signupData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  loading:boolean;
  authenticated:boolean
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
      const response = await apiClient.login(email, password);
      const { accessToken, user } = response.data;
      console.log(response);
      await AsyncStorage.setItem('token', accessToken);
      await AsyncStorage.setItem('userId', user?.id.toString());

      setAuthState({
        authenticated: true,
        token: accessToken,
        userId: user.id.toString(),
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (signupData: SignupData) => {
    try {
      const response = await apiClient.signup(signupData);
      // After successful signup, log the user in
      // await login(email, password);
      router.push(`/(auth)/verify?email=${signupData.email}`);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    // try {
    //   // Call server logout endpoint to destroy session
    //   await fetch(`${API_URL}/auth/logout`, {
    //     method: 'POST',
    //     credentials: 'include',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //   });
    // } catch (error) {
    //   console.error('Server logout error:', error);
    //   // Continue with client-side logout even if server logout fails
    // }

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

  const [loading, setLoading] = useState(true); // ← needed for splash

  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => {
    const initAuth = async () => {
      const isValid = await checkAuthStatus();
      setAuthenticated(isValid);
      setLoading(false); // auth check complete
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ authState, login, signup, logout, authenticated, loading }}>
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
