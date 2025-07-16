import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import BottomNavigation from '@/components/BottomNavigation';
import { 
  ArrowLeft, 
  Edit, 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  User,
  Calendar,
  Users,
  MapPin,
  Mail,
  Phone,
  Globe,
  GraduationCap,
  CheckCircle,
  Heart,
  BookOpen,
  Activity,
  MessageSquare
} from 'lucide-react-native';
import { currentUser } from '@/data/mockData';
import { theme, spacing, borderRadius, typography } from '@/components/theme';
import placeholderImg from '@/assets/images/icon.png';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('about');

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => router.push('/login') }
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleStatsClick = () => {
    router.push('/my-hub');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <View style={styles.tabContent}>
            <View style={styles.bioSection}>
              <Text style={styles.bioTitle}>Bio</Text>
              <Text style={styles.bioText}>
                Passionate about technology and preserving cultural traditions. Love connecting with fellow students from around the world! 🌍
              </Text>
            </View>
            
            <View style={styles.culturalIdentitySection}>
              <Text style={styles.sectionTitle}>Cultural Identity</Text>
              
              <View style={styles.identityItem}>
                <Globe size={16} color={theme.primary} />
                <Text style={styles.identityLabel}>Heritage:</Text>
              </View>
              <View style={styles.badgeContainer}>
                <View style={[styles.badge, styles.heritageBadge]}>
                  <Text style={styles.badgeText}>Chinese</Text>
                </View>
                <View style={[styles.badge, styles.heritageBadge]}>
                  <Text style={styles.badgeText}>Taiwanese</Text>
                </View>
              </View>
              
              <View style={[styles.identityItem, { marginTop: 16 }]}>
                <MessageSquare size={16} color={theme.accent} />
                <Text style={styles.identityLabel}>Languages:</Text>
              </View>
              <View style={styles.badgeContainer}>
                <View style={[styles.badge, styles.languageBadge]}>
                  <Text style={styles.badgeText}>Mandarin</Text>
                </View>
                <View style={[styles.badge, styles.languageBadge]}>
                  <Text style={styles.badgeText}>English</Text>
                </View>
                <View style={[styles.badge, styles.languageBadge]}>
                  <Text style={styles.badgeText}>Cantonese</Text>
                </View>
              </View>
            </View>
          </View>
        );
      case 'activity-buddy':
        return (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🤝</Text>
              <Text style={styles.emptyStateTitle}>No Activity Preferences Set</Text>
              <Text style={styles.emptyStateSubtitle}>Let others know what activities you're open to doing together</Text>
              <TouchableOpacity style={styles.setupButton}>
                <Text style={styles.setupButtonText}>+ Set Up Activity Buddy</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'stories':
        return (
          <View style={styles.tabContent}>
            <View style={styles.storyCard}>
              <Text style={styles.storyTitle}>Mid-Autumn Festival Memories</Text>
              <Text style={styles.storyDescription}>Growing up, the Mid-Autumn Festival was always a special time...</Text>
              <View style={styles.storyMeta}>
                <Text style={styles.storyTimestamp}>2 days ago</Text>
                <Text style={styles.storyEngagement}>45 likes 8 comments</Text>
              </View>
            </View>
            
            <View style={styles.storyCard}>
              <Text style={styles.storyTitle}>Traditional Tea Ceremony</Text>
              <Text style={styles.storyDescription}>Learning the art of Chinese tea ceremony from my grandmother...</Text>
              <View style={styles.storyMeta}>
                <Text style={styles.storyTimestamp}>1 week ago</Text>
                <Text style={styles.storyEngagement}>32 likes 5 comments</Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsButton}>
            <Settings size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: currentUser.profileImage || undefined }} 
              defaultSource={placeholderImg}
              style={styles.profileImage} 
            />
            <View style={styles.verificationBadge}>
              <CheckCircle size={16} color={theme.success} />
            </View>
            <TouchableOpacity style={styles.editImageButton}>
              <Edit size={16} color={theme.white} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.userInfoSection}>
            <Text style={styles.userName}>Alex Chen</Text>
            
            <View style={styles.userDetail}>
              <Mail size={16} color={theme.textSecondary} />
              <Text style={styles.userDetailText}>alex.chen@stanford.edu</Text>
            </View>
            
            <View style={styles.userDetail}>
              <GraduationCap size={16} color={theme.textSecondary} />
              <Text style={styles.userDetailText}>Computer Science • Junior</Text>
            </View>
            
            <View style={styles.userDetail}>
              <MapPin size={16} color={theme.textSecondary} />
              <Text style={styles.userDetailText}>Stanford University</Text>
            </View>
            
            <View style={styles.userDetail}>
              <MapPin size={16} color={theme.textSecondary} />
              <Text style={styles.userDetailText}>Palo Alto, CA</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <Edit size={16} color={theme.white} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.statsCard} onPress={handleStatsClick}>
          <View style={styles.statItem}>
            <Users size={16} color={theme.primary} />
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Groups</Text>
          </View>
          <View style={styles.statItem}>
            <User size={16} color={theme.primary} />
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Connections</Text>
          </View>
          <View style={styles.statItem}>
            <Calendar size={16} color={theme.primary} />
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'about' && styles.activeTab]} 
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'activity-buddy' && styles.activeTab]} 
            onPress={() => setActiveTab('activity-buddy')}
          >
            <Text style={[styles.tabText, activeTab === 'activity-buddy' && styles.activeTabText]}>Activity Buddy</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'stories' && styles.activeTab]} 
            onPress={() => setActiveTab('stories')}
          >
            <Text style={[styles.tabText, activeTab === 'stories' && styles.activeTabText]}>Stories</Text>
          </TouchableOpacity>
        </View>

        {renderTabContent()}

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/settings')}>
            <Settings size={20} color={theme.textSecondary} />
            <Text style={styles.settingText}>General Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/notifications')}>
            <Bell size={20} color={theme.textSecondary} />
            <Text style={styles.settingText}>Notifications</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Shield size={20} color={theme.textSecondary} />
            <Text style={styles.settingText}>Privacy & Security</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <HelpCircle size={20} color={theme.textSecondary} />
            <Text style={styles.settingText}>Help & Support</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={theme.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      </SafeAreaView>
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
    alignSelf: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: theme.primary,
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  userDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
    justifyContent: 'center',
  },
  userDetailText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 0,
    gap: 8,
  },
  editProfileText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.white,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.white,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: theme.gray100,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: theme.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  activeTabText: {
    color: theme.white,
  },
  tabContent: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  bioSection: {
    marginBottom: 20,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: theme.textSecondary,
    lineHeight: 24,
  },
  culturalIdentitySection: {
    backgroundColor: theme.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 16,
  },
  identityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  identityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  heritageBadge: {
    backgroundColor: theme.primary,
  },
  languageBadge: {
    backgroundColor: theme.accent,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  setupButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  setupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.white,
  },
  storyCard: {
    backgroundColor: theme.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  storyDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  storyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storyTimestamp: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  storyEngagement: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  settingsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  settingText: {
    fontSize: 16,
    color: theme.textPrimary,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: theme.error + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.error,
    marginLeft: 8,
  },
}); 