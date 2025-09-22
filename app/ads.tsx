import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getAdvertisements } from '@/contexts/ad.api';
import CulturalExperienceCard from '@/components/home/CulturalExperienceCard';
import { theme, spacing, typography } from '@/components/theme';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

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

export default function AllAdsScreen() {
  const {
    data: adResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<AdResponse>({
    queryKey: ['allAdvertisements'],
    queryFn: () => getAdvertisements({}),
  });

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
      originalAd: ad,
    }));
  };

  const allAds =
    adResponse?.success && adResponse.data
      ? transformAdData(adResponse.data)
      : [];

  const handleSponsoredContentPress = async (content: any) => {
    if (content.link && content.link.startsWith('http')) {
      const supported = await Linking.canOpenURL(content.link);
      if (supported) {
        await Linking.openURL(content.link);
      } else {
        Alert.alert('Error', `Don't know how to open this URL: ${content.link}`);
      }
    } else if (content.contactInfo) {
      const phoneUrl = `tel:${content.contactInfo}`;
      const supported = await Linking.canOpenURL(phoneUrl);
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Contact', `Contact: ${content.contactInfo}`);
      }
    }
  };

  const renderAdItem = ({ item, index }: { item: any; index: number }) => (
    <CulturalExperienceCard
      key={`${item.id}-${index}`}
      content={item}
      handleSponsoredContentPress={handleSponsoredContentPress}
      index={index}
      activeSponsoredCategory="all"
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.infoText}>Loading Experiences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load experiences.</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>All Experiences</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={allAds}
        renderItem={renderAdItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.infoText}>No experiences found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  listContent: {
    padding: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  infoText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: theme.error,
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  retryButtonText: {
    color: theme.white,
    fontWeight: '600',
  },
});