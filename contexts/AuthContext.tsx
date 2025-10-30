import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from './api';
import { API_URL } from './axiosConfig';
import { jwtDecode } from 'jwt-decode';
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
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        const userId = await SecureStore.getItemAsync('userId');

        if (token && userId) {
          const decoded: { exp?: number } = jwtDecode(token);
          if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            console.warn('Token expired, logging out.');
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('userId');
            router.replace('/(auth)/login');
          } else {
            setAuthState({
              authenticated: true,
              token,
              userId,
            });
          }
        }
      } catch (e) {
        console.error('Error checking token:', e);
        // If there's an error (e.g., invalid token), clear storage
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('userId');
      }
    };

    checkToken();
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

  const [loading, setLoading] = useState(true); // ← needed for splash

  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => {
    const initAuth = async () => {
      const isValid = await checkAuthStatus();
      setAuthenticated(isValid);
      setAuthState(()=>({...authState, authenticated:isValid}))
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
