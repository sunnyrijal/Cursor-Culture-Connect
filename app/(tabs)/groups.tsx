import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { Users, Lock, Globe, Star, Calendar } from "lucide-react-native"
import { useQuery } from "@tanstack/react-query"
import { getAllGroups, getUserGroups } from "@/contexts/group.api"

const placeholderImg = "https://via.placeholder.com/150"

const theme = {
  // Neomorphic base colors
  background: "#E8ECF4",
  cardBackground: "#E8ECF4",
  white: "#FFFFFF",

  // Primary colors
  primary: "#667EEA",
  primaryLight: "#764BA2",
  primaryDark: "#5A67D8",

  // Accent colors
  accent: "#F093FB",
  accentSecondary: "#F5576C",
  success: "#48BB78",
  warning: "#ED8936",

  // Text colors
  textPrimary: "#2D3748",
  textSecondary: "#4A5568",
  textMuted: "#718096",
  textLight: "#A0AEC0",

  // Neomorphic shadows
  shadowLight: "#FFFFFF",
  shadowDark: "#D1D9E6",

  // Status colors
  online: "#48BB78",
  offline: "#CBD5E0",

  // Border and divider
  border: "#E2E8F0",
  divider: "#EDF2F7",
}

interface ApiGroup {
  id: string
  name: string
  description: string
  imageUrl: string
  isPrivate: boolean
  createdAt: string
  updatedAt: string
  creatorId: string
  creator: {
    id: string
    email: string
    name: string
  }
  members: any[]
  _count: {
    members: number
  }
}

