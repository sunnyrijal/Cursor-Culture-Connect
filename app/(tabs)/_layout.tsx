// project/app/(tabs)/_layout.tsx

import React, { useEffect } from 'react';
import { Tabs, router, useRootNavigation } from 'expo-router';
import { Home, Search, Users, Calendar, MessageSquare, Activity } from 'lucide-react-native';
import { Platform, Text, View, ActivityIndicator } from 'react-native';
import { usePathname } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { theme } from '@/components/theme';

export default function TabLayout() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const rootNavigation = useRootNavigation();
  
  useEffect(() => {
    console.log("Tab layout rendered, pathname:", pathname);
    console.log("Auth state in tab layout:", { isAuthenticated, isLoading });
  }, [pathname, isAuthenticated, isLoading]);
  
  // Redirect unauthenticated users to login page
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("User not authenticated in tab layout, redirecting to login");
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading]);
  
  // Don't render tabs until authentication check is complete
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 16, color: theme.textSecondary }}>Loading...</Text>
      </View>
    );
  }
  
  // Only render tabs for authenticated users
  if (!isAuthenticated) {
    console.log("Not showing tabs because user is not authenticated");
    return null;
  }

  console.log("Rendering tabs for authenticated user");
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366F1',
        tabBarStyle: {
          height: 54,
          backgroundColor: '#fff',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 8,
        }
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home', 
          tabBarIcon: ({ color }) => <Home color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="discover" 
        options={{ 
          title: 'Discover', 
          tabBarIcon: ({ color }) => <Search color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="groups" 
        options={{ 
          title: 'Groups', 
          tabBarIcon: ({ color }) => <Users color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="events" 
        options={{ 
          title: 'Events', 
          tabBarIcon: ({ color }) => <Calendar color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="chat" 
        options={{ 
          title: 'Chat', 
          tabBarIcon: ({ color }) => <MessageSquare color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="activity-buddy" 
        options={{ 
          title: 'Activity', 
          tabBarIcon: ({ color }) => <Activity color={color} /> 
        }} 
      />
    </Tabs>
  );
}