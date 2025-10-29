import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Clock, Users, Trash2, MapPin, UserCheck } from 'lucide-react-native';
import { formatTo12Hour } from '@/utils/formatDate';
import CountdownTimer from '@/components/CountdownTimer';
import { theme } from '@/components/theme';

interface QuickEvent {
  id: string;
  name: string;
  description: string;
  max: string;
  location: string;
  interestedUsers: { id: string }[];
  time: string;
  endTime?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
}

interface QuickEventCardProps {
  quickEvent: QuickEvent;
  myUserId?: string;
  isFirst: boolean;
  isLast: boolean;
  isAddingInterest: boolean;
  isRemovingInterest: boolean;
  isDeletingQuickEvent: boolean;
  mutatingQuickEventId: string | null;
  onAddInterest: (id: string) => void;
  onRemoveInterest: (id: string) => void;
  onDeleteQuickEvent: (id: string) => void;
}

export const QuickEventCard: React.FC<QuickEventCardProps> = ({
  quickEvent,
  myUserId,
  isFirst,
  isLast,
  isAddingInterest,
  isRemovingInterest,
  isDeletingQuickEvent,
  mutatingQuickEventId,
  onAddInterest,
  onRemoveInterest,
  onDeleteQuickEvent,
}) => {
  const isInterested = quickEvent.interestedUsers.some(
    (user) => user.id === myUserId
  );
  const isMutating =
    (isAddingInterest || isRemovingInterest) &&
    mutatingQuickEventId === quickEvent.id;
  const isEventPast = (() => {
    const now = new Date();

    if (quickEvent.endTime) {
      const [endHours, endMinutes] = quickEvent.endTime.split(':').map(Number);
      const end = new Date();
      end.setHours(endHours, endMinutes, 0, 0);
      return end < now;
    } else {
      const [startHours, startMinutes] = quickEvent.time.split(':').map(Number);
      const start = new Date();
      start.setHours(startHours, startMinutes, 0, 0);
      return start < now;
    }
  })();

  const isHost = quickEvent.user.id === myUserId;
  const isOldEvent = (() => {
    const eventDate = new Date(quickEvent.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  })();

  return (
    <TouchableOpacity
      style={[
        styles.quickEventCard,
        isFirst && styles.firstCard,
        isLast && styles.lastCard,
      ]}
      onPress={() => router.push(`/quickevent/${quickEvent.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.quickEventContent}>
        <View style={styles.quickEventHeader}>
          <Text style={styles.quickEventTitle} numberOfLines={1}>
            {quickEvent.name}
          </Text>
          {isHost && isOldEvent && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDeleteQuickEvent(quickEvent.id)}
              disabled={isDeletingQuickEvent}
            >
              {isDeletingQuickEvent &&
              mutatingQuickEventId === quickEvent.id ? (
                <ActivityIndicator color="#9CA3AF" size="small" />
              ) : (
                <Trash2 size={18} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.locationContainer}>
          <MapPin size={14} color="#64748B" />
          <Text style={styles.quickEventLocation} numberOfLines={1}>
            {quickEvent.location}
          </Text>
        </View>

        <View style={styles.quickEventMetaRow}>
          <View style={styles.quickEventMeta}>
            <Clock size={14} color={theme.primary} />
            <Text style={styles.quickEventMetaText}>
              {quickEvent.time
                ? quickEvent.endTime
                ? `${formatTo12Hour(quickEvent.time)} - ${formatTo12Hour(
                    quickEvent.endTime
                  )}`
                : formatTo12Hour(quickEvent.time)
                : 'Time not set'}
            </Text>
          </View>

          <View style={styles.quickEventMeta}>
            <Users size={14} color="#9CA3AF" />
            <Text style={styles.quickEventMetaText}>
              {quickEvent.max || 'No Limit'}
            </Text>
          </View>

         {quickEvent.interestedUsers.length>0 && <View style={styles.quickEventMeta}>
            <UserCheck size={14} color={theme.success} />
            <Text style={[styles.quickEventMetaText, { color: theme.success }]}>
              {quickEvent.interestedUsers?.length || 0} Interested
            </Text>
          </View>}
        </View>

        <View style={styles.quickEventActions}>
          <View style={styles.quickEventCreator}>
            {quickEvent.user.profilePicture ? (
              <Image
                source={{ uri: quickEvent.user.profilePicture }}
                style={styles.creatorAvatar}
                defaultSource={require('../assets/user.png')}
              />
            ) : (
              <View style={styles.creatorAvatar}>
                <Text style={styles.creatorInitial}>
                  {quickEvent.user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.creatorName}>{quickEvent.user.name}</Text>
            {isHost && (
              <View style={styles.hostBadge}>
                <Text style={styles.hostBadgeText}>Host</Text>
              </View>
            )}
          </View>
          
          {!(isHost && isOldEvent) && (
            <TouchableOpacity
              style={[
                styles.rsvpButtonSmall,
                isInterested && !isEventPast ? styles.rsvpedButtonSmall : null,
                isEventPast && styles.endedButtonSmall,
              ]}
              onPress={() =>
                !isMutating &&
                !isEventPast &&
                (isInterested
                  ? onRemoveInterest(quickEvent.id)
                  : onAddInterest(quickEvent.id))
              }
              disabled={isMutating || isEventPast}
            >
              {isMutating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.rsvpButtonTextSmall}>
                  {isEventPast ? 'Ended' : isInterested ? 'Interested' : "I'm in"}
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
  quickEventCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  firstCard: {
    marginTop: 0,
  },
  lastCard: {
    marginBottom: 0,
  },
  quickEventContent: {
    padding: 16,
  },
  quickEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  quickEventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  quickEventLocation: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  quickEventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  quickEventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickEventMetaText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  interestedIcon: {
    fontSize: 12,
    color: '#6B7280',
  },
  quickEventActions: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickEventCreator: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatorInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  hostBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 4,
  },
  hostBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.primary,
  },
  deleteButton: {
    padding: 4,
  },
  rsvpButtonSmall: {
    backgroundColor: theme.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  rsvpedButtonSmall: {
    backgroundColor: theme.success,
  },
  rsvpButtonTextSmall: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  endedButtonSmall: {
    backgroundColor: theme.gray400,
  },
});