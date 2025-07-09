// Bolt final week/app/groups-joined.tsx

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { theme, spacing, typography, borderRadius } from '@/components/theme';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  MapPin, 
  Clock,
  MessageCircle, // Imported MessageCircle
  Heart,
  ChevronRight,
  UserPlus,
  Share2
} from 'lucide-react-native';
import { mockGroups, mockEvents, MockGroup, MockEvent } from '@/data/mockData';

export default function GroupsJoined() {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  // Filter only joined groups
  const joinedGroups = useMemo(() => {
    return mockGroups
      .filter(group => group.isJoined)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Get events associated with joined groups
  const groupEvents = useMemo(() => {
    const events: Record<number, MockEvent[]> = {};
    
    joinedGroups.forEach(group => {
      // Filter events that match the group's category or are organized by similar organizations
      const relatedEvents = mockEvents.filter(event => {
        // Check if event categories overlap with group category
        const hasMatchingCategory = event.category.some(eventCat => 
          group.category.toLowerCase().includes(eventCat.toLowerCase()) ||
          eventCat.toLowerCase().includes(group.category.toLowerCase()) ||
          group.name.toLowerCase().includes(eventCat.toLowerCase())
        );
        
        // Check if organizer matches group type
        const hasMatchingOrganizer = event.organizer.toLowerCase().includes(group.category.toLowerCase()) ||
          group.name.toLowerCase().includes(event.organizer.toLowerCase().split(' ')[0]);
        
        return hasMatchingCategory || hasMatchingOrganizer;
      });
      
      // Separate into past and upcoming events
      const now = new Date();
      const upcoming = relatedEvents.filter(event => new Date(event.date) >= now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const past = relatedEvents.filter(event => new Date(event.date) < now).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort past events descending
      
      events[group.id] = { upcoming, past };
    });
    
    return events;
  }, [joinedGroups]);

  // Get all upcoming events from joined groups, sorted chronologically and deduplicated
  const allUpcomingGroupEvents = useMemo(() => {
    const allEvents = Object.values(groupEvents).flatMap(e => e.upcoming);
    
    // Deduplicate events by ID to prevent duplicate keys
    const uniqueEvents = allEvents.filter((event, index, array) => 
      array.findIndex(e => e.id === event.id) === index
    );
    
    return uniqueEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [groupEvents]);

  const handleRSVP = (eventId: number) => {
    console.log('RSVP to event:', eventId);
  };

  const handleFavorite = (eventId: number) => {
    console.log('Favorite event:', eventId);
  };

  const handleJoinGroup = (groupId: number) => {
    console.log('Manage group membership:', groupId);
  };

  const handleViewGroup = (groupId: number) => {
    console.log('View group details:', groupId);
    // Navigate to group detail page
    router.push(`/group/${groupId}`);
  };

  const handleViewEvent = (eventId: number) => {
    console.log('View event details:', eventId);
    // Navigate to event detail page
    router.push(`/event/${eventId}`);
  };

  // New handler for message icon click
  const handleMessageGroup = (groupId: number) => {
    console.log('Message group:', groupId);
    router.push(`/chat/${groupId}`); // Navigate to group chat
  };

  if (joinedGroups.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>My Groups</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.emptyState}>
          <Users size={64} color={theme.gray400} />
          <Text style={styles.emptyTitle}>No Groups Joined</Text>
          <Text style={styles.emptyMessage}>
            You haven't joined any groups yet. Explore groups to connect with students who share your interests and heritage.
          </Text>
          <Button
            title="Explore Groups"
            onPress={() => router.push('/groups')}
            style={styles.exploreButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Groups</Text>
        <TouchableOpacity onPress={() => router.push('/groups')} style={styles.addButton}>
          <UserPlus size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Stats */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{joinedGroups.length}</Text>
              <Text style={styles.statLabel}>Groups Joined</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{allUpcomingGroupEvents.length}</Text> {/* Updated count */}
              <Text style={styles.statLabel}>Upcoming Events</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {joinedGroups.reduce((sum, group) => sum + group.memberCount, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Members</Text>
            </View>
          </View>
        </Card>

        {/* Groups List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Groups ({joinedGroups.length})</Text>
          
          {joinedGroups.map((group) => (
            <Card key={group.id} style={styles.groupCard}>
              {/* This TouchableOpacity around groupHeader is retained for main group view navigation */}
              <TouchableOpacity
                onPress={() => handleViewGroup(group.id)}
                activeOpacity={0.7}
              >
                <View style={styles.groupHeader}>
                  <Image source={{ uri: group.image }} style={styles.groupImage} />
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <View style={styles.groupMeta}>
                      <Users size={12} color={theme.gray500} />
                      <Text style={styles.groupMetaText}>{group.memberCount} members</Text>
                    </View>
                    <View style={styles.groupMeta}>
                      <MapPin size={12} color={theme.gray500} />
                      <Text style={styles.groupMetaText}>{group.location}</Text>
                    </View>
                    <View style={styles.groupBadges}>
                      <Badge 
                        label={group.isPublic ? "Public" : "Private"} 
                        variant={group.isPublic ? "success" : "warning"} 
                        size="sm"
                      />
                      {group.universityOnly && (
                        <Badge label="University-Only" variant="info" size="sm" />
                      )}
                    </View>
                  </View>
                  {/* ChevronRight for navigation to group details */}
                  <ChevronRight size={20} color={theme.gray400} />
                </View>
              </TouchableOpacity>

              <Text style={styles.groupDescription}>{group.description}</Text>

              {/* Group Events - Upcoming */}
              {groupEvents[group.id]?.upcoming.length > 0 && (
                <View style={styles.groupEventsSection}>
                  <View style={styles.groupEventsHeader}>
                    <Text style={styles.groupEventsTitle}>
                      Upcoming Events ({groupEvents[group.id].upcoming.length})
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSelectedGroupId(
                        selectedGroupId === group.id ? null : group.id
                      )}
                    >
                      <Text style={styles.toggleText}>
                        {selectedGroupId === group.id ? 'Hide' : 'Show'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {selectedGroupId === group.id && (
                    <View style={styles.eventsList}>
                      {groupEvents[group.id].upcoming.slice(0, 3).map((event) => (
                        <TouchableOpacity
                          key={event.id}
                          onPress={() => handleViewEvent(event.id)}
                          style={styles.eventItem}
                          activeOpacity={0.7}
                        >
                          <Image source={{ uri: event.image }} style={styles.eventImage} />
                          <View style={styles.eventInfo}>
                            <Text style={styles.eventTitle}>{event.title}</Text>
                            <View style={styles.eventMeta}>
                              <Calendar size={10} color={theme.gray500} />
                              <Text style={styles.eventMetaText}>{event.date}</Text>
                            </View>
                            <View style={styles.eventMeta}>
                              <MapPin size={10} color={theme.gray500} />
                              <Text style={styles.eventMetaText}>{event.location}</Text>
                            </View>
                            <View style={styles.eventTags}>
                              {event.category.slice(0, 2).map((tag, index) => (
                                <Badge 
                                  key={index}
                                  label={tag}
                                  variant="success"
                                  size="sm"
                                />
                              ))}
                            </View>
                          </View>
                          <View style={styles.eventActions}>
                            <TouchableOpacity
                              onPress={() => handleRSVP(event.id)}
                              style={[styles.eventActionButton, event.isRSVPed && styles.eventActionButtonActive]}
                            >
                              <Calendar size={12} color={event.isRSVPed ? theme.white : theme.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleFavorite(event.id)}
                              style={[styles.eventActionButton, event.isFavorited && styles.eventActionButtonFavorite]}
                            >
                              <Heart 
                                size={12} 
                                color={event.isFavorited ? theme.white : theme.accent}
                                fill={event.isFavorited ? theme.accent : 'none'}
                              />
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      ))}
                      
                      {groupEvents[group.id].upcoming.length > 3 && (
                        <TouchableOpacity style={styles.viewMoreButton}>
                          <Text style={styles.viewMoreText}>
                            View {groupEvents[group.id].upcoming.length - 3} more upcoming events
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* Group Events - Past */}
              {groupEvents[group.id]?.past.length > 0 && (
                <View style={styles.groupEventsSection}>
                  <View style={styles.groupEventsHeader}>
                    <Text style={styles.groupEventsTitle}>
                      Past Events ({groupEvents[group.id].past.length})
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSelectedGroupId(
                        selectedGroupId === `past-${group.id}` ? null : `past-${group.id}`
                      )}
                    >
                      <Text style={styles.toggleText}>
                        {selectedGroupId === `past-${group.id}` ? 'Hide' : 'Show'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {selectedGroupId === `past-${group.id}` && (
                    <View style={styles.eventsList}>
                      {groupEvents[group.id].past.slice(0, 3).map((event) => (
                        <TouchableOpacity
                          key={event.id}
                          onPress={() => handleViewEvent(event.id)}
                          style={styles.eventItem}
                          activeOpacity={0.7}
                        >
                          <Image source={{ uri: event.image }} style={styles.eventImage} />
                          <View style={styles.eventInfo}>
                            <Text style={styles.eventTitle}>{event.title}</Text>
                            <View style={styles.eventMeta}>
                              <Calendar size={10} color={theme.gray500} />
                              <Text style={styles.eventMetaText}>{event.date}</Text>
                            </View>
                            <View style={styles.eventMeta}>
                              <MapPin size={10} color={theme.gray500} />
                              <Text style={styles.eventMetaText}>{event.location}</Text>
                            </View>
                            <View style={styles.eventTags}>
                              {event.category.slice(0, 2).map((tag, index) => (
                                <Badge 
                                  key={index}
                                  label={tag}
                                  variant="secondary" // Past events can have a different badge style
                                  size="sm"
                                />
                              ))}
                            </View>
                          </View>
                          <View style={styles.eventActions}>
                            {/* Actions for past events might be different, e.g., 'View Photos' */}
                          </View>
                        </TouchableOpacity>
                      ))}
                      
                      {groupEvents[group.id].past.length > 3 && (
                        <TouchableOpacity style={styles.viewMoreButton}>
                          <Text style={styles.viewMoreText}>
                            View {groupEvents[group.id].past.length - 3} more past events
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* Media Section */}
              <View style={styles.mediaSection}>
                <Text style={styles.sectionTitle}>Media</Text>
                {/* Assuming mockGroups might have a media array, or placeholder */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaGallery}>
                  {group.media && group.media.length > 0 ? (
                    group.media.map((mediaUri, index) => (
                      <Image key={index} source={{ uri: mediaUri }} style={styles.mediaItem} />
                    ))
                  ) : (
                    <>
                      <Image source={{ uri: `https://placehold.co/100x100/A0A0A0/FFFFFF?text=Media+1` }} style={styles.mediaItem} />
                      <Image source={{ uri: `https://placehold.co/100x100/B0B0B0/FFFFFF?text=Media+2` }} style={styles.mediaItem} />
                      <Image source={{ uri: `https://placehold.co/100x100/C0C0C0/FFFFFF?text=Media+3` }} style={styles.mediaItem} />
                    </>
                  )}
                </ScrollView>
              </View>


              <View style={styles.groupActions}>
                {/* Message Icon - Moved here, left of Share button, using Button component for consistent styling */}
                <Button
                  title="Message" 
                  variant="outline" // Changed to outline for better visibility next to other buttons
                  onPress={() => handleMessageGroup(group.id)} 
                  style={styles.groupActionButton}
                  size="sm"
                  iconLeft={<MessageCircle size={16} color={theme.primary} />} // Use primary color for outline variant
                />
                <Button
                  title="View Group"
                  variant="outline"
                  onPress={() => handleViewGroup(group.id)}
                  style={styles.groupActionButton}
                  size="sm"
                />
                <Button
                  title="Share"
                  variant="ghost"
                  onPress={() => {}}
                  size="sm"
                  style={styles.groupActionButton}
                />
              </View>
            </Card>
          ))}
        </View>

        {/* All Upcoming Events */}
        {allUpcomingGroupEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Upcoming Events ({allUpcomingGroupEvents.length})</Text>
            
            {allUpcomingGroupEvents.slice(0, 5).map((event) => (
              <Card key={event.id} style={styles.eventCard}>
                <TouchableOpacity
                  onPress={() => handleViewEvent(event.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.eventCardHeader}>
                    <Image source={{ uri: event.image }} style={styles.eventCardImage} />
                    <View style={styles.eventCardInfo}>
                      <Text style={styles.eventCardTitle}>{event.title}</Text>
                      <View style={styles.eventCardMeta}>
                        <Calendar size={12} color={theme.gray500} />
                        <Text style={styles.eventCardMetaText}>{event.date}</Text>
                      </View>
                      <View style={styles.eventCardMeta}>
                        <MapPin size={12} color={theme.gray500} />
                        <Text style={styles.eventCardMetaText}>{event.location}</Text>
                      </View>
                      <View style={styles.eventCardMeta}>
                        <Users size={12} color={theme.gray500} />
                        <Text style={styles.eventCardMetaText}>{event.attendees} attending</Text>
                      </View>
                    </View>
                    <View style={styles.eventCardActions}>
                      <TouchableOpacity
                        onPress={() => handleRSVP(event.id)}
                        style={[styles.eventCardActionButton, event.isRSVPed && styles.eventCardActionButtonActive]}
                      >
                        <Calendar size={14} color={event.isRSVPed ? theme.white : theme.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleFavorite(event.id)}
                        style={[styles.eventCardActionButton, event.isFavorited && styles.eventCardActionButtonFavorite]}
                      >
                        <Heart 
                          size={14} 
                          color={event.isFavorited ? theme.white : theme.accent}
                          fill={event.isFavorited ? theme.accent : 'none'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </Card>
            ))}

            {allUpcomingGroupEvents.length > 5 && (
              <Button
                title={`View All ${allUpcomingGroupEvents.length} Events`}
                variant="outline"
                onPress={() => router.push('/events')}
                style={styles.viewAllButton}
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.white,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
  },
  addButton: {
    padding: spacing.xs,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    marginBottom: spacing.xl,
  },
  exploreButton: {
    paddingHorizontal: spacing.xl,
  },
  summaryCard: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: theme.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: theme.textPrimary,
    marginBottom: spacing.md,
  },
  groupCard: {
    marginBottom: spacing.md,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  groupImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.primary,
    marginBottom: spacing.xs,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  groupMetaText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    marginLeft: spacing.xs,
  },
  groupBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  groupDescription: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    marginBottom: spacing.md,
  },
  groupEventsSection: {
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  groupEventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  groupEventsTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
  },
  toggleText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: theme.primary,
  },
  eventsList: {
    gap: spacing.sm,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.gray50,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  eventImage: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  eventMetaText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    marginLeft: spacing.xs / 2,
  },
  eventTags: {
    flexDirection: 'row',
    gap: spacing.xs / 2,
    marginTop: spacing.xs / 2,
  },
  eventActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  eventActionButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventActionButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  eventActionButtonFavorite: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  viewMoreButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  viewMoreText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: theme.primary,
  },
  groupActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md, // Added margin to space from description
  },
  groupActionButton: {
    flex: 1,
  },
  eventCard: {
    marginBottom: spacing.sm,
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventCardImage: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  eventCardInfo: {
    flex: 1,
  },
  eventCardTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: theme.textPrimary,
    marginBottom: spacing.xs,
  },
  eventCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  eventCardMetaText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: theme.textSecondary,
    marginLeft: spacing.xs,
  },
  eventCardActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  eventCardActionButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCardActionButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  eventCardActionButtonFavorite: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  viewAllButton: {
    marginTop: spacing.md,
  },
  // Removed messageIconContainer style as it's no longer absolutely positioned
  // New styles for media section
  mediaSection: {
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  mediaGallery: {
    gap: spacing.sm,
  },
  mediaItem: {
    width: 100, // Fixed width for media items
    height: 100, // Fixed height for media items
    borderRadius: borderRadius.md,
    resizeMode: 'cover',
  },
});
