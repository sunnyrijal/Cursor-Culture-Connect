import React, { useCallback, useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import {
  Home,
  Search,
  Users,
  Calendar,
  MessageSquare,
  Activity,
} from 'lucide-react-native';
import { View, Platform, StyleSheet, Text } from 'react-native';
import getDecodedToken from '@/utils/getMyData';
import { useQuery } from '@tanstack/react-query';
import { SocketProvider } from '@/hooks/useSocket';
import { API_BASE_URL } from '@/contexts/axiosConfig';

export default function TabLayout() {
  const [userId, setUserId] = useState<string | null>(null);

  const { data: myData } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getDecodedToken(),
    retry: false,
  });

  useEffect(() => {
    if (myData?.userId) setUserId(myData.userId);
  }, [myData]);

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

  if (!userId) return null; // wait for userId before rendering tabs

  return (
    <SocketProvider
      serverUrl={API_BASE_URL}
      userId={userId}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onError={handleError}
      onAuthenticated={handleAuthenticated}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#8B8B8B',
          tabBarStyle: {
            height: 80,
            paddingBottom: 12,
            paddingTop: 16,
            backgroundColor: '#F0F3F7',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.8)',
            ...Platform.select({
              ios: {
                shadowColor: '#CDD2D8',
                shadowOffset: { width: 0, height: -8 },
                shadowOpacity: 1,
                shadowRadius: 16,
              },
              android: {
                elevation: 20,
                shadowColor: '#CDD2D8',
              },
            }),
          },
          tabBarIconStyle: {
            marginBottom: -2,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused, color }) => (
              <View
                style={[
                  styles.tabContainer,
                  focused ? styles.activeTab : styles.inactiveTab,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Home
                    color={focused ? '#fff' : '#64748B'}
                    size={22}
                    strokeWidth={2}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: focused ? '#fff' : '#64748B' },
                  ]}
                >
                  Home
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Discover',
            tabBarIcon: ({ focused, color }) => (
              <View
                style={[
                  styles.tabContainer,
                  focused ? styles.activeTab : styles.inactiveTab,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Search
                    color={focused ? '#fff' : '#64748B'}
                    size={22}
                    strokeWidth={2}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: focused ? '#fff' : '#64748B' },
                  ]}
                >
                  People
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="groups"
          options={{
            title: 'Groups',
            tabBarIcon: ({ focused, color }) => (
              <View
                style={[
                  styles.tabContainer,
                  focused ? styles.activeTab : styles.inactiveTab,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Users
                    color={focused ? '#fff' : '#64748B'}
                    size={22}
                    strokeWidth={2}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: focused ? '#fff' : '#64748B' },
                  ]}
                >
                  Groups
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: 'Events',
            tabBarIcon: ({ focused, color }) => (
              <View
                style={[
                  styles.tabContainer,
                  focused ? styles.activeTab : styles.inactiveTab,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Calendar
                    color={focused ? '#fff' : '#64748B'}
                    size={22}
                    strokeWidth={2}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: focused ? '#fff' : '#64748B' },
                  ]}
                >
                  Events
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ focused, color }) => (
              <View
                style={[
                  styles.tabContainer,
                  focused ? styles.activeTab : styles.inactiveTab,
                ]}
              >
                <View style={styles.iconContainer}>
                  <MessageSquare
                    color={focused ? '#fff' : '#64748B'}
                    size={22}
                    strokeWidth={2}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: focused ? '#fff' : '#64748B' },
                  ]}
                >
                  Chat
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="activity-buddy"
          options={{
            title: 'Activity',
            tabBarIcon: ({ focused, color }) => (
              <View
                style={[
                  styles.tabContainer,
                  focused ? styles.activeTab : styles.inactiveTab,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Activity
                    color={focused ? '#fff' : '#64748B'}
                    size={22}
                    strokeWidth={2}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: focused ? '#fff' : '#64748B' },
                  ]}
                >
                  Activity
                </Text>
              </View>
            ),
          }}
        />
      </Tabs>
    </SocketProvider>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 54,
    height: 54,
    borderRadius: 18,
  },
  iconContainer: {
    marginBottom: 4,
  },
  inactiveTab: {
    backgroundColor: '#F0F3F7',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
        shadowColor: '#CDD2D8',
      },
    }),
  },
  activeTab: {
    backgroundColor: '#6366F1',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
        shadowColor: '#4F46E5',
      },
    }),
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

// Alternative implementation with more pronounced neumorphism
export const NeumorphicTabStyles = StyleSheet.create({
  tabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: 20,
    marginTop: 2,
  },
  iconContainer: {
    marginBottom: 4,
  },
  inactiveTab: {
    backgroundColor: '#F0F3F7',
    // Multiple shadow layers for better neumorphism
    ...Platform.select({
      ios: [
        // Outer dark shadow
        {
          shadowColor: '#CDD2D8',
          shadowOffset: { width: 6, height: 6 },
          shadowOpacity: 1,
          shadowRadius: 12,
        },
        // Inner light shadow
        {
          shadowColor: '#FFFFFF',
          shadowOffset: { width: -6, height: -6 },
          shadowOpacity: 1,
          shadowRadius: 12,
        },
      ],
      android: {
        elevation: 6,
        shadowColor: '#CDD2D8',
        borderWidth: 0.5,
        borderColor: 'rgba(205, 210, 216, 0.3)',
      },
    }),
  },
  activeTab: {
    backgroundColor: '#6366F1',
    // Pressed/inset effect
    ...Platform.select({
      ios: [
        // Inset shadow effect
        {
          shadowColor: '#4F46E5',
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 6,
        },
        // Outer glow
        {
          shadowColor: '#6366F1',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
        },
      ],
      android: {
        elevation: 12,
        shadowColor: '#4F46E5',
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
    }),
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
