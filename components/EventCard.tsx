import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Trash2 } from 'lucide-react-native';
import {
  MapPin,
  Calendar,
  Users,
  Crown,
} from 'lucide-react-native';
import { theme } from '@/components/theme';
import { router } from 'expo-router';
import { formatDate, formatTime } from '@/utils/formatDate';

interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  imageUrl?: string | null;
  userId: string;
  attendingUsers: any;
  requiresTravel?: boolean;
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
    profilePicture?: string | null;
  };
  associatedGroup?: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

interface EventCardProps {
  event: Event;
  myUserId?: string;
  isFirst?: boolean;
  isLast?: boolean;
  onPress: () => void;
  onRSVP: (data?: { preference?: string; message?: string }) => void;
  isLoading?: boolean;
  onOpenTransportModal?: () => void;
  onDelete?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  myUserId,
  isFirst,
  isLast,
  onPress,
  onRSVP,
  isLoading = false,
  onOpenTransportModal,
  onDelete,
}) => {
  const isAttending = event?.attendingUsers?.some(
    (attendee: any) => attendee.id === myUserId
  );

  const eventTime = event.eventTimes?.[0];
  const isEventPast = eventTime
    ? new Date(eventTime.endTime || eventTime.startTime) < new Date()
    : false;

  const isHost = event.userId === myUserId;

  const organizerName = event.associatedGroup?.name || event.user.name;
  const organizerImage =
    event.associatedGroup?.imageUrl || event.user.profilePicture;
  const organizerRole = event.associatedGroup ? 'Group Event' : 'Event Organizer';

  const handleOrganizerPress = () => {
    // Prevent navigating to your own public profile, go to main profile instead
    if (event.user.id === myUserId) {
      router.push('/profile');
    } else if (event.associatedGroup) {
      router.push(`/group/${event.associatedGroup.id}`)
    } else {
      router.push(`/public/profile/${event.user.id}`);
    }
  };

  const handleRSVP = () => {
    if (event.requiresTravel && !isAttending) {
      // Open transportation modal for events requiring travel
      if (onOpenTransportModal) {
        onOpenTransportModal();
      }
    } else {
      // Direct RSVP for leaving or for events without travel requirement
      onRSVP();
    }
  };

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
        {event.imageUrl ? (
          <Image
            source={{
              uri: event.imageUrl,
            }}
            style={styles.eventImage}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Calendar size={40} color={theme.gray400} />
          </View>
        )}
        <View style={styles.imageOverlay} />
        
        {/* Host Badge */}
        {isHost && (
          <View style={styles.hostBadge}>
            {/* <Crown size={14} color="#FFD700" fill="#FFD700" /> */}
            <Text style={styles.hostBadgeText}>Host</Text>
          </View>
        )}
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
            {organizerImage ? (
               <Image
              source={{
                uri:
                  organizerImage ||
                  'https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png',
              }}
              style={styles.creatorAvatar}
              defaultSource={require('../assets/user.png')}
            />
            ) : (
              <View style={styles.creatorAvatar}>
                <Text style={styles.creatorInitial}>
                  {organizerName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.creatorDetails}>
              <TouchableOpacity onPress={handleOrganizerPress} activeOpacity={0.7}>
                <Text style={styles.creatorName}>
                  {organizerName}
                </Text>
              </TouchableOpacity>
              <Text style={styles.creatorRole}>
                {organizerRole}
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

          {isHost && isEventPast && onDelete ? (
            <TouchableOpacity
              style={[styles.rsvpButton, styles.deleteButton]}
              onPress={onDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Trash2 size={16} color="white" />
                  <Text style={styles.rsvpButtonText}>Delete</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.rsvpButton,
                isAttending && !isEventPast && styles.rsvpedButton,
                (isLoading || isEventPast) && styles.disabledButton,
              ]}
              onPress={handleRSVP}
              disabled={isLoading || isEventPast}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.rsvpButtonText,
                    isAttending && !isEventPast && styles.rsvpedButtonText,
                  ]}
                >
                  {isEventPast ? 'Ended' : isAttending ? 'Going' : 'RSVP'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#CDD2D8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
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
    height: 100,
    position: 'relative',
    backgroundColor: '#6366F1',
    overflow: 'hidden',
  },

  eventImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#94A3B8',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },

  hostBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },

  hostBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  eventContent: {
    padding: 16,
  },

  eventHeader: {
    marginBottom: 8,
  },

  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 24,
    letterSpacing: -0.3,
  },

  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },

  eventMetaText: {
    fontSize: 13,
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
    paddingHorizontal: 4, // Minimal padding
    paddingVertical: 4,
  },

  statText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  marginLeft: 6,
    flex: 1,
  },

  rsvpButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
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

  deleteButton: {
    backgroundColor: theme.error,
    gap: 8,
  },

  disabledButton: {
    opacity: 0.6,
  },

  rsvpButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },

  rsvpedButtonText: {
    color: 'white',
  },
});