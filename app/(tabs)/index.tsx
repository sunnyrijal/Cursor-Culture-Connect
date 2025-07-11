import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions, useWindowDimensions, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
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
  Bot
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
import YouTubeLinkCard from '@/components/YouTubeLinkCard';
import { store } from '@/data/store';
import { useEffect, useRef } from 'react';

export default function Dashboard() {
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showStoriesModal, setShowStoriesModal] = useState(false);
  const [showShareCultureModal, setShowShareCultureModal] = useState(false);
  const [eventsView, setEventsView] = useState<'grid' | 'list'>('grid');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiQuestion, setAIQuestion] = useState('');
  const [aiResults, setAIResults] = useState<any[]>([]);

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
      heritage: "Indian",
      popularityByHeritage: { Indian: 120, Nepali: 42, Pakistani: 10 }
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
      heritage: "Mexican",
      popularityByHeritage: { Mexican: 80, Nepali: 2 }
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
      heritage: "Vietnamese",
      popularityByHeritage: { Vietnamese: 60, Nepali: 8 }
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
      heritage: "Japanese",
      popularityByHeritage: { Japanese: 70, Nepali: 1 }
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

  const sponsoredCategories = [
    { id: 'all', label: 'All' },
    { id: 'restaurant', label: 'Restaurants' },
    { id: 'event', label: 'Events' },
    // Add more categories as needed, e.g. museums, shops, etc.
  ];
  const [activeSponsoredCategory, setActiveSponsoredCategory] = useState('all');
  const filteredSponsoredContent = activeSponsoredCategory === 'all'
    ? sponsoredContent
    : sponsoredContent.filter(c => c.type === activeSponsoredCategory);

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

  const getDayOfWeek = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getToday = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  };

  const normalize = (str) => (str || '').toLowerCase();

  const knownDays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

  const extractLocation = (q) => {
    // Try to extract a location from the query (city, university, state, etc.)
    const user = store.getState().currentUser;
    const locations = [user.location, user.university, user.state, user.country];
    for (const loc of locations) {
      if (loc && q.includes(normalize(loc))) return loc;
    }
    // Try to match against group/event locations
    const allLocs = [
      ...store.getState().groups.map(g => g.location),
      ...store.getState().events.map(e => e.location),
    ].filter(Boolean);
    for (const loc of allLocs) {
      if (loc && q.includes(normalize(loc))) return loc;
    }
    return null;
  };

  const extractDay = (q) => {
    if (q.includes('today')) return getToday();
    for (const day of knownDays) {
      if (q.includes(day)) return day.charAt(0).toUpperCase() + day.slice(1);
    }
    return null;
  };

  // Step 3: Simple NLP helpers
  const heritageList = [
    'Nepali', 'Indian', 'Pakistani', 'Vietnamese', 'Japanese', 'Mexican', 'Chinese', 'Korean', 'African', 'Middle Eastern', 'Caribbean', 'South Asian', 'East Asian', 'Hispanic', 'Latino', 'European', 'Pacific Islander', 'Native American', 'International', 'Mixed Heritage'
  ];

  function extractHeritage(q) {
    for (const h of heritageList) {
      if (q.includes(h.toLowerCase())) return h;
    }
    return null;
  }

  function extractIntent(q) {
    if (q.includes('food') || q.includes('restaurant') || q.includes('eat')) return 'food';
    if (q.includes('event') || q.includes('activity') || q.includes('happening')) return 'event';
    if (q.includes('group') || q.includes('community')) return 'group';
    return null;
  }

  const handleAISubmit = () => {
    const q = aiQuestion.trim().toLowerCase();
    if (!q) {
      setAIResults([{ type: 'info', text: 'Please enter a question.' }]);
      return;
    }
    // Step 2: Advanced logic for food/restaurant/heritage queries
    const heritage = extractHeritage(q);
    const intent = extractIntent(q);
    const location = extractLocation(q);
    const day = extractDay ? extractDay(q) : null;
    const outdoor = q.includes('outdoor');
    if (intent === 'food' && heritage) {
      // Find restaurants with highest popularity for that heritage near the user
      let restaurants = sponsoredContent.filter(c => c.type === 'restaurant' && c.popularityByHeritage && c.popularityByHeritage[heritage]);
      if (location) {
        restaurants = restaurants.filter(r => normalize(r.location).includes(normalize(location)));
      }
      // Sort by popularity for that heritage
      restaurants.sort((a, b) => b.popularityByHeritage[heritage] - a.popularityByHeritage[heritage]);
      if (restaurants.length === 0) {
        setAIResults([{ type: 'info', text: `No popular restaurants found for ${heritage} students in this area.` }]);
        return;
      }
      setAIResults(restaurants.map(r => ({ type: 'restaurant', name: r.title, location: r.location, popularity: r.popularityByHeritage[heritage], id: r.id })));
      return;
    }
    // Search events
    let events = store.getState().events.filter(e =>
      (e.name && normalize(e.name).includes(q)) ||
      (e.description && normalize(e.description).includes(q)) ||
      (Array.isArray(e.category) ? e.category.some(cat => normalize(cat).includes(q)) : (e.category && normalize(e.category).includes(q)))
    );
    // Add location filter
    if (location) {
      events = events.filter(e => normalize(e.location).includes(normalize(location)));
    }
    // Add day filter
    if (day) {
      events = events.filter(e => {
        // Try to match day in event.date or event.time or event.name
        if (e.date && normalize(e.date).includes(day.toLowerCase())) return true;
        if (e.time && normalize(e.time).includes(day.toLowerCase())) return true;
        if (e.name && normalize(e.name).includes(day.toLowerCase())) return true;
        return false;
      });
    }
    // Outdoor filter
    if (outdoor) {
      events = events.filter(e =>
        (e.name && normalize(e.name).includes('outdoor')) ||
        (e.description && normalize(e.description).includes('outdoor')) ||
        (Array.isArray(e.category) ? e.category.some(cat => normalize(cat).includes('outdoor')) : (e.category && normalize(e.category).includes('outdoor')))
      );
    }

    // Search groups
    let groups = store.getState().groups.filter(g =>
      (g.name && normalize(g.name).includes(q)) ||
      (g.description && normalize(g.description).includes(q)) ||
      (typeof g.category === 'string' ? normalize(g.category).includes(q) : Array.isArray(g.category) && g.category.some(cat => normalize(cat).includes(q)))
    );
    if (location) {
      groups = groups.filter(g => normalize(g.location).includes(normalize(location)));
    }
    if (day) {
      groups = groups.filter(g => {
        // Try to match day in meetingDays or meetingDate
        if (g.meetingDays && Array.isArray(g.meetingDays) && g.meetingDays.some(d => normalize(d) === day.toLowerCase())) return true;
        if (g.meetingDate && normalize(g.meetingDate).includes(day.toLowerCase())) return true;
        return false;
      });
    }
    if (outdoor) {
      groups = groups.filter(g =>
        (g.name && normalize(g.name).includes('outdoor')) ||
        (g.description && normalize(g.description).includes('outdoor')) ||
        (typeof g.category === 'string' ? normalize(g.category).includes('outdoor') : Array.isArray(g.category) && g.category.some(cat => normalize(cat).includes('outdoor')))
      );
    }

    if (events.length === 0 && groups.length === 0) {
      setAIResults([{ type: 'info', text: 'No matching groups or events found for your question.' }]);
      return;
    }
    setAIResults([
      ...groups.map(g => ({ type: 'group', name: g.name, privacy: g.isPublic ? 'public' : 'private', canRequest: !g.isJoined && !g.isPublic })),
      ...events.map(e => ({ type: 'event', name: e.name, date: e.date, location: e.location }))
    ]);
  };

  // Remove horizontal padding from grid container and adjust gridCardWidth
  const { width: screenWidth } = useWindowDimensions();
  const numColumns = 2;
  const gridGap = 16;
  // Use full screen width minus gap(s) only
  const gridCardWidth = (screenWidth - gridGap * (numColumns - 1)) / numColumns;

  // For voice (optional, web only)
  const isWeb = typeof window !== 'undefined';
  const modalRef = useRef(null);

  // Dismiss modal on outside click
  useEffect(() => {
    if (!showAIModal) return;
    function handleClick(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowAIModal(false);
      }
    }
    if (isWeb) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showAIModal]);

  // Voice command (web only, optional)
  const handleVoice = () => {
    if (!isWeb || !('webkitSpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser.');
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        setAIQuestion(event.results[0][0].transcript);
      }
    };
    recognition.start();
  };

  const welcomeMessages = [
    "Finding your culture just got easier",
    "Never celebrate festivals alone",
    "Discover new communities and friends",
    "Explore events from every heritage"
  ];
  const [welcomeIndex, setWelcomeIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setWelcomeIndex(i => (i + 1) % welcomeMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{paddingHorizontal: 20}} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.userName}>{currentUser.name.split(' ')[0]}! 👋</Text>
            </View>
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

            {/* Notification Icon - now rightmost */}
            <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.navButton}>
              <Bell size={22} color={theme.primary} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Centered Welcome Message */}
        <View style={styles.welcomeCenterContainer}>
          <Text style={styles.welcomeCenterTitle}>{welcomeMessages[welcomeIndex]}</Text>
        </View>

        <TouchableOpacity style={styles.welcomeCard} onPress={() => router.push('/my-hub')}>
          <Text style={styles.welcomeCardTitle}>Your Cultural Hub</Text>
          <Text style={styles.welcomeCardSubtitle}>
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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.sponsoredCategoryTabs}
              contentContainerStyle={{ alignItems: 'center' }}
            >
              {sponsoredCategories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.sponsoredCategoryTab, activeSponsoredCategory === cat.id && styles.sponsoredCategoryTabActive]}
                  onPress={() => setActiveSponsoredCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.sponsoredCategoryTabText, activeSponsoredCategory === cat.id && styles.sponsoredCategoryTabTextActive]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sponsoredScroll}>
            {filteredSponsoredContent.map((content, index) => (
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
            <View style={[styles.eventsGrid, { paddingHorizontal: 0, justifyContent: 'space-between' }]}> {/* Remove horizontal padding, add space-between */}
              {upcomingEvents.map((event, idx) => (
                <TouchableOpacity
                  key={event.id}
                  style={[
                    styles.eventGridCard,
                    { width: '48%', marginRight: (idx % 2 === 0) ? '4%' : 0 }, // 2 per row, small gap
                  ]}
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
      {/* Floating Ask AI Button */}
      <View style={{ position: 'absolute', bottom: 32, right: 24, zIndex: 200 }}>
        <TouchableOpacity
          style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 6, elevation: 6 }}
          onPress={() => setShowAIModal(true)}
          accessibilityLabel="Ask AI"
          accessibilityRole="button"
        >
          <Bot size={26} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* AI Assistant Modal */}
      <Modal visible={showAIModal} animationType="slide" transparent onRequestClose={() => setShowAIModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View ref={modalRef} style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, width: 340, maxWidth: '90%', alignItems: 'center', position: 'relative' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Ask AI</Text>
            <View style={{ flexDirection: 'row', width: '100%', marginBottom: 12 }}>
              <TextInput
                style={{ flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12 }}
                placeholder="Ask about groups or events..."
                value={aiQuestion}
                onChangeText={setAIQuestion}
                onSubmitEditing={handleAISubmit}
                returnKeyType="search"
                autoFocus
              />
              {isWeb && (
                <TouchableOpacity onPress={handleVoice} style={{ marginLeft: 8, backgroundColor: '#F3F4F6', borderRadius: 12, padding: 10 }}>
                  <Text role="img" aria-label="mic">🎤</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={{ backgroundColor: '#10B981', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 24, marginBottom: 12 }} onPress={handleAISubmit}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ask</Text>
            </TouchableOpacity>
            <View style={{ width: '100%' }}>
              {aiResults.map((result, idx) => (
                <View key={idx} style={{ marginBottom: 8 }}>
                  {result.type === 'restaurant' && (
                    <TouchableOpacity onPress={() => {
                      // Optionally, show more details or open a map, etc.
                      Alert.alert(result.name, `Location: ${result.location}\nPopularity: ${result.popularity} ${heritageList.find(h => result.popularityByHeritage && result.popularityByHeritage[h] === result.popularity)?.toLowerCase() || ''} students`);
                    }}>
                      <Text style={{ textDecorationLine: 'underline', color: '#2563EB' }}>Restaurant: {result.name} ({result.popularity} {heritageList.find(h => result.popularityByHeritage && result.popularityByHeritage[h] === result.popularity)?.toLowerCase() || ''} students) - {result.location}</Text>
                    </TouchableOpacity>
                  )}{result.type === 'group' && (
                    <TouchableOpacity onPress={() => {
                      const group = store.getState().groups.find(g => g.name === result.name);
                      if (group) router.push(`/group/${group.id}`);
                    }}>
                      <Text style={{ textDecorationLine: 'underline', color: '#2563EB' }}>Group: {result.name} {result.privacy === 'private' && result.canRequest && <Text style={{ color: '#EC4899' }}>(Request to Join)</Text>}</Text>
                    </TouchableOpacity>
                  )}{result.type === 'event' && (
                    <TouchableOpacity onPress={() => {
                      const event = store.getState().events.find(e => e.name === result.name);
                      if (event) router.push(`/event/${event.id}`);
                    }}>
                      <Text style={{ textDecorationLine: 'underline', color: '#2563EB' }}>Event: {result.name} - {result.date} @ {result.location}</Text>
                    </TouchableOpacity>
                  )}{result.type === 'info' && (
                    <Text>{result.text}</Text>
                  )}
                </View>
              ))}
            </View>
            <TouchableOpacity style={{ marginTop: 8 }} onPress={() => setShowAIModal(false)}>
              <Text style={{ color: '#EC4899', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    alignItems: 'flex-start',
    paddingVertical: 16,
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
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
  welcomeMessage: {
    marginTop: 12,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 2,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    fontStyle: 'italic',
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
  welcomeCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  welcomeCardSubtitle: {
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
    justifyContent: 'space-between',
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
  welcomeCenterContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeCenterTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  welcomeCenterSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
  sponsoredCategoryTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    marginLeft: 16,
  },
  sponsoredCategoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.gray50,
    borderWidth: 1,
    borderColor: theme.border,
    marginRight: 14,
  },
  sponsoredCategoryTabActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  sponsoredCategoryTabText: {
    fontSize: 13,
    color: theme.textPrimary,
    fontWeight: '500',
  },
  sponsoredCategoryTabTextActive: {
    color: theme.white,
  },
});