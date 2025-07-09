import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { store } from '@/data/store';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Heart } from 'lucide-react-native';

const theme = {
  primary: '#6366F1',
  accent: '#EC4899',
  success: '#10B981',
  background: '#FAFAFA',
  white: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

export default function EventDetails() {
  const { id } = useLocalSearchParams();
  const event = store.getEventById(Number(id));

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleRSVP = () => {
    store.toggleRsvp(store.getState().currentUser.id, event.id);
    Alert.alert("RSVP Confirmed", "You are now attending this event!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image source={{ uri: event.image }} style={styles.image} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.white} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>{event.title}</Text>
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}><Calendar size={16} color={theme.textSecondary} /><Text style={styles.metaText}>{event.date}</Text></View>
            <View style={styles.metaItem}><Clock size={16} color={theme.textSecondary} /><Text style={styles.metaText}>{event.time}</Text></View>
            <View style={styles.metaItem}><MapPin size={16} color={theme.textSecondary} /><Text style={styles.metaText}>{event.location}</Text></View>
          </View>
          <Text style={styles.description}>{event.description}</Text>

           <TouchableOpacity style={styles.rsvpButton} onPress={handleRSVP}>
            <Text style={styles.rsvpButtonText}>RSVP</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.white },
  image: { width: '100%', height: 250 },
  backButton: { position: 'absolute', top: 40, left: 15, padding: 10, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20 },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 10 },
  metaContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 16, color: theme.textSecondary },
  description: { fontSize: 16, color: theme.textSecondary, lineHeight: 24, marginBottom: 20 },
  rsvpButton: { backgroundColor: theme.primary, padding: 15, borderRadius: 10, alignItems: 'center' },
  rsvpButtonText: { color: theme.white, fontSize: 18, fontWeight: 'bold' },
  header: { padding: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' }
});
