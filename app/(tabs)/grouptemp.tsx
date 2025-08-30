import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Search,
  Users,
  Calendar,
  MapPin,
  Plus,
  Lock,
  Globe,
  GraduationCap,
} from 'lucide-react-native';
import { ShareButton } from '@/components/ui/ShareButton';
import { FilterSystem } from '@/components/FilterSystem';
import { currentUser } from '@/data/mockData';
const placeholderImg = 'https://via.placeholder.com/150';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { useQuery } from '@tanstack/react-query';
import { getUserGroups } from '@/contexts/group.api';

const theme = {
  primary: '#6366F1',
  accent: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  background: '#F0F3F7',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#4B5563',
  gray900: '#111827',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  shadow: '#CDD2D8',
  shadowPrimary: '#6366F1',
};

const spacing = {
  sm: 8,
  md: 16,
  lg: 24,
};

interface FilterOptions {
  location: {
    country: string;
    state: string;
    city: string;
  };
  university: string;
  filterBy: 'all' | 'public' | 'private' | 'my-university' | 'my-heritage' | 'filter-by-state';
  ethnicity: string[];
  selectedUniversity: string;
  visibility?: 'all' | 'my-university' | 'my-heritage' | 'filter-by-state';
  groupType?: 'all' | 'public' | 'private';
  heritage?: string;
}

interface ApiGroup {
  id: number;
  name: string;
  description: string;
  category: string | string[];
  location: string;
  isPublic: boolean;
  universityOnly: boolean;
  allowedUniversity: string;
  presidentId: number;
  meetings: any[];
  memberCount: number;
  recentActivity: string;
  upcomingEvents: number;
  image: string;
  isJoined: boolean;
  heritage?: string;
}

