import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
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
  MessageSquare,
  LogOut,
  X
} from 'lucide-react-native';
import { theme, spacing, borderRadius, typography } from '@/components/theme';
// Directly import the image without type checking
const placeholderImg = require('@/assets/images/icon.png');
import { API_URL } from '@/contexts/api';

// Interface for the user profile data
interface UserProfile {
  id: number;
  email: string;
  fullName?: string;
  university?: string;
  major?: string;
  year?: string;
  state?: string;
  city?: string;
  bio?: string;
  linkedin?: string;
  heritage?: string[];
  languages?: string[];
  profile_image?: string;
  createdAt?: string;
  mobileNumber?: string;
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState('about');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for profile completion modal
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  
  // Fetch user profile data
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use a default user ID for now (in a real app, this would come from auth context)
      const userId = 1; 
      const response = await fetch(`${API_URL}/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const data = await response.json();
      setUserProfile(data);
      
      // Check if important profile fields are missing
      checkProfileCompletion(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load profile data');
      
      // Fallback to mock data in case of error
      const mockData = {
        id: 1,
        email: "alex.chen@stanford.edu",
        fullName: "Alex Chen",
        university: "Stanford University",
        major: "Computer Science",
        year: "Junior",
        state: "California",
        city: "Palo Alto",
        bio: "Passionate about technology and preserving cultural traditions. Love connecting with fellow students from around the world! 🌍",
        linkedin: "linkedin.com/in/alexchen",
        heritage: ["Chinese", "Taiwanese"],
        languages: ["English", "Mandarin", "Cantonese"],
        profile_image: "",
        createdAt: "",
        mobileNumber: ""
      };
      
      setUserProfile(mockData);
      checkProfileCompletion(mockData);
    } finally {
      setLoading(false);
    }
  };

  // Check if important profile fields are missing
  const checkProfileCompletion = (profile: UserProfile) => {
    const requiredFields = ['fullName', 'university', 'major', 'year', 'city', 'state'];
    const missingFields = requiredFields.filter(field => !profile[field as keyof UserProfile]);
    
    if (missingFields.length > 0) {
      // Initialize the edited profile with current values
      setEditedProfile({
        ...profile,
        // Set missing fields to empty strings for the form
        ...Object.fromEntries(missingFields.map(field => [field, '']))
      });
      setShowCompletionModal(true);
    }
  };

  // Save the updated profile
  const saveUpdatedProfile = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userProfile?.id.toString() || '1' // For testing
        },
        body: JSON.stringify(editedProfile)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const updatedProfile = await response.json();
      setUserProfile({...userProfile, ...updatedProfile});
      setShowCompletionModal(false);
      
      Alert.alert('Success', 'Your profile has been updated!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  // Render different tab content
  const renderTabContent = () => {
    if (!userProfile) return null;
    
    switch (activeTab) {
      case 'about':
        return (
          <View style={styles.tabContent}>
            <View style={styles.bioSection}>
              <Text style={styles.bioTitle}>Bio</Text>
              <Text style={styles.bioText}>{userProfile.bio || 'No bio added yet.'}</Text>
            </View>
            
            <View style={styles.culturalIdentitySection}>
              <Text style={styles.sectionTitle}>Cultural Identity</Text>
              
              <View style={styles.identityItem}>
                <Globe size={16} color={theme.primary} />
                <Text style={styles.identityLabel}>Heritage:</Text>
              </View>
              <View style={styles.badgeContainer}>
                {userProfile.heritage && userProfile.heritage.length > 0 ? (
                  userProfile.heritage.map((heritage, index) => (
                    <View key={`heritage-${index}`} style={[styles.badge, styles.heritageBadge]}>
                      <Text style={styles.badgeText}>{heritage}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No heritage information added</Text>
                )}
              </View>
              
              <View style={[styles.identityItem, { marginTop: 16 }]}>
                <MessageSquare size={16} color={theme.accent} />
                <Text style={styles.identityLabel}>Languages:</Text>
              </View>
              <View style={styles.badgeContainer}>
                {userProfile.languages && userProfile.languages.length > 0 ? (
                  userProfile.languages.map((language, index) => (
                    <View key={`language-${index}`} style={[styles.badge, styles.languageBadge]}>
                      <Text style={styles.badgeText}>{language}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No languages information added</Text>
                )}
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
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsButton}>
              <Settings size={20} color={theme.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.headerLogoutButton}>
              <LogOut size={20} color={theme.error} />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                <Image 
                  source={{ uri: userProfile?.profile_image || undefined }} 
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
                <Text style={styles.userName}>{userProfile?.fullName || 'Complete your profile'}</Text>
                
                <View style={styles.userDetail}>
                  <Mail size={16} color={theme.textSecondary} />
                  <Text style={styles.userDetailText}>{userProfile?.email}</Text>
                </View>
                
                <View style={styles.userDetail}>
                  <GraduationCap size={16} color={theme.textSecondary} />
                  <Text style={styles.userDetailText}>
                    {userProfile?.major && userProfile?.year ? 
                      `${userProfile.major} • ${userProfile.year}` : 
                      'Add education details'
                    }
                  </Text>
                </View>
                
                <View style={styles.userDetail}>
                  <MapPin size={16} color={theme.textSecondary} />
                  <Text style={styles.userDetailText}>{userProfile?.university || 'Add university'}</Text>
                </View>
                
                <View style={styles.userDetail}>
                  <MapPin size={16} color={theme.textSecondary} />
                  <Text style={styles.userDetailText}>
                    {userProfile?.city && userProfile?.state ?
                      `${userProfile.city}, ${userProfile.state}` :
                      'Add location'
                    }
                  </Text>
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

            <TouchableOpacity style={styles.logoutButtonContainer} onPress={handleLogout}>
              <LogOut size={20} color={theme.error} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
        
        {/* Profile Completion Modal */}
        <Modal
          visible={showCompletionModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCompletionModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Complete Your Profile</Text>
                <TouchableOpacity onPress={() => setShowCompletionModal(false)} style={styles.modalCloseButton}>
                  <X size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalSubtitle}>
                Please fill in the missing information to complete your profile.
              </Text>
              
              <ScrollView style={styles.modalScrollView}>
                {!userProfile?.fullName && (
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Full Name *</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editedProfile.fullName || ''}
                      onChangeText={(text) => setEditedProfile({...editedProfile, fullName: text})}
                      placeholder="Enter your full name"
                    />
                  </View>
                )}
                
                {!userProfile?.university && (
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>University *</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editedProfile.university || ''}
                      onChangeText={(text) => setEditedProfile({...editedProfile, university: text})}
                      placeholder="Enter your university"
                    />
                  </View>
                )}
                
                {!userProfile?.major && (
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Major *</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editedProfile.major || ''}
                      onChangeText={(text) => setEditedProfile({...editedProfile, major: text})}
                      placeholder="Enter your major"
                    />
                  </View>
                )}
                
                {!userProfile?.year && (
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Year *</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editedProfile.year || ''}
                      onChangeText={(text) => setEditedProfile({...editedProfile, year: text})}
                      placeholder="Freshman, Sophomore, Junior, Senior, etc."
                    />
                  </View>
                )}
                
                {!userProfile?.state && (
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>State *</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editedProfile.state || ''}
                      onChangeText={(text) => setEditedProfile({...editedProfile, state: text})}
                      placeholder="Enter your state"
                    />
                  </View>
                )}
                
                {!userProfile?.city && (
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>City *</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editedProfile.city || ''}
                      onChangeText={(text) => setEditedProfile({...editedProfile, city: text})}
                      placeholder="Enter your city"
                    />
                  </View>
                )}
              </ScrollView>
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalSecondaryButton}
                  onPress={() => setShowCompletionModal(false)}
                >
                  <Text style={styles.modalSecondaryButtonText}>Later</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalPrimaryButton}
                  onPress={saveUpdatedProfile}
                >
                  <Text style={styles.modalPrimaryButtonText}>Save Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.md, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.border 
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.textPrimary },
  settingsButton: { padding: 4, marginRight: 12 },
  headerLogoutButton: { padding: 4 },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 16,
    color: theme.error,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: 'bold',
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
  logoutButtonContainer: {
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
  // Add these new styles for the profile completion modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: theme.white,
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 20,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalField: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  modalPrimaryButton: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalPrimaryButtonText: {
    color: theme.white,
    fontWeight: '600',
    fontSize: 16,
  },
  modalSecondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalSecondaryButtonText: {
    color: theme.textSecondary,
    fontWeight: '600',
    fontSize: 16,
  },
  emptyText: {
    color: theme.textSecondary,
    fontStyle: 'italic',
    fontSize: 14,
  },
}); 