import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { store } from '@/data/store';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Heart, Share, Star, Bookmark, Music, Gift, Navigation, Phone, Mail, Camera } from 'lucide-react-native';

const theme = {
  primary: '#6366F1',
  accent: '#EC4899',
  success: '#10B981',
  background: '#FAFAFA',
  white: '#FFFFFF',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray800: '#1F2937',
  error: '#EF4444',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  warning: '#F59E0B',
  info: '#3B82F6',
};

const neomorphColors = {
  background: '#F8FAFC',
  lightShadow: '#FFFFFF',
  darkShadow: '#a3b1c6',
};

const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 20,
    xl: 24,
    xxl: 28,
  },
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  card: 16,
};

export default function EventDetails() {
  const { id } = useLocalSearchParams();
  const event = store.getEventById(Number(id));
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [pressedButton, setPressedButton] = useState(null);

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>Event Not Found</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
              <Text style={styles.backLinkText}>← Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleRSVP = () => {
    store.toggleRsvp(store.getState().currentUser.id, event.id);
    Alert.alert("RSVP Confirmed", "You are now attending this event!");
  };

  const handleShare = () => {
    Alert.alert("Share Event", "Sharing functionality would be implemented here");
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    Alert.alert(isLiked ? "Removed from favorites" : "Added to favorites", "Event preference updated");
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Alert.alert(isBookmarked ? "Bookmark removed" : "Event bookmarked", "Bookmark preference updated");
  };

  const handlePressIn = (buttonId) => {
    setPressedButton(buttonId);
  };

  const handlePressOut = () => {
    setPressedButton(null);
  };

  const quickActionItems = [
    { id: 'like', icon: Heart, label: 'Favorite', description: 'Save for later', color: theme.accent, isActive: isLiked, action: handleLike },
    { id: 'share', icon: Share, label: 'Share', description: 'Tell friends', color: theme.info, action: handleShare },
    { id: 'navigate', icon: Navigation, label: 'Navigate', description: 'Get directions', color: theme.success },
    { id: 'contact', icon: Phone, label: 'Contact', description: 'Call organizer', color: theme.warning },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Hero Image Section */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: event.image }} style={styles.heroImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.8)']}
            locations={[0, 0.3, 0.7, 1]}
            style={styles.heroOverlay}
          />
          
          {/* Header Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.back()} style={styles.actionButton}>
              <ArrowLeft size={20} color={theme.gray800} />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={handleBookmark} style={styles.actionButton}>
                <Bookmark 
                  size={18} 
                  color={isBookmarked ? theme.primary : theme.gray800} 
                  fill={isBookmarked ? theme.primary : 'none'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Camera size={18} color={theme.gray800} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Event Badge */}
          <View style={styles.eventBadge}>
            <Music size={16} color={theme.white} />
            <Text style={styles.eventBadgeText}>Live Music</Text>
          </View>

          {/* Hero Bottom Info */}
          <View style={styles.heroBottomInfo}>
            <View style={styles.heroTitleContainer}>
              <Text style={styles.heroTitle}>{event.title}</Text>
              <View style={styles.heroRating}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.heroRatingText}>4.8</Text>
              </View>
            </View>
            <View style={styles.heroMetaContainer}>
              <Text style={styles.heroSubtitle}>124 people attending</Text>
              <View style={styles.heroStatusBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.heroStatusText}>Booking Open</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          {/* Quick Actions Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            <View style={styles.quickActions}>
              <View style={styles.actionButtons}>
                {quickActionItems.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    onPressIn={() => handlePressIn(item.id)}
                    onPressOut={handlePressOut}
                    onPress={item.action}
                    style={[
                      styles.quickActionButton,
                      pressedButton === item.id && styles.quickActionButtonPressed,
                      item.isActive && styles.quickActionButtonActive
                    ]}
                    activeOpacity={0.8}
                  >
                    <View style={[
                      styles.actionIcon,
                      { backgroundColor: `${item.color}15` }
                    ]}>
                      <item.icon 
                        size={24} 
                        color={item.isActive ? theme.white : item.color}
                        fill={item.isActive ? theme.white : 'none'}
                      />
                    </View>
                    <Text style={[
                      styles.actionTitle,
                      { color: item.isActive ? theme.white : theme.textPrimary }
                    ]}>
                      {item.label}
                    </Text>
                    <Text style={[
                      styles.actionDescription,
                      { color: item.isActive ? 'rgba(255,255,255,0.8)' : theme.textSecondary }
                    ]}>
                      {item.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Event Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Event Details</Text>
            </View>
            <View style={styles.detailsContainer}>
              <View style={styles.metaRow}>
                <View style={styles.metaCard}>
                  <View style={[styles.metaIconWrapper, { backgroundColor: '#EEF2FF' }]}>
                    <Calendar size={28} color={theme.primary} />
                  </View>
                  <View style={styles.metaContent}>
                    <Text style={styles.metaLabel}>Date & Day</Text>
                    <Text style={styles.metaValue}>{event.date}</Text>
                    <Text style={styles.metaSubValue}>Saturday</Text>
                  </View>
                </View>

                <View style={styles.metaCard}>
                  <View style={[styles.metaIconWrapper, { backgroundColor: '#FDF2F8' }]}>
                    <Clock size={28} color={theme.accent} />
                  </View>
                  <View style={styles.metaContent}>
                    <Text style={styles.metaLabel}>Time</Text>
                    <Text style={styles.metaValue}>{event.time}</Text>
                    <Text style={styles.metaSubValue}>Duration: 4 hrs</Text>
                  </View>
                </View>
              </View>

              <View style={styles.metaCardLarge}>
                <View style={[styles.metaIconWrapper, { backgroundColor: '#ECFDF5' }]}>
                  <MapPin size={28} color={theme.success} />
                </View>
                <View style={styles.metaContent}>
                  <Text style={styles.metaLabel}>Venue Location</Text>
                  <Text style={styles.metaValue}>{event.location}</Text>
                  <Text style={styles.metaSubValue}>Click to view on map</Text>
                </View>
                <TouchableOpacity style={styles.mapButton}>
                  <Navigation size={16} color={theme.white} />
                  <Text style={styles.mapButtonText}>Map</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Pricing Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Event Pricing</Text>
            </View>
            <View style={styles.pricingContainer}>
              <View style={styles.pricingCard}>
                <View style={styles.pricingHeader}>
                  <View>
                    <Text style={styles.pricingLabel}>General Admission</Text>
                    <Text style={styles.pricingNote}>Includes welcome drink & snacks</Text>
                  </View>
                  <View style={styles.pricingBadge}>
                    <Text style={styles.pricingBadgeText}>Popular</Text>
                  </View>
                </View>
                <View style={styles.pricingDetails}>
                  <View style={styles.priceRow}>
                    <Text style={styles.originalPrice}>Rs. 1,500</Text>
                    <Text style={styles.currentPrice}>Rs. 1,200</Text>
                  </View>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discount}>20% OFF</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>About This Event</Text>
            </View>
            <View style={styles.descriptionContainer}>
              <View style={styles.descriptionCard}>
                <Text style={styles.description}>{event.description}</Text>
                
                <View style={styles.highlightsList}>
                  <Text style={styles.highlightsTitle}>Event Highlights</Text>
                  {[
                    { icon: Music, text: 'Live music performances' },
                    { icon: Gift, text: 'Food & beverage stalls' },
                    { icon: Users, text: 'Interactive activities' },
                    { icon: Heart, text: 'Networking opportunities' },
                  ].map((item, index) => (
                    <View key={index} style={styles.highlightItem}>
                      <View style={styles.highlightIconWrapper}>
                        <item.icon size={16} color={theme.primary} />
                      </View>
                      <Text style={styles.highlightText}>{item.text}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Attendees Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Attendees (124)</Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.attendeesContainer}>
              <View style={styles.attendeesPreview}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <View key={i} style={styles.attendeeAvatar}>
                    <Text style={styles.attendeeInitial}>U{i}</Text>
                  </View>
                ))}
                <View style={styles.moreAttendees}>
                  <Text style={styles.moreAttendeesText}>+119</Text>
                </View>
              </View>
              <Text style={styles.attendeesNote}>Join others who are attending this amazing event</Text>
            </View>
          </View>

          {/* RSVP Section */}
          <View style={styles.rsvpSection}>
            <TouchableOpacity onPress={handleRSVP} style={styles.rsvpButton}>
              <LinearGradient
                colors={[theme.primary, theme.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.rsvpGradient}
              >
                <View style={styles.rsvpContent}>
                  <View>
                    <Text style={styles.rsvpButtonText}>Book Now</Text>
                    <Text style={styles.rsvpPriceText}>Rs. 1,200</Text>
                  </View>
                  <View style={styles.rsvpIcon}>
                    <Text style={styles.rsvpIconText}>→</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            
            <Text style={styles.rsvpSubtext}>🔒 Secure booking • ⚡ Instant confirmation</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neomorphColors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: neomorphColors.background,
    paddingHorizontal: spacing.xl,
  },
  errorCard: {
    backgroundColor: theme.white,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
        shadowColor: neomorphColors.darkShadow,
      },
    }),
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: theme.error,
    fontWeight: '600',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  backLink: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: neomorphColors.background,
    borderRadius: borderRadius.md,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backLinkText: {
    color: theme.primary,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },

  // Hero Section
  heroContainer: {
    position: 'relative',
    height: 400,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  eventBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 90,
    left: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  eventBadgeText: {
    color: theme.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  heroBottomInfo: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
  },
  heroTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '800',
    color: theme.white,
    lineHeight: 32,
    flex: 1,
    marginRight: spacing.md,
  },
  heroRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroRatingText: {
    color: theme.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  heroMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  heroStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.success,
  },
  heroStatusText: {
    color: theme.success,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },

  // Content Container
  contentContainer: {
    backgroundColor: neomorphColors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl * 2,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  // Section Styles
  section: {
    marginVertical: spacing.md,
    backgroundColor: neomorphColors.background,
    paddingTop: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
    marginHorizontal: spacing.lg,
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
  viewAllButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: neomorphColors.background,
    borderRadius: borderRadius.md,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  viewAllText: {
    fontSize: typography.fontSize.sm,
    color: theme.primary,
    fontWeight: '600',
  },

  // Quick Actions
  quickActions: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  quickActionButton: {
    width: '48%',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    minHeight: 120,
    backgroundColor: neomorphColors.background,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
        shadowColor: neomorphColors.darkShadow,
      },
    }),
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    marginBottom: spacing.sm,
  },
  quickActionButtonPressed: {
    width: '48%',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    minHeight: 120,
    backgroundColor: neomorphColors.background,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
        shadowColor: neomorphColors.darkShadow,
      },
    }),
    borderWidth: 0.5,
    borderColor: 'rgba(163, 177, 198, 0.15)',
    marginBottom: spacing.sm,
  },
  quickActionButtonActive: {
    backgroundColor: theme.primary,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
        shadowColor: theme.primary,
      },
    }),
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  actionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: typography.fontFamily.bold,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: typography.fontSize.xs,
    color: theme.gray500,
    textAlign: 'center',
    fontFamily: typography.fontFamily.regular,
    lineHeight: 14,
  },

  // Event Details
  detailsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metaCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  metaCardLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  metaIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  metaContent: {
    flex: 1,
  },
  metaLabel: {
    fontSize: typography.fontSize.xs,
    color: theme.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: typography.fontSize.md,
    color: theme.textPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  metaSubValue: {
    fontSize: typography.fontSize.xs,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: theme.success,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  mapButtonText: {
    color: theme.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },

  // Pricing Section
  pricingContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  pricingCard: {
    backgroundColor: theme.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  pricingLabel: {
    fontSize: typography.fontSize.md,
    color: theme.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  pricingNote: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
  pricingBadge: {
    backgroundColor: theme.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xl,
    ...Platform.select({
      ios: {
        shadowColor: theme.accent,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  pricingBadgeText: {
    color: theme.white,
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pricingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  originalPrice: {
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: typography.fontSize.xl,
    color: theme.textPrimary,
    fontWeight: '800',
  },
  discountBadge: {
    backgroundColor: theme.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  discount: {
    fontSize: typography.fontSize.sm,
    color: theme.white,
    fontWeight: '700',
  },

  // Description Section
  descriptionContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  descriptionCard: {
    backgroundColor: theme.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: theme.textPrimary,
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: spacing.xl,
  },
  highlightsList: {
    gap: spacing.md,
  },
  highlightsTitle: {
    fontSize: typography.fontSize.md,
    color: theme.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: neomorphColors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  highlightIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightText: {
    fontSize: typography.fontSize.sm,
    color: theme.textPrimary,
    fontWeight: '500',
    flex: 1,
  },

  // Attendees Section
  attendeesContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  attendeesPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  attendeeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -8,
    borderWidth: 3,
    borderColor: theme.white,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  attendeeInitial: {
    color: theme.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
  },
  moreAttendees: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.gray300,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
    borderWidth: 3,
    borderColor: theme.white,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  moreAttendeesText: {
    color: theme.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
  },
  attendeesNote: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // RSVP Section
  rsvpSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  rsvpButton: {
    width: '100%',
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  rsvpGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
  },
  rsvpContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rsvpButtonText: {
    fontSize: typography.fontSize.md,
    color: theme.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rsvpPriceText: {
    fontSize: typography.fontSize.lg,
    color: theme.white,
    fontWeight: '800',
  },
  rsvpIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rsvpIconText: {
    color: theme.white,
    fontSize: typography.fontSize.md,
    fontWeight: '700',
  },
  rsvpSubtext: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
});