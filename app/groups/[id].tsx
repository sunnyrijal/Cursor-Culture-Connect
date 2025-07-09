import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { store } from '@/data/store';
import { ArrowLeft, Users, MapPin, Globe, Lock, Clock, Calendar } from 'lucide-react-native';

const theme = {
  primary: '#6366F1',
  accent: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  background: '#FAFAFA',
  white: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

export default function GroupDetails() {
  const { id } = useLocalSearchParams();
  const group = store.getGroupById(Number(id));

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Group Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const handleJoin = () => {
    store.toggleGroupMembership(store.getState().currentUser.id, group.id);
    Alert.alert("Success", `You have ${group.isJoined ? 'joined' : 'left'} the group.`);
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image source={{ uri: group.image }} style={styles.image} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.white} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{group.name}</Text>
            <View style={group.isPublic ? styles.publicBadge : styles.privateBadge}>
              {group.isPublic ? <Globe size={14} color={theme.success} /> : <Lock size={14} color={theme.warning} />}
              <Text style={styles.badgeText}>{group.isPublic ? 'Public' : 'Private'}</Text>
            </View>
          </View>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}><Users size={16} color={theme.textSecondary} /><Text style={styles.metaText}>{group.memberCount} members</Text></View>
            <View style={styles.metaItem}><MapPin size={16} color={theme.textSecondary} /><Text style={styles.metaText}>{group.location}</Text></View>
          </View>
          
          <Text style={styles.description}>{group.description}</Text>

          {group.meetingTime && (
            <View style={styles.meetingDetails}>
                <Text style={styles.sectionTitle}>Meeting Information</Text>
                <View style={styles.metaItem}><Clock size={16} color={theme.textSecondary} /><Text style={styles.metaText}>Time: {group.meetingTime}</Text></View>
                <View style={styles.metaItem}><Calendar size={16} color={theme.textSecondary} /><Text style={styles.metaText}>Days: {group.meetingDays?.join(', ')}</Text></View>
                <View style={styles.metaItem}><MapPin size={16} color={theme.textSecondary} /><Text style={styles.metaText}>Location: {group.meetingLocation}</Text></View>
            </View>
          )}

           <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
            <Text style={styles.joinButtonText}>{group.isJoined ? 'Leave Group' : 'Join Group'}</Text>
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
  titleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.textPrimary },
  publicBadge: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: '#e7f7ef', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15 },
  privateBadge: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: '#fff8e1', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15 },
  badgeText: { fontSize: 14, fontWeight: '600' },
  metaContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 16, color: theme.textSecondary },
  description: { fontSize: 16, color: theme.textSecondary, lineHeight: 24, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: theme.textPrimary, marginBottom: 10 },
  meetingDetails: { marginTop: 10, marginBottom: 20, gap: 8 },
  joinButton: { backgroundColor: theme.primary, padding: 15, borderRadius: 10, alignItems: 'center' },
  joinButtonText: { color: theme.white, fontSize: 18, fontWeight: 'bold' },
  header: { padding: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' }
});
