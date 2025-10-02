import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import { ArrowLeft, User, CreditCard as Edit3, Share2, Eye, Shield, Bell, Lock, CircleHelp as HelpCircle, ChevronRight, Settings as SettingsIcon, Globe, Smartphone, Mail } from 'lucide-react-native';
import LogoutButton from '@/components/LogoutButton';
import getDecodedToken from '@/utils/getMyData';
import { useQuery } from '@tanstack/react-query';
import { getMyData } from '@/contexts/user.api';

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
  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const { data: myData, isLoading } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getMyData(),
  });

  const handleShareProfile = async () => {
    try {
      const profileUrl = `https://cultureconnect.app/profile/${myData?.user?.id || 'user'}`;
      await Share.share({
        message: `Check out my TRiVO profile! Connect with me to explore our shared cultural heritage: ${profileUrl}`,
        url: profileUrl,
        title: 'My TRiVO Profile'
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
      Alert.alert('Error', 'Unable to share profile at this time');
    }
  };

  const handleViewPublicProfile = () => {
    router.push({
      pathname: '/public/profile/[id]',
      params: {
        id: String(myData?.user?.id ?? '1'),
        sameuser: 'true',
      },
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
      showChevron: true
    },
    {
      id: 'share-profile',
      icon: Share2,
      label: 'Share Profile',
      description: 'Share your profile with friends and connections',
      color: '#3B82F6',
      onPress: handleShareProfile
    },
    {
      id: 'view-public',
      icon: Eye,
      label: 'View Public Profile',
      description: 'See how others view your profile',
      color: '#10B981',
      onPress: handleViewPublicProfile,
      showChevron: true
    }
  ];

  const accountOptions: SettingsOption[] = [
    {
      id: 'privacy',
      icon: Shield,
      label: 'Privacy Settings',
      description: 'Control who can see your information',
      color: '#3B82F6',
      onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon'),
      showChevron: true
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'Notifications',
      description: 'Manage your notification preferences',
      color: '#F59E0B',
      onPress: () => Alert.alert('Notification Settings', 'Here you will be able to manage your notification preferences (e.g., push, email, event reminders, etc.).'),
      showChevron: true
    },
    {
      id: 'security',
      icon: Lock,
      label: 'Account Security',
      description: 'Password and security settings',
      color: '#10B981',
      onPress: () => Alert.alert('Coming Soon', 'Security settings will be available soon'),
      showChevron: true
    }
  ];

  const supportOptions: SettingsOption[] = [
    {
      id: 'help',
      icon: HelpCircle,
      label: 'Help & Support',
      description: 'Get help and contact support',
      color: '#8B5CF6',
      onPress: () => Alert.alert('Help & Support', 'Contact us at support@cultureconnect.app'),
      showChevron: true
    }
  ];

  const renderSettingsSection = (title: string, options: SettingsOption[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.neomorphicCard}>
        <BlurView intensity={20} tint="light" style={styles.blurView}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
            style={styles.cardGradient}
          >
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.neomorphicOption,
                  index === options.length - 1 && styles.lastOption
                ]}
                onPress={option.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <View style={styles.neomorphicIconContainer}>
                    <LinearGradient
                      colors={[`${option.color}20`, `${option.color}10`]}
                      style={styles.iconGradient}
                    >
                      <option.icon size={22} color={option.color} />
                    </LinearGradient>
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionLabel}>
                      {option.label}
                    </Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                </View>
                {option.showChevron && (
                  <View style={styles.chevronContainer}>
                    <ChevronRight size={16} color="#94A3B8" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </LinearGradient>
        </BlurView>
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

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const user = myData?.user;

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#F8FAFC', '#E2E8F0', '#F1F5F9']}
        style={styles.gradientBackground}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <BlurView intensity={30} tint="light" style={styles.headerBlur}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
              style={styles.headerGradient}
            >
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.neomorphicBackButton}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.9)', 'rgba(241, 245, 249, 0.8)']}
                    style={styles.backButtonGradient}
                  >
                    <ArrowLeft size={20} color="#475569" />
                  </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.title}>Settings</Text>
                <View style={styles.headerRight}>
                  <LogoutButton />
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Overview */}
          <View style={styles.profileContainer}>
            <BlurView intensity={25} tint="light" style={styles.profileBlur}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.9)']}
                style={styles.profileGradient}
              >
                <View style={styles.profileHeader}>
                  <View style={styles.neomorphicAvatar}>
                    <LinearGradient
                      colors={['rgba(99, 102, 241, 0.15)', 'rgba(99, 102, 241, 0.1)']}
                      style={styles.avatarGradient}
                    >
                      <User size={36} color="#6366F1" />
                    </LinearGradient>
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>
                      {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
                    </Text>
                    <Text style={styles.profileEmail}>{user?.email || 'No email'}</Text>
                    <View style={styles.profileBadgesRow}>
                      {user?.isVerified && (
                        <View style={styles.neomorphicBadge}>
                          <Text style={styles.badgeText}>✓ Verified</Text>
                        </View>
                      )}
                      {user?.classYear && (
                        <View style={[styles.neomorphicBadge, styles.studentBadge]}>
                          <Text style={[styles.badgeText, styles.studentBadgeText]}>
                            {user.classYear}
                          </Text>
                        </View>
                      )}
                    </View>
                    {getAcademicInfo() && (
                      <Text style={styles.profileMeta}>{getAcademicInfo()}</Text>
                    )}
                    {user?.university?.name && (
                      <Text style={styles.profileMeta}>{user.university.name}</Text>
                    )}
                    {getLocationString() && (
                      <Text style={styles.profileMeta}>{getLocationString()}</Text>
                    )}
                    <Text style={styles.profileBio}>
                      {getUserBio()}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </BlurView>
          </View>

          {/* Profile Management */}
          {renderSettingsSection('Profile Management', profileOptions)}

          {/* Account Settings */}
          {renderSettingsSection('Account Settings', accountOptions)}

          {/* Support & Help */}
          {renderSettingsSection('Support', supportOptions)}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerBlur: {
    borderRadius: 20,
  },
  headerGradient: {
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  neomorphicBackButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#CBD5E1',
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  headerRight: {
    width: 44,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileContainer: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  profileBlur: {
    borderRadius: 24,
  },
  profileGradient: {
    padding: 20,
    borderRadius: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  neomorphicAvatar: {
    width: 70,
    height: 70,
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    fontWeight: '500',
  },
  profileBadgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  neomorphicBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  studentBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  studentBadgeText: {
    color: '#3B82F6',
  },
  profileMeta: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  profileBio: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginTop: 8,
    fontWeight: '400',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
    marginLeft: 4,
    letterSpacing: -0.3,
  },
  neomorphicCard: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  blurView: {
    borderRadius: 20,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 4,
  },
  neomorphicOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 2,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  lastOption: {
    marginBottom: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  neomorphicIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  optionDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    fontWeight: '500',
  },
  chevronContainer: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});