'use client';

import { AuthProvider } from '../contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import getDecodedToken from '@/utils/getMyData';
import { useEffect, useCallback, useState } from 'react';
import { API_BASE_URL } from '@/contexts/axiosConfig';
import socketService from '@/utils/socketService'; // Import the singleton instance
import { SocketProvider } from '@/hooks/useSocket'; // Keep this for the provider component
import 'react-native-reanimated'; // This should be at the top
import { AlertProvider } from '@/contexts/AlertContext';
import * as Linking from 'expo-linking';
import SafeScreen from '@/components/SafeScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
const queryClient = new QueryClient();

function MainLayout() {
  const [userId, setUserId] = useState<string | null>(null);
  const [myData, setMyData] = useState<any>(null);

  // Socket event handlers
  const handleConnect = useCallback(
    () => console.log('🔌 Connected to socket'),
    []
  );
  const handleDisconnect = useCallback(
    () => console.log('❌ Disconnected'),
    []
  );
  const handleError = useCallback(
    (err: string) => console.error('Socket error:', err),
    []
  );
  const handleAuthenticated = useCallback(
    (data: any) => console.log('✅ Socket authenticated', data),
    []
  );

  useEffect(() => {
    const fetchMyData = async () => {
      const data = await getDecodedToken();
      setMyData(data);
      if (data?.userId) setUserId(data.userId);
    };
    fetchMyData();
  }, []);

  // Set the queryClient for the socket service singleton
  socketService.setQueryClient(queryClient);

  const linking = {
    prefixes: [Linking.createURL('/'), 'myapp://', 'https://trivo.app/*'],
    config: {
      screens: {
        '(tabs)': {
          screens: {
            index: 'home',
          },
        },
        'event/[id]': 'event/:id',
        'public/profile/[id]': 'public/profile/:id',
        '(auth)/login': 'login',
        '+not-found': '*',
      },
    },
  };

 const scheme = useColorScheme() ?? 'light';
 console.log(scheme)
  return (
    <SocketProvider serverUrl={API_BASE_URL} userId={userId || ''} onConnect={handleConnect} onDisconnect={handleDisconnect} onError={handleError} onAuthenticated={handleAuthenticated}>
      <StatusBar  style={scheme === 'dark' ? 'dark' : 'light'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SocketProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <SafeAreaProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
        </SafeAreaProvider>
      </AlertProvider>
    </QueryClientProvider>
  );
}
