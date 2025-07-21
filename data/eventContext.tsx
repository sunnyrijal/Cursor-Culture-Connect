import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as api from './api';
import { useAuth } from './authContext';
import { Alert } from 'react-native';

// Define Event type
type Event = {
  id: string;
  title: string;
  name?: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string[];
  organizer: string;
  image?: string;
  isRSVPed?: boolean;
  isFavorited?: boolean;
  [key: string]: any;
};

type EventContextType = {
  events: Event[];
  userEvents: Event[];
  favoriteEvents: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: (filters?: any) => Promise<void>;
  fetchUserEvents: () => Promise<void>;
  fetchFavoriteEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<Event>;
  createEvent: (eventData: any) => Promise<Event>;
  updateEvent: (id: string, eventData: any) => Promise<Event>;
  rsvpEvent: (id: string) => Promise<void>;
  cancelRsvp: (id: string) => Promise<void>;
  toggleFavorite: (id: string, favorite: boolean) => Promise<void>;
};

// Create context with default values
const EventContext = createContext<EventContextType>({
  events: [],
  userEvents: [],
  favoriteEvents: [],
  loading: false,
  error: null,
  fetchEvents: async () => {},
  fetchUserEvents: async () => {},
  fetchFavoriteEvents: async () => {},
  fetchEventById: async () => ({ 
    id: '', 
    title: '', 
    description: '', 
    date: '', 
    time: '', 
    location: '', 
    category: [], 
    organizer: '' 
  }),
  createEvent: async () => ({ 
    id: '', 
    title: '', 
    description: '', 
    date: '', 
    time: '', 
    location: '', 
    category: [], 
    organizer: '' 
  }),
  updateEvent: async () => ({ 
    id: '', 
    title: '', 
    description: '', 
    date: '', 
    time: '', 
    location: '', 
    category: [], 
    organizer: '' 
  }),
  rsvpEvent: async () => {},
  cancelRsvp: async () => {},
  toggleFavorite: async () => {},
});

// Custom hook to use the event context
export const useEvents = () => useContext(EventContext);

// Provider component
export const EventProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Fetch all events
  const fetchEvents = async (filters: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching events with filters:', filters);
      const response = await api.getEvents(filters);
      console.log('Events fetched successfully:', response.events?.length || 0, 'events');
      setEvents(response.events || []);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch events';
      console.error('Error fetching events:', err);
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Fetch events the user has RSVP'd to
  const fetchUserEvents = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching user events');
      const response = await api.getUserEvents();
      console.log('User events fetched successfully:', response.events?.length || 0, 'events');
      setUserEvents(response.events || []);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch user events';
      console.error('Error fetching user events:', err);
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Fetch events the user has favorited
  const fetchFavoriteEvents = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching favorite events');
      const response = await api.getUserEvents('favorites');
      console.log('Favorite events fetched successfully:', response.events?.length || 0, 'events');
      setFavoriteEvents(response.events || []);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch favorite events';
      console.error('Error fetching favorite events:', err);
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single event by ID
  const fetchEventById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching event by ID:', id);
      const response = await api.getEventById(id);
      console.log('Event fetched successfully:', response.event?.title || response.event?.name);
      return response.event;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch event';
      console.error('Error fetching event:', err);
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new event
  const createEvent = async (eventData: any) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Creating event with data:', eventData);
      const response = await api.createEvent(eventData);
      console.log('Event created successfully:', response.event?.title || response.event?.name);
      await fetchEvents();
      await fetchUserEvents();
      return response.event;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create event';
      console.error('Error creating event:', err);
      setError(errorMsg);
      Alert.alert('Error', 'Failed to create event: ' + errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing event
  const updateEvent = async (id: string, eventData: any) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Updating event with ID:', id, 'data:', eventData);
      const response = await api.updateEvent(id, eventData);
      console.log('Event updated successfully:', response.event?.title || response.event?.name);
      await fetchEvents();
      await fetchUserEvents();
      return response.event;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update event';
      console.error('Error updating event:', err);
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Toggle RSVP status for an event
  const toggleRsvp = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Find the event to check if user is already attending
      const event = events.find(e => e.id === id) || 
                    userEvents.find(e => e.id === id);
      
      if (!event) {
        console.error('Event not found for RSVP toggle:', id);
        setError('Event not found');
        Alert.alert('Error', 'Event not found');
        setLoading(false);
        return;
      }
      
      const isAttending = Boolean(event.isRSVPed);
      console.log(`Toggling RSVP for event ${id}, current status:`, isAttending ? 'attending' : 'not attending');
      
      // Update the local state optimistically for immediate feedback
      const updatedEvents = events.map(e => 
        e.id === id ? { ...e, isRSVPed: !isAttending, attendees: isAttending ? (e.attendees - 1) : (e.attendees + 1) } : e
      );
      setEvents(updatedEvents);
      
      // Call our dedicated toggle API function
      await api.toggleRsvp(id, isAttending);
      console.log(`RSVP ${isAttending ? 'cancellation' : 'registration'} successful`);
      
      // Refresh event data from server to ensure consistency
      await fetchEvents();
      await fetchUserEvents();
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to toggle RSVP status';
      
      // If the error is about already attending or not attending, just refresh the data
      if (errorMsg.includes('already attending') || errorMsg.includes('not attending')) {
        console.log('RSVP state mismatch, refreshing data...');
        await fetchEvents();
        await fetchUserEvents();
      } else {
        console.error('Error toggling RSVP status:', err);
        setError(errorMsg);
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // RSVP to an event (legacy - use toggleRsvp instead)
  const rsvpEvent = async (id: string) => {
    return toggleRsvp(id);
  };
  
  // Cancel RSVP to an event (legacy - use toggleRsvp instead)
  const cancelRsvp = async (id: string) => {
    return toggleRsvp(id);
  };

  // Toggle favorite status for an event
  const toggleFavorite = async (id: string, favorite: boolean) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`${favorite ? 'Adding' : 'Removing'} favorite for event with ID:`, id);
      await api.toggleFavorite(id, favorite);
      console.log('Favorite toggle successful');
      await fetchEvents();
      await fetchFavoriteEvents();
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to toggle favorite status';
      console.error('Error toggling favorite status:', err);
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load events when the component mounts or auth state changes
  useEffect(() => {
    console.log('EventContext: Auth state changed, isAuthenticated =', isAuthenticated);
    fetchEvents();
    if (isAuthenticated) {
      fetchUserEvents();
      fetchFavoriteEvents();
    } else {
      setUserEvents([]);
      setFavoriteEvents([]);
    }
  }, [isAuthenticated]);

  const value = {
    events,
    userEvents,
    favoriteEvents,
    loading,
    error,
    fetchEvents,
    fetchUserEvents,
    fetchFavoriteEvents,
    fetchEventById,
    createEvent,
    updateEvent,
    rsvpEvent,
    cancelRsvp,
    toggleFavorite,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export default EventContext; 