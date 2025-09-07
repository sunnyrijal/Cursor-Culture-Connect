import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import { LayoutGrid, List as ListIcon } from 'lucide-react-native';
import {
  theme,
  spacing,
  typography,
  borderRadius,
  neomorphColors,
} from '../theme'; // adjust if needed
import { router } from 'expo-router'; // or your navigation lib
import { useQuery } from '@tanstack/react-query';
import { getEvents } from '@/contexts/event.api';

const placeholderImg = 'https://via.placeholder.com/150';

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

// Helper function to format time
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const UpcomingEvents = () => {
  const [eventsView, setEventsView] = useState<'grid' | 'list'>('list');

  // Use Tanstack Query to fetch events
  const {
    data: eventsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['events'],
    queryFn: () => getEvents(),
  });

  const eventsData = eventsResponse?.events || [];

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
        </View>
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
        </View>
        <Text style={styles.errorText}>Failed to load events</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        <View style={styles.eventsToggleContainer}>
           <TouchableOpacity
            style={[
              styles.toggleButton,
              eventsView === 'list' && styles.toggleButtonActive,
            ]}
            onPress={() => setEventsView('list')}
            activeOpacity={0.7}
          >
            <ListIcon
              size={18}
              color={eventsView === 'list' ? theme.white : theme.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              eventsView === 'grid' && styles.toggleButtonActive,
            ]}
            onPress={() => setEventsView('grid')}
            activeOpacity={0.7}
          >
            <LayoutGrid
              size={18}
              color={eventsView === 'grid' ? theme.white : theme.primary}
            />
          </TouchableOpacity>
         
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/events')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {eventsView === 'grid' ? (
        <View
          style={[
            styles.eventsGrid,
            { paddingHorizontal: 0, justifyContent: 'space-between' },
          ]}
        >
          {eventsData.map((event: any, idx: number) => {
            const eventTime = event.eventTimes?.[0];
            const date = eventTime ? formatDate(eventTime.startTime) : 'TBA';
            const time = eventTime ? formatTime(eventTime.startTime) : 'TBA';

            return (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.eventGridCard,
                  { width: '48%', marginRight: idx % 2 === 0 ? '4%' : 0 },
                ]}
                onPress={() => router.push(`/event/${event.id}`)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: event.imageUrl || placeholderImg }}
                  style={styles.eventGridImage}
                />
                <View style={styles.eventGridDetails}>
                  <Text style={styles.eventGridTitle} numberOfLines={2}>
                    {event.name}
                  </Text>
                  <Text style={styles.eventGridMeta}>
                    {date} • {time}
                  </Text>
                  <Text style={styles.eventGridMeta} numberOfLines={1}>
                    {event.location}
                  </Text>
                  <Text style={styles.eventGridMeta} numberOfLines={1}>
                    by {event.user?.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.eventsList}>
          {eventsData.map((event: any) => {
            const eventTime = event.eventTimes?.[0];
            const date = eventTime ? formatDate(eventTime.startTime) : 'TBA';
            const time = eventTime ? formatTime(eventTime.startTime) : 'TBA';

            return (
              <TouchableOpacity
                key={event.id}
                style={styles.eventListCard}
                onPress={() => router.push(`/event/${event.id}`)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: event.imageUrl || placeholderImg }}
                  style={styles.eventListImage}
                />
                <View style={styles.eventListDetails}>
                  <Text style={styles.eventListTitle} numberOfLines={2}>
                    {event.name}
                  </Text>
                  <Text style={styles.eventListMeta}>
                    {date} • {time}
                  </Text>
                  <Text style={styles.eventListMeta} numberOfLines={1}>
                    {event.location}
                  </Text>
                  <View style={styles.eventListFooter}>
                    <Text style={styles.eventListPrice}>
                      by {event.user?.name}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};
export default UpcomingEvents;

const styles = StyleSheet.create({
  loadingText: {
    fontSize: typography.fontSize.md,
  },
  errorText:{

  },
  section: {
    marginBottom: spacing.lg,
    backgroundColor: neomorphColors.background,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
    width: '100%',
    // Cross-platform neumorphic outer shadow
    // ...Platform.select({
    //   ios: {
    //     shadowColor: neomorphColors.darkShadow,
    //     shadowOffset: { width: 8, height: 8 },
    //     shadowOpacity: 0.3,
    //     shadowRadius: 16,
    //   },
    //   android: {
    //     elevation: 8,
    //   },
    // }),
    // Inner light border
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: spacing.lg,
    fontFamily: typography.fontFamily.bold,
  },
  viewAllText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: theme.primary,
    fontFamily: typography.fontFamily.semiBold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: neomorphColors.background,
    borderRadius: 16,
    // Cross-platform pressed effect for button
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: -3, height: -3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  eventsToggleContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    marginRight: spacing.sm,
    backgroundColor: neomorphColors.background,
    borderRadius: 12,
    padding: 4,
    // Cross-platform inset container effect
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: -4, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: -2, // Note: negative elevation doesn't work on Android, but we'll keep border for visual effect
      },
    }),
    borderWidth: 1,
    borderColor: neomorphColors.darkShadow,
  },
  toggleButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: neomorphColors.background,
    // Cross-platform raised neumorphic effect
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
    borderWidth: 0.5,
    borderColor: neomorphColors.lightShadow,
  },
  toggleButtonActive: {
    backgroundColor: theme.primary,
    // Cross-platform pressed effect when active
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  eventGridCard: {
    backgroundColor: neomorphColors.background,
    borderRadius: borderRadius.card,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    // Cross-platform enhanced neumorphic shadow
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
    // Light inner border
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  eventGridImage: {
    width: '100%',
    height: 80,
    borderTopLeftRadius: borderRadius.card,
    borderTopRightRadius: borderRadius.card,
    resizeMode: 'cover',
  },
  eventGridDetails: {
    padding: spacing.sm,
    backgroundColor: neomorphColors.background,
    // Cross-platform subtle inset effect for content area
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        // Android doesn't support inset shadows well, so we'll use a subtle border
        borderTopWidth: 1,
        borderTopColor: neomorphColors.darkShadow + '20', // 20% opacity
      },
    }),
  },
  eventGridTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.bold,
  },
  eventGridMeta: {
    fontSize: typography.fontSize.xs,
    color: theme.textSecondary,
    fontFamily: typography.fontFamily.regular,
    marginBottom: spacing.xs / 2,
  },
  eventGridPrice: {
    fontSize: typography.fontSize.xs,
    color: theme.primary,
    fontWeight: '600',
    fontFamily: typography.fontFamily.semiBold,
  },
  eventsList: {
    gap: spacing.sm,
  },
  eventListCard: {
    flexDirection: 'row',
    backgroundColor: neomorphColors.background,
    borderRadius: borderRadius.card,
    marginBottom: spacing.md,
    overflow: 'hidden',
    // Cross-platform enhanced neumorphic shadow for list cards
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
    // Light inner border
    borderWidth: 1,
    borderColor: neomorphColors.lightShadow,
  },
  eventListImage: {
    width: 80,
    height: '100%',
    borderTopLeftRadius: borderRadius.card,
    borderBottomLeftRadius: borderRadius.card,
    resizeMode: 'cover',
  },
  eventListDetails: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
    backgroundColor: neomorphColors.background,
    // Cross-platform subtle inset effect for content area
    ...Platform.select({
      ios: {
        shadowColor: neomorphColors.darkShadow,
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        // Android doesn't support inset shadows well, so we'll use a subtle border
        borderLeftWidth: 1,
        borderLeftColor: neomorphColors.darkShadow + '20', // 20% opacity
      },
    }),
  },
  eventListTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.bold,
  },
  eventListMeta: {
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    fontFamily: typography.fontFamily.regular,
    marginBottom: spacing.xs / 2,
  },
  eventListFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  eventListPrice: {
    fontSize: typography.fontSize.sm,
    color: theme.primary,
    fontWeight: '600',
    fontFamily: typography.fontFamily.semiBold,
  },
  eventListDistance: {
    fontSize: typography.fontSize.xs,
    color: theme.textSecondary,
    fontFamily: typography.fontFamily.regular,
  },
});
