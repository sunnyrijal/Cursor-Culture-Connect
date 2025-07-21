import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions, useWindowDimensions, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  Bell, 
  Plus, 
  Calendar, 
  Users, 
  MapPin, 
  ChevronRight,
  Heart,
  MessageCircle,
  LogOut,
  Globe,
  GraduationCap,
  Star,
  Clock,
  DollarSign,
  ExternalLink,
  Utensils,
  Music,
  Palette,
  BookOpen,
  Phone,
  Navigation,
  Building2,
  Camera,
  LayoutGrid,
  List as ListIcon,
  Bot,
  Activity,
  User
} from 'lucide-react-native';
import { CreateEventModal } from '@/components/CreateEventModal';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { ShareCultureModal } from '@/components/ShareCultureModal';
import { CulturalStoriesModal } from '@/components/CulturalStoriesModal';
import { theme, spacing, borderRadius, typography } from '@/components/theme';
import placeholderImg from '@/assets/images/icon.png';
import { WebView } from 'react-native-webview';
import * as Linking from 'expo-linking';
import { useAuth } from '@/data/authContext';
import { useGroups } from '@/data/groupContext';
import { useEvents } from '@/data/eventContext';
import { useActivities } from '@/data/activityContext';

// Component to render until the screen is fully loaded
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={{ marginTop: 16, color: theme.textSecondary }}>Loading dashboard...</Text>
    </View>
  );
}

