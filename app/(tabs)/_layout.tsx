// project/app/(tabs)/_layout.tsx

import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Search, Users, Calendar, User, MessageSquare } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366F1',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Home color={color} /> }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover', tabBarIcon: ({ color }) => <Search color={color} /> }} />
      <Tabs.Screen name="groups" options={{ title: 'Groups', tabBarIcon: ({ color }) => <Users color={color} /> }} />
      <Tabs.Screen name="events" options={{ title: 'Events', tabBarIcon: ({ color }) => <Calendar color={color} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: ({ color }) => <MessageSquare color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <User color={color} /> }} />
    </Tabs>
  );
}