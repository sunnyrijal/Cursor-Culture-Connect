import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import React, { useState } from 'react';
import { Star, MapPin, Clock } from 'lucide-react-native';
import { sponsoredContent, sponsoredCategories } from '@/data/sponsoredContent'; // Make sure these are correctly defined
import { theme, spacing, typography, borderRadius, neomorphColors } from '../theme'; // Adjust paths as needed
import CulturalExperienceCard from './CulturalExperienceCard';

const placeholderImg = 'https://via.placeholder.com/200'; // Fallback image URL

const CulturalExperiences = () => {
  const [activeSponsoredCategory, setActiveSponsoredCategory] = useState('all');
  
  const filteredSponsoredContent = activeSponsoredCategory === 'all'
    ? sponsoredContent
    : sponsoredContent.filter(c => c.type === activeSponsoredCategory);

  const handleSponsoredContentPress = (content: any) => {
    // Handle navigation or deep link
    console.log('Tapped on:', content.title);
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Discover Cultural Experiences</Text>
      </View>

      <View style={styles.sponsoredCategoryTabsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sponsoredCategoryTabs}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {sponsoredCategories.map((cat:any) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.sponsoredCategoryTab,
                activeSponsoredCategory === cat.id && styles.sponsoredCategoryTabActive,
              ]}
              onPress={() => setActiveSponsoredCategory(cat.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.sponsoredCategoryTabText,
                  activeSponsoredCategory === cat.id && styles.sponsoredCategoryTabTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true} 
        style={styles.sponsoredScroll}
        contentContainerStyle={styles.scrollContentContainer}
        decelerationRate="fast"
        snapToInterval={220} // Card width + margin for snap effect
        snapToAlignment="start"
      >
        {filteredSponsoredContent.map((content, index) => (
         <CulturalExperienceCard 
           key={index} 
           content={content} 
           handleSponsoredContentPress={() => handleSponsoredContentPress(content)}  
           index={index}
         />
        ))}
      </ScrollView>
    </View>
  );
};

export default CulturalExperiences;

const styles = StyleSheet.create({
  section: {
    marginVertical: spacing.lg,
    // paddingBottom: 20,
    backgroundColor: neomorphColors.background,
    // paddingHorizontal: 20,
    paddingTop: 20,
    borderRadius: 20,
    // // Light neumorphic shadow for main section
    // ...Platform.select({
    //   ios: {
    //     shadowColor: neomorphColors.darkShadow,
    //     shadowOffset: { width: 4, height: 4 },
    //     shadowOpacity: 0.15,
    //     shadowRadius: 8,
    //   },
    //   android: {
    //     elevation: 4,
    //   },
    // }),
    // Light inner border
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal:20
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily.bold,
  },

  sponsoredCategoryTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 16,
    marginLeft: -20, 
    paddingHorizontal:20

  },
  sponsoredCategoryTabs: {
    flexDirection: 'row',
    marginBottom: 0,
    paddingLeft: 20, // Restore padding for content
  },
  sponsoredCategoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: neomorphColors.background,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    // Light neumorphic raised effect for inactive tabs
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
    // Light highlight
    borderWidth: 0.5,
    borderColor: neomorphColors.lightShadow,
  },
  sponsoredCategoryTabActive: {
    backgroundColor: theme.primary,
    // Subtle pressed neumorphic effect for active tab
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: -1, height: -1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
    // Remove light border for active state
    borderWidth: 0,
  },
  sponsoredCategoryTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  sponsoredCategoryTabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  sponsoredScroll: {
    // marginHorizontal: -20, // Offset section padding for full-width scroll
    paddingBottom: 20,
  },
  scrollContentContainer: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  cardWrapper: {
    // Light neumorphic effect for card wrapper
    backgroundColor: neomorphColors.background,
    borderRadius: borderRadius.card + 4,
    marginRight: spacing.md,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  sponsoredCard: {
    width: 200,
    marginRight: spacing.md,
    backgroundColor: neomorphColors.background,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    // Light neumorphic shadow for cards
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  sponsoredImageContainer: {
    position: 'relative',
  },
  sponsoredImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: borderRadius.card,
    borderTopRightRadius: borderRadius.card,
    resizeMode: 'cover',
  },
  sponsoredLabel: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    // Very subtle neumorphic effect for label
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sponsoredLabelText: {
    color: theme.white,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: typography.fontFamily.semiBold,
  },
  heritageBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    // Light neumorphic badge effect
    backgroundColor: neomorphColors.background,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  heritageBadgeText: {
    color: theme.primary,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sponsoredCardContent: {
    padding: spacing.md,
    backgroundColor: neomorphColors.background,
    // Very subtle inset effect for content area
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: -1, height: -1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        // No inset shadow on Android as it doesn't support negative elevation well
      },
    }),
  },
  sponsoredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  sponsoredTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: neomorphColors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    // Very light neumorphic effect for rating
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: -0.5, height: -0.5 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        // Minimal elevation for Android
        elevation: 1,
      },
    }),
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  sponsoredSubtitle: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    fontFamily: typography.fontFamily.regular,
  },
  sponsoredMeta: {
    marginTop: 8,
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: theme.textSecondary,
  },
  offerContainer: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: neomorphColors.background,
    borderRadius: 8,
    alignSelf: 'flex-start',
    // Light neumorphic pressed effect for offer badge
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: -1, height: -1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
    borderWidth: 0.5,
    borderColor: theme.primary,
  },
  offerText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.primary,
  },
});