export default function Dashboard() {
  // Define all hooks unconditionally at the top of the component
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showStoriesModal, setShowStoriesModal] = useState(false);
  const [showShareCultureModal, setShowShareCultureModal] = useState(false);
  const [eventsView, setEventsView] = useState('grid');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiQuestion, setAIQuestion] = useState('');
  const [aiResults, setAIResults] = useState([]);
  const [activeSponsoredCategory, setActiveSponsoredCategory] = useState('all');
  
  const { isAuthenticated, user } = useAuth();
  const { groups, fetchGroups } = useGroups();
  const { events, userEvents, fetchEvents, fetchUserEvents } = useEvents();
  const { activities, fetchActivities } = useActivities();

  const isInitialMount = useRef(true);
  
  // Load data when the dashboard mounts
  useEffect(() => {
    console.log("Dashboard Tab Index rendered");
    console.log("User authenticated:", isAuthenticated);
    console.log("Current user:", user);

    async function loadData() {
      try {
        setIsLoading(true);
        if (isAuthenticated) {
          // Fetch data in parallel for better performance
          await Promise.all([
            fetchEvents(),
            fetchUserEvents(),
            fetchGroups(),
            fetchActivities()
          ]);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        Alert.alert(
          "Error",
          "There was a problem loading data. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadData();

    if (isInitialMount.current) {
      console.log("Initial Dashboard render");
      isInitialMount.current = false;
    }
  }, [isAuthenticated]);

  // Return loading screen if data is still loading
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Return loading screen if user is not authenticated
  if (!isAuthenticated) {
    console.log("User not authenticated in Dashboard, this shouldn't happen");
    return <LoadingScreen />;
  }
  
  // Use real events data
  const upcomingEvents = events.slice(0, 3);

  // Define handler functions
  const handleCreateEvent = (eventData) => {
    // Create event through context
    setShowCreateEventModal(false);
    setIsLoading(true);
    events.createEvent(eventData)
      .then(() => {
        Alert.alert("Success", "Event created successfully!");
      })
      .catch(error => {
        Alert.alert("Error", "Failed to create event: " + error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleCreateGroup = (groupData) => {
    // Create group through context
    setShowCreateGroupModal(false);
    setIsLoading(true);
    groups.createGroup(groupData)
      .then(() => {
        Alert.alert("Success", "Group created successfully!");
      })
      .catch(error => {
        Alert.alert("Error", "Failed to create group: " + error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  
  const handleShareStory = (storyData) => {
    console.log('Sharing story:', storyData);
    setShowShareCultureModal(false);
  };

  const handlePostStory = () => {
    setShowStoriesModal(false);
    setShowShareCultureModal(true);
  };

  // Define the simplified UI
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/notifications')}
            >
              <Bell size={22} color={theme.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.iconButton, styles.profileButton]}
              onPress={() => router.push('/profile')}
            >
              {user && user.image ? (
                <Image source={{ uri: user.image }} style={styles.profileImage} />
              ) : (
                <User size={20} color={theme.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.welcomeText}>
          Welcome{user ? `, ${user.name?.split(' ')[0] || 'User'}` : ' to Culture Connect'}!
        </Text>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowCreateEventModal(true)}
          >
            <Calendar size={24} color={theme.primary} />
            <Text style={styles.actionText}>Create Event</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowCreateGroupModal(true)}
          >
            <Users size={24} color={theme.primary} />
            <Text style={styles.actionText}>Create Group</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/api-test')}
          >
            <Activity size={24} color={theme.primary} />
            <Text style={styles.actionText}>API Test</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.debugLinks}>
          {__DEV__ && (
            <>
              <TouchableOpacity onPress={() => router.push('/debug')} style={styles.debugButton}>
                <Text style={styles.debugButtonText}>Debug Mode</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/api-test')} style={styles.debugButton}>
                <Text style={styles.debugButtonText}>API Test</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/debug-events')} style={styles.debugButton}>
                <Text style={styles.debugButtonText}>Debug Events</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        
        <Text style={styles.sectionTitle}>Your Events</Text>
        
        {userEvents.length > 0 ? (
          <View style={styles.eventsContainer}>
            {userEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => router.push(`/event/${event.id}`)}
              >
                <Image
                  source={event.image ? { uri: event.image } : placeholderImg}
                  style={styles.eventImage}
                />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle} numberOfLines={2}>{event.title || event.name}</Text>
                  <View style={styles.eventDetails}>
                    <Calendar size={14} color={theme.textSecondary} />
                    <Text style={styles.eventDetail}>{event.date}, {event.time}</Text>
                  </View>
                  <View style={styles.eventDetails}>
                    <MapPin size={14} color={theme.textSecondary} />
                    <Text style={styles.eventDetail}>{event.location}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>You haven't joined any events yet.</Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => router.push('/events')}
            >
              <Text style={styles.emptyStateButtonText}>Explore Events</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        
        {events.length > 0 ? (
          <View style={styles.eventsContainer}>
            {events.slice(0, 3).map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => router.push(`/event/${event.id}`)}
              >
                <Image
                  source={event.image ? { uri: event.image } : placeholderImg}
                  style={styles.eventImage}
                />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle} numberOfLines={2}>{event.title || event.name}</Text>
                  <View style={styles.eventDetails}>
                    <Calendar size={14} color={theme.textSecondary} />
                    <Text style={styles.eventDetail}>{event.date}, {event.time}</Text>
                  </View>
                  <View style={styles.eventDetails}>
                    <MapPin size={14} color={theme.textSecondary} />
                    <Text style={styles.eventDetail}>{event.location}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            
            {events.length > 3 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => router.push('/events')}
              >
                <Text style={styles.viewAllText}>View all events</Text>
                <ChevronRight size={16} color={theme.primary} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No upcoming events found.</Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setShowCreateEventModal(true)}
            >
              <Text style={styles.emptyStateButtonText}>Create an Event</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <Text style={styles.sectionTitle}>Your Groups</Text>
        
        {groups.length > 0 ? (
          <View style={styles.groupsContainer}>
            {groups.slice(0, 3).map((group) => (
              <TouchableOpacity
                key={group.id}
                style={styles.groupCard}
                onPress={() => router.push(`/group/${group.id}`)}
              >
                <Image
                  source={group.image ? { uri: group.image } : placeholderImg}
                  style={styles.groupImage}
                />
                <View style={styles.groupContent}>
                  <Text style={styles.groupTitle} numberOfLines={1}>{group.name}</Text>
                  <Text style={styles.groupMembers}>{group.memberCount} members</Text>
                </View>
              </TouchableOpacity>
            ))}
            
            {groups.length > 3 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => router.push('/groups')}
              >
                <Text style={styles.viewAllText}>View all groups</Text>
                <ChevronRight size={16} color={theme.primary} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>You haven't joined any groups yet.</Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => router.push('/groups')}
            >
              <Text style={styles.emptyStateButtonText}>Explore Groups</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* Modals */}
      <CreateEventModal 
        visible={showCreateEventModal} 
        onClose={() => setShowCreateEventModal(false)}
        onSubmit={handleCreateEvent}
      />
      
      <CreateGroupModal 
        visible={showCreateGroupModal} 
        onClose={() => setShowCreateGroupModal(false)}
        onSubmit={handleCreateGroup}
      />
      
      <ShareCultureModal
        visible={showShareCultureModal}
        onClose={() => setShowShareCultureModal(false)}
        onSubmit={handleShareStory}
      />
      
      <CulturalStoriesModal
        visible={showStoriesModal}
        onClose={() => setShowStoriesModal(false)}
        onPostStory={handlePostStory}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.cardBackground,
    marginLeft: 8,
  },
  profileButton: {
    backgroundColor: theme.cardBackground,
  },
  profileImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  welcomeText: {
    fontSize: 18,
    color: theme.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.cardBackground,
    margin: 16,
    borderRadius: 12,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  actionText: {
    color: theme.text,
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  eventsContainer: {
    paddingHorizontal: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  eventImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  eventContent: {
    flex: 1,
    padding: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  eventDetail: {
    fontSize: 13,
    color: theme.textSecondary,
    marginLeft: 6,
  },
  groupsContainer: {
    paddingHorizontal: 16,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  groupImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  groupContent: {
    marginLeft: 12,
    flex: 1,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  groupMembers: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  viewAllText: {
    color: theme.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyStateContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.primary,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  debugLinks: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.cardBackground,
    margin: 16,
    borderRadius: 12,
  },
  debugButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.primary,
    borderRadius: 8,
    marginBottom: 8,
  },
  debugButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});