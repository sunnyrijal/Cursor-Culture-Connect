import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShareButton } from '@/components/ui/ShareButton';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import { ArrowLeft, Users, Calendar, Info, Clock, MapPin, MessageCircle, Instagram, Twitter, Facebook, Link as LinkIcon } from 'lucide-react-native';
import { mockGroups, MockGroup, mockEvents } from '@/data/mockData';
import placeholderImg from '@/assets/images/icon.png';
import { store } from '@/data/store';

// Helper to get the correct social media icon
const SocialIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case 'instagram': return <Instagram size={20} color={theme.primary} />;
    case 'twitter': return <Twitter size={20} color={theme.primary} />;
    case 'facebook': return <Facebook size={20} color={theme.primary} />;
    default: return <LinkIcon size={20} color={theme.primary} />;
  }
};

export default function GroupDetail() {
  const { id } = useLocalSearchParams();
  const [group, setGroup] = React.useState(() => mockGroups.find(g => g.id.toString() === id));

  // Modal state for members
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Placeholder members
  const members = [
    { id: 1, name: 'Aisha Patel', role: 'President' },
    { id: 2, name: 'Wei Chen', role: 'Coordinator' },
    { id: 3, name: 'Maria Rodriguez', role: 'Treasurer' },
  ];

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Group Not Found</Text>
          <View style={{ width: 40 }}/>
        </View>
        <View style={styles.centered}>
          <Text>Sorry, we couldn't find this group.</Text>
          <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  // Find past events for this group
  const pastEvents = mockEvents.filter(event => group.pastEvents?.includes(event.id));

  const generateGroupShareContent = () => {
    return {
      title: `${group.name} - Culture Connect`,
      message: `Check out ${group.name} on Culture Connect!\n\n${group.description}\n\n📍 ${group.location}\n👥 ${group.memberCount} members\n\nJoin our cultural community!`,
      url: `https://cultureconnect.app/group/${group.id}`
    };
  };

  // Handler for location click
  const handleLocationClick = () => {
    if (!group.meetingLocation) return;
    const query = encodeURIComponent(group.meetingLocation);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Location', group.meetingLocation);
    });
  };

  const handleJoinLeaveGroup = () => {
    if (group.isJoined) {
      Alert.alert(
        'Leave Group',
        'Are you sure you want to leave this group?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => {
              store.toggleGroupMembership(store.getState().currentUser.id, group.id);
              setGroup(store.getGroupById(group.id)); // Update local state to force re-render
            }
          }
        ]
      );
    } else {
      if (group.universityOnly) {
        Alert.prompt(
          'Join University Group',
          'This group requires approval. Please provide an optional message to the group administrators:',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Join', onPress: (message) => {
                store.toggleGroupMembership(store.getState().currentUser.id, group.id);
                setGroup(store.getGroupById(group.id)); // Update local state to force re-render
                Alert.alert('Request Sent', 'Your request to join has been sent to the group administrators.');
              }
            }
          ],
          'plain-text',
          ''
        );
      } else {
        store.toggleGroupMembership(store.getState().currentUser.id, group.id);
        setGroup(store.getGroupById(group.id)); // Update local state to force re-render
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{paddingHorizontal: 20}}>
        <Image source={{ uri: group.image || undefined }} defaultSource={placeholderImg} style={styles.image} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonAbsolute}>
          <ArrowLeft size={24} color={theme.white} />
        </TouchableOpacity>

        <View style={styles.shareButtonContainer}>
          <ShareButton
            {...generateGroupShareContent()}
            size={20}
            color={theme.white}
            style={styles.shareButton}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
              <Text style={styles.title}>{group.name}</Text>
              <View style={styles.actionButtons}>
                {group.isJoined && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      if (group.chatId) {
                        router.push(`/chat/${group.chatId}`);
                      } else {
                        // Create a new group chat or show a message
                        Alert.alert('Message', 'Group chat feature coming soon!');
                      }
                    }}
                  >
                      <MessageCircle size={24} color={theme.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
          </View>
          <View style={styles.tagsContainer}>
            <Badge label={group.category} variant="primary" />
            {group.isPublic ? 
              <Badge label="Public" variant="success" /> : 
              <Badge label="Private" variant="warning" />
            }
            {group.universityOnly && <Badge label="University Only" variant="info" />}
          </View>
         
          <Card style={styles.infoCard}>
            <TouchableOpacity style={styles.infoRow} onPress={() => setShowMembersModal(true)}>
              <Users size={20} color={theme.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Members</Text>
                <Text style={styles.infoValue}>{group.memberCount}</Text>
              </View>
            </TouchableOpacity>
            {group.meetingDate && (
             <View style={styles.infoRow}>
               <Calendar size={20} color={theme.primary} />
               <View style={styles.infoTextContainer}>
                 <Text style={styles.infoLabel}>Meeting Day</Text>
                 <Text style={styles.infoValue}>{group.meetingDate}</Text>
               </View>
             </View>
           )}
           {group.meetingTime && (
             <View style={styles.infoRow}>
               <Clock size={20} color={theme.primary} />
               <View style={styles.infoTextContainer}>
                 <Text style={styles.infoLabel}>Meeting Time</Text>
                 <Text style={styles.infoValue}>{group.meetingTime}</Text>
               </View>
             </View>
           )}
           {group.meetingLocation && (
             <TouchableOpacity style={styles.infoRow} onPress={handleLocationClick}>
               <MapPin size={20} color={theme.primary} />
               <View style={styles.infoTextContainer}>
                 <Text style={styles.infoLabel}>Meeting Location</Text>
                 <Text style={[styles.infoValue, { textDecorationLine: 'underline', color: theme.primary }]}>{group.meetingLocation}</Text>
               </View>
             </TouchableOpacity>
           )}
           {group.socialMedia && group.socialMedia.length > 0 && (
             <>
               <View style={styles.separator} />
               {group.socialMedia.map((social, index) => (
                 <TouchableOpacity key={index} style={styles.socialRow} onPress={() => Linking.openURL(social.link)}>
                   <SocialIcon platform={social.platform} />
                   <Text style={styles.socialLink}>{`Follow on ${social.platform}`}</Text>
                 </TouchableOpacity>
               ))}
             </>
           )}
          </Card>

          <Text style={styles.sectionTitle}>About this Group</Text>
          <Text style={styles.description}>{group.description}</Text>

          {group.isJoined && pastEvents.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Past Events</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg }}>
                {pastEvents.map(event => (
                  <TouchableOpacity key={event.id} onPress={() => router.push(`/event/${event.id}`)}>
                    <Card style={styles.eventCard}>
                      <Image source={{ uri: event.image || undefined }} defaultSource={placeholderImg} style={styles.eventImage} />
                      <Text style={styles.eventTitle} numberOfLines={2}>{event.name}</Text>
                    </Card>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {group.isJoined && group.media && group.media.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Media</Text>
              <View style={styles.mediaContainer}>
                {group.media.map((item, index) => (
                  <TouchableOpacity key={index} style={styles.mediaItem}>
                    <Image source={{ uri: item.url || undefined }} defaultSource={placeholderImg} style={styles.mediaImage} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
      {/* Members Modal */}
      {showMembersModal && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
        }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, minWidth: 320, maxWidth: 360 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Group Members</Text>
            <View style={{ gap: 12 }}>
              {members.map(m => (
                <View
                  key={m.id}
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06,
                    shadowRadius: 2,
                    elevation: 2,
                    marginBottom: 0,
                  }}
                >
                  <Text style={{ fontWeight: '600', fontSize: 16, marginBottom: 2 }}>{m.name}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{m.role}</Text>
                </View>
              ))}
            </View>
            <Button title="Close" onPress={() => setShowMembersModal(false)} style={{ marginTop: 16 }} />
          </View>
        </View>
      )}
      <View style={styles.footer}>
        <Button title={group.isJoined ? "Leave Group" : "Join Group"} onPress={handleJoinLeaveGroup} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
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
  },
  infoTextContainer: {
    marginLeft: spacing.md,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: theme.textSecondary,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: spacing.sm,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  socialLink: {
    marginLeft: spacing.md,
    color: theme.primary,
    fontFamily: typography.fontFamily.medium,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  description: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  eventCard: {
    width: 100,
    marginRight: spacing.md,
    backgroundColor: theme.white,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    alignItems: 'center',
    padding: 0,
    elevation: 2,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  eventImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
  },
  eventTitle: {
    padding: spacing.sm,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -spacing.xs,
  },
  mediaItem: {
    width: 100,
    height: 100,
    padding: spacing.xs,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
    resizeMode: 'cover',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.white,
  },
});