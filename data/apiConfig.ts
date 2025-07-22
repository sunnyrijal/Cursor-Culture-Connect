// Base API URL configuration
export const API_BASE_URL = 'http://localhost:5002/api';

// Auth API endpoints
export const AUTH_API = {
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  logout: `${API_BASE_URL}/auth/logout`,
  me: `${API_BASE_URL}/auth/me`,
};

// User API endpoints
export const USER_API = {
  profile: `${API_BASE_URL}/user/profile`,
  updateProfile: `${API_BASE_URL}/user/update-profile`,
};

// Group API endpoints
export const GROUP_API = {
  all: `${API_BASE_URL}/groups`,
  myGroups: `${API_BASE_URL}/groups/my-groups`,
  details: (id: string | number) => `${API_BASE_URL}/groups/${id}`,
  create: `${API_BASE_URL}/groups`,
  join: (id: string | number) => `${API_BASE_URL}/groups/${id}/join`,
  joinRequests: (id: string | number) => `${API_BASE_URL}/groups/${id}/join-requests`,
  respondToJoinRequest: (requestId: string) => `${API_BASE_URL}/groups/join-requests/${requestId}`,
  addAdmin: (groupId: string | number, userId: string) => `${API_BASE_URL}/groups/${groupId}/admins/${userId}`,
  removeAdmin: (groupId: string | number, userId: string) => `${API_BASE_URL}/groups/${groupId}/admins/${userId}`,
};

// Event API endpoints
export const EVENT_API = {
  all: `${API_BASE_URL}/events`,
  myEvents: `${API_BASE_URL}/events/my-events`,
  details: (id: string | number) => `${API_BASE_URL}/events/${id}`,
  create: `${API_BASE_URL}/events`,
  pendingRequests: `${API_BASE_URL}/events/requests/pending`,
  respondToEventRequest: (requestId: string) => `${API_BASE_URL}/events/requests/${requestId}`,
  rsvp: (id: string | number) => `${API_BASE_URL}/events/${id}/rsvp`,
  favorite: (id: string | number) => `${API_BASE_URL}/events/${id}/favorite`,
  groupEvents: (groupId: string | number) => `${API_BASE_URL}/events/group/${groupId}`,
};

// Notification API endpoints
export const NOTIFICATION_API = {
  all: `${API_BASE_URL}/notifications`,
  unreadCount: `${API_BASE_URL}/notifications/unread-count`,
  markAsRead: (id: string) => `${API_BASE_URL}/notifications/${id}/read`,
  markAllAsRead: `${API_BASE_URL}/notifications/read-all`,
}; 