import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShareButton } from '@/components/ui/ShareButton';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import { ArrowLeft, Users, Calendar, Clock, MapPin } from 'lucide-react-native';
import { mockEvents } from '@/data/mockData';
import placeholderImg from '@/assets/images/icon.png';
import { store } from '@/data/store';

export default function EventDetail() {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = React.useState(() => store.getEventById(Number(id)));

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Not Found</Text>
          <View style={{ width: 40 }}/>
        </View>
        <View style={styles.centered}>
          <Text>Sorry, we couldn't find this event.</Text>
          <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  const generateEventShareContent = () => {
    return {
      title: `${event.name} - Culture Connect`,
      message: `Join me at ${event.name}!\n\n📅 ${event.date} at ${event.time}\n📍 ${event.location}\n\n${event.description}\n\nDiscover amazing cultural events on Culture Connect!`,
      url: `https://cultureconnect.app/event/${event.id}`
    };
  };

  const handleRSVP = () => {
    store.toggleRsvp(store.getState().currentUser.id, event.id);
    setEvent(store.getEventById(event.id)); // force re-render with updated RSVP status
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{alignItems: 'center', paddingHorizontal: 0}}>
        <View style={{ width: '100%', maxWidth: 600, alignSelf: 'center', overflow: 'hidden', borderRadius: 20, marginTop: 16 }}>
          <Image source={{ uri: event.image || undefined }} defaultSource={placeholderImg} style={{ width: '100%', height: 250, borderRadius: 20 }} resizeMode="cover" />
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButtonAbsolute, {zIndex: 2}]}> 
            <ArrowLeft size={24} color={theme.white} />
          </TouchableOpacity>
          <View style={styles.shareButtonContainer}>
            <ShareButton
              {...generateEventShareContent()}
              size={20}
              color={theme.white}
              style={styles.shareButton}
            />
          </View>
        </View>
        <View style={[styles.content, { width: '100%', maxWidth: 600, alignSelf: 'center' }]}> 
          <View style={styles.headerRow}>
              <Text style={styles.title}>{event.name}</Text>
          </View>
          <View style={styles.tagsContainer}>
             {event.category.map(cat => <Badge key={cat} label={cat} variant="success" />)}
          </View>
         
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Calendar size={20} color={theme.primary} />
              <Text style={styles.infoValue}>{event.date}</Text>
            </View>
            <View style={styles.infoRow}>
              <Clock size={20} color={theme.primary} />
              <Text style={styles.infoValue}>{event.time}</Text>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={20} color={theme.primary} />
              <Text style={styles.infoValue}>{event.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Users size={20} color={theme.primary} />
              <Text style={styles.infoValue}>{event.attendees} going</Text>
            </View>
          </Card>

          <Text style={styles.sectionTitle}>About this Event</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title={event.isRSVPed ? "Cancel RSVP" : "RSVP"} onPress={handleRSVP} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.white,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
  },
  backButton: {
    padding: spacing.xs,
  },
  backButtonAbsolute: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  shareButtonContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  shareButton: {
    padding: 4,
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: spacing.lg,
  },
  headerRow: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.white,
  },
});