export default function Groups() {
  const {
    data: groupResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["groups"],
    queryFn: () => getUserGroups(),
  })

  const groups = groupResponse?.groups || []

  console.log(groupResponse)

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>Discovering Groups...</Text>
              <Text style={styles.loadingSubtext}>Finding amazing communities for you</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>Oops! Something went wrong</Text>
              <Text style={styles.errorSubtext}>Unable to load groups right now</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.heroSection}>
          <View style={styles.heroOverlay}>
            <View style={styles.headerContainer}>
              <Text style={styles.heroTitle}>Cultural Groups</Text>
              <Text style={styles.heroSubtitle}>Connect with communities that share your interests</Text>
              {/* <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{groups.length}</Text>
                  <Text style={styles.statLabel}>Groups</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {groups.reduce((acc, group) => acc + (group._count?.members || 0), 0)}
                  </Text>
                  <Text style={styles.statLabel}>Members</Text>
                </View>
              </View> */}
            </View>
          </View>
        </View>

        <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {groups.map((group: any, index: number) => (
            <TouchableOpacity
              key={group.id}
              style={[
                styles.groupCard,
                index === 0 && styles.firstCard,
                index === groups.length - 1 && styles.lastCard,
              ]}
              onPress={() => router.push(`/group/${group.id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.groupImageContainer}>
                <Image
                  source={{
                    uri: group.imageUrl || placeholderImg,
                  }}
                  style={styles.groupImage}
                />
                <View style={styles.imageOverlay} />

                {/* Status Badge */}
                <View style={styles.badgeContainer}>
                  {!group.isPrivate ? (
                    <View style={[styles.badge, styles.publicBadge]}>
                      <Globe size={10} color={theme.white} />
                      <Text style={styles.badgeText}>Public</Text>
                    </View>
                  ) : (
                    <View style={[styles.badge, styles.privateBadge]}>
                      <Lock size={10} color={theme.white} />
                      <Text style={styles.badgeText}>Private</Text>
                    </View>
                  )}
                </View>

                {/* Featured Badge for first few groups */}
                {/* {index < 2 && (
                  <View style={styles.featuredBadge}>
                    <Star size={10} color={theme.warning} fill={theme.warning} />
                    <Text style={styles.featuredText}>Featured</Text>
                  </View>
                )} */}
              </View>

              <View style={styles.groupContent}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupName} numberOfLines={2}>
                    {group.name}
                  </Text>
                </View>

                <Text style={styles.groupDescription} numberOfLines={3}>
                  {group.description || "Join this amazing community and connect with like-minded people."}
                </Text>

                <View style={styles.creatorSection}>
                  <View style={styles.creatorInfo}>
                    <View style={styles.creatorAvatar}>
                      <Text style={styles.creatorInitial}>{group.creator.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.creatorDetails}>
                      <Text style={styles.creatorName}>{group.creator.name}</Text>
                      <Text style={styles.creatorRole}>Group Creator</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.statsSection}>
                  <View style={styles.statCard}>
                    <Users size={16} color={theme.primary} />
                    <Text style={styles.statText}>{group._count?.members || 0} members</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Calendar size={16} color={theme.accent} />
                    <Text style={styles.statText}>
                      {new Date(group.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>

                {/* <View style={styles.actionSection}>
                  <View style={styles.joinPreview}>
                    <Text style={styles.joinPreviewText}>Tap to explore</Text>
                  </View>
                </View> */}
              </View>
            </TouchableOpacity>
          ))}

          {groups.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No Groups Yet</Text>
                <Text style={styles.emptyText}>
                  Be the first to create a cultural group and start building your community!
                </Text>
              </View>
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  safeArea: {
    flex: 1,
  },

  // Hero Section Styles
  heroSection: {
    height: 120,
    backgroundColor: theme.primary,
    position: "relative",
    overflow: "hidden",
    paddingTop:10
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: "rgba(102, 126, 234, 0.9)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  headerContainer: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: theme.white,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backdropFilter: "blur(10px)",
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.white,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },

  // List Styles
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingTop: 24,
  },

  // Group Card Styles (Neomorphic)
  groupCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 24,
    marginBottom: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: theme.shadowDark,
        shadowOffset: { width: -6, height: -6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
    // Neomorphic inner shadow effect
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  firstCard: {
    marginTop: 0,
  },
  lastCard: {
    marginBottom: 0,
  },

  // Group Image Styles
  groupImageContainer: {
    height: 100,
    position: "relative",
    backgroundColor: theme.primary,
  },
  groupImage: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.textMuted,
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },

  // Badge Styles
  badgeContainer: {
    position: "absolute",
    top: 16,
    left: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(10px)",
  },
  publicBadge: {
    backgroundColor: "rgba(72, 187, 120, 0.9)",
  },
  privateBadge: {
    backgroundColor: "rgba(245, 87, 108, 0.9)",
  },
  badgeText: {
    color: theme.white,
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  featuredBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(237, 137, 54, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  featuredText: {
    color: theme.white,
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 4,
  },

  // Group Content Styles
  groupContent: {
    padding: 16,
  },
  groupHeader: {
    marginBottom: 8,
  },
  groupName: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.textPrimary,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  groupDescription: {
    fontSize: 15,
    color: theme.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },

  // Creator Section Styles
  creatorSection: {
    marginBottom: 12,
  },
  creatorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadowDark,
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  creatorInitial: {
    color: theme.white,
    fontSize: 14,
    fontWeight: "600",
  },
  creatorDetails: {
    flex: 1,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.textPrimary,
  },
  creatorRole: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 1,
  },

  // Stats Section Styles
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadowDark,
        shadowOffset: { width: -3, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statText: {
    fontSize: 13,
    color: theme.textSecondary,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },

  // Action Section Styles
  actionSection: {
    alignItems: "center",
  },
  joinPreview: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  joinPreviewText: {
    color: theme.white,
    fontSize: 13,
    fontWeight: "600",
  },

  // Loading State Styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingCard: {
    backgroundColor: theme.cardBackground,
    padding: 32,
    borderRadius: 24,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: theme.shadowDark,
        shadowOffset: { width: -8, height: -8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.textPrimary,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: "center",
  },

  // Error State Styles
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorCard: {
    backgroundColor: theme.cardBackground,
    padding: 32,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(245, 87, 108, 0.2)",
    ...Platform.select({
      ios: {
        shadowColor: theme.accentSecondary,
        shadowOffset: { width: -6, height: -6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.accentSecondary,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: "center",
  },

  // Empty State Styles
  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyCard: {
    backgroundColor: theme.cardBackground,
    padding: 40,
    borderRadius: 24,
    alignItems: "center",
    maxWidth: 280,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadowDark,
        shadowOffset: { width: -8, height: -8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.textPrimary,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 20,
  },
})
