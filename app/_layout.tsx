'use client';

import { AuthProvider } from '../contexts/AuthContext';
import {
  QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import getDecodedToken from '@/utils/getMyData';
import { useEffect, useCallback, useState } from 'react';
import { API_BASE_URL } from '@/contexts/axiosConfig';
import { SocketProvider } from '@/hooks/useSocket';
import 'react-native-reanimated';

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
      <QueryClientProvider client={queryClient}>
    <AuthProvider>
        <MainLayout />
    </AuthProvider>
      </QueryClientProvider>
  );
}