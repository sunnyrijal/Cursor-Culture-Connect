// app/(tabs)/_layout.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { AppState, Platform, StyleSheet, View, Text } from 'react-native';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Users as UsersIcon,
  Calendar as CalendarIcon,
  MessageSquare as MessageSquareIcon,
  Activity as ActivityIcon,
} from 'lucide-react-native';

import getDecodedToken from '@/utils/getMyData';
import { SocketProvider, useSocket } from '@/hooks/useSocket';
import { API_BASE_URL } from '@/contexts/axiosConfig';
import SafeScreen from '@/components/SafeScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUnreadChatCount } from '@/contexts/chat.api';

export default function TabLayout() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 60;

  useEffect(() => {
    (async () => {
      const data = await getDecodedToken();
      if (data?.userId) setUserId(data.userId);
    })();
  }, []);

  const handleConnect = useCallback(() => console.log('🔌 Connected to socket'), []);
  const handleDisconnect = useCallback(() => console.log('❌ Disconnected'), []);
  const handleError = useCallback((err: string) => console.error('Socket error:', err), []);
  const handleAuthenticated = useCallback((data: any) => console.log('✅ Socket authenticated', data), []);

  const { data: unreadChatCountResponse } = useQuery({
    queryKey: ['unreadChatCount'],
    queryFn: getUnreadChatCount,
    enabled: !!userId, // Only run query when userId is available
  });
  const unreadChatCount = unreadChatCountResponse?.data.count || 0;

  const SocketConnectionManager = ({ children }: { children: React.ReactNode }) => {
    const {
      isConnected,
      reconnect,
      onNewUserMessage,
      removeNewUserMessageListener,
      onNewMessageReceived,
      removeNewMessageReceivedListener,
    } = useSocket();

    const handleNewUserMessage = useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }, []);

    // NEW: Global handler for new_message_received event
    const handleNewMessageReceived = useCallback((messageData: any) => {
      console.log('📨 NEW MESSAGE RECEIVED (GLOBAL):', messageData);
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['chat'] });
      queryClient.invalidateQueries({ queryKey: ['unreadChatCount'] });
    }, [queryClient]);

    useEffect(() => {
      const sub = AppState.addEventListener('change', state => {
        if (state === 'active' && !isConnected) reconnect();
      });
      
      if (!isConnected) reconnect();

      if (isConnected) {
        console.log('Setting up socket message listeners');
        
        // Old listener (if still needed)
        onNewUserMessage(handleNewUserMessage);
        
        // NEW: Global listener for new_message_received
        onNewMessageReceived(handleNewMessageReceived);
      }

      return () => {
        sub.remove();
        removeNewUserMessageListener();
        removeNewMessageReceivedListener();
      };
    }, [
      isConnected, 
      reconnect, 
      onNewUserMessage, 
      handleNewUserMessage,
      onNewMessageReceived,
      handleNewMessageReceived,
      removeNewUserMessageListener,
      removeNewMessageReceivedListener
    ]);

    return <>{children}</>;
  };

  if (!userId) {
    // You might want to show a loading indicator here
    return null;
  }

  return (
    <SocketProvider
      serverUrl={API_BASE_URL}
      userId={userId}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onError={handleError}
      onAuthenticated={handleAuthenticated}
    >
      {/* If SafeScreen supports edges, prefer: <SafeScreen edges={['top']}> */}
      <SafeScreen>
        <SocketConnectionManager>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarShowLabel: false,
              tabBarHideOnKeyboard: true,
              tabBarStyle: {
                height: TAB_BAR_HEIGHT + insets.bottom,
                paddingTop: 4,
                paddingBottom: Math.max(insets.bottom, 8),
                backgroundColor: '#F0F3F7',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: 'rgba(0,0,0,0.06)',
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
              },
              tabBarItemStyle: { paddingVertical: 2 },
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: 'Home',
                tabBarIcon: ({ focused }) => <TabItem focused={focused} label="Home" Icon={HomeIcon} />,
              }}
            />
            <Tabs.Screen
              name="discover"
              options={{
                title: 'People',
                tabBarIcon: ({ focused }) => <TabItem focused={focused} label="People" Icon={SearchIcon} />,
              }}
            />
            <Tabs.Screen
              name="groups"
              options={{
                title: 'Groups',
                tabBarIcon: ({ focused }) => <TabItem focused={focused} label="Groups" Icon={UsersIcon} />,
              }}
            />
            <Tabs.Screen
              name="events"
              options={{
                title: 'Events',
                tabBarIcon: ({ focused }) => <TabItem focused={focused} label="Events" Icon={CalendarIcon} />,
              }}
            />
            <Tabs.Screen
              name="chat"
              options={{
                title: 'Chat',
                tabBarIcon: ({ focused }) => (
                  <TabItem
                    focused={focused}
                    label="Chat"
                    Icon={MessageSquareIcon}
                    badgeCount={unreadChatCount}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="activity-buddy"
              options={{
                title: 'Activity',
                tabBarIcon: ({ focused }) => <TabItem focused={focused} label="Activity" Icon={ActivityIcon} />,
              }}
            />
          </Tabs>
        </SocketConnectionManager>
      </SafeScreen>
    </SocketProvider>
  );
}

/** Reusable tab item with icon + label + subtle active indicator */
function TabItem({
  focused,
  label,
  Icon,
  badgeCount = 0,
}: {
  focused: boolean;
  label: string;
  Icon: React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;
  badgeCount?: number;
}) {
  const color = focused ? '#6366F1' : '#64748B';
  return (
    <View style={styles.tabContainer}>
      <View style={[styles.activeIndicator, focused && styles.activeIndicatorVisible]} />
      <View style={styles.iconWrapper}>
        <Icon color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
      </View>
      <Text style={[styles.tabLabel, { color, fontWeight: focused ? '600' : '500' }]}>{label}</Text>
      {badgeCount > 0 && (
        <View style={styles.badge} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 55,
    paddingTop: 3,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    height: 3,
    width: 0,
    borderRadius: 2,
    backgroundColor: '#6366F1',
  },
  activeIndicatorVisible: { width: 30 },
  iconWrapper: { marginTop: 7, marginBottom: 2 },
  tabLabel: { 
    fontSize: 10, 
    letterSpacing: 0.3, 
    marginTop: 1, 
    textAlign: 'center' 
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444', // Red color for the dot
    borderWidth: 2,
    borderColor: '#F0F3F7', // Match tab bar background
  },
});