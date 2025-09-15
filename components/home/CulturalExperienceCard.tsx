import { Image, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { theme, spacing, typography, neomorphColors } from '../theme'; 
import { MapPin, Clock } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { recordAdClick, recordAdImpression } from '@/contexts/ad.api';
import { useAuth } from '@/contexts/AuthContext';
import getDecodedToken from '@/utils/getMyData';
import { useQuery } from '@tanstack/react-query';

const CulturalExperienceCard = ({
  content,
  handleSponsoredContentPress,
  index,
  activeSponsoredCategory
}: {
  content: any,
  index: number,
  activeSponsoredCategory: string,
  handleSponsoredContentPress: (value: any) => void
}) => {
  const { data: myData } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getDecodedToken(),
  });

  const { mutate: recordAdImpressionMutate } = useMutation({
    mutationFn: (adId: string) => recordAdImpression(adId),
    onSuccess: (data, adId) => console.log('✅ Ad Impression Recorded for ad:', adId, data),
    onError: (error, adId) => console.error('❌ Error recording ad impression for ad:', adId, error),
  });

  const { mutate: recordAdClickMutate } = useMutation({
    mutationFn: (adId: string) => recordAdClick(adId),
    onSuccess: (data, adId) => console.log('✅ Ad Click Recorded for ad:', adId, data),
    onError: (error, adId) => console.error('❌ Error recording ad click for ad:', adId, error),
  });

  useEffect(() => {
    // Only record impression if user is logged in
    if (myData) {
      const timer = setTimeout(() => {
        console.log('📊 Ad became visible:', content.id);
        recordAdImpressionMutate(content.id);
      }, 1000); // 1-second delay to ensure card is actually visible

      return () => clearTimeout(timer);
    }
  }, [content.id, myData, recordAdImpressionMutate]);

  const handlePress = () => {
    // Only record click if user is logged in
    if (myData) {
      console.log('🔗 Ad clicked:', content.id);
      recordAdClickMutate(content.id);
    }
    handleSponsoredContentPress(content);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Image on left */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: content.image }} style={styles.image} />
        {content.type && (
          <View style={styles.sponsoredLabel}>
            <Text style={styles.sponsoredLabelText}>Sponsored</Text>
          </View>
        )}
      </View>

      {/* Content on right */}
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{content.title}</Text>
          {content.category && (
            <View style={[styles.categoryBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.categoryBadgeText}>{content.category}</Text>
            </View>
          )}
        </View>

        <Text style={styles.description} numberOfLines={2}>{content.description}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MapPin size={12} color={theme.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>{content.location}</Text>
          </View>
        </View>

        {content.contactInfo && (
          <View style={styles.metaRow}>
            <Clock size={12} color={theme.textSecondary} />
            <Text style={styles.metaText}>{content.contactInfo}</Text>
          </View>
        )}

        {content.metrics && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {content.metrics.views} views
            </Text>
            {content.offer && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{content.offer}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default CulturalExperienceCard

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: neomorphColors.background,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  imageContainer: {
    width: 80,
    height: 80,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sponsoredLabel: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sponsoredLabelText: {
    color: theme.white,
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  contentContainer: {
    flex: 1,
    padding: 8,
    paddingLeft: 0,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: theme.textPrimary,
    fontFamily: typography.fontFamily.bold,
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: theme.white,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 11,
    color: theme.textSecondary,
    fontFamily: typography.fontFamily.regular,
    marginBottom: 6,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaText: {
    fontSize: 10,
    color: theme.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statsText: {
    fontSize: 10,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  discountBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 9,
    color: '#1976D2',
    fontWeight: '600',
  },
});