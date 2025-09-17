'use client';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Utensils, Music, Palette, Camera, Bot } from 'lucide-react-native';
import { CreateEventModal } from '@/components/CreateEventModal';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { ShareCultureModal } from '@/components/ShareCultureModal';
import { CulturalStoriesModal } from '@/components/CulturalStoriesModal';
import { currentUser } from '@/data/mockData';
import { theme, spacing } from '@/components/theme';
import { store } from '@/data/store';
import { useEffect, useRef } from 'react';
import Header from '@/components/home/Header';
import UserStat from '@/components/home/UserStat';
import CulturalExperiences from '@/components/home/CulturalExperiences';
import UpcommingEvents from '@/components/home/UpcommingEvents';
import QuickActions from '@/components/home/QuickActions';
import WelcomeCenter from '@/components/home/WelcomeMesage';
import { CreateQuickEventModal } from '@/components/CreateQuickEventModal';
import AutoplayVideo from '@/components/home/VideoCard';
import { useAuth } from '@/contexts/AuthContext';
import { Image } from 'react-native';
import getDecodedToken from '@/utils/getMyData';
import { useQuery } from '@tanstack/react-query';

export default function Dashboard() {
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showCreateQuickEventModal, setShowCreateQuickEventModal] =
    useState(false);
  const { authState } = useAuth();
  console.log(authState)

   const { data: myData } = useQuery({
    queryKey: ['myData'],
    queryFn: () => getDecodedToken(),
  });
  console.log(myData)
  // useEffect(() => {
  //   // Only check for authentication after the initial loading is complete
  //   if (authState.isAuthLoading === false && authState.authenticated === false) {
  //     Alert.alert(
  //       'Authentication Required',
  //       'Please login to continue.',
  //       [
  //         {
  //           text: 'OK',
  //           onPress: () => router.replace('/(auth)/login'),
  //         },
  //       ],
  //       { cancelable: false }
  //     );
  //   }
  // }, [authState.authenticated, authState.isAuthLoading, myData]);

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showStoriesModal, setShowStoriesModal] = useState(false);
  const [showShareCultureModal, setShowShareCultureModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiQuestion, setAIQuestion] = useState('');
  const [aiResults, setAIResults] = useState<any[]>([]);
  const sponsoredContent = [
    {
      id: 1,
      type: 'restaurant',
      title: 'Maharaja Palace',
      subtitle: 'Authentic Indian Cuisine',
      description:
        'Experience traditional flavors from across India with our tandoor specialties, biryanis, and fresh naan bread.',
      image:
        'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      price: '$$-$$$',
      rating: 4.8,
      location: 'Downtown Minneapolis',
      phone: '(612) 555-0123',
      hours: '11 AM - 10 PM',
      offer: '20% Student Discount',
      cta: 'View Menu',
      icon: Utensils,
      color: theme.warning,
      heritage: 'Indian',
      popularityByHeritage: { Indian: 120, Nepali: 42, Pakistani: 10 },
    },
    {
      id: 2,
      type: 'event',
      title: 'Asian Art Festival',
      subtitle: 'Contemporary & Traditional Art',
      description:
        'Explore stunning artworks from emerging Asian artists featuring calligraphy, paintings, and sculptures.',
      image:
        'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=400',
      price: 'Free for Students',
      date: 'Nov 15-17',
      location: 'Walker Art Center',
      phone: '(612) 375-7600',
      offer: 'Free Student Entry',
      cta: 'Get Tickets',
      icon: Palette,
      color: theme.accent,
      heritage: 'Asian',
    },
    {
      id: 3,
      type: 'restaurant',
      title: 'Tacos El Sol',
      subtitle: 'Mexican Street Food',
      description:
        'Authentic Mexican flavors with fresh ingredients, handmade tortillas, and traditional recipes passed down through generations.',
      image:
        'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400',
      price: '$-$$',
      rating: 4.6,
      location: 'West Bank',
      phone: '(612) 555-0456',
      hours: '10 AM - 11 PM',
      offer: 'Free Guacamole on Tuesdays',
      cta: 'Order Now',
      icon: Utensils,
      color: theme.success,
      heritage: 'Mexican',
      popularityByHeritage: { Mexican: 80, Nepali: 2 },
    },
    {
      id: 4,
      type: 'event',
      title: 'African Drum Circle',
      subtitle: 'Traditional Rhythms & Dance',
      description:
        'Join our weekly drum circle featuring traditional African rhythms, dance performances, and cultural storytelling.',
      image:
        'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400',
      price: 'Free',
      date: 'Every Friday',
      location: 'Northrop Mall',
      phone: '(612) 555-0789',
      offer: 'Drums Provided',
      cta: 'Join Circle',
      icon: Music,
      color: theme.primary,
      heritage: 'African',
    },
    {
      id: 5,
      type: 'restaurant',
      title: 'Pho Saigon',
      subtitle: 'Vietnamese Comfort Food',
      description:
        'Warm bowls of pho, fresh spring rolls, and authentic Vietnamese dishes made with love and traditional recipes.',
      image:
        'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=400',
      price: '$-$$',
      rating: 4.7,
      location: 'Dinkytown',
      phone: '(612) 555-0321',
      hours: '11 AM - 9 PM',
      offer: 'Student Lunch Special',
      cta: 'View Menu',
      icon: Utensils,
      color: theme.info,
      heritage: 'Vietnamese',
      popularityByHeritage: { Vietnamese: 60, Nepali: 8 },
    },
    {
      id: 6,
      type: 'event',
      title: 'Middle Eastern Film Festival',
      subtitle: 'Cinema & Culture',
      description:
        'A week-long celebration of Middle Eastern cinema featuring award-winning films, director Q&As, and cultural discussions.',
      image:
        'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400',
      price: '$5 per film',
      date: 'Dec 1-7',
      location: 'Bell Museum',
      phone: '(612) 555-0654',
      offer: 'Festival Pass Available',
      cta: 'Get Pass',
      icon: Camera,
      color: theme.warning,
      heritage: 'Middle Eastern',
    },
    {
      id: 7,
      type: 'restaurant',
      title: 'Sakura Sushi',
      subtitle: 'Japanese Fine Dining',
      description:
        'Premium sushi and sashimi prepared by master chefs using the freshest ingredients and traditional Japanese techniques.',
      image:
        'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=400',
      price: '$$$-$$$$',
      rating: 4.9,
      location: 'Uptown',
      phone: '(612) 555-0987',
      hours: '5 PM - 11 PM',
      offer: 'Happy Hour 5-7 PM',
      cta: 'Reserve Table',
      icon: Utensils,
      color: theme.accent,
      heritage: 'Japanese',
      popularityByHeritage: { Japanese: 70, Nepali: 1 },
    },
    {
      id: 8,
      type: 'event',
      title: 'Caribbean Carnival',
      subtitle: 'Music, Dance & Culture',
      description:
        'Experience the vibrant colors, infectious rhythms, and rich cultural heritage of the Caribbean through music and dance.',
      image:
        'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=400',
      price: '$15',
      date: 'Dec 15',
      location: 'Theater District',
      phone: '(612) 555-0123',
      offer: 'Early Bird Discount',
      cta: 'Buy Tickets',
      icon: Music,
      color: theme.success,
      heritage: 'Caribbean',
    },
  ];

  const handleCreateEvent = (eventData: any) => {
    setShowCreateEventModal(false);
  };

  const handleCreateQuickEvent = (eventData: any) => {
    setShowCreateQuickEventModal(false);
  };

  const handleCreateGroup = (groupData: any) => {
    setShowCreateGroupModal(false);
  };

  const handleShareStory = (storyData: any) => {
    setShowShareCultureModal(false);
  };

  const handlePostStory = () => {
    setShowStoriesModal(false);
    setShowShareCultureModal(true);
  };

  const getToday = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  };

  const normalize = (str: string) => (str || '').toLowerCase();

  const knownDays = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  const extractLocation = (q: string) => {
    // Try to extract a location from the query (city, university, state, etc.)
    const user: any = store.getState().currentUser;

    // Add null check for user
    if (!user) {
      console.log('User data not available for location extraction');
      return null;
    }

    const locations = [
      user.location,
      user.university,
      user.state,
      user.country,
    ];
    for (const loc of locations) {
      if (loc && q.includes(normalize(loc))) return loc;
    }

    // Try to match against group/event locations
    const state = store.getState();
    const groups = state.groups || [];
    const events = state.events || [];

    const allLocs = [
      ...groups.map((g) => g?.location),
      ...events.map((e) => e?.location),
    ].filter(Boolean);

    for (const loc of allLocs) {
      if (loc && q.includes(normalize(loc))) return loc;
    }

    return null;
  };

  const extractDay = (q: string) => {
    if (q.includes('today')) return getToday();
    for (const day of knownDays) {
      if (q.includes(day)) return day.charAt(0).toUpperCase() + day.slice(1);
    }
    return null;
  };

  // Step 3: Simple NLP helpers
  const heritageList = [
    'Nepali',
    'Indian',
    'Pakistani',
    'Vietnamese',
    'Japanese',
    'Mexican',
    'Chinese',
    'Korean',
    'African',
    'Middle Eastern',
    'Caribbean',
    'South Asian',
    'East Asian',
    'Hispanic',
    'Latino',
    'European',
    'Pacific Islander',
    'Native American',
    'International',
    'Mixed Heritage',
  ];

  function extractHeritage(q: string) {
    for (const h of heritageList) {
      if (q.includes(h.toLowerCase())) return h;
    }
    return null;
  }

  function extractIntent(q: string) {
    if (q.includes('food') || q.includes('restaurant') || q.includes('eat'))
      return 'food';
    if (
      q.includes('event') ||
      q.includes('activity') ||
      q.includes('happening')
    )
      return 'event';
    if (q.includes('group') || q.includes('community')) return 'group';
    return null;
  }

  const handleAISubmit = () => {
    const q = aiQuestion.trim().toLowerCase();
    if (!q) {
      setAIResults([{ type: 'info', text: 'Please enter a question.' }]);
      return;
    }

    try {
      // Step 2: Advanced logic for food/restaurant/heritage queries
      const heritage = extractHeritage(q);
      const intent = extractIntent(q);
      const location = extractLocation(q);
      const day = extractDay ? extractDay(q) : null;
      const outdoor = q.includes('outdoor');

      if (intent === 'food' && heritage) {
        // Find restaurants with highest popularity for that heritage near the user
        let restaurants = sponsoredContent.filter(
          (c: any) =>
            c.type === 'restaurant' &&
            c.popularityByHeritage &&
            c.popularityByHeritage[heritage]
        );

        if (location) {
          restaurants = restaurants.filter((r) =>
            normalize(r.location).includes(normalize(location))
          );
        }

        // Sort by popularity for that heritage
        restaurants.sort(
          (a: any, b: any) =>
            b.popularityByHeritage[heritage] - a.popularityByHeritage[heritage]
        );

        if (restaurants.length === 0) {
          setAIResults([
            {
              type: 'info',
              text: `No popular restaurants found for ${heritage} students in this area.`,
            },
          ]);
          return;
        }

        setAIResults(
          restaurants.map((r: any) => ({
            type: 'restaurant',
            name: r.title,
            location: r.location,
            popularity: r.popularityByHeritage[heritage],
            id: r.id,
          }))
        );

        return;
      }

      // Get store state safely
      const state = store.getState();
      const storeEvents = state.events || [];

      // Search events
      let events = storeEvents.filter(
        (e: any) =>
          (e.name && normalize(e.name).includes(q)) ||
          (e.description && normalize(e.description).includes(q)) ||
          (Array.isArray(e.category)
            ? e.category.some((cat: string) => normalize(cat).includes(q))
            : e.category && normalize(e.category).includes(q))
      );

      // Add location filter
      if (location) {
        events = events.filter(
          (e) =>
            e.location && normalize(e.location).includes(normalize(location))
        );
      }

      // Add day filter
      if (day) {
        events = events.filter((e: any) => {
          // Try to match day in event.date or event.time or event.name
          if (e.date && normalize(e.date).includes(day.toLowerCase()))
            return true;
          if (e.time && normalize(e.time).includes(day.toLowerCase()))
            return true;
          if (e.name && normalize(e.name).includes(day.toLowerCase()))
            return true;
          return false;
        });
      }

      // Outdoor filter
      if (outdoor) {
        events = events.filter(
          (e: any) =>
            (e.category &&
              Array.isArray(e.category) &&
              e.category.some((c: string) =>
                c.toLowerCase().includes('outdoor')
              )) ||
            (e.name && e.name.toLowerCase().includes('outdoor')) ||
            (e.description && e.description.toLowerCase().includes('outdoor'))
        );
      }

      // Search groups
      const storeGroups = state.groups || [];
      let groups = storeGroups.filter(
        (g) =>
          (g && g.name && normalize(g.name).includes(q)) ||
          (g && g.description && normalize(g.description).includes(q)) ||
          (g && g.category && normalize(g.category).includes(q))
      );

      // Apply filters to groups
      if (location) {
        groups = groups.filter(
          (g) =>
            g.location && normalize(g.location).includes(normalize(location))
        );
      }

      if (day) {
        groups = groups.filter((g) => {
          // Try to match day in meetingDays or meetingDate
          if (
            g.meetingDays &&
            Array.isArray(g.meetingDays) &&
            g.meetingDays.some((d) => normalize(d) === day.toLowerCase())
          )
            return true;
          if (
            g.meetingDate &&
            normalize(g.meetingDate).includes(day.toLowerCase())
          )
            return true;
          return false;
        });
      }

      if (outdoor) {
        groups = groups.filter(
          (g: any) =>
            (g.name && normalize(g.name).includes('outdoor')) ||
            (g.description && normalize(g.description).includes('outdoor')) ||
            (g.category &&
              (typeof g.category === 'string'
                ? normalize(g.category).includes('outdoor')
                : Array.isArray(g.category) &&
                  g.category.some((cat: string) =>
                    normalize(cat).includes('outdoor')
                  )))
        );
      }

      // Combine results or show not found
      if (events.length === 0 && groups.length === 0) {
        setAIResults([
          {
            type: 'info',
            text: `No results found for "${aiQuestion}". Try broadening your search.`,
          },
        ]);
        return;
      }

      setAIResults([
        ...groups.map((g) => ({
          type: 'group',
          name: g.name,
          description: g.description,
          location: g.location,
        })),
        ...events.map((e: any) => ({
          type: 'event',
          name: e.name,
          date: e.date,
          location: e.location,
        })),
      ]);
    } catch (error) {
      console.error('Error in AI search:', error);
      setAIResults([
        {
          type: 'info',
          text: 'Sorry, I encountered an error while searching. Please try again.',
        },
      ]);
    }
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
  // Dismiss modal on outside click
  useEffect(() => {
    if (!showAIModal || !isWeb) return;

    function handleClick(e: any) {
      //@ts-ignore
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowAIModal(false);
      }
    }

    // Type guard for document
    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showAIModal, isWeb]);

  const handleVoice = () => {
    if (
      !isWeb ||
      typeof window === 'undefined' ||
      !('webkitSpeechRecognition' in window)
    ) {
      alert('Voice recognition not supported in this environment.');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        setAIQuestion(event.results[0][0].transcript);
      }
    };
    recognition.start();
  };

  const welcomeMessages = [
    { first: 'Finding your culture just', second: 'got easier' },
    { first: 'Never celebrate', second: 'festivals alone' },
    { first: 'Discover new communities', second: 'and friends' },
    { first: 'Explore events from', second: 'every heritage' },
  ];
  // const [welcomeIndex, setWelcomeIndex] = useState(0);
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setWelcomeIndex((i) => (i + 1) % welcomeMessages.length);
  //   }, 3000);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Header setShowStoriesModal={setShowStoriesModal} />

        <UserStat currentUser={currentUser} />


        <QuickActions />
    <AutoplayVideo source={require('../../assets/trivo.mp4')} style={{}} />

        <CulturalExperiences />
         {/* <Image
      source={{ uri: "https://trivo-connect-data-01.s3.us-east-1.amazonaws.com/1757236034645-9b9fad2f-8720-4de2-844d-a59d23304c3f.jpeg" }}
      style={{ width: 200, height: 200 }}
      resizeMode="cover"
    /> */}

        <UpcommingEvents />
      </ScrollView>

      {/* Modals */}
      <CreateEventModal
        visible={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        onSubmit={handleCreateEvent}
      />

      <CreateQuickEventModal
        visible={showCreateQuickEventModal}
        onClose={() => setShowCreateQuickEventModal(false)}
        onSubmit={handleCreateQuickEvent}
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
      {/* <View
        style={{ position: 'absolute', bottom: 20, right: 16, zIndex: 200 }}
      >
        <TouchableOpacity
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: '#10B981',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.18,
            shadowRadius: 6,
            elevation: 6,
          }}
          onPress={() => setShowAIModal(true)}
          accessibilityLabel="Ask AI"
          accessibilityRole="button"
        >
          <Bot size={20} color="#fff" />
        </TouchableOpacity>
      </View> */}
      {/* AI Assistant Modal */}
      <Modal
        visible={showAIModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAIModal(false)}
      >
        <KeyboardAvoidingView
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View
            ref={modalRef}
            style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              padding: 24,
              width: 340,
              maxWidth: '90%',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Text
              style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}
            >
              Ask AI
            </Text>
            <View
              style={{ flexDirection: 'row', width: '100%', marginBottom: 12 }}
            >
              <TextInput
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 12,
                  padding: 12,
                }}
                placeholder="Ask about groups or events..."
                value={aiQuestion}
                onChangeText={setAIQuestion}
                onSubmitEditing={handleAISubmit}
                returnKeyType="search"
                autoFocus
              />
              {isWeb && (
                <TouchableOpacity
                  onPress={handleVoice}
                  style={{
                    marginLeft: 8,
                    backgroundColor: '#F3F4F6',
                    borderRadius: 12,
                    padding: 10,
                  }}
                >
                  <Text role="img" aria-label="mic">
                    🎤
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: '#10B981',
                borderRadius: 12,
                paddingVertical: 10,
                paddingHorizontal: 24,
                marginBottom: 12,
              }}
              onPress={handleAISubmit}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ask</Text>
            </TouchableOpacity>
            <View style={{ width: '100%' }}>
              {aiResults.map((result, idx) => (
                <View key={idx} style={{ marginBottom: 8 }}>
                  {result.type === 'restaurant' && (
                    <TouchableOpacity
                      onPress={() => {
                        // Optionally, show more details or open a map, etc.
                        Alert.alert(
                          result.name,
                          `Location: ${result.location}\nPopularity: ${
                            result.popularity
                          } ${
                            heritageList
                              .find(
                                (h) =>
                                  result.popularityByHeritage &&
                                  result.popularityByHeritage[h] ===
                                    result.popularity
                              )
                              ?.toLowerCase() || ''
                          } students`
                        );
                      }}
                    >
                      <Text
                        style={{
                          textDecorationLine: 'underline',
                          color: '#2563EB',
                        }}
                      >
                        Restaurant: {result.name} ({result.popularity}{' '}
                        {heritageList
                          .find(
                            (h) =>
                              result.popularityByHeritage &&
                              result.popularityByHeritage[h] ===
                                result.popularity
                          )
                          ?.toLowerCase() || ''}{' '}
                        students) - {result.location}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {result.type === 'group' && (
                    <TouchableOpacity
                      onPress={() => {
                        const group = store
                          .getState()
                          .groups.find((g) => g.name === result.name);
                        if (group) router.push(`/group/${group.id}`);
                      }}
                    >
                      <Text
                        style={{
                          textDecorationLine: 'underline',
                          color: '#2563EB',
                        }}
                      >
                        Group: {result.name}{' '}
                        {result.privacy === 'private' && result.canRequest && (
                          <Text style={{ color: '#EC4899' }}>
                            (Request to Join)
                          </Text>
                        )}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {result.type === 'event' && (
                    <TouchableOpacity
                      onPress={() => {
                        const event = store
                          .getState()
                          .events.find((e) => e.name === result.name);
                        if (event) router.push(`/event/${event.id}`);
                      }}
                    >
                      <Text
                        style={{
                          textDecorationLine: 'underline',
                          color: '#2563EB',
                        }}
                      >
                        Event: {result.name} - {result.date} @ {result.location}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {result.type === 'info' && <Text>{result.text}</Text>}
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={{ marginTop: 8 }}
              onPress={() => setShowAIModal(false)}
            >
              <Text style={{ color: '#EC4899', fontWeight: 'bold' }}>
                Close
              </Text>
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
    paddingHorizontal: spacing.sm,
  },

  // WELCOME CENTER
  welcomeCenterContainer: {
    alignItems: 'center',
    marginVertical: 32,
    paddingHorizontal: 20,
  },
  welcomeCenterTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A202C',
    letterSpacing: -0.5,
    lineHeight: 34,
    textAlign: 'center',
    fontFamily: 'System',
    // Subtle text shadow for depth
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  welcomeCenterTitleIndented: {
    marginLeft: 16,
    color: '#4A5568', // Slightly lighter for visual hierarchy
    fontSize: 26,
    fontWeight: '600',
    marginTop: 2,
    // Different shadow for secondary text
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
  },

  // Alternative version with background card
  welcomeCenterContainerCard: {
    alignItems: 'center',
    marginVertical: 32,
    marginHorizontal: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    // Neumorphism effect
    shadowColor: '#E2E8F0',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 0,
    // Inner highlight
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
});
