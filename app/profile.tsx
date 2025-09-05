'use client';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  CheckCircle,
  Calendar,
  Users,
  Pencil,
  LogOut,
  AlertCircle,
  RefreshCw,
  LogOutIcon,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { logout } from '@/data/store';
import { getMyData } from '@/contexts/user.api';
import { useQuery } from '@tanstack/react-query';

const clayTheme = {
  background: '#E8E8E8',
  cardBackground: '#E8E8E8',
  shadowLight: '#FFFFFF',
  shadowDark: '#BEBEBE',
  primary: '#6366F1',
  accent: '#8B5CF6',
  success: '#10B981',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
};

const neumorphTheme = {
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

export default function Profile() {
  const {
    data: userData,
    isLoading: queryLoading,
    error,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      try {
        const response = await getMyData()
        console.log(response)
        const data = {
          id: response.user.id,
          name: response.user.name,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          email: response.user.email,
          phone: response.user.phone,
          dateOfBirth: response.user.dateOfBirth,
          profilePicture: response.user.profilePicture,
          pronouns: response.user.pronouns,
          bio: response.user.bio,
          city: response.user.city,
          state: response.user.state,
          countryOfOrigin: response.user.countryOfOrigin,
          university: response.user.university,
          classYear: response.user.classYear,
          ethnicity: response.user.ethnicity,
          languagesSpoken: response.user.languagesSpoken,
          interests: response.user.interests,
          isVerified: response.user.isVerified,
          privacyAccepted: response.user.privacyAccepted,
          marketingOptIn: response.user.marketingOptIn,
          createdAt: response.user.createdAt,
          updatedAt: response.user.updatedAt,
          
          // Legacy fields for backward compatibility (if needed)
          fullName: response.user.name,
          profile_image: response.user.profilePicture,
          avatar: response.user.profilePicture,
          mobileNumber: response.user.phone,
          year: response.user.classYear,
        }
        return data
      } catch (error) {
        console.error("Error fetching user profile:", error)
        throw error // Let React Query handle the error
      }
    },
    retry: 2, // Retry failed requests twice
    retryDelay: 1000, // Wait 1 second between retries
  })

  console.log(userData)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout(); // Call the auth context logout function
          router.replace('/');
        },
      },
    ]);
  };

  const calculateAge = (dateString: string) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleRetry = () => {
    refetch();
  };

  // Loading Component
  const LoadingScreen = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingCard}>
        <ActivityIndicator size="large" color={clayTheme.primary} />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    </View>
  );

  // Error Component
  const ErrorScreen = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorCard}>
        <AlertCircle size={48} color={neumorphTheme.error} />
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorMessage}>
          {error?.message || 'Failed to load profile data'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <RefreshCw size={20} color={clayTheme.primary} />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={clayTheme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>

          <>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/profile/edit')}
            disabled={queryLoading || isError}
          >
            <Pencil 
              size={20} 
              color={queryLoading || isError ? clayTheme.textMuted : clayTheme.textPrimary} 
            />
          </TouchableOpacity>
             <TouchableOpacity
            style={styles.backButton}
            onPress={() => handleLogout()}
          >
            <LogOutIcon 
              size={20} 
              color={queryLoading || isError ? clayTheme.textMuted : clayTheme.textPrimary} 
            />
          </TouchableOpacity>
          </>

        </View>

        {queryLoading && <LoadingScreen />}
        
        {isError && <ErrorScreen />}

        {userData && !queryLoading && !isError && (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={queryLoading}
                onRefresh={refetch}
                colors={[clayTheme.primary]}
                tintColor={clayTheme.primary}
              />
            }
          >
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                <View style={styles.profileImageWrapper}>
                  <Image
                    source={{ uri: userData.profilePicture }}
                    style={styles.profileImage}
                    defaultSource={require('../assets/user.png')}
                  />
                  {userData.isVerified && (
                    <View style={styles.verificationBadge}>
                      <CheckCircle size={20} color={clayTheme.success} />
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userData.name}</Text>
                {userData.pronouns && (
                  <Text style={styles.userPronouns}>{userData.pronouns}</Text>
                )}

                {userData.dateOfBirth && (
                  <View style={styles.ageContainer}>
                    <Text style={styles.ageText}>
                      {calculateAge(userData.dateOfBirth)} years old
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Mail size={18} color={clayTheme.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{userData.email}</Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Phone size={18} color={clayTheme.accent} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>
                      {userData.phone || 'Not provided'}
                    </Text>
                  </View>
                </View>

                {userData.dateOfBirth && (
                  <View style={styles.infoItem}>
                    <View style={styles.infoIcon}>
                      <Calendar size={18} color={clayTheme.success} />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Date of Birth</Text>
                      <Text style={styles.infoValue}>
                        {formatDate(userData.dateOfBirth)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {userData.university && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Academic Information</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoItem}>
                    <View style={styles.infoIcon}>
                      <GraduationCap size={18} color={clayTheme.primary} />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>University</Text>
                      <Text style={styles.infoValue}>
                        {userData.university.name}
                      </Text>
                    </View>
                  </View>

                  {userData.classYear && (
                    <View style={styles.infoItem}>
                      <View style={styles.infoIcon}>
                        <Calendar size={18} color={clayTheme.accent} />
                      </View>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Class Year</Text>
                        <Text style={styles.infoValue}>{userData.classYear}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.infoCard}>
                {userData.ethnicity && userData.ethnicity.length > 0 && (
                  <View style={styles.infoItem}>
                    <View style={styles.infoIcon}>
                      <Users size={18} color={clayTheme.success} />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Ethnicity</Text>
                      <View style={styles.badgeContainer}>
                        {userData.ethnicity.map((eth:any, index:number) => (
                          <View key={index} style={styles.ethnicityBadge}>
                            <Text style={styles.badgeText}>{eth}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <MapPin size={18} color={clayTheme.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>
                      {userData.city ||
                        userData.state ||
                        userData.countryOfOrigin ||
                        'Not specified'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Account Status</Text>
              <View style={styles.statusCard}>
                <View style={styles.statusItem}>
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: userData.isVerified ? clayTheme.success : clayTheme.textMuted },
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {userData.isVerified ? 'Verified Account' : 'Unverified Account'}
                  </Text>
                </View>
                <View style={styles.statusItem}>
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: userData.privacyAccepted ? clayTheme.success : clayTheme.textMuted },
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {userData.privacyAccepted ? 'Privacy Accepted' : 'Privacy Not Accepted'}
                  </Text>
                </View>
                <View style={styles.statusItem}>
                  <View
                    style={[
                      styles.statusIndicator,
                      {
                        backgroundColor: userData.marketingOptIn
                          ? clayTheme.success
                          : clayTheme.textMuted,
                      },
                    ]}
                  />
                  <Text style={styles.statusText}>
                    Marketing Opt-in: {userData.marketingOptIn ? 'Yes' : 'No'}
                  </Text>
                </View>
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

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: clayTheme.background,
  },
  safeArea: {
    flex: 1,
  },

   // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingCard: {
    backgroundColor: clayTheme.cardBackground,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: clayTheme.shadowDark,
    shadowOffset: {
      width: -8,
      height: -8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: clayTheme.textSecondary,
    fontWeight: '500',
  },
  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorCard: {
    backgroundColor: clayTheme.cardBackground,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: clayTheme.shadowDark,
    shadowOffset: {
      width: -8,
      height: -8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: 300,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: clayTheme.textPrimary,
    textAlign: 'center',
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    color: clayTheme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },


   retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: clayTheme.cardBackground,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: clayTheme.shadowDark,
    shadowOffset: {
      width: -4,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  retryButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: clayTheme.primary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: clayTheme.background,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: clayTheme.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: clayTheme.shadowDark,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: clayTheme.textPrimary,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  profileImageContainer: {
    marginBottom: 24,
  },
  profileImageWrapper: {
    position: 'relative',
    backgroundColor: clayTheme.cardBackground,
    padding: 8,
    borderRadius: 70,
    ...Platform.select({
      ios: {
        shadowColor: clayTheme.shadowDark,
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: clayTheme.cardBackground,
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: clayTheme.shadowDark,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: clayTheme.textPrimary,
    marginBottom: 8,
  },
  userPronouns: {
    fontSize: 16,
    color: clayTheme.textSecondary,
    fontWeight: '500',
    marginBottom: 12,
  },
  ageContainer: {
    backgroundColor: clayTheme.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: clayTheme.shadowDark,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  ageText: {
    fontSize: 14,
    fontWeight: '600',
    color: clayTheme.textSecondary,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: clayTheme.textPrimary,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: clayTheme.cardBackground,
    borderRadius: 24,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: clayTheme.shadowDark,
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: clayTheme.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: clayTheme.shadowDark,
        shadowOffset: { width: -3, height: -3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: clayTheme.textMuted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: clayTheme.textPrimary,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  ethnicityBadge: {
    backgroundColor: clayTheme.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: clayTheme.primary,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  statusCard: {
    backgroundColor: clayTheme.cardBackground,
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: clayTheme.shadowDark,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: clayTheme.textPrimary,
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
});
