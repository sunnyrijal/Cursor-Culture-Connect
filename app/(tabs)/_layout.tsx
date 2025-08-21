import React from 'react';
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

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // Keep this false since we're using custom labels
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#8B8B8B',
        tabBarStyle: {
          height: 86, // Increased height to accommodate labels
          paddingBottom: 12,
          paddingTop: 16,
          backgroundColor: '#f5f5f7',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 10,
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
            <View style={[styles.tabContainer, focused && styles.activeTab]}>
              <View style={styles.iconContainer}>
                <Home color={focused ? '#fff' : '#8B8B8B'} size={22} />
              </View>
              <Text style={[styles.tabLabel, { color: focused ? '#fff' : '#8B8B8B' }]}>
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
            <View style={[styles.tabContainer, focused && styles.activeTab]}>
              <View style={styles.iconContainer}>
                <Search color={focused ? '#fff' : '#8B8B8B'} size={22} />
              </View>
              <Text style={[styles.tabLabel, { color: focused ? '#fff' : '#8B8B8B' }]}>
                Discover
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
            <View style={[styles.tabContainer, focused && styles.activeTab]}>
              <View style={styles.iconContainer}>
                <Users color={focused ? '#fff' : '#8B8B8B'} size={22} />
              </View>
              <Text style={[styles.tabLabel, { color: focused ? '#fff' : '#8B8B8B' }]}>
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
            <View style={[styles.tabContainer, focused && styles.activeTab]}>
              <View style={styles.iconContainer}>
                <Calendar color={focused ? '#fff' : '#8B8B8B'} size={22} />
              </View>
              <Text style={[styles.tabLabel, {  color: focused ? '#fff' : '#8B8B8B' }]}>
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
            <View style={[styles.tabContainer, focused && styles.activeTab]}>
              <View style={styles.iconContainer}>
                <MessageSquare color={focused ? '#fff' : '#8B8B8B'} size={22} />
              </View>
              <Text style={[styles.tabLabel, { color: focused ? '#fff' : '#8B8B8B' }]}>
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
            <View style={[styles.tabContainer, focused && styles.activeTab]}>
              <View style={styles.iconContainer}>
                <Activity color={focused ? '#fff' : '#8B8B8B'} size={22} />
              </View>
              <Text style={[styles.tabLabel, { color: focused ? '#fff' : '#8B8B8B' }]}>
                Activity
              </Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#f5f5f7',
    shadowColor: '#fff',
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  iconContainer: {
    marginBottom: 4,
  },
  activeTab: {
    backgroundColor: '#6366F1',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});