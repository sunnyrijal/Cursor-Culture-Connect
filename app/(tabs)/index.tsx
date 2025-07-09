import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions, useWindowDimensions } from 'react-native';
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
  List as ListIcon
} from 'lucide-react-native';
import { CreateEventModal } from '@/components/CreateEventModal';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { ShareCultureModal } from '@/components/ShareCultureModal';
import { CulturalStoriesModal } from '@/components/CulturalStoriesModal';
import { currentUser } from '@/data/mockData';
import { theme } from '@/components/theme';
import placeholderImg from '@/assets/images/icon.png';
import { WebView } from 'react-native-webview';
import * as Linking from 'expo-linking';

export default function Dashboard() {
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showStoriesModal, setShowStoriesModal] = useState(false);
  const [showShareCultureModal, setShowShareCultureModal] = useState(false);
  const [eventsView, setEventsView] = useState<'grid' | 'list'>('grid');

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
    },
    {
      id: 3,
      title: "Chinese New Year Parade",
      date: "Nov 18",
      time: "2:00 PM",
      location: "Downtown Minneapolis",
      image: "https://images.pexels.com/photos/6786961/pexels-photo-6786961.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 4,
      title: "African Dance Workshop",
      date: "Nov 20",
      time: "4:00 PM",
      location: "Dance Studio",
      image: "https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 5,
      title: "Middle Eastern Poetry Night",
      date: "Nov 22",
      time: "7:00 PM",
      location: "Coffee House",
      image: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 6,
      title: "Japanese Tea Ceremony",
      date: "Nov 25",
      time: "3:00 PM",
      location: "Garden Pavilion",
      image: "https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 7,
      title: "Caribbean Music Night",
      date: "Nov 28",
      time: "8:00 PM",
      location: "Music Hall",
      image: "https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      id: 8,
      title: "Vietnamese Cooking Class",
      date: "Nov 30",
      time: "5:00 PM",
      location: "Culinary Arts Center",
      image: "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  const sponsoredContent = [
    {
      id: 1,
      type: 'restaurant',
      title: "Maharaja Palace",
      subtitle: "Authentic Indian Cuisine",
      description: "Experience traditional flavors from across India with our tandoor specialties, biryanis, and fresh naan bread.",
      image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: "$$-$$$",
      rating: 4.8,
      location: "Downtown Minneapolis",
      phone: "(612) 555-0123",
      hours: "11 AM - 10 PM",
      offer: "20% Student Discount",
      cta: "View Menu",
      icon: Utensils,
      color: theme.warning,
      heritage: "Indian"
    },
    {
      id: 2,
      type: 'event',
      title: "Asian Art Festival",
      subtitle: "Contemporary & Traditional Art",
      description: "Explore stunning artworks from emerging Asian artists featuring calligraphy, paintings, and sculptures.",
      image: "https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: "Free for Students",
      date: "Nov 15-17",
      location: "Walker Art Center",
      phone: "(612) 375-7600",
      offer: "Free Student Entry",
      cta: "Get Tickets",
      icon: Palette,
      color: theme.accent,
      heritage: "Asian"
    },
    {
      id: 3,
      type: 'restaurant',
      title: "Tacos El Sol",
      subtitle: "Mexican Street Food",
      description: "Authentic Mexican flavors with fresh ingredients, handmade tortillas, and traditional recipes passed down through generations.",
      image: "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: "$-$$",
      rating: 4.6,
      location: "West Bank",
      phone: "(612) 555-0456",
      hours: "10 AM - 11 PM",
      offer: "Free Guacamole on Tuesdays",
      cta: "Order Now",
      icon: Utensils,
      color: theme.success,
      heritage: "Mexican"
    },
    {
      id: 4,
      type: 'event',
      title: "African Drum Circle",
      subtitle: "Traditional Rhythms & Dance",
      description: "Join our weekly drum circle featuring traditional African rhythms, dance performances, and cultural storytelling.",
      image: "https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: "Free",
      date: "Every Friday",
      location: "Northrop Mall",
      phone: "(612) 555-0789",
      offer: "Drums Provided",
      cta: "Join Circle",
      icon: Music,
      color: theme.primary,
      heritage: "African"
    },
    {
      id: 5,
      type: 'restaurant',
      title: "Pho Saigon",
      subtitle: "Vietnamese Comfort Food",
      description: "Warm bowls of pho, fresh spring rolls, and authentic Vietnamese dishes made with love and traditional recipes.",
      image: "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: "$-$$",
      rating: 4.7,
      location: "Dinkytown",
      phone: "(612) 555-0321",
      hours: "11 AM - 9 PM",
      offer: "Student Lunch Special",
      cta: "View Menu",
      icon: Utensils,
      color: theme.info,
      heritage: "Vietnamese"
    },
    {
      id: 6,
      type: 'event',
      title: "Middle Eastern Film Festival",
      subtitle: "Cinema & Culture",
      description: "A week-long celebration of Middle Eastern cinema featuring award-winning films, director Q&As, and cultural discussions.",
      image: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: "$5 per film",
      date: "Dec 1-7",
      location: "Bell Museum",
      phone: "(612) 555-0654",
      offer: "Festival Pass Available",
      cta: "Get Pass",
      icon: Camera,
      color: theme.warning,
      heritage: "Middle Eastern"
    },
    {
      id: 7,
      type: 'restaurant',
      title: "Sakura Sushi",
      subtitle: "Japanese Fine Dining",
      description: "Premium sushi and sashimi prepared by master chefs using the freshest ingredients and traditional Japanese techniques.",
      image: "https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: "$$$-$$$$",
      rating: 4.9,
      location: "Uptown",
      phone: "(612) 555-0987",
      hours: "5 PM - 11 PM",
      offer: "Happy Hour 5-7 PM",
      cta: "Reserve Table",
      icon: Utensils,
      color: theme.accent,
      heritage: "Japanese"
    },
    {
      id: 8,
      type: 'event',
      title: "Caribbean Carnival",
      subtitle: "Music, Dance & Culture",
      description: "Experience the vibrant colors, infectious rhythms, and rich cultural heritage of the Caribbean through music and dance.",
      image: "https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: "$15",
      date: "Dec 15",
      location: "Theater District",
      phone: "(612) 555-0123",
      offer: "Early Bird Discount",
      cta: "Buy Tickets",
      icon: Music,
      color: theme.success,
      heritage: "Caribbean"
    }
  ];

  const handleCreateEvent = (eventData: any) => {
    console.log('Creating event:', eventData);
    setShowCreateEventModal(false);
  };

  const handleCreateGroup = (groupData: any) => {
    console.log('Creating group:', groupData);
    setShowCreateGroupModal(false);
  };
  
  const handleShareStory = (storyData: any) => {
    console.log('Sharing story:', storyData);
    setShowShareCultureModal(false);
  };

  const handlePostStory = () => {
    setShowStoriesModal(false);
    setShowShareCultureModal(true);
  };

  const handleSponsoredContentPress = (content: any) => {
    Alert.alert(content.title, content.description);
  };

  const { width: screenWidth } = useWindowDimensions();
  const numColumns = screenWidth < 600 ? 2 : 3;
  const gridGap = 16;
  const gridCardWidth = (screenWidth - 20 * 2 - gridGap * (numColumns - 1)) / numColumns;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{paddingHorizontal: 20}} showsVerticalScrollIndicator={false}>
        {/* YouTube Video Link Box */}
        <TouchableOpacity
          style={{
            width: '100%',
            borderRadius: 12,
            backgroundColor: theme.primary,
            padding: 20,
            marginBottom: 24,
            alignItems: 'center',
            flexDirection: 'row',
            gap: 16,
          }}
          activeOpacity={0.85}
          onPress={() => Linking.openURL('https://youtu.be/xZespC4JRSI')}
        >
          <Image source={{ uri: 'https://img.youtube.com/vi/xZespC4JRSI/0.jpg' }} style={{ width: 64, height: 36, borderRadius: 6, marginRight: 16 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.white, fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>Watch: Culture Connect Video</Text>
            <Text style={{ color: theme.white, opacity: 0.85, fontSize: 13 }}>Click to open YouTube</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{currentUser.name.split(' ')[0]}! 👋</Text>
          </View>
          <View style={styles.headerActions}>
            {/* Story Icon */}
            <TouchableOpacity 
              onPress={() => setShowStoriesModal(true)}
              style={styles.navButton}
              activeOpacity={0.7}
            >
              <BookOpen size={22} color={theme.primary} />
            </TouchableOpacity>

            {/* Notification Icon */}
            <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.navButton}>
              <Bell size={22} color={theme.primary} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>

            {/* Uploaded Image */}
            <TouchableOpacity style={styles.navButton} activeOpacity={0.7}>
              <Image 
                source={require('@/assets/images/black_circle_360x360.png')} 
                style={styles.uploadedImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.welcomeCard} onPress={() => router.push('/my-hub')}>
          <Text style={styles.welcomeTitle}>Your Cultural Hub</Text>
          <Text style={styles.welcomeSubtitle}>
            Connect with your heritage and explore new cultures
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{currentUser.eventsAttended}</Text>
              <Text style={styles.statLabel}>Events Attended</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{currentUser.joinedGroups}</Text>
              <Text style={styles.statLabel}>Groups Joined</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{currentUser.connections}</Text>
              <Text style={styles.statLabel}>Connections</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowCreateEventModal(true)}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.primary }]}>
                <Plus size={18} color={theme.white} />
              </View>
              <Text style={styles.actionText}>Create Event</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowCreateGroupModal(true)}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.accent }]}>
                <Users size={18} color={theme.white} />
              </View>
              <Text style={styles.actionText}>Create Group</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/my-university')}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.info }]}>
                <Building2 size={18} color={theme.white} />
              </View>
              <Text style={styles.actionText}>My University</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Discover Cultural Experiences</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sponsoredScroll}>
            {sponsoredContent.map((content, index) => (
              <TouchableOpacity
                key={content.id}
                style={[styles.sponsoredCard, { marginLeft: index === 0 ? 0 : 16 }]}
                onPress={() => handleSponsoredContentPress(content)}
                activeOpacity={0.8}
              >
                <View style={styles.sponsoredImageContainer}>
                  <Image source={{ uri: content.image || placeholderImg }} style={styles.sponsoredImage} />
                  <View style={styles.sponsoredLabel}>
                    <Text style={styles.sponsoredLabelText}>Sponsored</Text>
                  </View>
                  <View style={[styles.heritageBadge, { backgroundColor: content.color }]}>
                    <Text style={styles.heritageBadgeText}>{content.heritage}</Text>
                  </View>
                </View>
                <View style={styles.sponsoredCardContent}>
                  <View style={styles.sponsoredHeader}>
                    <Text style={styles.sponsoredTitle}>{content.title}</Text>
                    <View style={styles.ratingContainer}>
                      <Star size={12} color={theme.warning} fill={theme.warning} />
                      <Text style={styles.ratingText}>{content.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.sponsoredSubtitle}>{content.subtitle}</Text>
                  <View style={styles.sponsoredMeta}>
                    <View style={styles.metaItem}>
                      <MapPin size={12} color={theme.textSecondary} />
                      <Text style={styles.metaText}>{content.location}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Clock size={12} color={theme.textSecondary} />
                      <Text style={styles.metaText}>
                        {content.type === 'restaurant' ? content.hours : content.date}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.offerContainer}>
                    <Text style={styles.offerText}>{content.offer}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <View style={styles.eventsToggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, eventsView === 'grid' && styles.toggleButtonActive]}
                onPress={() => setEventsView('grid')}
                activeOpacity={0.7}
              >
                <LayoutGrid size={18} color={eventsView === 'grid' ? theme.white : theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, eventsView === 'list' && styles.toggleButtonActive]}
                onPress={() => setEventsView('list')}
                activeOpacity={0.7}
              >
                <ListIcon size={18} color={eventsView === 'list' ? theme.white : theme.primary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/events')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {eventsView === 'grid' ? (
            <View style={styles.eventsGrid}>
              {upcomingEvents.map((event, idx) => (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.eventGridCard, { width: gridCardWidth, marginRight: (idx + 1) % numColumns === 0 ? 0 : gridGap }]}
                  onPress={() => router.push(`/event/${event.id}`)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: event.image || placeholderImg }} style={styles.eventGridImage} />
                  <View style={styles.eventGridDetails}>
                    <Text style={styles.eventGridTitle} numberOfLines={2}>{event.title}</Text>
                    <Text style={styles.eventGridMeta}>{event.date} • {event.time}</Text>
                    <Text style={styles.eventGridMeta} numberOfLines={1}>{event.location}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.eventsList}>
              {upcomingEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventListCard}
                  onPress={() => router.push(`/event/${event.id}`)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: event.image || placeholderImg }} style={styles.eventListImage} />
                  <View style={styles.eventListDetails}>
                    <Text style={styles.eventListTitle} numberOfLines={2}>{event.title}</Text>
                    <Text style={styles.eventListMeta}>{event.date} • {event.time}</Text>
                    <Text style={styles.eventListMeta} numberOfLines={1}>{event.location}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.white,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  uploadedImage: {
    width: 22,
    height: 22,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.accent,
  },
  welcomeCard: {
    backgroundColor: theme.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.primary,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  quickActions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textPrimary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.primary,
  },
  sponsoredScroll: {
    marginHorizontal: -20,
  },
  sponsoredCard: {
    width: 200,
    marginRight: 16,
    backgroundColor: theme.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sponsoredImageContainer: {
    position: 'relative',
  },
  sponsoredImage: {
    width: '100%',
    height: 120,
  },
  sponsoredLabel: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sponsoredLabelText: {
    color: theme.white,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sponsoredCardContent: {
    padding: 12,
  },
  sponsoredTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sponsoredSubtitle: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  eventsToggleContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginRight: 12,
  },
  toggleButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  toggleButtonActive: {
    backgroundColor: theme.primary,
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
  },
  eventGridCard: {
    backgroundColor: theme.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  eventGridImage: {
    width: '100%',
    height: 80,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  eventGridDetails: {
    padding: 8,
  },
  eventGridTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  eventGridMeta: {
    fontSize: 11,
    color: theme.textSecondary,
  },
  eventsList: {
    gap: 12,
  },
  eventListCard: {
    flexDirection: 'row',
    backgroundColor: theme.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  eventListImage: {
    width: 80,
    height: 80,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  eventListDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  eventListTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  eventListMeta: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  heritageBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heritageBadgeText: {
    color: theme.white,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sponsoredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  sponsoredMeta: {
    marginTop: 8,
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: theme.textSecondary,
  },
  offerContainer: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.gray50,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  offerText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.primary,
  },
});