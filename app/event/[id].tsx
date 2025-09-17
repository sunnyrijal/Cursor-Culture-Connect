'use client';

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShareButton } from '@/components/ui/ShareButton';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Star,
  Bookmark,
  Music,
  Gift,
  Navigation,
  Trash2,
  Shield,
} from 'lucide-react-native';
import { deleteEvent, getEvent } from '@/contexts/event.api';
import getDecodedToken from '@/utils/getMyData';

// Enhanced theme for neumorphism
const neomorphColors = {
  background: '#F8FAFC',
  lightShadow: '#FFFFFF',
  darkShadow: '#a3b1c6',
};

// Extended theme
const extendedTheme = {
  ...theme,
  accent: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export default function EventDetail() {
  const { id } = useLocalSearchParams();
  const [isLiked, setIsLiked] = React.useState(false);
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  const eventId = Array.isArray(id) ? id[0] : id ?? null;

  const {
    data: eventResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId as string),
    enabled: !!eventId, // Only run query if eventId exists
  });

  const event = eventResponse?.event;

  console.log(event);

  const { data: myData } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getDecodedToken(),
  });

  const queryClient = useQueryClient();
  const { mutate: deleteEventMutation } = useMutation({
    mutationFn: (eventIdToDelete: string) => deleteEvent(eventIdToDelete),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      router.back();
      Alert.alert('Success', 'Event deleted successfully.');
    },
    onError: (err) => {
      console.error('Error deleting event:', err);
      Alert.alert('Error', 'Failed to delete event. Please try again.');
    },
  });

  const handleDeleteEvent = () => {
    if (!eventId) {
      Alert.alert('Error', 'Event ID is missing.');
      return;
    }
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete "${event?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteEventMutation(eventId),
        },
      ]
    );
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper function to format time
  const formatTime = (startTime: string, endTime: string) => {
    if (!startTime) return 'TBD';
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;

    const startTimeStr = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (end) {
      const endTimeStr = end.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return `${startTimeStr} - ${endTimeStr}`;
    }

    return startTimeStr;
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (isError || !event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              {isError ? 'Failed to load event' : 'Event Not Found'}
            </Text>
            <Text style={styles.errorSubtext}>
              {isError
                ? error?.message || 'Please try again later'
                : "Sorry, we couldn't find this event."}
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backLink}
            >
              <Text style={styles.backLinkText}>← Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Extract dynamic data from response
  const eventTime = event.eventTimes?.[0]; // Get first event time
  const eventDate = formatDate(eventTime?.startTime);
  const eventTimeFormatted = formatTime(
    eventTime?.startTime,
    eventTime?.endTime
  );
  const organizer = event.user?.name || 'Unknown Organizer';
  const organizerEmail = event.user?.email;

  const generateEventShareContent = () => {
    return {
      title: `${event.name} - Trivo`,
      message: `Join me at ${event.name}!\n\n📅 ${eventDate} at ${eventTimeFormatted}\n📍 ${event.location}\n\n${event.description}\n\nDiscover amazing cultural events on Culture Connect!`,
      url: `https://trivo.app/event/${event.id}`,
    };
  };

  const handleRSVP = () => {
    // For now, just toggle local state since we don't have RSVP mutation
    setIsLiked(!isLiked);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Section */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: event.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />

          {/* Header Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <ArrowLeft size={20} color={theme.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={handleBookmark}
                style={styles.headerButton}
              >
                <Bookmark
                  size={18}
                  color={
                    isBookmarked ? extendedTheme.accent : theme.textPrimary
                  }
                  fill={isBookmarked ? extendedTheme.accent : 'none'}
                />
              </TouchableOpacity>
              {/* <ShareButton
                {...generateEventShareContent()}
                size={18}
                color={theme.textPrimary}
                style={styles.headerButton}
              /> */}
              {event?.userId === myData?.userId && (
                <TouchableOpacity
                  onPress={handleDeleteEvent}
                  style={styles.actionButton}
                >
                  <Trash2 size={20} color={theme.error} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Event Badge */}
          <View style={styles.eventBadge}>
            <Music size={16} color={theme.white} />
            <Text style={styles.eventBadgeText}>Live Event</Text>
          </View>

          {/* Hero Bottom Info */}
          <View style={styles.heroBottomInfo}>
            <View style={styles.heroTitleContainer}>
              <Text style={styles.heroTitle}>{event.name}</Text>
              {/* <View style={styles.heroRating}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.heroRatingText}>4.8</Text>
              </View> */}
            </View>
            <View style={styles.heroMetaContainer}>
              <Text style={styles.heroSubtitle}>Organized by {organizer}</Text>
              {/* <View style={styles.heroStatusBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.heroStatusText}>Booking Open</Text>
              </View> */}
            </View>
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Tags Section */}
          <View style={styles.tagsSection}>
            <View style={styles.tagsContainer}>
              <View style={[styles.categoryTag]}>
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: event.UniversityOnly
                        ? extendedTheme.info
                        : extendedTheme.success,
                    },
                  ]}
                >
                  {event.UniversityOnly ? 'University Only' : 'Public Event'}
                </Text>
              </View>
              {event.groupName && (
                <View
                  style={[
                    styles.categoryTag,
                    { backgroundColor: theme.primary + '20' },
                  ]}
                >
                  <Users size={14} color={theme.primary} />
                  <Text style={[styles.categoryText, { color: theme.primary }]}>
                    Group Event
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Event Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Event Details</Text>
            </View>
            <View style={styles.detailsContainer}>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <View
                    style={[
                      styles.infoIconWrapper,
                      { backgroundColor: '#EEF2FF' },
                    ]}
                  >
                    <Calendar size={24} color={theme.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Date</Text>
                    <Text style={styles.infoValue}>{eventDate}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View
                    style={[
                      styles.infoIconWrapper,
                      { backgroundColor: '#FDF2F8' },
                    ]}
                  >
                    <Clock size={24} color={extendedTheme.accent} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Time</Text>
                    <Text style={styles.infoValue}>{eventTimeFormatted}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View
                    style={[
                      styles.infoIconWrapper,
                      { backgroundColor: '#ECFDF5' },
                    ]}
                  >
                    <MapPin size={24} color={extendedTheme.success} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>{event.location}</Text>
                  </View>
                  <TouchableOpacity style={styles.mapButton}>
                    <Navigation size={16} color={theme.white} />
                    <Text style={styles.mapButtonText}>Map</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.infoRow}>
                  <View
                    style={[
                      styles.infoIconWrapper,
                      { backgroundColor: '#FEF3C7' },
                    ]}
                  >
                    <Users size={24} color={extendedTheme.warning} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Organizer</Text>
                    <Text style={styles.infoValue}>{organizer}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Associated Group Section */}
          {event.associatedGroup && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Associated Group</Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  router.push(`/group/${event.associatedGroup.id}`)
                }
                activeOpacity={0.8}
              >
                <View style={styles.groupCard}>
                  <Image
                    source={
                      event.associatedGroup.imageUrl
                        ? { uri: event.associatedGroup.imageUrl }
                        : require('../../assets/user.png')
                    }
                    style={styles.groupImage}
                  />

                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>
                      {event.associatedGroup.name}
                    </Text>
                    <Text style={styles.groupDescription}>
                      {event.associatedGroup.description}
                    </Text>
                    <Text style={styles.groupAction}>View Group Details</Text>
                  </View>
                  <View style={styles.groupArrow}>
                    <ArrowLeft
                      size={20}
                      color={theme.primary}
                      style={{ transform: [{ rotate: '180deg' }] }}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Description Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>About This Event</Text>
            </View>
            <View style={styles.descriptionContainer}>
              <View style={styles.descriptionCard}>
                <Text style={styles.description}>{event.description}</Text>

                {/* <View style={styles.highlightsList}>
                  <Text style={styles.highlightsTitle}>Event Highlights</Text>
                  {[
                    { icon: Music, text: "Live performances" },
                    { icon: Gift, text: "Special activities" },
                    { icon: Users, text: "Networking opportunities" },
                    { icon: Heart, text: "Cultural experiences" },
                  ].map((item, index) => (
                    <View key={index} style={styles.highlightItem}>
                      <View style={styles.highlightIconWrapper}>
                        <item.icon size={16} color={theme.primary} />
                      </View>
                      <Text style={styles.highlightText}>{item.text}</Text>
                    </View>
                  ))}
                </View> */}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer RSVP */}
      {/* <View style={styles.footer}>
        <TouchableOpacity onPress={handleRSVP} style={styles.rsvpButton}>
          <View style={styles.rsvpContent}>
            <Text style={styles.rsvpButtonText}>{isLiked ? "Cancel RSVP" : "RSVP Now"}</Text>
            <View style={styles.rsvpIcon}>
              <Text style={styles.rsvpIconText}>→</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

  container: {
    flex: 1,
    backgroundColor: neomorphColors.background,
    minHeight: '100%',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80, // Reduced from 100 to 80
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
  },

  // Error States
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg, // Reduced from spacing.xl to spacing.lg
  },
  errorCard: {
    backgroundColor: theme.white,
    padding: spacing.lg, // Reduced from spacing.xl to spacing.lg
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
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
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  backLink: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
    height: 350,
    marginHorizontal: spacing.sm,
    marginTop: spacing.sm,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerActions: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  },
  eventBadge: {
    position: 'absolute',
    top: 80,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: spacing.xs,
  },
  eventBadgeText: {
    color: theme.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  heroBottomInfo: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  heroTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '800',
    color: theme.white,
    flex: 1,
    marginRight: spacing.md,
  },
  heroRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
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
    borderRadius: 8,
    gap: spacing.xs,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: extendedTheme.success,
  },
  heroStatusText: {
    color: extendedTheme.success,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },

  // Content Container
  contentContainer: {
    backgroundColor: neomorphColors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: spacing.lg, // Reduced from spacing.xl to spacing.lg
  },

  // Tags Section
  tagsSection: {
    paddingHorizontal: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryTag: {
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    paddingVertical: spacing.xs, // Reduced from spacing.sm to spacing.xs
    borderRadius: 20,
    backgroundColor: neomorphColors.background,
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
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
  },
  categoryText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: theme.primary,
  },

  section: {
    marginVertical: spacing.sm,
    backgroundColor: neomorphColors.background,
    paddingTop: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
    marginHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    // marginBottom: spacing.sm, // Reduced from 15 to spacing.sm
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: spacing.sm,
    fontFamily: typography?.fontFamily?.bold || 'System',
  },

  detailsContainer: {},
  infoCard: {
    backgroundColor: theme.white,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 20,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: extendedTheme.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  mapButtonText: {
    color: theme.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },

  descriptionContainer: {
    paddingBottom: spacing.md,
  },
  descriptionCard: {
    backgroundColor: theme.white,
    padding: spacing.md,
    borderRadius: 20,
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
    fontFamily: typography.fontFamily.regular,
    color: theme.textPrimary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing.md,
  },
  highlightsList: {
    gap: spacing.sm,
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
    gap: spacing.sm,
    backgroundColor: neomorphColors.background,
    padding: spacing.sm,
    borderRadius: 12,
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

  // Footer RSVP
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: neomorphColors.background,
    borderTopWidth: 1,
    borderTopColor: neomorphColors.lightShadow,
    alignItems: 'center',
  },
  rsvpButton: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: theme.primary,
    marginBottom: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  rsvpContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rsvpButtonText: {
    fontSize: typography.fontSize.md,
    color: theme.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rsvpIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rsvpIconText: {
    color: theme.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
  },
  rsvpSubtext: {
    fontSize: typography.fontSize.xs,
    color: theme.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Group Card Styles
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.white,
    borderRadius: 20,
    padding: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  groupImage: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginRight: spacing.md,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  groupAction: {
    fontSize: typography.fontSize.sm,
    color: theme.primary,
    fontWeight: '600',
  },
  groupArrow: {
    marginLeft: spacing.sm,
  },
});
