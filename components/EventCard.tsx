import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {
  MapPin,
  Calendar,
  Users,
} from 'lucide-react-native';
import { theme } from '@/components/theme';
import { formatDate, formatTime } from '@/utils/formatDate';

interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  imageUrl?: string | null;
  userId: string;
  attendingUsers: any;
  eventTimes: {
    id: number;
    eventId: string;
    startTime: string;
    endTime: string;
  }[];
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface EventCardProps {
  event: Event;
  myUserId?: string;
  isFirst?: boolean;
  isLast?: boolean;
  onPress: () => void;
  onRSVP: () => void;
  isLoading?: boolean;
}



export const EventCard: React.FC<EventCardProps> = ({
  event,
  myUserId,
  isFirst,
  isLast,
  onPress,
  onRSVP,
  isLoading = false,
}) => {
  const isAttending = event?.attendingUsers?.some(
    (attendee: any) => attendee.id === myUserId
  );

  return (
    <TouchableOpacity
      style={[
        styles.eventCard,
        isFirst && styles.firstCard,
        isLast && styles.lastCard,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isLoading}
    >
      <View style={styles.eventImageContainer}>
        <Image
          source={{
            uri: event.imageUrl || 'https://via.placeholder.com/150',
          }}
          style={styles.eventImage}
        />
        <View style={styles.imageOverlay} />
      </View>

      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {event.name}
          </Text>
        </View>

        <View style={styles.eventMeta}>
          <MapPin size={16} color="#64748B" />
          <Text style={styles.eventMetaText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        {event.eventTimes && event.eventTimes.length > 0 && (
          <View style={styles.eventMeta}>
            <Calendar size={16} color="#6366F1" />
            <Text style={styles.eventMetaText}>
              {formatDate(event.eventTimes[0].startTime)} at{' '}
              {formatTime(event.eventTimes[0].startTime)}
            </Text>
          </View>
        )}

        <View style={styles.creatorSection}>
          <View style={styles.creatorInfo}>
            <View style={styles.creatorAvatar}>
              <Text style={styles.creatorInitial}>
                {event.user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.creatorDetails}>
              <Text style={styles.creatorName}>
                {event.user.name}
              </Text>
              <Text style={styles.creatorRole}>
                Event Organizer
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <Users size={16} color="#6366F1" />
              <Text style={styles.statText}>
                {event?.attendingUsers?.length || 0} attending
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.rsvpButton,
              isAttending && styles.rsvpedButton,
            ]}
            onPress={onRSVP}
            disabled={isLoading}
          >
            <Text style={[
              styles.rsvpButtonText,
              isAttending && styles.rsvpedButtonText,
            ]}>
              {isAttending ? 'Going' : 'RSVP'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  firstCard: {
    marginTop: 0,
  },
  
  lastCard: {
    marginBottom: 0,
  },

  eventImageContainer: {
    height: 120,
    position: 'relative',
    backgroundColor: '#6366F1',
    overflow: 'hidden',
  },

  eventImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#94A3B8',
  },

  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },

  eventContent: {
    padding: 20,
  },

  eventHeader: {
    marginBottom: 12,
  },

  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 24,
    letterSpacing: -0.3,
  },

  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },

  eventMetaText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },

  creatorSection: {
    marginBottom: 16,
    marginTop: 12,
  },

  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  creatorInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  creatorDetails: {
    flex: 1,
  },

  creatorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.2,
  },

  creatorRole: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },

  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },

  statsSection: {
    flex: 1,
  },

  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  statText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },

  rsvpButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    minWidth: 80,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  rsvpedButton: {
    backgroundColor: theme.success,
    borderColor: 'rgba(255,255,255,0.8)',
  },

  rsvpButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },

  rsvpedButtonText: {
    color: 'white',
  },
});