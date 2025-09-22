// project/components/university/EventsList.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import {
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  Users,
} from 'lucide-react-native';

interface EventTime {
  id: number;
  eventId: string;
  startTime: string;
  endTime: string;
}

interface EventUser {
  id: string;
  email: string;
  name: string;
}

interface Event {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  location: string;
  userId: string;
  date: string;
  UniversityOnly: boolean;
  associatedGroupId: string | null;
  eventTimes: EventTime[];
  user: EventUser;
  associatedGroup: any;
}

interface EventsListProps {
  events: Event[];
}

const EventsList: React.FC<EventsListProps> = ({ events }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getEventTime = (eventTimes: EventTime[]) => {
    if (!eventTimes || eventTimes.length === 0) return 'Time TBD';
    const firstTime = eventTimes[0];
    return `${formatTime(firstTime.startTime)} - ${formatTime(
      firstTime.endTime
    )}`;
  };

  if (events.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Calendar size={48} color={theme.gray400} />
        <Text style={styles.emptyStateTitle}>No Events Found</Text>
        <Text style={styles.emptyStateText}>
          There are currently no events available at your university. Check back
          later for updates!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.eventsList}>
      {events.map((event) => (
        <TouchableOpacity
          key={event.id}
          onPress={() => router.push(`/event/${event.id}`)}
          style={styles.eventCard}
        >
          {/* <Image
            source={{
              uri: event.imageUrl || require('../../assets/logo.png'),
            }}
            style={styles.eventImage}
          /> */}

          <Image
            source={
              event.imageUrl
                ? { uri: event.imageUrl }
                : require('../../assets/logo.png')
            }
            style={styles.eventImage}
            defaultSource={require('../../assets/logo.png')}
          />
          <View style={styles.eventInfo}>
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.eventDescription} numberOfLines={2}>
              {event.description}
            </Text>
            <View style={styles.eventMeta}>
              <View style={styles.metaRow}>
                <Calendar size={14} color={theme.gray500} />
                <Text style={styles.metaText}>{formatDate(event.date)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Clock size={14} color={theme.gray500} />
                <Text style={styles.metaText}>
                  {getEventTime(event.eventTimes)}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <MapPin size={14} color={theme.gray500} />
                <Text style={styles.metaText}>{event.location}</Text>
              </View>
              <View style={styles.metaRow}>
                <Users size={14} color={theme.gray500} />
                <Text style={styles.metaText}>by {event.user.name}</Text>
              </View>
            </View>
          </View>
          <ChevronRight size={20} color={theme.gray400} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  eventsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  eventImage: {
    width: 100,
    height: '100%',
    borderRadius: 12,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: theme.gray600,
    marginBottom: 8,
    lineHeight: 20,
  },
  eventMeta: {
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: theme.gray500,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 15,
    color: theme.gray500,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default EventsList;
