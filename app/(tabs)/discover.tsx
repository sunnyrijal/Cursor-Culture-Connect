'use client';

import FriendsListScreen from '@/components/friend/FriendLists';
import FriendRequestsScreen from '@/components/friend/FriendRequests';
import SendFriendRequestScreen from '@/components/friend/SendFriendRequest';
import getDecodedToken from '@/utils/getMyData';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';

const theme = {
  primary: '#6366F1',
  accent: '#EC4899',
  success: '#10B981',
  background: '#F0F3F7',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray900: '#111827',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

type TabType = 'friends' | 'discover' | 'requests';

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabType>('friends');

  const { data: myData, isLoading: isLoadingMyData } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getDecodedToken(),
  });

  if (isLoadingMyData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  if (!myData) {
    return (
      <View style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Join the Community</Text>
          <Text style={styles.authSubtitle}>
            Log in to connect with friends, discover new people, and manage your
            requests.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>Login or Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'friends':
        return <FriendsListScreen />;
      case 'discover':
        return <SendFriendRequestScreen />;
      case 'requests':
        return <FriendRequestsScreen />;
      default:
        return <FriendsListScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroOverlay}>
          <View style={styles.headerContainer}>
            <Text style={styles.heroTitle}>Friends</Text>
            <Text style={styles.heroSubtitle}>
              Connect and build meaningful relationships
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Container with Neumorphism */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'friends' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('friends')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'friends' && styles.activeTabButtonText,
            ]}
          >
            Friends
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'discover' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('discover')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'discover' && styles.activeTabButtonText,
            ]}
          >
            Discover
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'requests' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('requests')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'requests' && styles.activeTabButtonText,
            ]}
          >
            Requests
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}

      <View style={styles.contentWrapper}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F3F7', // Updated to match groups page background
    marginBottom: 0,
    paddingBottom: 0,
  },
  contentWrapper: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F3F7',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: theme.background,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  authSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: theme.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  loginButtonText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: '600',
  },

  heroSection: {
    minHeight: 140,
    backgroundColor: '#6366F1',
    position: 'relative',
    overflow: 'hidden',
    paddingTop: 10,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderRadius: 0, // Keep it straight for the header
  },

  headerContainer: {
    alignItems: 'center',
  },

  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },

  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },

  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginBottom:2,

    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeTabButton: {
    backgroundColor: '#6366F1',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },

  activeTabButtonText: {
    color: '#FFFFFF',
  },
});
