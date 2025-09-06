import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '../contexts/AuthContext';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import { SocketProvider } from '@/hooks/useSocket';
import getDecodedToken from '@/utils/getMyData';
import { useQuery } from '@tanstack/react-query';
import { API_URL } from '@/contexts/axiosConfig';

const queryClient = new QueryClient();

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const serverUrl = API_URL

  // Socket event handlers
  const handleConnect = useCallback(() => {
    console.log('🔌 Connected to socket server');
  }, []);
  const handleDisconnect = useCallback(() => {
    console.log('❌ Disconnected from socket server');
  }, []);
  const handleError = useCallback((error: string) => {
    console.error('Socket error:', error);
  }, []);
  const handleAuthenticated = useCallback((data: any) => {
    console.log('✅ Socket authenticated:', data);
  }, []);

  const { data: myData } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getDecodedToken(),
  });

  return (
    <SocketProvider
      serverUrl={serverUrl}
      userId={myData?.userId || ''}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onError={handleError}
      onAuthenticated={handleAuthenticated}
    >
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </SocketProvider>
  );
}
