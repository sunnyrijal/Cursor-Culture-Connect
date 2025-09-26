'use client';

import { AuthProvider } from '../contexts/AuthContext';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import getDecodedToken from '@/utils/getMyData';
import { useEffect, useCallback, useState } from 'react';
import { API_BASE_URL } from '@/contexts/axiosConfig';
import { SocketProvider } from '@/hooks/useSocket';

const queryClient = new QueryClient();

function MainLayout() {
  const [userId, setUserId] = useState<string | null>(null);

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

  const { data: myData } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getDecodedToken(),
    retry: false,
  });

  useEffect(() => {
    if (myData?.userId) setUserId(myData.userId);
  }, [myData]);

  return (
    <SocketProvider
      serverUrl={API_BASE_URL}
      userId={userId || ''}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onError={handleError}
      onAuthenticated={handleAuthenticated}
    >
      <StatusBar style="auto" />
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
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <MainLayout />
      </QueryClientProvider>
    </AuthProvider>
  );
}
