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
import { currentUser } from '@/data/mockData';
import { theme, spacing, borderRadius, typography } from '@/components/theme';
import placeholderImg from '@/assets/images/icon.png';
import { WebView } from 'react-native-webview';
import * as Linking from 'expo-linking';
import { useAuth } from '@/context/AuthContext';
import { getUserGroups } from '@/data/services/groupService';
import { createEvent } from '@/data/services/eventService';

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
  const [userGroups, setUserGroups] = useState([]);
  
  const { isAuthenticated, user } = useAuth();
  const isInitialMount = useRef(true);
  
  // Debug info for the Dashboard
  useEffect(() => {
    console.log("Dashboard Tab Index rendered");
    console.log("User authenticated:", isAuthenticated);
    console.log("Current user:", user);

    // Fetch user groups when component mounts
    const fetchUserGroups = async () => {
      try {
        const response = await getUserGroups();
        if (response && response.groups) {
          setUserGroups(response.groups);
          console.log("Fetched user groups:", response.groups);
        }
      } catch (error) {
        console.error("Error fetching user groups:", error);
      }
    };

    // Simulate data loading
    const loadData = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    if (isAuthenticated && user) {
      fetchUserGroups();
    }

    if (isInitialMount.current) {
      console.log("Initial Dashboard render");
      isInitialMount.current = false;
    }

    return () => {
      clearTimeout(loadData);
    };
  }, [isAuthenticated, user]);

  // Return loading screen if data is still loading
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Return loading screen if user is not authenticated
  if (!isAuthenticated) {
    console.log("User not authenticated in Dashboard, this shouldn't happen");
    return <LoadingScreen />;
  }
  
  // Define data for UI
  const upcomingEvents = [
    {
      id: 1,
      title: "Diwali Celebration",
      date: "Nov 12",
      time: "6:00 PM",
      location: "Student Center",
      image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 2,
      title: "International Food Festival",
      date: "Nov 15",
      time: "12:00 PM",
      location: "Campus Quad",
      image: "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  const recommendedGroups = [
    {
      id: 1,
      name: "Asian Student Association",
      members: 124,
      image: "https://images.pexels.com/photos/935949/pexels-photo-935949.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 2,
      name: "International Students Club",
      members: 89,
      image: "https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  // Define handler functions
  const handleCreateEvent = async (eventData) => {
    console.log('Creating event:', eventData);
    try {
      const response = await createEvent(eventData);
      console.log("Event created response:", response);
      
      if (response && response.success) {
        Alert.alert(
          "Success", 
          "Your event has been created successfully! It may need approval from group admins.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Error", 
          "There was a problem creating your event. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert(
        "Error", 
        "Failed to create event. Please check your network connection and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setShowCreateEventModal(false);
    }
  };

  const handleCreateGroup = (groupData) => {
    console.log('Creating group:', groupData);
    setShowCreateGroupModal(false);
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
              {user && user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.profileImage} />
              ) : (
                <User size={20} color={theme.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.welcomeText}>
          Welcome{user ? `, ${user.fullName?.split(' ')[0] || 'User'}` : ' to Culture Connect'}!
        </Text>

        {/* Quick Action Cards */}
        <View style={styles.quickActionContainer}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setShowCreateEventModal(true)}
          >
            <Calendar size={24} color={theme.primary} />
            <Text style={styles.actionText}>New Event</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setShowCreateGroupModal(true)}
          >
            <Users size={24} color={theme.primary} />
            <Text style={styles.actionText}>New Group</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setShowShareCultureModal(true)}
          >
            <Globe size={24} color={theme.primary} />
            <Text style={styles.actionText}>Share Culture</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setShowStoriesModal(true)}
          >
            <BookOpen size={24} color={theme.primary} />
            <Text style={styles.actionText}>Stories</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        
        <View style={styles.eventsContainer}>
          {upcomingEvents.map((event, index) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => router.push(`/event/${event.id}`)}
            >
              <Image
                source={{ uri: event.image }}
                style={styles.eventImage}
              />
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
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
          
          <TouchableOpacity 
            style={styles.viewMoreButton}
            onPress={() => router.push('/events')}
          >
            <Text style={styles.viewMoreText}>View All Events</Text>
            <ChevronRight size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Recommended Groups</Text>
        
        <View style={styles.groupsContainer}>
          {recommendedGroups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              onPress={() => router.push(`/group/${group.id}`)}
            >
              <Image
                source={{ uri: group.image }}
                style={styles.groupImage}
              />
              <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
              <Text style={styles.groupMembers}>{group.members} members</Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
            style={styles.viewMoreButton}
            onPress={() => router.push('/groups')}
          >
            <Text style={styles.viewMoreText}>Discover More Groups</Text>
            <ChevronRight size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Modals */}
      {showCreateEventModal && (
        <CreateEventModal 
          isVisible={showCreateEventModal} 
          onClose={() => setShowCreateEventModal(false)} 
          onSubmit={handleCreateEvent} 
          userGroups={userGroups}
        />
      )}
      
      {showCreateGroupModal && (
        <CreateGroupModal 
          isVisible={showCreateGroupModal} 
          onClose={() => setShowCreateGroupModal(false)}
          onSubmit={handleCreateGroup}
        />
      )}
      
      {showShareCultureModal && (
        <ShareCultureModal 
          isVisible={showShareCultureModal}
          onClose={() => setShowShareCultureModal(false)}
          onSubmit={handleShareStory}
        />
      )}
      
      {showStoriesModal && (
        <CulturalStoriesModal
          isVisible={showStoriesModal}
          onClose={() => setShowStoriesModal(false)}
          onPost={handlePostStory}
        />
      )}
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
  quickActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  actionCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.cardBackground,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    width: '23%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionText: {
    fontSize: 12,
    color: theme.text,
    marginTop: 8,
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
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.primary,
    marginRight: 4,
  },
  groupsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  groupCard: {
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
  groupImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 12,
    marginHorizontal: 12,
  },
  groupMembers: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 4,
    marginBottom: 12,
    marginHorizontal: 12,
  },
});