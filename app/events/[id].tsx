import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { store } from '@/data/store';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Heart, Share } from 'lucide-react-native';

const theme = {
  primary: '#6366F1',
  accent: '#EC4899',
  success: '#10B981',
  background: '#FAFAFA',
  white: '#FFFFFF',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray800: '#1F2937',
  error: '#EF4444',
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
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export default function EventDetails() {
  const { id } = useLocalSearchParams();
  const event = store.getEventById(Number(id));

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Event Not Found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Go Back</Text>
          </TouchableOpacity>
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
    Alert.alert("Liked!", "Event added to favorites");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Hero Image Section */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: event.image }} style={styles.heroImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)', 'transparent']}
            style={styles.heroOverlay}
          />
          
          {/* Header Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.back()} style={styles.actionButton}>
              <ArrowLeft size={20} color={theme.gray800} />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
                <Heart size={20} color={theme.gray800} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
                <Share size={20} color={theme.gray800} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          {/* Event Title */}
          <View style={styles.titleSection}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>Music Event</Text>
            </View>
          </View>

          {/* Event Meta Info */}
          <View style={styles.metaSection}>
            <View style={styles.metaCard}>
              <View style={styles.metaIconWrapper}>
                <Calendar size={20} color={theme.primary} />
              </View>
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaValue}>{event.date}</Text>
              </View>
            </View>

            <View style={styles.metaCard}>
              <View style={styles.metaIconWrapper}>
                <Clock size={20} color={theme.accent} />
              </View>
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Time</Text>
                <Text style={styles.metaValue}>{event.time}</Text>
              </View>
            </View>

            <View style={styles.metaCard}>
              <View style={styles.metaIconWrapper}>
                <MapPin size={20} color={theme.success} />
              </View>
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Location</Text>
                <Text style={styles.metaValue}>{event.location}</Text>
              </View>
            </View>

            <View style={styles.metaCard}>
              <View style={styles.metaIconWrapper}>
                <Users size={20} color={theme.gray500} />
              </View>
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Attendees</Text>
                <Text style={styles.metaValue}>124 going</Text>
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <View style={styles.descriptionCard}>
              <Text style={styles.description}>{event.description}</Text>
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
                <Text style={styles.rsvpButtonText}>RSVP Now</Text>
                <Heart size={20} color={theme.white} style={styles.rsvpIcon} />
              </LinearGradient>
            </TouchableOpacity>
            
            <Text style={styles.rsvpSubtext}>Join 124 others attending this event</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContainer: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
    paddingHorizontal: spacing.xl,
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
    backgroundColor: theme.white,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
  heroContainer: {
    position: 'relative',
    height: 300,
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
    paddingHorizontal: spacing.md,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  contentContainer: {
    backgroundColor: theme.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  titleSection: {
    marginBottom: spacing.xl,
  },
  eventTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '800',
    color: theme.gray800,
    lineHeight: 36,
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    color: theme.white,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaSection: {
    marginBottom: spacing.xl,
  },
  metaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.gray200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  metaIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  metaContent: {
    flex: 1,
  },
  metaLabel: {
    fontSize: typography.fontSize.sm,
    color: theme.gray500,
    fontWeight: '500',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: typography.fontSize.base,
    color: theme.gray800,
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: theme.gray800,
    marginBottom: spacing.md,
  },
  descriptionCard: {
    backgroundColor: theme.background,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.gray200,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: theme.gray700,
    lineHeight: 24,
    fontWeight: '500',
  },
  rsvpSection: {
    alignItems: 'center',
  },
  rsvpButton: {
    width: '100%',
    borderRadius: 16,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  rsvpGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    gap: spacing.sm,
  },
  rsvpButtonText: {
    fontSize: typography.fontSize.md,
    color: theme.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rsvpIcon: {
    marginLeft: spacing.xs,
  },
  rsvpSubtext: {
    fontSize: typography.fontSize.sm,
    color: theme.gray500,
    fontWeight: '500',
    textAlign: 'center',
  },
});