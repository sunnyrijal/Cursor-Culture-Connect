import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Home, Search, Users, Calendar, MessageSquare, Activity } from 'lucide-react-native';
import { router, usePathname } from 'expo-router';
import { theme } from './theme';

interface TabItem {
  name: string;
  title: string;
  icon: React.ComponentType<{ color: string }>;
  route: string;
}

const tabs: TabItem[] = [
  { name: 'home', title: 'Home', icon: Home, route: '/' },
  { name: 'discover', title: 'Discover', icon: Search, route: '/discover' },
  { name: 'groups', title: 'Groups', icon: Users, route: '/groups' },
  { name: 'events', title: 'Events', icon: Calendar, route: '/events' },
  { name: 'chat', title: 'Chat', icon: MessageSquare, route: '/chat' },
  { name: 'activity', title: 'Activity', icon: Activity, route: '/activity-buddy' },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  const handleTabPress = (route: string) => {
    router.push(route);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.route || 
          (tab.route === '/' && pathname === '/index') ||
          (tab.route === '/activity-buddy' && pathname === '/activity-buddy');
        
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => handleTabPress(tab.route)}
          >
            <Icon color={isActive ? theme.primary : theme.textSecondary} />
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: theme.border,
    height: 54,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 12,
    marginTop: 2,
    color: theme.textSecondary,
  },
  activeTabText: {
    color: theme.primary,
    fontWeight: '500',
  },
}); 