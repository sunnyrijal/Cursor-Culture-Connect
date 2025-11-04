'use client';

import { AuthProvider } from '../contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import getDecodedToken from '@/utils/getMyData';
import { useEffect, useCallback, useState, useRef } from 'react';
import { API_BASE_URL } from '@/contexts/axiosConfig';
import socketService from '@/utils/socketService'; 
import { SocketProvider } from '@/hooks/useSocket'; 
import 'react-native-reanimated'; 
import { AlertProvider } from '@/contexts/AlertContext';
import * as Linking from 'expo-linking';
import SafeScreen from '@/components/SafeScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { usePushNotifications } from '@/hooks/usePushNotification';

// Create queryClient outside component to prevent recreation on re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

function MainLayout() {
  const [userId, setUserId] = useState<string | null>(null);
  const [myData, setMyData] = useState<any>(null);
  const initializedRef = useRef(false);

  const scheme = useColorScheme() ?? 'light';

  // Memoize socket event handlers
  const handleConnect = useCallback(() => console.log('🔌 Connected to socket'), []);
  const handleDisconnect = useCallback(() => console.log('❌ Disconnected'), []);
  const handleError = useCallback((err: string) => console.error('Socket error:', err), []);
  const handleAuthenticated = useCallback((data: any) => console.log('✅ Socket authenticated', data), []);

  // Initialize only once
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const fetchMyData = async () => {
      try {
        const data = await getDecodedToken();
        setMyData(data);
        if (data?.userId) setUserId(data.userId);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchMyData();

    // Set the queryClient for the socket service singleton
    socketService.setQueryClient(queryClient);

    // Uncomment if using AdMob
    // mobileAds()
    //   .initialize()
    //   .then(adapterStatuses => console.log('✅ AdMob initialized', adapterStatuses))
    //   .catch(err => console.log('❌ AdMob init error:', err));
  }, []);

  const linking = {
    prefixes: [Linking.createURL('/'), 'myapp://', 'https://trivo.app/*'],
    config: {
      screens: {
        '(tabs)': { screens: { index: 'home' } },
        'event/[id]': 'event/:id',
        'public/profile/[id]': 'public/profile/:id',
        '(auth)/login': 'login',
        '+not-found': '*',
      },
    },
  };
    const { expoPushToken, notification } = usePushNotifications();

  return (
    <SocketProvider
      serverUrl={API_BASE_URL}
      userId={userId || ''}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onError={handleError}
      onAuthenticated={handleAuthenticated}
    >
      <StatusBar style={scheme === 'dark' ? 'dark' : 'light'} />
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