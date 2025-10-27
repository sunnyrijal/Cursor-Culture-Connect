import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from './api';
import { API_URL } from './axiosConfig';
import { router } from 'expo-router';
import { SignupData } from '@/types/user';

type AuthState = {
  authenticated: boolean;
  token: string | null;
  userId: string | null;
};

type AuthContextType = {
  login: (email: string, password: string) => Promise<void>;
  signup: (signupData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  authenticated: boolean;
  userId: string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>({
    authenticated: false,
    token: null,
    userId: null,
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
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
            const token = await SecureStore.getItemAsync('token');

            setAuthState({
              authenticated: true,
              token,
              userId: data.userId,
            });
            return;
          }
        }

        // If no active session, check local storage as fallback
        const token = await SecureStore.getItemAsync('token');
        const userId = await SecureStore.getItemAsync('userId');
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
        const token = await SecureStore.getItemAsync('token');
        const userId = await SecureStore.getItemAsync('userId');
        if (token && userId) {
          setAuthState({
            authenticated: true,
            token,
            userId,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      const { accessToken, user } = response.data;

      await SecureStore.setItemAsync('token', accessToken);
      await SecureStore.setItemAsync('userId', user?.id.toString());

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
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('userId');

    // Update auth state
    setAuthState({
      authenticated: false,
      token: null,
      userId: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        signup,
        logout,
        loading,
        authenticated: authState.authenticated,
        userId: authState.userId,
      }}
    >
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
