import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL - use the Docker service name for container-to-container communication
// This ensures the frontend container communicates directly with the backend container
// through the Docker internal network without exposing the URL publicly
const API_URL = 'http://localhost:5001/api';

// For debugging purposes
export { API_URL };

// Generic API call function with auth header
const apiCall = async (endpoint: string, method = 'GET', data?: any) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    console.log(`API Request: ${method} ${API_URL}${endpoint}`, data ? { data } : '');
    
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const contentType = response.headers.get("content-type");
    
    let responseData;
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch (e) {
        responseData = { message: text || 'No response data' };
      }
    }

    if (!response.ok) {
      console.error('API Error Response:', responseData);
      
      // Special handling for RSVP-related errors
      if (endpoint.includes('/rsvp') && responseData.message) {
        // Create a proper error object with all details
        const error: any = new Error(responseData.message);
        error.status = response.status;
        error.details = responseData.details || '';
        error.endpoint = endpoint;
        error.method = method;
        throw error;
      }
      
      throw new Error(responseData.message || `Request failed with status ${response.status}`);
    }

    return responseData;
  } catch (error) {
    console.error(`API Error for ${method} ${endpoint}:`, error);
    throw error;
  }
};

// Authentication APIs
export const login = async (credentials: { email: string; password: string }) => {
  return apiCall('/auth/login', 'POST', credentials);
};

export const register = async (userData: any) => {
  return apiCall('/auth/register', 'POST', userData);
};

export const getCurrentUser = async () => {
  return apiCall('/users/profile');
};

export const updateProfile = async (userData: any) => {
  return apiCall('/users/profile', 'PUT', userData);
};

// User APIs
export const getUsers = async (filters: any = {}) => {
  const queryParams = new URLSearchParams();
  Object.keys(filters).forEach((key) => {
    if (filters[key]) queryParams.append(key, filters[key]);
  });
  return apiCall(`/users?${queryParams.toString()}`);
};

export const getUserById = async (id: string) => {
  return apiCall(`/users/${id}`);
};

// Group APIs
export const getGroups = async (filters: any = {}) => {
  const queryParams = new URLSearchParams();
  Object.keys(filters).forEach((key) => {
    if (filters[key]) queryParams.append(key, filters[key]);
  });
  return apiCall(`/groups?${queryParams.toString()}`);
};

export const getUserGroups = async () => {
  return apiCall('/users/groups/all');
};

export const getGroupById = async (id: string) => {
  return apiCall(`/groups/${id}`);
};

export const createGroup = async (groupData: any) => {
  return apiCall('/groups', 'POST', groupData);
};

export const updateGroup = async (id: string, groupData: any) => {
  return apiCall(`/groups/${id}`, 'PUT', groupData);
};

export const joinGroup = async (id: string) => {
  return apiCall(`/groups/${id}/join`, 'POST');
};

export const leaveGroup = async (id: string) => {
  return apiCall(`/groups/${id}/leave`, 'POST');
};

export const addGroupMedia = async (id: string, mediaData: any) => {
  return apiCall(`/groups/${id}/media`, 'POST', mediaData);
};

// Event APIs
export const getEvents = async (filters: any = {}) => {
  const queryParams = new URLSearchParams();
  Object.keys(filters).forEach((key) => {
    if (filters[key]) queryParams.append(key, filters[key]);
  });
  return apiCall(`/events?${queryParams.toString()}`);
};

export const getUserEvents = async (type: string = 'attending') => {
  return apiCall(`/users/events/all?type=${type}`);
};

export const getEventById = async (id: string) => {
  return apiCall(`/events/${id}`);
};

export const createEvent = async (eventData: any) => {
  // Format data properly for backend
  const formattedData = {
    ...eventData,
    // Ensure numeric fields are properly formatted
    maxAttendees: eventData.maxAttendees || null,
    price: eventData.price || 0,
  };
  
  console.log('Creating event with formatted data:', formattedData);
  return apiCall('/events', 'POST', formattedData);
};

export const updateEvent = async (id: string, eventData: any) => {
  return apiCall(`/events/${id}`, 'PUT', eventData);
};

export const rsvpEvent = async (id: string) => {
  return apiCall(`/events/${id}/rsvp`, 'POST');
};

export const cancelRsvp = async (id: string) => {
  return apiCall(`/events/${id}/rsvp`, 'DELETE');
};

export const toggleFavorite = async (id: string, favorite: boolean) => {
  return apiCall(`/events/${id}/favorite`, favorite ? 'POST' : 'DELETE');
};

// Add a new API function specifically for toggling RSVP
export const toggleRsvp = async (id: string, isCurrentlyAttending: boolean) => {
  if (isCurrentlyAttending) {
    // If already attending, cancel RSVP
    return apiCall(`/events/${id}/rsvp`, 'DELETE');
  } else {
    // If not attending, add RSVP
    return apiCall(`/events/${id}/rsvp`, 'POST');
  }
};

// Activity APIs
export const getActivities = async () => {
  return apiCall('/activities');
};

export const getUserActivityPreferences = async () => {
  return apiCall('/users/activity-preferences');
};

export const updateActivityPreference = async (activityId: string, preferenceData: any) => {
  return apiCall(`/activities/${activityId}/preferences`, 'PUT', preferenceData);
};

export const deleteActivityPreference = async (activityId: string) => {
  return apiCall(`/activities/${activityId}/preferences`, 'DELETE');
};

export const findActivityBuddies = async (activityId: string) => {
  return apiCall(`/activities/${activityId}/buddies`);
};

export const createActivityRequest = async (userId: string, activityId: string, requestData: any) => {
  return apiCall(`/users/${userId}/activity-requests/${activityId}`, 'POST', requestData);
};

export const getReceivedActivityRequests = async () => {
  return apiCall('/users/activity-requests/received');
};

export const getSentActivityRequests = async () => {
  return apiCall('/users/activity-requests/sent');
};

export const respondToActivityRequest = async (requestId: string, status: string) => {
  return apiCall(`/activity-requests/${requestId}/respond`, 'PUT', { status });
};

// Chat APIs
export const getConversations = async () => {
  return apiCall('/chat/conversations');
};

export const getConversationMessages = async (conversationId: string) => {
  return apiCall(`/chat/conversations/${conversationId}/messages`);
};

export const sendMessage = async (conversationId: string, messageData: any) => {
  return apiCall(`/chat/conversations/${conversationId}/messages`, 'POST', messageData);
};

export const createConversation = async (participants: string[]) => {
  return apiCall('/chat/conversations', 'POST', { participants });
};

export const createGroupChat = async (groupId: string) => {
  return apiCall(`/groups/${groupId}/chat`, 'POST');
};

// File upload helper
export const uploadFile = async (file: any, type: 'avatar' | 'group' | 'event' | 'message' = 'message') => {
  const token = await AsyncStorage.getItem('token');
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  try {
    const response = await fetch(`${API_URL}/media/upload`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'File upload failed');
    }
    
    return data;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}; 