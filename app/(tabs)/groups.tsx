import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Users,
  Lock,
  Globe,
  Star,
  Calendar,
  Search,
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { getAllGroups, getUserGroups } from '@/contexts/group.api';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { useState } from 'react';

import { PlusCircle } from 'lucide-react-native';
import AdMobScreen from '@/components/BannerAd';

const placeholderImg = 'https://via.placeholder.com/150';

const theme = {
  // Neomorphic base colors
  background: '#E8ECF4',
  cardBackground: '#E8ECF4',
  white: '#FFFFFF',

  // Primary colors
  primary: '#667EEA',
  primaryLight: '#764BA2',
  primaryDark: '#5A67D8',

  // Accent colors
  accent: '#F093FB',
  accentSecondary: '#F5576C',
  success: '#48BB78',
  warning: '#ED8936',

  // Text colors
  textPrimary: '#2D3748',
  textSecondary: '#4A5568',
  textMuted: '#718096',
  textLight: '#A0AEC0',

  // Neomorphic shadows
  shadowLight: '#FFFFFF',
  shadowDark: '#D1D9E6',

  // Status colors
  online: '#48BB78',
  offline: '#CBD5E0',

  // Border and divider
  border: '#E2E8F0',
  divider: '#EDF2F7',
};

interface ApiGroup {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator: {
    id: string;
    email: string;
    name: string;
  };
  members: any[];
  _count: {
    members: number;
  };
}

export default function Groups() {
  const {
    data: groupResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['groups'],
    queryFn: () => getUserGroups(),
  });
  const allGroups = groupResponse?.groups || [];

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const groups = allGroups.filter(
    (group: ApiGroup) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.creator.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log(groupResponse);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>Discovering Groups...</Text>
              <Text style={styles.loadingSubtext}>
                Finding amazing communities for you
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>Oops! Something went wrong</Text>
              <Text style={styles.errorSubtext}>
                Unable to load groups right now
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <>
      <CreateGroupModal
        visible={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onSubmit={() => setShowCreateGroupModal(false)}
      />


      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.heroSection}>
            <View style={styles.heroOverlay}>
              <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                  <Text
                    style={[
                      styles.heroSubtitle,
                      { fontSize: 20, lineHeight: 24, fontWeight: '600' },
                    ]}
                  >
                    Connect with communities that share your interests
                  </Text>
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => setShowCreateGroupModal(true)}
                    activeOpacity={0.7}
                  >
                    <PlusCircle size={28} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.searchWrapper}>
            <View style={styles.searchContainer}>
              <Search size={18} color={theme.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search groups by name, description..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={theme.textMuted}
              />
            </View>
          </View>
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
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

                  {group.description && group.description !== '' && (
                    <Text style={styles.groupDescription} numberOfLines={3}>
                      {group.description}
                    </Text>
                  )}

                  <View style={styles.creatorSection}>
                    <View style={styles.creatorInfo}>
                      <View style={styles.creatorAvatar}>
                        <Text style={styles.creatorInitial}>
                          {group.creator.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.creatorDetails}>
                        <Text style={styles.creatorName}>
                          {group.creator.name}
                        </Text>
                        <Text style={styles.creatorRole}>Group Creator</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.statsSection}>
                    <View style={styles.statCard}>
                      <Users size={16} color={theme.primary} />
                      <Text style={styles.statText}>
                        {group._count?.members || 0} members
                      </Text>
                    </View>

                    <View style={styles.statCard}>
                      <Calendar size={16} color={theme.accent} />
                      <Text style={styles.statText}>
                        {new Date(group.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
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
                    Be the first to create a cultural group and start building
                    your community!
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.bottomSpacing} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F3F7', // Clay-like background
  },
  safeArea: {
    flex: 1,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  createButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  // Hero Section Styles
  heroSection: {
    height: 100,
    backgroundColor: '#6366F1',
    position: 'relative',
    overflow: 'hidden',
    // marginHorizontal: 20,
    marginBottom: 16,
    // borderRadius: 24,
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
    borderRadius: 24,
  },
  headerContainer: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
    width:'80%'
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backdropFilter: 'blur(10px)',
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  // List Styles
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  // Group Card Styles (Enhanced Claymorphism/Neumorphism)
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
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
    position: 'relative',
    backgroundColor: '#6366F1',
    overflow: 'hidden',
  },
  groupImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#94A3B8',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },

  // Badge Styles
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(10px)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  publicBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  privateBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 146, 60, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#FB923C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  groupDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '500',
  },

  // Creator Section Styles
  creatorSection: {
    marginBottom: 12,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  creatorInitial: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  creatorDetails: {
    flex: 1,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  creatorRole: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },

  // Stats Section Styles
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },

  // Action Section Styles
  actionSection: {
    alignItems: 'center',
  },
  joinPreview: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  joinPreviewText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },

  // Loading State Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  loadingSubtext: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Error State Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  errorSubtext: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 24,
  },

  // Additional Claymorphism Elements
  searchWrapper: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 52,
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchContainerFocused: {
    borderColor: '#6366F1',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    paddingVertical: 12,
  },

  // Filter buttons for categories
  filterWrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 6,
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
  filterButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  activeFilter: {
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
});