export default function Groups() {
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [searchFocused, setSearchFocused] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    location: { country: '', state: '', city: '' },
    university: '',
    visibility: 'all',
    ethnicity: [],
    groupType: 'all',
    selectedUniversity: '',
    filterBy: 'all',
  });

  // useEffect(() => {
  //   fetchGroups();
  // }, []);

  // const fetchGroups = async () => {
  //   try {
  //     const response = await fetch('http://localhost:3001/api/groups');
  //     const data = await response.json();
  //     console.log('Fetched groups:', data);
  //     setGroups(
  //       data.map((group) => ({
  //         ...group,
  //         isPublic: group.is_public,
  //         universityOnly: group.university_only,
  //         allowedUniversity: group.allowed_university,
  //         presidentId: group.president_id,
  //         memberCount: group.member_count || 1,
  //         recentActivity: 'just now',
  //         upcomingEvents: 0,
  //         image: 'https://images.unsplash.com/photo-1578836537282-3171d77f8632?q=80&w=300',
  //         isJoined: group.president_id === currentUser?.id,
  //       }))
  //     );
  //   } catch (error) {
  //     console.error('Error fetching groups:', error);
  //     Alert.alert('Error', 'Failed to load groups. Please try again.');
  //   }
  // };


    const {
    data: groupResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['events'],
    queryFn: () => getUserGroups(),
  });


  console.log(groupResponse)

  const filteredGroups = useMemo(() => {
    let tempGroups = [...groups];

    if (searchQuery) {
      tempGroups = tempGroups.filter(
        (group) =>
          group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (Array.isArray(group.category)
            ? group.category.some((cat) =>
                cat.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : group.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    switch (filters.filterBy) {
      case 'public':
        tempGroups = tempGroups.filter((group) => group.isPublic);
        break;
      case 'private':
        tempGroups = tempGroups.filter((group) => !group.isPublic);
        break;
      case 'my-university':
        tempGroups = tempGroups.filter(
          (group) =>
            group.location === currentUser.university ||
            (group.allowedUniversity &&
              group.allowedUniversity === currentUser.university)
        );
        break;
      case 'my-heritage':
        const userHeritages = currentUser.heritage || [];
        tempGroups = tempGroups.filter((group) =>
          userHeritages.some((heritage) =>
            Array.isArray(group.category)
              ? group.category.some((cat) =>
                  cat.toLowerCase().includes(heritage.toLowerCase())
                )
              : group.category.toLowerCase().includes(heritage.toLowerCase())
          )
        );
        break;
      case 'filter-by-state':
        if (filters.location.state) {
          tempGroups = tempGroups.filter((group) =>
            group.location.includes(filters.location.state)
          );
        }
        if (filters.location.city) {
          tempGroups = tempGroups.filter((group) =>
            group.location
              .toLowerCase()
              .includes(filters.location.city.toLowerCase())
          );
        }
        break;
    }

    if (filters.ethnicity.length > 0) {
      tempGroups = tempGroups.filter((group) =>
        Array.isArray(group.category)
          ? group.category.some((cat) => filters.ethnicity.includes(cat))
          : filters.ethnicity.includes(group.category)
      );
    }

    if (filters.selectedUniversity) {
      tempGroups = tempGroups.filter(
        (group) =>
          group.location === filters.selectedUniversity ||
          (group.allowedUniversity &&
            group.allowedUniversity === filters.selectedUniversity)
      );
    }

    if (filters.heritage && filters.heritage.length > 0) {
      tempGroups = tempGroups.filter((group) => {
        return group.heritage === filters.heritage;
      });
    }

    return tempGroups;
  }, [groups, searchQuery, filters]);

  const handleJoinGroup = (groupId: number) => {
    setGroups((currentGroups) =>
      currentGroups.map((g) =>
        g.id === groupId ? { ...g, isJoined: !g.isJoined } : g
      )
    );
  };

  const handleCreateGroup = async (groupData: any) => {
  };

  const generateGroupShareContent = (group: ApiGroup) => {
    return {
      title: `${group.name} - Culture Connect`,
      message: `Check out ${group.name} on Culture Connect!\n\n${group.description}\n\n📍 ${group.location}\n👥 ${group.memberCount} members\n\nJoin our cultural community!`,
      url: `https://cultureconnect.app/group/${group.id}`,
    };
  };

  const handleFiltersChange = (filters: FilterOptions) => {
    setFilters(filters);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <CreateGroupModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGroup}
        />

        {/* Modern Header */}
        <View style={styles.header}>
          <View style={styles.headerGradient}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>Cultural Groups</Text>
              </View>
              <TouchableOpacity
                style={styles.headerRight}
                onPress={() => setShowCreateModal(true)}
              >
                <Plus size={28} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Modern Search */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBlur}>
            <View style={[
              styles.searchContainer,
              searchFocused && styles.searchContainerFocused
            ]}>
              <View style={styles.searchIcon}>
                <Search size={20} color={searchFocused ? theme.primary : theme.gray400} />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search cultural groups..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholderTextColor={theme.gray400}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Enhanced Filter System */}
        <View style={styles.filterWrapper}>
          <FilterSystem
            onFiltersChange={handleFiltersChange}
            contentType="groups"
            showPresets={true}
            groupCount={filteredGroups.length}
            filterLabel={(() => {
              if (filters.filterBy === 'my-university') return 'My University';
              if (filters.filterBy === 'my-heritage') return 'My Heritage';
              if (filters.filterBy === 'filter-by-state') return 'By State';
              if (filters.filterBy === 'public') return 'Public Groups';
              if (filters.filterBy === 'private') return 'Private Groups';
              return 'All';
            })()}
          />
        </View>

        {/* Groups List */}
        <View style={styles.listContainer}>
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          >
            {filteredGroups.map((group) => (
              <View key={group.id} style={styles.groupItem}>
                <View style={styles.groupItemBlur}>
                  <TouchableOpacity
                    style={styles.groupItemContent}
                    onPress={() => router.push(`/group/${group.id}`)}
                  >
                    {/* Group Image */}
                    <View style={styles.groupImageContainer}>
                      <Image
                        source={{ uri: group.image || undefined }}
                        defaultSource={{ uri: placeholderImg }}
                        style={styles.groupImage}
                      />
                      <View style={styles.badgeContainer}>
                        {group.isPublic ? (
                          <View style={[styles.badge, styles.publicBadge]}>
                            <Globe size={8} color={theme.white} />
                            <Text style={styles.badgeText}>Public</Text>
                          </View>
                        ) : (
                          <View style={[styles.badge, styles.privateBadge]}>
                            <Lock size={8} color={theme.white} />
                            <Text style={styles.badgeText}>Private</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.groupActions}>
                        <ShareButton
                          {...generateGroupShareContent(group)}
                          size={16}
                          color={theme.white}
                          style={styles.shareButton}
                        />
                      </View>
                    </View>

                    {/* Group Content */}
                    <View style={styles.groupContent}>
                      <View style={styles.groupHeader}>
                        <Text style={styles.groupName} numberOfLines={2}>
                          {group.name}
                        </Text>
                        <View style={styles.groupCategoryContainer}>
                          <Text style={styles.groupCategory}>
                            {Array.isArray(group.category)
                              ? group.category.join(', ')
                              : group.category}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.groupLocation}>
                        <MapPin size={14} color={theme.gray500} />
                        <Text style={styles.groupLocationText} numberOfLines={1}>
                          {group.location}
                        </Text>
                      </View>

                      <Text style={styles.groupDescription} numberOfLines={2}>
                        {group.description}
                      </Text>

                      <View style={styles.groupStats}>
                        <View style={styles.groupStat}>
                          <Users size={14} color={theme.gray500} />
                          <Text style={styles.groupStatText}>
                            {group.memberCount} members
                          </Text>
                        </View>
                        <View style={styles.groupStat}>
                          <Calendar size={14} color={theme.gray500} />
                          <Text style={styles.groupStatText}>
                            {group.upcomingEvents} events
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.joinButton,
                          group.isJoined ? styles.joinedButton : styles.notJoinedButton,
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleJoinGroup(group.id);
                        }}
                      >
                        <Text
                          style={[
                            styles.joinButtonText,
                            group.isJoined ? styles.joinedButtonText : styles.notJoinedButtonText,
                          ]}
                        >
                          {group.isJoined ? 'Joined' : 'Join Group'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
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
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: theme.shadow,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerGradient: {
    backgroundColor: theme.white,
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: theme.gray50,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadowPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.textPrimary,
    letterSpacing: -0.5,
  },
  searchWrapper: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.border,
    minHeight: 52,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadow,
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
    borderColor: theme.primary,
    backgroundColor: theme.white,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadowPrimary,
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
    color: theme.textPrimary,
    fontWeight: '500',
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: theme.gray400,
  },
  filterWrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  listContainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  groupItem: {
    marginBottom: 16,
    padding: 4,
  },
  groupItemBlur: {
    borderRadius: 20,
    backgroundColor: theme.white,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: theme.shadow,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  groupItemContent: {
    overflow: 'hidden',
  },
  groupImageContainer: {
    position: 'relative',
    height: 200,
  },
  groupImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  publicBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
  },
  privateBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.95)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.white,
  },
  groupActions: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  shareButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  groupContent: {
    padding: 20,
  },
  groupHeader: {
    marginBottom: 12,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  groupCategoryContainer: {
    alignSelf: 'flex-start',
  },
  groupCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  groupLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  groupLocationText: {
    fontSize: 14,
    color: theme.gray500,
    flex: 1,
    fontWeight: '500',
  },
  groupDescription: {
    fontSize: 15,
    color: theme.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  groupStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  groupStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupStatText: {
    fontSize: 13,
    color: theme.gray500,
    fontWeight: '600',
  },
  joinButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.shadowPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  joinedButton: {
    backgroundColor: theme.gray100,
    borderWidth: 1,
    borderColor: theme.border,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  notJoinedButton: {
    backgroundColor: theme.primary,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  joinedButtonText: {
    color: theme.textSecondary,
  },
  notJoinedButtonText: {
    color: theme.white,
  },
});