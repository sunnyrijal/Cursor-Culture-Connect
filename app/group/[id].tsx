import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, MapPin, Calendar, ArrowLeft, Shield, Globe, MessageSquare, Bell } from 'lucide-react-native';
import { theme } from '@/components/theme';
import { Button } from '@/components/ui/Button';
import { getGroupById, requestJoinGroup } from '@/data/services/groupService';
import { getGroupEvents } from '@/data/services/eventService';
import { useAuth } from '@/context/AuthContext';

interface GroupEvent {
  id: string;
  title: string;
  date: string;
  image?: string;
}

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const groupId = Array.isArray(id) ? id[0] : id;
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [joiningGroup, setJoiningGroup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'events' | 'members'>('about');
  const { user } = useAuth();

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch group details
        const groupResponse = await getGroupById(groupId);
        if (groupResponse.success && groupResponse.group) {
          setGroup(groupResponse.group);
          
          // Fetch group events
          try {
            const eventsResponse = await getGroupEvents(groupId);
            if (eventsResponse.success && eventsResponse.events) {
              setEvents(eventsResponse.events);
            }
          } catch (eventError) {
            console.error('Error fetching group events:', eventError);
          }
        } else {
          setError('Failed to fetch group details');
        }
      } catch (err) {
        console.error('Error fetching group:', err);
        setError('Failed to fetch group details');
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  const handleJoinGroup = async () => {
    try {
      setJoiningGroup(true);
      setError(null);
      
      if (group.isJoined) {
        // Already joined - this should be handled differently
        return;
      }
      
      const response = await requestJoinGroup(groupId);
      if (response.success) {
        // Update the group data with pending request status
        setGroup({
          ...group,
          hasPendingRequest: true
        });
      } else {
        setError('Failed to send join request');
      }
    } catch (err) {
      console.error('Error joining group:', err);
      setError('Failed to send join request');
    } finally {
      setJoiningGroup(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading group details...</Text>
      </View>
    );
  }

  if (error || !group) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Group not found'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={theme.text} />
            </TouchableOpacity>
          ),
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Group Header */}
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: group.image }}
            style={styles.coverImage}
          />
          
          <View style={styles.groupMetaContainer}>
            <Text style={styles.groupName}>{group.name}</Text>
            
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Users size={16} color={theme.textSecondary} />
                <Text style={styles.statText}>{group.memberCount} members</Text>
              </View>
              
              {group.location && (
                <View style={styles.statItem}>
                  <MapPin size={16} color={theme.textSecondary} />
                  <Text style={styles.statText}>{group.location}</Text>
                </View>
              )}
            </View>

            <View style={styles.categoryBadge}>
              {group.category && (
                <Text style={styles.categoryText}>{group.category}</Text>
              )}
            </View>
            
            {/* Join/Request Button */}
            {!group.isMember && !group.hasPendingRequest && (
              <Button
                title={joiningGroup ? "Sending Request..." : "Join Group"}
                onPress={handleJoinGroup}
                disabled={joiningGroup}
                style={styles.joinButton}
              />
            )}
            
            {group.hasPendingRequest && !group.isMember && (
              <View style={styles.pendingRequestBadge}>
                <Bell size={16} color={theme.warning} />
                <Text style={styles.pendingRequestText}>Request Pending</Text>
              </View>
            )}
            
            {group.isMember && (
              <View style={styles.memberBadge}>
                <Users size={16} color={theme.success} />
                <Text style={styles.memberText}>You're a member</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'about' && styles.activeTab
            ]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'about' && styles.activeTabText
            ]}>About</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'events' && styles.activeTab
            ]}
            onPress={() => setActiveTab('events')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'events' && styles.activeTabText
            ]}>Events</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'members' && styles.activeTab
            ]}
            onPress={() => setActiveTab('members')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'members' && styles.activeTabText
            ]}>Members</Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Content */}
        <View style={styles.tabContent}>
          {/* About Tab */}
          {activeTab === 'about' && (
            <View>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{group.description}</Text>
              
              {(group.meetingTime || group.meetingDate || group.meetingLocation) && (
                <>
                  <Text style={styles.sectionTitle}>Meeting Details</Text>
                  <View style={styles.meetingDetails}>
                    {group.meetingDate && (
                      <View style={styles.meetingDetail}>
                        <Calendar size={16} color={theme.textSecondary} />
                        <Text style={styles.meetingDetailText}>{group.meetingDate}</Text>
                      </View>
                    )}
                    
                    {group.meetingTime && (
                      <View style={styles.meetingDetail}>
                        <Calendar size={16} color={theme.textSecondary} />
                        <Text style={styles.meetingDetailText}>{group.meetingTime}</Text>
                      </View>
                    )}
                    
                    {group.meetingLocation && (
                      <View style={styles.meetingDetail}>
                        <MapPin size={16} color={theme.textSecondary} />
                        <Text style={styles.meetingDetailText}>{group.meetingLocation}</Text>
                      </View>
                    )}
                  </View>
                </>
              )}
              
              <View style={styles.adminSection}>
                <Text style={styles.sectionTitle}>Group Admin</Text>
                {group.president && (
                  <View style={styles.adminCard}>
                    <Image 
                      source={{ uri: group.president.avatar || 'https://placehold.co/100x100/ddd/aaa?text=User' }} 
                      style={styles.adminAvatar}
                    />
                    <View style={styles.adminInfo}>
                      <Text style={styles.adminName}>{group.president.fullName}</Text>
                      <View style={styles.adminBadge}>
                        <Shield size={12} color={theme.primary} />
                        <Text style={styles.adminBadgeText}>Group Admin</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
              
              {group.isPublic !== undefined && (
                <View style={styles.privacySection}>
                  <Text style={styles.sectionTitle}>Privacy</Text>
                  <View style={styles.privacyBadge}>
                    {group.isPublic ? (
                      <>
                        <Globe size={16} color={theme.success} />
                        <Text style={[styles.privacyText, { color: theme.success }]}>
                          Public Group
                        </Text>
                      </>
                    ) : (
                      <>
                        <Shield size={16} color={theme.warning} />
                        <Text style={[styles.privacyText, { color: theme.warning }]}>
                          Private Group
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}
          
          {/* Events Tab */}
          {activeTab === 'events' && (
            <View>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              
              {events.length === 0 ? (
                <Text style={styles.noContentText}>No upcoming events</Text>
              ) : (
                <View style={styles.eventsList}>
                  {events.map((event) => (
                    <TouchableOpacity 
                      key={event.id} 
                      style={styles.eventCard}
                      onPress={() => router.push(`/event/${event.id}`)}
                    >
                      {event.image && (
                        <Image 
                          source={{ uri: event.image }} 
                          style={styles.eventImage} 
                        />
                      )}
                      <View style={styles.eventDetails}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <View style={styles.eventDate}>
                          <Calendar size={14} color={theme.textSecondary} />
                          <Text style={styles.eventDateText}>{event.date}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {group.isMember && (
                <Button 
                  title="Create Event" 
                  onPress={() => router.push('/events/create')} 
                  style={styles.createEventButton}
                />
              )}
            </View>
          )}
          
          {/* Members Tab */}
          {activeTab === 'members' && (
            <View>
              <Text style={styles.sectionTitle}>Group Members</Text>
              
              {!group.members || group.members.length === 0 ? (
                <Text style={styles.noContentText}>No members to display</Text>
              ) : (
                <View style={styles.membersList}>
                  {group.members.map((member: any) => (
                    <TouchableOpacity 
                      key={member.id} 
                      style={styles.memberCard}
                      onPress={() => router.push(`/profile/public/${member.id}`)}
                    >
                      <Image 
                        source={{ uri: member.avatar || 'https://placehold.co/100x100/ddd/aaa?text=User' }} 
                        style={styles.memberAvatar} 
                      />
                      <View style={styles.memberDetails}>
                        <Text style={styles.memberName}>{member.fullName}</Text>
                        {member.university && (
                          <Text style={styles.memberUniversity}>{member.university}</Text>
                        )}
                        {group.president && member.id === group.president.id && (
                          <View style={styles.adminBadge}>
                            <Shield size={12} color={theme.primary} />
                            <Text style={styles.adminBadgeText}>Group Admin</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {group.isMember && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => router.push(`/chat/${group.chatId || groupId}`)}
          >
            <MessageSquare size={20} color={theme.white} />
            <Text style={styles.chatButtonText}>Group Chat</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: theme.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: theme.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: theme.cardBackground,
    marginBottom: 16,
  },
  coverImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  groupMetaContainer: {
    padding: 16,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 6,
    fontSize: 14,
    color: theme.textSecondary,
  },
  categoryBadge: {
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.primary,
  },
  joinButton: {
    borderRadius: 8,
  },
  pendingRequestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.warningLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  pendingRequestText: {
    marginLeft: 8,
    color: theme.warning,
    fontWeight: '500',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.successLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  memberText: {
    marginLeft: 8,
    color: theme.success,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.cardBackground,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  activeTabText: {
    color: theme.primary,
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 12,
    marginTop: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.text,
    marginBottom: 20,
  },
  meetingDetails: {
    backgroundColor: theme.cardBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  meetingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  meetingDetailText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.text,
  },
  adminSection: {
    marginBottom: 20,
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    borderRadius: 8,
    padding: 12,
  },
  adminAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  adminInfo: {
    marginLeft: 12,
  },
  adminName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  adminBadgeText: {
    marginLeft: 4,
    fontSize: 12,
    color: theme.primary,
  },
  privacySection: {
    marginBottom: 20,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    borderRadius: 8,
    padding: 12,
  },
  privacyText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  eventsList: {
    marginBottom: 20,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: theme.cardBackground,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  eventImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  eventDetails: {
    padding: 12,
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 8,
  },
  eventDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDateText: {
    marginLeft: 6,
    fontSize: 14,
    color: theme.textSecondary,
  },
  createEventButton: {
    borderRadius: 8,
    marginBottom: 20,
  },
  noContentText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
  },
  membersList: {
    marginBottom: 20,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  memberDetails: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    color: theme.text,
  },
  memberUniversity: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    borderRadius: 8,
    paddingVertical: 12,
  },
  chatButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: theme.white,
  },
});