import { StyleSheet, Text, View, FlatList, TouchableOpacity, Linking, Alert, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import React, { useState, useRef, useCallback } from 'react';
import { theme, spacing, typography, borderRadius, neomorphColors } from '../theme';
import CulturalExperienceCard from './CulturalExperienceCard';
import { getAnalytics } from '@/contexts/analytics';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getAdvertisements, recordAdClick, recordAdImpression } from '@/contexts/ad.api';

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
}

interface AdResponse {
  success: boolean;
  data: Advertisement[];
}

const CulturalExperiences = () => {
  const [activeSponsoredCategory, setActiveSponsoredCategory] = useState('all');
  const [viewedAds, setViewedAds] = useState<Set<string>>(new Set()); // Track viewed ads
  
  // Define categories
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'Events', label: 'Events' },
    { id: 'Retail', label: 'Retail' },
    { id: 'Food', label: 'Food' },
    { id: 'Other', label: 'Other' }

  ];

  const {
    data: adResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<AdResponse>({
    queryKey: ["advertisements", activeSponsoredCategory],
    queryFn: () => {
      const params = activeSponsoredCategory !== 'all' 
        ? { category: activeSponsoredCategory.charAt(0).toUpperCase() + activeSponsoredCategory.slice(1) }
        : {};
      return getAdvertisements(params);
    },
  });

  console.log('Ad Response:', adResponse);

  // Ad Impression Mutation
  const { mutate: recordAdImpressionMutate } = useMutation({
    mutationFn: (adId: string) => recordAdImpression(adId),
    onSuccess: (data, adId) => {
      console.log('✅ Ad Impression Recorded for ad:', adId, data);
    },
    onError: (error, adId) => {
      console.error('❌ Error recording ad impression for ad:', adId, error);
    },
  });

  // Ad Click Mutation
  const { mutate: recordAdClickMutate } = useMutation({
    mutationFn: (adId: string) => recordAdClick(adId),
    onSuccess: (data, adId) => {
      console.log('✅ Ad Click Recorded for ad:', adId, data);
    },
    onError: (error, adId) => {
      console.error('❌ Error recording ad click for ad:', adId, error);
    },
  });

  // Handle ad impression when item becomes visible (only for native platforms)
  const onViewableItemsChanged = Platform.OS !== 'web' ? useRef(({ viewableItems }: any) => {
    viewableItems.forEach((viewableItem: any) => {
      const adId = viewableItem.item.id;
      
      // Only record impression if ad hasn't been viewed before
      if (!viewedAds.has(adId)) {
        console.log('📊 Ad became visible:', adId);
        recordAdImpressionMutate(adId);
        
        // Mark as viewed
        setViewedAds(prev => new Set([...prev, adId]));
      }
    });
  }).current : undefined;

  // Viewability configuration (only for native platforms)
  const viewabilityConfig = Platform.OS !== 'web' ? useRef({
    itemVisiblePercentThreshold: 50, // Ad needs to be 50% visible
    minimumViewTime: 1000, // Ad needs to be visible for 1 second
  }).current : undefined;

  // Transform API data to match your card component format
  const transformAdData = (ads: Advertisement[]) => {
    return ads.map(ad => ({
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
    }));
  };

  // Get the data to display (only API data)
  const getDisplayContent = () => {
    if (adResponse?.success && adResponse?.data) {
      const transformedAds = transformAdData(adResponse.data);
      
      if (activeSponsoredCategory === 'all') {
        return transformedAds;
      } else {
        return transformedAds.filter(ad => 
          ad.type.toLowerCase() === activeSponsoredCategory.toLowerCase()
        );
      }
    }
    return [];
  };

  const displayContent = getDisplayContent();

  // Handle ad click with tracking
  const handleSponsoredContentPress = async (content: any) => {
    try {
      console.log('🔗 Ad clicked:', content.id);
      
      // Record the click
      recordAdClickMutate(content.id);
      
      // Check if URL can be opened
      const supported = await Linking.canOpenURL(content.link);
      if (supported) {
        await Linking.openURL(content.link);
      } else {
        Alert.alert("Error", `Don't know how to open this URL: ${content.link}`);
      }
    } catch (error) {
      console.error("Failed to open URL:", error);
      Alert.alert("Error", "Failed to open the link. Please try again.");
    }
  };

  const showAnalytics = async () => {
    console.log('📊 Fetching analytics from API...');
    await getAnalytics();
  };

  const handleRefresh = () => {
    // Reset viewed ads when refreshing
    setViewedAds(new Set());
    refetch();
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveSponsoredCategory(categoryId);
    // Reset viewed ads when changing category
    setViewedAds(new Set());
  };

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Unable to load experiences</Text>
      <Text style={styles.errorText}>
        {error?.message || 'Something went wrong while fetching data'}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
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
    </View>
  );

  // Render individual ad item
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
        <Text style={styles.sectionTitle}>Discover Experiences</Text>
        {/* Refresh button */}
        <TouchableOpacity 
          onPress={handleRefresh} 
          style={styles.refreshBtn}
          disabled={isLoading}
        >
          <Text style={styles.refreshBtnText}>
            {isLoading ? '⟳' : '↻'}
          </Text>
        </TouchableOpacity>
        {/* Debug button - uncomment to test analytics API */}
        {/* <TouchableOpacity onPress={showAnalytics} style={styles.debugBtn}>
          <Text>📊</Text>
        </TouchableOpacity> */}
      </View>

      {/* API Status Indicator */}
      {/* {adResponse?.success && (
        <View style={styles.statusIndicator}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            Live data • {adResponse.data?.length || 0} ads loaded • {viewedAds.size} viewed
          </Text>
        </View>
      )} */}

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
                  activeSponsoredCategory === cat.id && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Content Area */}
      {error && !adResponse ? (
        renderErrorState()
      ) : isLoading && !adResponse ? (
        renderLoadingState()
      ) : displayContent.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          horizontal
          data={displayContent}
          renderItem={renderAdItem}
          keyExtractor={(item, index) => `${item.id}-${activeSponsoredCategory}-${index}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          {...(Platform.OS !== 'web' && {
            onViewableItemsChanged: onViewableItemsChanged,
            viewabilityConfig: viewabilityConfig,
          })}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={[theme.primary]}
            />
          }
        />
      )}
    </View>
  );
};

export default CulturalExperiences;

const styles = StyleSheet.create({
  section: {
    marginVertical: spacing.lg,
    backgroundColor: neomorphColors.background,
    paddingTop: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.textPrimary,
    fontFamily: typography.fontFamily.bold,
  },
  refreshBtn: {
    padding: 10,
    backgroundColor: neomorphColors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
    minWidth: 40,
    alignItems: 'center',
  },
  refreshBtnText: {
    fontSize: 18,
    color: theme.primary,
  },
  debugBtn: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  categoryRow: {
    paddingLeft: 20,
    marginBottom: 15,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: neomorphColors.background,
    marginRight: 10,
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  categoryTabActive: {
    backgroundColor: theme.primary,
    borderWidth: 0,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 20,
  },
  // Error State Styles
  errorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
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
  retryButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: typography.fontSize.sm,
  },
  // Loading State Styles
  loadingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    marginTop: 16,
  },
  // Empty State Styles
  emptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
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
  },
});