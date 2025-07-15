// project/app/(tabs)/_layout.tsx

import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Search, Users, Calendar, User, MessageSquare, Heart } from 'lucide-react-native';
import { Platform } from 'react-native';
import { usePathname } from 'expo-router';

export default function TabLayout() {
  const pathname = usePathname && usePathname();
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
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Home color={color} /> }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover', tabBarIcon: ({ color }) => <Search color={color} /> }} />
      <Tabs.Screen name="groups" options={{ title: 'Groups', tabBarIcon: ({ color }) => <Users color={color} /> }} />
      <Tabs.Screen name="events" options={{ title: 'Events', tabBarIcon: ({ color }) => <Calendar color={color} /> }} />
      <Tabs.Screen name="activity-buddy" options={{ title: 'Buddy', tabBarIcon: ({ color }) => <Heart color={color} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: ({ color }) => <MessageSquare color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <User color={color} /> }} />
    </Tabs>
  );
}