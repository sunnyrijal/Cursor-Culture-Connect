import { Image, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { theme, spacing, typography, neomorphColors } from '../theme'; 
import { Star, MapPin, Clock, Phone } from 'lucide-react-native';
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
      style={[styles.card, { marginLeft: index === 0 ? 0 : spacing.md }]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: content.image }} style={styles.image} />
        <View style={styles.overlay} />

        {/* Labels */}
        {content.type && (
          <View style={styles.sponsoredLabel}>
            <Text style={styles.sponsoredLabelText}>Sponsored</Text>
          </View>
        )}
        {content.category && (
          <View style={[styles.heritageBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.heritageBadgeText}>{content.category}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>{content.title}</Text>
          <View style={styles.rating}>
            <Star size={12} color={theme.warning} fill={theme.warning} />
            <Text style={styles.ratingText}>{content.metrics?.views || 'New'}</Text>
          </View>
        </View>

        <Text style={styles.subtitle} numberOfLines={2}>{content.description}</Text>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <MapPin size={11} color={theme.textSecondary} />
            <Text style={styles.metaText}>{content.location}</Text>
          </View>
          {content.contactInfo && (
            <View style={styles.metaItem}>
              <Phone size={11} color={theme.textSecondary} />
              <Text style={styles.metaText}>{content.contactInfo}</Text>
            </View>
          )}
      </View>

      {content.offer ? (
          <View style={styles.offer}>
            <Text style={styles.offerText}>{content.offer}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  )
}

export default CulturalExperienceCard

const styles = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: neomorphColors.background,
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 2, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  sponsoredLabel: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  sponsoredLabelText: {
    color: theme.white,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heritageBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heritageBadgeText: {
    color: theme.white,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: theme.textPrimary,
    fontFamily: typography.fontFamily.bold,
    marginRight: 5,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: neomorphColors.background,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: -0.5, height: -0.5 },
        shadowOpacity: 0.04,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: theme.textSecondary,
    fontFamily: typography.fontFamily.regular,
    marginBottom: 8,
  },
  meta: {
    marginBottom: 10,
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: theme.textSecondary,
  },
  offer: {
    backgroundColor: theme.primary + '15',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  offerText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  label: {
    fontSize: 11,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  value: {
    fontSize: 11,
    color: theme.textPrimary,
  },
});