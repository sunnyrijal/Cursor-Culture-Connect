import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import React, { useState, useRef, useCallback } from 'react';
import {
  theme,
  spacing,
  typography,
  borderRadius,
  neomorphColors,
} from '../theme';
import CulturalExperienceCard from './CulturalExperienceCard';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getAdvertisements,
  recordAdClick,
  recordAdImpression,
} from '@/contexts/ad.api';
import { useRouter } from 'expo-router';
import getDecodedToken from '@/utils/getMyData';

interface Advertisement {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  contactInfo: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  link: string;
  location: {
    address: string;
  };
  user: {
    id: string;
    name: string;
  };
  metrics?: {
    id: number;
    advertisementId: string;
    views: number;
    clicks: number;
  };
}

interface AdResponse {
  success: boolean;
  data: Advertisement[];
}

const CulturalExperiences = () => {
  const [activeSponsoredCategory, setActiveSponsoredCategory] = useState('all');
  const router = useRouter();
  const flatListRef = useRef(null);

  // Define categories
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'Food', label: 'Food' },
    { id: 'Arts', label: 'Arts' },
    { id: 'Volunteer', label: 'Volunteer' },
    { id: 'Faith', label: 'Faith' },
  ];

  const {
    data: adResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<AdResponse>({
    queryKey: ['advertisements', activeSponsoredCategory],
    queryFn: () => {
      const params =
        activeSponsoredCategory !== 'all'
          ? {
              category:
                activeSponsoredCategory.charAt(0).toUpperCase() +
                activeSponsoredCategory.slice(1),
            }
          : {};
      return getAdvertisements(params);
    },
  });

  const { data: myData } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getDecodedToken(),
  });

  // Transform API data to match your card component format
  const transformAdData = (ads: Advertisement[]) => {
    return ads.map((ad) => ({
      id: ad.id,
      title: ad.name,
      description: ad.description,
      image: ad.imageUrl,
      type: ad.category.toLowerCase(),
      link: ad.link,
      contactInfo: ad.contactInfo,
      location: ad.location?.address || 'Location not specified',
      author: ad.user?.name || 'Unknown',
      createdAt: ad.createdAt,
      metrics: ad.metrics,
      category: ad.category,
      // Add all the original ad data for the card component
      originalAd: ad,
    }));
  };

  // Get the data to display (only API data)
  const getDisplayContent = () => {
    if (adResponse?.success && adResponse?.data) {
      const transformedAds = transformAdData(adResponse.data);

      if (activeSponsoredCategory === 'all') {
        return transformedAds;
      } else {
        return transformedAds.filter(
          (ad) =>
            ad.type.toLowerCase() === activeSponsoredCategory.toLowerCase()
        );
      }
    }
    return [];
  };

  const displayContent = getDisplayContent();

  // Handle ad click with tracking
  const handleSponsoredContentPress = async (content: any) => {
      // Try to open the link first, then fallback to contact
      if (content.link && content.link.startsWith('http')) {
        const supported = await Linking.canOpenURL(content.link);
        if (supported) {
          await Linking.openURL(content.link);
        } else {
          Alert.alert(
            'Error',
            `Don't know how to open this URL: ${content.link}`
          );
        }
      } else if (content.contactInfo) {
        // Handle contact info (phone number)
        const phoneUrl = `tel:${content.contactInfo}`;
        const supported = await Linking.canOpenURL(phoneUrl);
        if (supported) {
          await Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Contact', `Contact: ${content.contactInfo}`);
        }
      }
  };

  const handleRefresh = () => {
    refetch();
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveSponsoredCategory(categoryId);
  };

  const handleViewAll = () => {
    router.push('/');
  };

  // const handleViewAll = () => {
  //   router.push('/');
  // };

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Unable to load experiences</Text>
      <Text style={styles.errorText}>
        {error?.message || 'Something went wrong while fetching data'}
      </Text>
      {/* <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAll}>
        <Text style={styles.viewAllButtonText}>View All</Text>
      </TouchableOpacity> */}
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={styles.loadingText}>Loading experiences...</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No experiences found</Text>
      <Text style={styles.emptyText}>
        Try selecting a different category or check back later.
      </Text>
      {/* <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAll}>
        <Text style={styles.viewAllButtonText}>View All</Text>
      </TouchableOpacity> */}
    </View>
  );

  // Render individual ad item using the original card component
  const renderAdItem = ({ item, index }: any) => (
    <CulturalExperienceCard
      key={`${item.id}-${activeSponsoredCategory}-${index}`}
      content={item}
      handleSponsoredContentPress={handleSponsoredContentPress}
      index={index}
      activeSponsoredCategory={activeSponsoredCategory}
    />
  );

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Discover</Text>
        {/* <TouchableOpacity onPress={handleViewAll} style={styles.viewAllBtn}>
          <Text style={styles.viewAllBtnText}>View all</Text>
        </TouchableOpacity> */}
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryRow}>
        <FlatList
          horizontal
          data={categories}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center' }}
          keyExtractor={(item) => item.id}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryTab,
                activeSponsoredCategory === cat.id && styles.categoryTabActive,
              ]}
              onPress={() => handleCategoryChange(cat.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeSponsoredCategory === cat.id &&
                    styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Content Area - Fixed with proper scroll handling */}
      <View style={styles.contentContainer}>
        {error && !adResponse ? (
          renderErrorState()
        ) : isLoading && !adResponse ? (
          renderLoadingState()
        ) : displayContent.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            ref={flatListRef}
            data={displayContent}
            renderItem={renderAdItem}
            keyExtractor={(item, index) =>
              `${item.id}-${activeSponsoredCategory}-${index}`
            }
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.listContent}
            // KEY FIXES FOR SCROLL BEHAVIOR:
            nestedScrollEnabled={true}
            scrollEnabled={true}
            bounces={Platform.OS === 'ios'}
            overScrollMode={Platform.OS === 'android' ? 'auto' : undefined}
            // Ensure proper gesture handling
            onScrollBeginDrag={() => {
              // Optional: Add haptic feedback or other scroll start logic
            }}
            // Remove refresh control from here and handle it differently if needed
            // Or keep it but make sure it doesn't interfere
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
          />
        )}
      </View>
    </View>
  );
};

export default CulturalExperiences;

const styles = StyleSheet.create({
  section: {
    marginVertical: spacing.lg,
    backgroundColor: 'skyblue',
    paddingTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
    // Ensure the container doesn't interfere with touch events
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.textPrimary,
    fontFamily: typography.fontFamily.bold,
  },
  viewAllBtn: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  viewAllBtnText: {
    color: theme.primary,
    fontWeight: '600',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  categoryRow: {
    paddingLeft: 16,
    marginBottom: 12,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: neomorphColors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  categoryTabActive: {
    backgroundColor: theme.primary,
    borderWidth: 0,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  contentContainer: {
    height: 280, // Fixed height for the scrollable area
    paddingHorizontal: 16,
    // IMPORTANT: Don't add flex: 1 here as it can cause issues
    // Make sure the container has a defined height
  },
  listContent: {
    paddingBottom: 12,
    // Ensure there's enough content to scroll
    flexGrow: 1,
  },
  // Error State Styles
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center', 
    justifyContent: 'center',
    flex: 1,
  },
  errorTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  viewAllButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  viewAllButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: typography.fontSize.sm,
  },
  // Loading State Styles
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    marginTop: 16,
  },
  // Empty State Styles
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
});