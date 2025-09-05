"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { ArrowLeft, Mail, Phone, MapPin, GraduationCap, CheckCircle, Calendar, Users, Pencil, LogOut } from "lucide-react-native"
import { router } from "expo-router"
import { red } from "react-native-reanimated/lib/typescript/Colors"
import AsyncStorage from "@react-native-async-storage/async-storage"

const clayTheme = {
  background: "#E8E8E8",
  cardBackground: "#E8E8E8",
  shadowLight: "#FFFFFF",
  shadowDark: "#BEBEBE",
  primary: "#6366F1",
  accent: "#8B5CF6",
  success: "#10B981",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  red: "#EF4444",
}

const userData = {
  id: "2195955f-e59b-4542-bf45-e4aa1ea548e2",
  name: "Babish Chaudhary",
  firstName: "Babish",
  lastName: "Chaudhary",
  email: "babish078b@asm.edu.np",
  phone: null,
  dateOfBirth: "2003-07-23T00:00:00.000Z",
  profilePicture:
    "https://scontent.fktm10-1.fna.fbcdn.net/v/t39.30808-1/480924177_647840841032452_2220990856163608241_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=107&ccb=1-7&_nc_sid=e99d92&_nc_ohc=8Cq7_BWuBBEQ7kNvwEJCiSt&_nc_oc=Adlikxj2Yzg2m4jida1TCid3jNxn8bkKdAC1kttj5SerL4ILyReH3ISLetj6HzB4AMA&_nc_zt=24&_nc_ht=scontent.fktm10-1.fna&_nc_gid=Q4w-9OCzOY2hzIa4j7KLJA&oh=00_AfaQn7pXKyDzfA9vZ6n_55NuQ8LbRYjp2244me5qY02AqQ&oe=68BF1624",
  pronouns: "he/him",
  bio: null,
  city: null,
  state: null,
  countryOfOrigin: null,
  university: {
    id: "b69e4c62-ed76-45e2-ad55-faa237c596ac",
    name: "TU",
  },
  classYear: "2024",
  ethnicity: ["Asian"],
  languagesSpoken: [],
  interests: [],
  isVerified: true,
  privacyAccepted: true,
  marketingOptIn: false,
  createdAt: "2025-09-04T06:39:54.375Z",
  updatedAt: "2025-09-04T06:40:35.021Z",
}

export default function Profile() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateAge = (dateString: string) => {
    const today = new Date()
    const birthDate = new Date(dateString)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/(auth)/login")
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={clayTheme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push("/profile/edit")}>
            <Pencil size={20} color={clayTheme.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImageWrapper}>
                <Image source={{ uri: userData.profilePicture }} style={styles.profileImage} />
                {userData.isVerified && (
                  <View style={styles.verificationBadge}>
                    <CheckCircle size={20} color={clayTheme.success} />
                  </View>
                )}
              </View>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userData.name}</Text>
              <Text style={styles.userPronouns}>{userData.pronouns}</Text>

              <View style={styles.ageContainer}>
                <Text style={styles.ageText}>{calculateAge(userData.dateOfBirth)} years old</Text>
              </View>
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
                  <Text style={styles.infoValue}>{userData.phone || "Not provided"}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Calendar size={18} color={clayTheme.success} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Date of Birth</Text>
                  <Text style={styles.infoValue}>{formatDate(userData.dateOfBirth)}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Academic Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <GraduationCap size={18} color={clayTheme.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>University</Text>
                  <Text style={styles.infoValue}>{userData.university.name}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Calendar size={18} color={clayTheme.accent} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Class Year</Text>
                  <Text style={styles.infoValue}>{userData.classYear}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Users size={18} color={clayTheme.success} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Ethnicity</Text>
                  <View style={styles.badgeContainer}>
                    {userData.ethnicity.map((eth, index) => (
                      <View key={index} style={styles.ethnicityBadge}>
                        <Text style={styles.badgeText}>{eth}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <MapPin size={18} color={clayTheme.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>
                    {userData.city || userData.state || userData.countryOfOrigin || "Not specified"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Account Status</Text>
            <View style={styles.statusCard}>
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, { backgroundColor: clayTheme.success }]} />
                <Text style={styles.statusText}>Verified Account</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, { backgroundColor: clayTheme.success }]} />
                <Text style={styles.statusText}>Privacy Accepted</Text>
              </View>
              <View style={styles.statusItem}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: userData.marketingOptIn ? clayTheme.success : clayTheme.textMuted },
                  ]}
                />
                <Text style={styles.statusText}>Marketing Opt-in: {userData.marketingOptIn ? "Yes" : "No"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.logoutSection}>
            <Text style={styles.logoutSectionTitle}>Logout</Text>
            <TouchableOpacity style={[styles.backButton, { backgroundColor: '#EF4444' }]} onPress={async () => {
              handleLogout()
            }}>
              <LogOut size={20} color={"white"} />
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: clayTheme.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: clayTheme.background,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: clayTheme.cardBackground,
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "700",
    color: clayTheme.textPrimary,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  profileImageContainer: {
    marginBottom: 24,
  },
  profileImageWrapper: {
    position: "relative",
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
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: clayTheme.cardBackground,
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
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
    alignItems: "center",
  },
  userName: {
    fontSize: 28,
    fontWeight: "800",
    color: clayTheme.textPrimary,
    marginBottom: 8,
  },
  userPronouns: {
    fontSize: 16,
    color: clayTheme.textSecondary,
    fontWeight: "500",
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
    fontWeight: "600",
    color: clayTheme.textSecondary,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  logoutSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: clayTheme.red,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
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
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: clayTheme.cardBackground,
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "600",
    color: clayTheme.textMuted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: clayTheme.textPrimary,
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    fontWeight: "600",
    color: "white",
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
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "500",
    color: clayTheme.textPrimary,
  },
})
