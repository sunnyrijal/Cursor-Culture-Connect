import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as api from './api';
import { useAuth } from './authContext';

// Define Activity types
type Activity = {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  equipment?: string[];
  transportation?: boolean;
  indoor?: boolean;
  outdoor?: boolean;
  skillLevel?: string;
  maxParticipants?: number;
  duration?: number;
  [key: string]: any;
};

type ActivityPreference = {
  id: string;
  activityId: string;
  userId: string;
  isOpen: boolean;
  locationRadius?: number;
  equipment?: string;
  transportation?: string;
  skillLevel?: string;
  notes?: string;
  availability?: any[];
  [key: string]: any;
};

type ActivityMatch = {
  user: any;
  matchScore: number;
  commonAvailability?: any[];
  preference?: ActivityPreference;
  [key: string]: any;
};

type ActivityRequest = {
  id: string;
  message: string;
  proposedDateTime?: string;
  location?: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  requesterId: string;
  recipientId: string;
  activityId: string;
  requester?: any;
  recipient?: any;
  activity?: Activity;
  [key: string]: any;
};

type ActivityContextType = {
  activities: Activity[];
  userPreferences: ActivityPreference[];
  matches: ActivityMatch[];
  receivedRequests: ActivityRequest[];
  sentRequests: ActivityRequest[];
  loading: boolean;
  error: string | null;
  fetchActivities: () => Promise<void>;
  fetchUserPreferences: () => Promise<void>;
  updatePreference: (activityId: string, preferenceData: any) => Promise<void>;
  deletePreference: (activityId: string) => Promise<void>;
  findActivityBuddies: (activityId: string) => Promise<ActivityMatch[]>;
  sendActivityRequest: (userId: string, activityId: string, requestData: any) => Promise<void>;
  fetchReceivedRequests: () => Promise<void>;
  fetchSentRequests: () => Promise<void>;
  respondToRequest: (requestId: string, status: 'accepted' | 'declined' | 'cancelled') => Promise<void>;
};

// Create context with default values
const ActivityContext = createContext<ActivityContextType>({
  activities: [],
  userPreferences: [],
  matches: [],
  receivedRequests: [],
  sentRequests: [],
  loading: false,
  error: null,
  fetchActivities: async () => {},
  fetchUserPreferences: async () => {},
  updatePreference: async () => {},
  deletePreference: async () => {},
  findActivityBuddies: async () => [],
  sendActivityRequest: async () => {},
  fetchReceivedRequests: async () => {},
  fetchSentRequests: async () => {},
  respondToRequest: async () => {},
});

// Custom hook to use the activity context
export const useActivities = () => useContext(ActivityContext);

// Provider component
export const ActivityProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userPreferences, setUserPreferences] = useState<ActivityPreference[]>([]);
  const [matches, setMatches] = useState<ActivityMatch[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ActivityRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ActivityRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Fetch all activities
  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getActivities();
      setActivities(response.activities);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch activities');
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's activity preferences
  const fetchUserPreferences = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.getUserActivityPreferences();
      setUserPreferences(response.preferences);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user preferences');
      console.error('Error fetching user preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update or create a preference for an activity
  const updatePreference = async (activityId: string, preferenceData: any) => {
    setLoading(true);
    setError(null);
    try {
      await api.updateActivityPreference(activityId, preferenceData);
      await fetchUserPreferences();
    } catch (err: any) {
      setError(err.message || 'Failed to update preference');
      console.error('Error updating preference:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a preference for an activity
  const deletePreference = async (activityId: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteActivityPreference(activityId);
      await fetchUserPreferences();
    } catch (err: any) {
      setError(err.message || 'Failed to delete preference');
      console.error('Error deleting preference:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Find activity buddies for a specific activity
  const findActivityBuddies = async (activityId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.findActivityBuddies(activityId);
      setMatches(response.matches);
      return response.matches;
    } catch (err: any) {
      setError(err.message || 'Failed to find activity buddies');
      console.error('Error finding activity buddies:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Send activity request to a user
  const sendActivityRequest = async (userId: string, activityId: string, requestData: any) => {
    setLoading(true);
    setError(null);
    try {
      await api.createActivityRequest(userId, activityId, requestData);
      await fetchSentRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to send activity request');
      console.error('Error sending activity request:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch received activity requests
  const fetchReceivedRequests = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.getReceivedActivityRequests();
      setReceivedRequests(response.requests);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch received requests');
      console.error('Error fetching received requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sent activity requests
  const fetchSentRequests = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.getSentActivityRequests();
      setSentRequests(response.requests);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sent requests');
      console.error('Error fetching sent requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Respond to activity request
  const respondToRequest = async (requestId: string, status: 'accepted' | 'declined' | 'cancelled') => {
    setLoading(true);
    setError(null);
    try {
      await api.respondToActivityRequest(requestId, status);
      await fetchReceivedRequests();
      await fetchSentRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to respond to request');
      console.error('Error responding to request:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load activities and user preferences when the component mounts or auth state changes
  useEffect(() => {
    fetchActivities();
    if (isAuthenticated) {
      fetchUserPreferences();
      fetchReceivedRequests();
      fetchSentRequests();
    } else {
      setUserPreferences([]);
      setReceivedRequests([]);
      setSentRequests([]);
    }
  }, [isAuthenticated]);

  const value = {
    activities,
    userPreferences,
    matches,
    receivedRequests,
    sentRequests,
    loading,
    error,
    fetchActivities,
    fetchUserPreferences,
    updatePreference,
    deletePreference,
    findActivityBuddies,
    sendActivityRequest,
    fetchReceivedRequests,
    fetchSentRequests,
    respondToRequest,
  };

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
};

export default ActivityContext; 