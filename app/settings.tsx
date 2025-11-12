import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import { ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  User,
  CreditCard as Edit3,
  Share2,
  Eye,
  Shield,
  Bell,
  Lock,
  CircleHelp as HelpCircle,
  ChevronRight,
  Settings as SettingsIcon,
  Globe,
  Smartphone,
  Mail,
  UserX,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileWarning } from 'lucide-react-native';
import { Trash2 } from 'lucide-react-native';
import LogoutButton from '@/components/LogoutButton';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAlert } from '@/contexts/AlertContext';
import { getMyData, deleteMe } from '@/contexts/user.api';
import * as Linking from 'expo-linking';
import { useAuth } from '@/contexts/AuthContext';
import getDecodedToken from '@/utils/getMyData';

interface SettingsOption {
  id: string;
  icon: any;
  label: string;
  description: string;
  color: string;
  onPress: () => void;
  showChevron?: boolean;
}

export default function Settings() {
  const { logout: authLogout } = useAuth();
  const { showAlert } = useAlert();
  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const { data: myData, isLoading, isFetching } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getMyData(),
  });

    const { data: myDataLocal } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getDecodedToken(),
  });

  const { mutate: deleteAccountMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteMe,
    onError: (err: any) => {
      console.error('Delete account error:', err);
      showAlert({
        title: 'Error',
        message: err.message || 'Failed to delete account. Please try again.',
      });
    },
  });

  const handleDeleteAccount = () => {
    showAlert({
      title: 'Delete Account',
      message:
        'Are you sure you want to delete your account? This action is permanent and cannot be undone.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            deleteAccountMutation(undefined, {
              onSuccess: async () => {
                await authLogout();
                router.replace('/(auth)/login');
                showAlert({
                  title: 'Account Deleted',
                  message: 'Your account has been successfully deleted.',
                });
              },
            }),
        },
      ],
    });
  };

  const url = Linking.useURL();
  const handleShareProfile = async () => {

    try {
      const profileUrl = `${url}/public/profile/${myData?.userId || 'user'}`;
      await Share.share({
        message: `Check out my TRiVO profile! Connect with me to explore: ${profileUrl}`,
        url: profileUrl,
        title: 'My TRiVO Profile',
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
      showAlert({
        title: 'Error',
        message: 'Unable to share profile at this time',
      });
    }
  };

  const handleViewPublicProfile = () => {
    router.push({
      pathname: `/public/profile/${myDataLocal?.userId || myData.userId || myData?.user.id || '1'}`,
     
    });
  };

  const profileOptions: SettingsOption[] = [
    {
      id: 'edit-profile',
      icon: Edit3,
      label: 'Edit Profile',
      description: 'Update your personal information and cultural identity',
      color: '#6366F1',
      onPress: handleEditProfile,
      showChevron: true,
    },
    {
      id: 'share-profile',
      icon: Share2,
      label: 'Share Profile',
      description: 'Share your profile with friends and connections',
      color: '#3B82F6',
      onPress: handleShareProfile,
    },
    {
      id: 'view-public',
      icon: Eye,
      label: 'View Public Profile',
      description: 'See how others view your profile',
      color: '#10B981',
      onPress: handleViewPublicProfile,
      showChevron: true,
    },
  ];

  const accountOptions: SettingsOption[] = [
    {
      id: 'privacy',
      icon: Shield,
      label: 'Privacy Settings',
      description: 'Control who can see your information',
      color: '#3B82F6',
      onPress: () =>
        showAlert({
          title: 'Coming Soon',
          message: 'Privacy settings will be available soon',
        }),
      showChevron: true,
    },
    // {
    //   id: 'notifications',
    //   icon: Bell,
    //   label: 'Notifications',
    //   description: 'Manage your notification preferences',
    //   color: '#F59E0B',
    //   onPress: () =>
    //     showAlert({
    //       title: 'Notification Settings',
    //       message:
    //         'Here you will be able to manage your notification preferences (e.g., push, email, event reminders, etc.).',
    //     }),
    //   showChevron: true,
    // },
    {
      id: 'security',
      icon: Lock,
      label: 'Account Security',
      description: 'Password and security settings',
      color: '#10B981',
      onPress: () =>
        showAlert({
          title: 'Coming Soon',
          message: 'Security settings will be available soon',
        }),
      showChevron: true,
    },
    {
      id: 'blocked-users',
      icon: UserX,
      label: 'Blocked Users',
      description: 'Manage users you have blocked',
      color: '#EF4444',
      onPress: () => router.push('/blocked-users'),
      showChevron: true,
    },
    {
      id: 'my-reports',
      icon: FileWarning,
      label: 'My Reports',
      description: 'View your submitted reports',
      color: '#F59E0B',
      onPress: () => router.push('/my-reports'),
      showChevron: true,
    },
  ];

  const dangerZoneOptions: SettingsOption[] = [
    {
      id: 'delete-account',
      icon: Trash2,
      label: 'Delete Account',
      description: 'Permanently delete your account and all associated data',
      color: '#EF4444',
      onPress: handleDeleteAccount,
      showChevron: false,
    },
  ];

  const supportOptions: SettingsOption[] = [
    {
      id: 'help',
      icon: HelpCircle,
      label: 'Help & Support',
      description: 'Get help and contact support',
      color: '#8B5CF6',
      onPress: () =>
        showAlert({
          title: 'Help & Support',
          message: 'Contact us at  info@trivoconnect.com',
        }),
      showChevron: true,
    },
  ];

  const renderSettingsSection = (title: string, options: SettingsOption[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      <View style={styles.card}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.option,
              index < options.length - 1 && styles.optionDivider,
            ]}
            onPress={option.onPress}
            activeOpacity={0.7}
          >
            <option.icon size={22} color={option.color} />
            <Text style={styles.optionLabel}>{option.label}</Text>
            {option.showChevron !== false && (
              <ChevronRight size={18} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Helper function to format location
  const getLocationString = () => {
    const user = myData?.user;
    if (!user) return '';

    const parts = [];
    if (user.city) parts.push(user.city);
    if (user.state) parts.push(user.state);

    return parts.join(', ');
  };

  // Helper function to format user's academic info
  const getAcademicInfo = () => {
    const user = myData?.user;
    if (!user) return '';

    const parts = [];
    if (user.major) parts.push(user.major);
    if (user.classYear) parts.push(user.classYear);

    return parts.join(' • ');
  };

  // Helper function to format user's bio or fallback
  const getUserBio = () => {
    const user = myData?.user;
    if (!user) return '';

    if (user.bio) return user.bio;

    // Create a dynamic bio based on user's interests
    if (user.interests && user.interests.length > 0) {
      const interestsText = user.interests.slice(0, 3).join(', ');
      return `Passionate about ${interestsText.toLowerCase()} and connecting with fellow students! 🌍`;
    }

    return 'Student passionate about connecting with fellow students from around the world! 🌍';
  };

  if (isLoading || isFetching) {
    return (
      <View
        style={[
          styles.container, {
            justifyContent: 'center',
            alignItems: 'center'
          }
        ]}
      >
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const user = myData?.user;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.headerRight}>
            <LogoutButton />
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Management */}
          {renderSettingsSection('Profile Management', profileOptions)}

          {/* Account Settings */}
          {renderSettingsSection('Account Settings', accountOptions)}

          {/* Support & Help */}
          {renderSettingsSection('Support', supportOptions)}

          {/* Danger Zone */}
          {renderSettingsSection('Danger Zone', dangerZoneOptions)}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F3F7', // A light gray background
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  headerRight: {
    width: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
    paddingHorizontal: 16,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginLeft: 16,
    flex: 1,
  },
  bottomSpacing: {
    height: 20,
  },
});
