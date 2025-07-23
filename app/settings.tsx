// sunnyrijal/cursor-culture-connect/Cursor-Culture-Connect-dev4/app/settings.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
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
  LogOut, 
  ChevronRight, 
  Settings as SettingsIcon, 
  Globe, 
  Smartphone, 
  Mail 
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

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
  const { logout } = useAuth(); // Get logout function from context
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleShareProfile = async () => {
    try {
      const profileUrl = 'https://cultureconnect.app/profile/priya-sharma';
      await Share.share({
        message: `Check out my Culture Connect profile! Connect with me to explore our shared cultural heritage: ${profileUrl}`,
        url: profileUrl,
        title: 'My Culture Connect Profile'
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
      Alert.alert('Error', 'Unable to share profile at this time');
    }
  };

  const handleViewPublicProfile = () => {
    router.push('/profile/public/1');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            await logout(); // Use the logout function from AuthContext
            setIsLoggingOut(false);
          }
        }
      ]
    );
  };

  const profileOptions: SettingsOption[] = [
    {
      id: 'edit-profile',
      icon: Edit3,
      label: 'Edit Profile',
      description: 'Update your personal information and cultural identity',
      color: theme.primary,
      onPress: handleEditProfile,
      showChevron: true
    },
    {
      id: 'share-profile',
      icon: Share2,
      label: 'Share Profile',
      description: 'Share your profile with friends and connections',
      color: theme.info,
      onPress: handleShareProfile
    },
    {
      id: 'view-public',
      icon: Eye,
      label: 'View Public Profile',
      description: 'See how others view your profile',
      color: theme.success,
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
      color: theme.info,
      onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon'),
      showChevron: true
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'Notifications',
      description: 'Manage your notification preferences',
      color: theme.warning,
      onPress: () => Alert.alert('Notification Settings', 'Here you will be able to manage your notification preferences (e.g., push, email, event reminders, etc.).'),
      showChevron: true
    },
    {
      id: 'security',
      icon: Lock,
      label: 'Account Security',
      description: 'Password and security settings',
      color: theme.success,
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
      color: theme.gray500,
      onPress: () => Alert.alert('Help & Support', 'Contact us at support@cultureconnect.app'),
      showChevron: true
    },
    {
      id: 'logout',
      icon: LogOut,
      label: 'Logout',
      description: 'Sign out of your account',
      color: theme.error,
      onPress: handleLogout
    }
  ];

  const renderSettingsSection = (title: string, options: SettingsOption[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card style={styles.optionsCard}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.settingOption,
              index === options.length - 1 && styles.lastOption
            ]}
            onPress={option.onPress}
            disabled={option.id === 'logout' && isLoggingOut}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: `${option.color}15` }]}>
                <option.icon size={20} color={option.color} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionLabel,
                  option.id === 'logout' && styles.logoutLabel
                ]}>
                  {option.label}
                  {option.id === 'logout' && isLoggingOut && ' ...'}
                </Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </View>
            {option.showChevron && (
              <ChevronRight size={16} color={theme.gray400} />
            )}
          </TouchableOpacity>
        ))}
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Overview */}
        <Card style={styles.profileOverview}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <User size={40} color={theme.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Alex Chen</Text>
              <Text style={styles.profileEmail}>alex.chen@stanford.edu</Text>
              <View style={styles.profileBadgesRow}>
                <Badge label="Verified" variant="success" size="sm" style={{ marginRight: 8 }} />
                <Badge label="Student" variant="info" size="sm" />
              </View>
              <Text style={styles.profileMeta}>Computer Science • Junior</Text>
              <Text style={styles.profileMeta}>Stanford University</Text>
              <Text style={styles.profileMeta}>Palo Alto, CA</Text>
              <Text style={styles.profileBio}>Passionate about technology and preserving cultural traditions. Love connecting with fellow students from around the world! 🌏</Text>
            </View>
          </View>
        </Card>

        {/* Profile Management */}
        {renderSettingsSection('Profile Management', profileOptions)}

        {/* Account Settings */}
        {renderSettingsSection('Account Settings', accountOptions)}

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Smartphone size={16} color={theme.gray500} />
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Globe size={16} color={theme.gray500} />
              <Text style={styles.infoLabel}>Region</Text>
              <Text style={styles.infoValue}>United States</Text>
            </View>
            <View style={styles.infoRow}>
              <Mail size={16} color={theme.gray500} />
              <Text style={styles.infoLabel}>Support</Text>
              <Text style={styles.infoValue}>support@cultureconnect.app</Text>
            </View>
          </Card>
        </View>

        {/* Support & Logout */}
        {renderSettingsSection('Support', supportOptions)}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Culture Connect v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Connecting students through shared heritage and cultural experiences
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.white,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  profileOverview: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: `${theme.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  profileEmail: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    marginBottom: spacing.sm,
  },
  profileBadgesRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  profileMeta: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    marginBottom: spacing.xs,
  },
  profileBio: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
    marginBottom: spacing.md,
  },
  optionsCard: {
    padding: 0,
  },
  settingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  logoutLabel: {
    color: theme.error,
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
  },
  infoCard: {
    padding: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
  },
  infoLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: theme.textPrimary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
    marginBottom: spacing.xs,
  },
  footerSubtext: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});