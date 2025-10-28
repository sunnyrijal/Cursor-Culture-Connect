import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import {
  Users,
  Lock,
  Globe,
  Star,
  Calendar,
  Search,
  Filter,
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { getAllGroups, joinGroup } from '@/contexts/group.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

import { PlusCircle } from 'lucide-react-native';
import getDecodedToken from '@/utils/getMyData';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { GroupFilterModal } from '@/components/GroupFilterModal';
import { useAlert } from '@/contexts/AlertContext';
import AnimatedTabPage from '@/components/AnimatedTabPage';
import { theme } from '@/components/theme';

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
    profilePicture?: string | null;
  };
  members: any[];
  _count: {
    members: number;
  };
}

export default function Groups() {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const { data: myData } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getDecodedToken(),
  });

  const [showGroupFilterModal, setShowGroupFilterModal] = useState(false);
  const [groupFilters, setGroupFilters] = useState<{
    myUniversity?: boolean;
    privacy?: 'private' | 'public';
    sortBy?: 'name' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  }>({});

  const {
    data: groupResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['groups', groupFilters],
    queryFn: () => getAllGroups(groupFilters),
  });
  const allGroups = groupResponse?.groups || [];

  const handleGroupFilterChange = (newFilters: typeof groupFilters) => {
    setGroupFilters(newFilters);
  };

  const handleApplyGroupFilters = () => {
    setShowGroupFilterModal(false);
    refetch(); // This will refetch with new filters
  };

  const hasActiveGroupFilters = Object.keys(groupFilters).length > 0;

  const { mutate: joinGroupMutation, isPending: isJoining } = useMutation({
    mutationFn: (groupId: string) => {
      setJoiningGroupId(groupId);
      return joinGroup(groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error) => {
      showAlert({
        title: 'Error',
        message: 'Failed to join group. Please try again.',
      });
      console.error('Error joining group:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to join group. Please try again.',
      });
    },
    onSettled: () => {
      setJoiningGroupId(null);
    },
  });

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().then(() => setRefreshing(false));
  }, [refetch]);

  const groups = allGroups.filter(
    (group: ApiGroup) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.creator.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <AnimatedTabPage style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1 }}>
          <View style={styles.container}>
            {/* <View style={styles.heroSection}>
            <View style={styles.headerContainer}>
              <View style={styles.headerRow}>
                <Text style={styles.heroSubtitle}>
                  Discover and connect with communities that share your
                  interests.
                </Text>
              </View>

              {/* <Text style={styles.heroSubtitle}>
                Discover and connect with communities that share your interests.
                </Text> 
            </View>
          </View> 
          */}

            <View style={styles.searchWrapper}>
              <View style={styles.searchContainer}>
                <Search size={20} color={theme.gray500} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search groups by name, description..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor={theme.gray500}
                />
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    hasActiveGroupFilters && styles.activeFilterButton,
                  ]}
                  onPress={() => setShowGroupFilterModal(true)}
                  activeOpacity={0.7}
                >
                  <Filter
                    size={22}
                    color={hasActiveGroupFilters ? theme.white : theme.gray500}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {isLoading ? (
                <View style={styles.inlineFeedbackContainer}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <Text style={styles.loadingText}>Loading Groups...</Text>
                </View>
              ) : error ? (
                <View style={styles.inlineFeedbackContainer}>
                  <Text style={styles.errorText}>
                    Oops! Something went wrong.
                  </Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => refetch()}
                  >
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              ) : groups.length > 0 ? (
                groups.map((group: any, index: number) => {
                  const currentUserMembership = group?.members?.find(
                    (member: any) => member.userId == myData?.userId
                  );
                  const isCurrentUserMember = !!currentUserMembership;
                  const isCurrentUserAdmin =
                    currentUserMembership?.role === 'ADMIN';
                  return (
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
                        {group.imageUrl ? (
                          <Image
                            source={{
                              uri: group.imageUrl,
                            }}
                            style={styles.groupImage}
                          />
                        ) : (
                          <View style={styles.imagePlaceholder}>
                            <Users size={40} color={theme.gray400} />
                          </View>
                        )}

                        <View style={styles.badgeContainer}>
                          {!group.isPrivate ? (
                            <View style={[styles.badge, styles.publicBadge]}>
                              <Globe size={10} color={theme.white} />
                              <Text style={styles.badgeText}>Public</Text>
                            </View>
                          ) : (
                            <View style={[styles.badge, styles.privateBadge]}>
                              <Lock size={12} color={theme.white} />
                              <Text style={styles.badgeText}>
                                University Only
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View style={styles.groupContent}>
                        <View style={styles.groupHeader}>
                          <Text style={styles.groupName} numberOfLines={1}>
                            {group.name}
                          </Text>
                        </View>

                        {group.description && group.description !== '' && (
                          <Text
                            style={styles.groupDescription}
                            numberOfLines={2}
                          >
                            {group.description}
                          </Text>
                        )}

                        <View style={styles.creatorSection}>
                          <TouchableOpacity
                            onPress={() => {
                              if (group.creator.id === myData?.userId) {
                                router.push('/profile');
                              } else {
                                router.push(
                                  `/public/profile/${group.creator.id}`
                                );
                              }
                            }}
                            activeOpacity={0.7}
                          >
                            <View style={styles.creatorInfo}>
                              {group.creator.profilePicture ? (
                                <Image
                                  source={{
                                    uri:
                                      group.creator.profilePicture ||
                                      'https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png',
                                  }}
                                  style={styles.creatorAvatar}
                                  defaultSource={require('../../assets/user.png')}
                                />
                              ) : (
                                <View style={styles.creatorAvatar}>
                                  <Text style={styles.creatorInitial}>
                                    {group.creator.name.charAt(0).toUpperCase()}
                                  </Text>
                                </View>
                              )}
                              <View style={styles.creatorDetails}>
                                <Text style={styles.creatorName}>
                                  {group.creator.name}
                                </Text>
                                <Text style={styles.creatorRole}>
                                  Group Creator
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                          {isCurrentUserAdmin ? (
                            <View
                              style={[
                                styles.badge,
                                {
                                  backgroundColor: theme.warning,
                                  paddingHorizontal: 10,
                                  paddingVertical: 4,
                                },
                              ]}
                            >
                              <Text style={styles.badgeText}>Admin</Text>
                            </View>
                          ) : !isCurrentUserMember ? (
                            <TouchableOpacity
                              style={styles.joinButton}
                              onPress={() => joinGroupMutation(group.id)}
                              disabled={isJoining}
                            >
                              <Text style={styles.joinButtonText}>
                                {isJoining && joiningGroupId === group.id
                                  ? 'Joining...'
                                  : 'Join'}
                              </Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>

                        <View style={styles.footer}>
                          <View style={styles.statItem}>
                            <Users size={14} color={theme.gray500} />
                            <Text style={styles.statText}>
                              {group._count?.members || 0} members
                            </Text>
                          </View>
                          <View style={styles.statItem}>
                            <Calendar size={14} color={theme.gray500} />
                            <Text style={styles.statText}>
                              Joined{' '}
                              {new Date(group.createdAt).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  year: 'numeric',
                                }
                              )}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>No Groups Found</Text>
                    <Text style={styles.emptyText}>
                      Try adjusting your filters or be the first to create a new
                      group!
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.bottomSpacing} />
            </ScrollView>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateGroupModal(true)}
              activeOpacity={0.7}
            >
              <PlusCircle size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <CreateGroupModal
              visible={showCreateGroupModal}
              onClose={() => setShowCreateGroupModal(false)}
              onSubmit={() => {}}
            />

            <GroupFilterModal
              visible={showGroupFilterModal}
              onClose={() => setShowGroupFilterModal(false)}
              filters={groupFilters}
              onFiltersChange={handleGroupFilterChange}
              onApply={handleApplyGroupFilters}
            />
          </View>
          <Modal transparent={true} animationType="fade" visible={isJoining}>
            <View style={styles.loadingModalOverlay}>
              <View style={styles.loadingModalContent}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.loadingText}>Joining Group...</Text>
              </View>
            </View>
          </Modal>
        </View>
      </AnimatedTabPage>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    flex: 1,
    backgroundColor: '#F0F3F7', // Updated to match groups page background
  },
  safeArea: {
    flex: 1,

  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inlineFeedbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterButton: {
    padding: 8,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  createButton: {
    position: 'absolute',
    right: 20,
    bottom: 100, // tweak to sit above your bottom tab bar
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 101, 241, 1)',
    zIndex: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#6365f1',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  // Hero Section Styles
  heroSection: {
    height: 100,
    paddingBottom: 12,
    backgroundColor: '#6366F1',
    position: 'relative',
    overflow: 'hidden',
    paddingTop: 4,
    // marginHorizontal: 20,
    marginBottom: 12,
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
    flex: 0,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    justifyContent: 'flex-start',
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
    marginBottom: 8,
    lineHeight: 22,
    width: '80%',
    fontWeight: '600',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '50%',
    marginBottom: 8,
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
    paddingBottom: 80,
  },

  // Group Card Styles (Enhanced Claymorphism/Neumorphism)
  joinButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  joinButtonText: {
    color: theme.white,
    fontWeight: '600',
    fontSize: 13,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
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
    height: 120,
    position: 'relative',
  },
  groupImage: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.gray100,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
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
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
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
    fontWeight: '700',
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
    padding: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 26,
    letterSpacing: -0.3,
    flex: 1,
  },
  groupDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 8,
  },

  // Creator Section Styles
  creatorSection: {
    width: '100%',
    marginBottom: 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    borderColor: 'white',
  },
  creatorInitial: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  creatorDetails: {},
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

  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  statText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
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
    // paddingHorizontal: 16,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
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
    height: '100%',
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
  loadingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
});
