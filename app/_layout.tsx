'use client';

import { AuthProvider } from '../contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from './index'; // splash/index page
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          {/* Splash / index screen */}
          <Stack.Screen name="index" />
          {/* Auth screens */}
          <Stack.Screen name="(auth)" />
          {/* Tabs will initialize socket */}
          <Stack.Screen name="(tabs)" />
        </Stack>
      </QueryClientProvider>
    </AuthProvider>
  );
}
