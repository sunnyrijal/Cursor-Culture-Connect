import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
  X,
} from 'lucide-react-native';
import { theme, spacing, borderRadius, typography } from '@/components/theme';

// Directly import the image without type checking
const placeholderImg = require('@/assets/images/icon.png');
import { API_URL } from '@/contexts/api';

// Enhanced theme with neumorphism colors
const neumorphTheme = {
  ...theme,
  background: '#F0F0F3',
  cardBackground: '#F0F0F3',
  shadowLight: '#FFFFFF',
  shadowDark: '#D1D9E6',
  primary: '#667eea',
  accent: '#764ba2',
  success: '#4ecdc4',
  error: '#ff6b6b',
  warning: '#feca57',
  gradientPrimary: ['#667eea', '#764ba2'],
  gradientSecondary: ['#f093fb', '#f5576c'],
  gradientSuccess: ['#4ecdc4', '#44a08d'],
};

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

// Mock data fallback
const mockUserData: UserProfile = {
  id: 1,
  email: 'alex.chen@stanford.edu',
  fullName: 'Alex Chen',
  university: 'Stanford University',
  major: 'Computer Science',
  year: 'Junior',
  state: 'California',
  city: 'Palo Alto',
  bio: 'Passionate about technology and preserving cultural traditions. Love connecting with fellow students from around the world! 🌍✨',
  linkedin: 'linkedin.com/in/alexchen',
  heritage: ['Chinese', 'Taiwanese'],
  languages: ['English', 'Mandarin', 'Cantonese'],
  profile_image:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  createdAt: '2024-01-15',
  mobileNumber: '+1 (555) 123-4567',
};

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

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Use a default user ID for now (in a real app, this would come from auth context)
      const userId = 1;

      // Comment out the real API call and use mock data
      // const response = await fetch(`${API_URL}/users/${userId}`);
      // if (!response.ok) {
      //   throw new Error('Failed to fetch user profile');
      // }
      // const data = await response.json();

      // Use mock data instead
      const data = mockUserData;
      setUserProfile(data);

      // Check if important profile fields are missing
      checkProfileCompletion(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load profile data');

      // Always fallback to mock data
      setUserProfile(mockUserData);
      checkProfileCompletion(mockUserData);
    } finally {
      setLoading(false);
    }
  };

  // Check if important profile fields are missing
  const checkProfileCompletion = (profile: UserProfile) => {
    const requiredFields = [
      'fullName',
      'university',
      'major',
      'year',
      'city',
      'state',
    ];
    const missingFields = requiredFields.filter(
      (field) => !profile[field as keyof UserProfile]
    );

    if (missingFields.length > 0) {
      // Initialize the edited profile with current values
      setEditedProfile({
        ...profile,
        // Set missing fields to empty strings for the form
        ...Object.fromEntries(missingFields.map((field) => [field, ''])),
      });
      // Don't auto-show modal for demo purposes
      // setShowCompletionModal(true);
    }
  };

  // Save the updated profile
  const saveUpdatedProfile = async () => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // const response = await fetch(`${API_URL}/users/profile`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'user-id': userProfile?.id.toString() || '1'
      //   },
      //   body: JSON.stringify(editedProfile)
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to update profile');
      // }

      // const updatedProfile = await response.json();
      const updatedProfile = editedProfile;
      setUserProfile({ ...userProfile, ...updatedProfile });
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
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => router.push('/login'),
      },
    ]);
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
              <View style={styles.bioCard}>
                <Text style={styles.bioText}>
                  {userProfile.bio || 'No bio added yet.'}
                </Text>
              </View>
            </View>

            <View style={styles.culturalIdentitySection}>
              <Text style={styles.sectionTitle}>Cultural Identity</Text>

              <View style={styles.identityCard}>
                <View style={styles.identityItem}>
                  <View style={styles.iconContainer}>
                    <Globe size={18} color={neumorphTheme.primary} />
                  </View>
                  <Text style={styles.identityLabel}>Heritage</Text>
                </View>
                <View style={styles.badgeContainer}>
                  {userProfile.heritage && userProfile.heritage.length > 0 ? (
                    userProfile.heritage.map((heritage, index) => (
                      <View
                        key={`heritage-${index}`}
                        style={[styles.badge, styles.heritageBadge]}
                      >
                        <Text style={styles.badgeText}>{heritage}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>
                      No heritage information added
                    </Text>
                  )}
                </View>

                <View style={[styles.identityItem, { marginTop: 20 }]}>
                  <View style={styles.iconContainer}>
                    <MessageSquare size={18} color={neumorphTheme.accent} />
                  </View>
                  <Text style={styles.identityLabel}>Languages</Text>
                </View>
                <View style={styles.badgeContainer}>
                  {userProfile.languages && userProfile.languages.length > 0 ? (
                    userProfile.languages.map((language, index) => (
                      <View
                        key={`language-${index}`}
                        style={[styles.badge, styles.languageBadge]}
                      >
                        <Text style={styles.badgeText}>{language}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>
                      No languages information added
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        );
      case 'activity-buddy':
        return (
          <View style={styles.tabContent}>
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateEmoji}>🤝</Text>
              <Text style={styles.emptyStateTitle}>
                No Activity Preferences Set
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                Let others know what activities you're open to doing together
              </Text>
              <TouchableOpacity style={styles.setupButton}>
                <LinearGradient
                  colors={neumorphTheme.gradientPrimary}
                  style={styles.setupButtonGradient}
                >
                  <Text style={styles.setupButtonText}>
                    + Set Up Activity Buddy
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'stories':
        return (
          <View style={styles.tabContent}>
            <View style={styles.storyCard}>
              <View style={styles.storyHeader}>
                <Text style={styles.storyTitle}>
                  Mid-Autumn Festival Memories
                </Text>
                <View style={styles.storyIconContainer}>
                  <Heart size={16} color={neumorphTheme.accent} />
                </View>
              </View>
              <Text style={styles.storyDescription}>
                Growing up, the Mid-Autumn Festival was always a special time
                for our family to gather under the full moon, sharing mooncakes
                and stories passed down through generations...
              </Text>
              <View style={styles.storyMeta}>
                <Text style={styles.storyTimestamp}>2 days ago</Text>
                <View style={styles.storyEngagement}>
                  <Text style={styles.storyEngagementText}>45 ❤️ 8 💬</Text>
                </View>
              </View>
            </View>

            <View style={styles.storyCard}>
              <View style={styles.storyHeader}>
                <Text style={styles.storyTitle}>Traditional Tea Ceremony</Text>
                <View style={styles.storyIconContainer}>
                  <Heart size={16} color={neumorphTheme.success} />
                </View>
              </View>
              <Text style={styles.storyDescription}>
                Learning the art of Chinese tea ceremony from my grandmother has
                been one of the most meaningful experiences. Each movement
                carries centuries of tradition...
              </Text>
              <View style={styles.storyMeta}>
                <Text style={styles.storyTimestamp}>1 week ago</Text>
                <View style={styles.storyEngagement}>
                  <Text style={styles.storyEngagementText}>32 ❤️ 5 💬</Text>
                </View>
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={neumorphTheme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={styles.headerActionButton}
            >
              <Settings size={20} color={neumorphTheme.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.headerActionButton}
            >
              <LogOut size={20} color={neumorphTheme.error} />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={neumorphTheme.primary} />
              <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                <View style={styles.profileImageWrapper}>
                  <Image
                    source={{ uri: userProfile?.profile_image || undefined }}
                    defaultSource={placeholderImg}
                    style={styles.profileImage}
                  />
                  <View style={styles.verificationBadge}>
                    <CheckCircle size={18} color={neumorphTheme.success} />
                  </View>
                  {/* <TouchableOpacity style={styles.editImageButton}>
                    <LinearGradient
                      colors={neumorphTheme.gradientPrimary}
                      style={styles.editImageGradient}
                    >
                      <Edit size={16} color="white" />
                    </LinearGradient>
                  </TouchableOpacity> */}
                </View>
              </View>

              <View style={styles.userInfoSection}>
                <Text style={styles.userName}>
                  {userProfile?.fullName || 'Complete your profile'}
                </Text>

                <View style={styles.userDetailsCard}>
                  <View style={styles.userDetail}>
                    <View style={styles.detailIcon}>
                      <Mail size={16} color={neumorphTheme.primary} />
                    </View>
                    <Text style={styles.userDetailText}>
                      {userProfile?.email}
                    </Text>
                  </View>

                  <View style={styles.userDetail}>
                    <View style={styles.detailIcon}>
                      <GraduationCap size={16} color={neumorphTheme.accent} />
                    </View>
                    <Text style={styles.userDetailText}>
                      {userProfile?.major && userProfile?.year
                        ? `${userProfile.major} • ${userProfile.year}`
                        : 'Add education details'}
                    </Text>
                  </View>

                  <View style={styles.userDetail}>
                    <View style={styles.detailIcon}>
                      <MapPin size={16} color={neumorphTheme.success} />
                    </View>
                    <Text style={styles.userDetailText}>
                      {userProfile?.university || 'Add university'}
                    </Text>
                  </View>

                  <View style={styles.userDetail}>
                    <View style={styles.detailIcon}>
                      <MapPin size={16} color={neumorphTheme.warning} />
                    </View>
                    <Text style={styles.userDetailText}>
                      {userProfile?.city && userProfile?.state
                        ? `${userProfile.city}, ${userProfile.state}`
                        : 'Add location'}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.editProfileButton}
                onPress={handleEditProfile}
              >
                <LinearGradient
                  colors={neumorphTheme.gradientPrimary}
                  style={styles.editProfileGradient}
                >
                  <Edit size={18} color="white" />
                  <Text style={styles.editProfileText}>Edit Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.statsCard}
              onPress={handleStatsClick}
            >
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Users size={24} color={neumorphTheme.primary} />
                </View>
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>Groups</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <User size={24} color={neumorphTheme.accent} />
                </View>
                <Text style={styles.statNumber}>3</Text>
                <Text style={styles.statLabel}>Connections</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Calendar size={24} color={neumorphTheme.success} />
                </View>
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>Events</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'about' && styles.activeTab]}
                onPress={() => setActiveTab('about')}
              >
                {activeTab === 'about' ? (
                  <LinearGradient
                    colors={neumorphTheme.gradientPrimary}
                    style={styles.activeTabGradient}
                  >
                    <Text style={styles.activeTabText}>About</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.tabText}>About</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'activity-buddy' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('activity-buddy')}
              >
                {activeTab === 'activity-buddy' ? (
                  <LinearGradient
                    colors={neumorphTheme.gradientPrimary}
                    style={styles.activeTabGradient}
                  >
                    <Text style={styles.activeTabText}>Activity Buddy</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.tabText}>Activity Buddy</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'stories' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('stories')}
              >
                {activeTab === 'stories' ? (
                  <LinearGradient
                    colors={neumorphTheme.gradientPrimary}
                    style={styles.activeTabGradient}
                  >
                    <Text style={styles.activeTabText}>Stories</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.tabText}>Stories</Text>
                )}
              </TouchableOpacity>
            </View>

            {renderTabContent()}

            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Settings</Text>

              <View style={styles.settingsCard}>
                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={() => router.push('/settings')}
                >
                  <View style={styles.settingIcon}>
                    <Settings size={20} color={neumorphTheme.primary} />
                  </View>
                  <Text style={styles.settingText}>General Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={() => router.push('/notifications')}
                >
                  <View style={styles.settingIcon}>
                    <Bell size={20} color={neumorphTheme.accent} />
                  </View>
                  <Text style={styles.settingText}>Notifications</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                  <View style={styles.settingIcon}>
                    <Shield size={20} color={neumorphTheme.success} />
                  </View>
                  <Text style={styles.settingText}>Privacy & Security</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.settingItem, { borderBottomWidth: 0 }]}
                >
                  <View style={styles.settingIcon}>
                    <HelpCircle size={20} color={neumorphTheme.warning} />
                  </View>
                  <Text style={styles.settingText}>Help & Support</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.logoutButtonContainer}
              onPress={handleLogout}
            >
              <View style={styles.logoutIcon}>
                <LogOut size={20} color={neumorphTheme.error} />
              </View>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <View style={{ height: 100 }} />
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
                <TouchableOpacity
                  onPress={() => setShowCompletionModal(false)}
                  style={styles.modalCloseButton}
                >
                  <X size={20} color={neumorphTheme.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Please fill in the missing information to complete your profile.
              </Text>

              <ScrollView style={styles.modalScrollView}>
                {!userProfile?.fullName && (
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>Full Name *</Text>
                    <View style={styles.modalInputContainer}>
                      <TextInput
                        style={styles.modalInput}
                        value={editedProfile.fullName || ''}
                        onChangeText={(text) =>
                          setEditedProfile({ ...editedProfile, fullName: text })
                        }
                        placeholder="Enter your full name"
                      />
                    </View>
                  </View>
                )}

                {!userProfile?.university && (
                  <View style={styles.modalField}>
                    <Text style={styles.modalLabel}>University *</Text>
                    <View style={styles.modalInputContainer}>
                      <TextInput
                        style={styles.modalInput}
                        value={editedProfile.university || ''}
                        onChangeText={(text) =>
                          setEditedProfile({
                            ...editedProfile,
                            university: text,
                          })
                        }
                        placeholder="Enter your university"
                      />
                    </View>
                  </View>
                )}

                {/* Add other fields similarly */}
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
                  <LinearGradient
                    colors={neumorphTheme.gradientPrimary}
                    style={styles.modalPrimaryGradient}
                  >
                    <Text style={styles.modalPrimaryButtonText}>
                      Save Profile
                    </Text>
                  </LinearGradient>
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
    backgroundColor: neumorphTheme.background,
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
    backgroundColor: neumorphTheme.cardBackground,
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: neumorphTheme.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: -3, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: neumorphTheme.textPrimary,
  },
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: neumorphTheme.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingCard: {
    backgroundColor: neumorphTheme.cardBackground,
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: neumorphTheme.textSecondary,
    fontWeight: '600',
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  profileImageContainer: {
    marginBottom: 24,
    alignSelf: 'center',
  },
  profileImageWrapper: {
    position: 'relative',
    backgroundColor: neumorphTheme.cardBackground,
    padding: 8,
    borderRadius: 60,
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: neumorphTheme.cardBackground,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  editImageButton: {
    position: 'absolute',
    bottom: 8,
    right: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  editImageGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfoSection: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: neumorphTheme.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  userDetailsCard: {
    backgroundColor: neumorphTheme.cardBackground,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  userDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: neumorphTheme.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  userDetailText: {
    fontSize: 16,
    color: neumorphTheme.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  editProfileButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  editProfileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 8,
  },
  editProfileText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: neumorphTheme.cardBackground,
    marginHorizontal: 20,
    marginBottom: 24,
    paddingVertical: 24,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  statItem: {
    alignItems: 'center',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: neumorphTheme.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: -3, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: neumorphTheme.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 14,
    color: neumorphTheme.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: neumorphTheme.cardBackground,
    borderRadius: 16,
    padding: 6,
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tab: {
    flex: 1, // ensures equal space
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    overflow: 'hidden',
  },
  activeTabGradient: {
    ...StyleSheet.absoluteFillObject, // fill the whole tab
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: neumorphTheme.textSecondary,
  },
  activeTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },

  bioSection: {
    marginBottom: 20,
    marginHorizontal:20
  },
  bioTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: neumorphTheme.textPrimary,
    marginBottom: 12,
  },
  bioCard: {
    backgroundColor: neumorphTheme.cardBackground,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  bioText: {
    fontSize: 16,
    color: neumorphTheme.textSecondary,
    lineHeight: 24,
    fontWeight: '500',
  },
  culturalIdentitySection: {
    marginBottom: 20,
    marginHorizontal:20

  },
  identityCard: {
    backgroundColor: neumorphTheme.cardBackground,
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: neumorphTheme.textPrimary,
    marginBottom: 16,
  },
  identityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: neumorphTheme.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  identityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: neumorphTheme.textPrimary,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginLeft: 48,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  heritageBadge: {
    backgroundColor: neumorphTheme.primary,
  },
  languageBadge: {
    backgroundColor: neumorphTheme.accent,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  emptyStateCard: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: neumorphTheme.cardBackground,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: neumorphTheme.textPrimary,
    marginBottom: 12,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: neumorphTheme.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  setupButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  setupButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  setupButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  storyCard: {
    backgroundColor: neumorphTheme.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: neumorphTheme.textPrimary,
    flex: 1,
  },
  storyIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: neumorphTheme.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  storyDescription: {
    fontSize: 15,
    color: neumorphTheme.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  storyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storyTimestamp: {
    fontSize: 13,
    color: neumorphTheme.textSecondary,
    fontWeight: '500',
  },
  storyEngagement: {
    backgroundColor: neumorphTheme.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: -1, height: -1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  storyEngagementText: {
    fontSize: 13,
    color: neumorphTheme.textSecondary,
    fontWeight: '600',
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  settingsCard: {
    backgroundColor: neumorphTheme.cardBackground,
    borderRadius: 20,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: neumorphTheme.shadowDark + '20',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: neumorphTheme.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  settingText: {
    fontSize: 16,
    color: neumorphTheme.textPrimary,
    fontWeight: '500',
  },
  logoutButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
    backgroundColor: neumorphTheme.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: neumorphTheme.error + '30',
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.error,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: neumorphTheme.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  logoutText: {
    fontSize: 18,
    fontWeight: '700',
    color: neumorphTheme.error,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: neumorphTheme.cardBackground,
    width: '100%',
    maxWidth: 500,
    borderRadius: 24,
    padding: 24,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: neumorphTheme.textPrimary,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: neumorphTheme.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  modalSubtitle: {
    fontSize: 16,
    color: neumorphTheme.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalField: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: neumorphTheme.textPrimary,
    marginBottom: 12,
  },
  modalInputContainer: {
    backgroundColor: neumorphTheme.cardBackground,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  modalInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: neumorphTheme.textPrimary,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 32,
    gap: 16,
  },
  modalSecondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: neumorphTheme.cardBackground,
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.shadowDark,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  modalSecondaryButtonText: {
    color: neumorphTheme.textSecondary,
    fontWeight: '600',
    fontSize: 16,
  },
  modalPrimaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: neumorphTheme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  modalPrimaryGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  modalPrimaryButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyText: {
    color: neumorphTheme.textSecondary,
    fontStyle: 'italic',
    fontSize: 14,
    marginLeft: 48,
  },
});
