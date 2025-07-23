import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout as storeLogout } from '@/data/store';

type AuthState = {
  authenticated: boolean;
  token: string | null;
  userId: string | null;
};

type AuthContextType = {
  authState: AuthState;
  login: (token: string, userId: string) => Promise<void>;
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
    const loadAuthData = async () => {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (token && userId) {
        setAuthState({
          authenticated: true,
          token,
          userId,
        });
      }
    };
    loadAuthData();
  }, []);

  const login = async (token: string, userId: string) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('userId', userId);
    setAuthState({
      authenticated: true,
      token,
      userId,
    });
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userId');
    storeLogout(); // Reset store current user
    setAuthState({
      authenticated: false,
      token: null,
      userId: null,
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
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
