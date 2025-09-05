import { User } from '@/types/user';
import { Event } from '@/types/event';
import { Group } from '@/types/group';
import { mockUsersByHeritage, mockEvents, mockGroups } from './mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Combine all users into a single array
const allUsers: User[] = Object.values(mockUsersByHeritage).flat();

interface AppState {
  users: User[];
  events: Event[];
  groups: Group[];
  currentUser: User | null; // Change to allow null for logged out state
  connections: Record<string, string[]>; // Store connections as a map of user IDs
  rsvps: Record<string, number[]>; // Store RSVPs as a map of user IDs to event IDs
  favorites: Record<string, number[]>; // Store favorites as a map of user IDs to event IDs
}

// In-memory store with immutable updates
const state: AppState = {
  users: allUsers,
  events: [...mockEvents],
  groups: [...mockGroups],
  currentUser: null, // Initialize as null
  connections: {
    '1': ['2', '3'], // Mock initial connections for the current user
  },
  rsvps: {
    '1': [1, 2], // Mock initial RSVPs for the current user
  },
  favorites: {
    '1': [1, 3], // Mock initial favorites for the current user
  },
};

// Auth methods
export const login = (email: string, password: string): boolean => {
  const user = state.users.find((u) => u.email === email);
  if (user && user.password === password) {
    // In a real app, compare hashed passwords
    state.currentUser = user;
    return true;
  }
  return false;
};

export const signup = (user: User): boolean => {
  // Check if user already exists
  if (state.users.some((u) => u.email === user.email)) {
    return false;
  }
  state.users.push(user);
  state.currentUser = user;
  return true;
};

export const logout = async (): Promise<void> => {
  state.currentUser = null;
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('userId');
};

export const getCurrentUser = (): User | null => state.currentUser;

export const store = {
  getState: () => ({ ...state }),

  // User actions
  getUserById: (id: string | number): User | undefined => {
    return state.users.find((user) => user.id.toString() === id.toString());
  },

  getConnections: (userId: string): User[] => {
    const connectionIds = state.connections[userId] || [];
    return state.users.filter((user) =>
      connectionIds.includes(user.id.toString())
    );
  },

  isConnected: (userId: string, targetId: string): boolean => {
    return state.connections[userId]?.includes(targetId) || false;
  },

  toggleConnection: (userId: string, targetId: string) => {
    const connections = [...(state.connections[userId] || [])];
    const index = connections.indexOf(targetId);

    if (index > -1) {
      connections.splice(index, 1);
    } else {
      connections.push(targetId);
    }

    state.connections = {
      ...state.connections,
      [userId]: connections,
    };

    console.log(`Connections for user ${userId}:`, state.connections[userId]);
  },

  updateUserProfile: (updatedProfile: Partial<User>) => {
    const userIndex = state.users.findIndex((u) => u.id === updatedProfile.id);
    if (userIndex !== -1) {
      state.users = [
        ...state.users.slice(0, userIndex),
        { ...state.users[userIndex], ...updatedProfile },
        ...state.users.slice(userIndex + 1),
      ];
    }
  },

  // Event actions
  getEventById: (id: number): Event | undefined => {
    console.log(id);
    console.log(state.events);
    const event = state.events.find((event) => event.id === id);
    console.log(event);
    return event;
  },

  toggleRsvp: (userId: string, eventId: number) => {
    const rsvps = [...(state.rsvps[userId] || [])];
    const index = rsvps.indexOf(eventId);

    if (index > -1) {
      rsvps.splice(index, 1);
    } else {
      rsvps.push(eventId);
    }

    state.rsvps = {
      ...state.rsvps,
      [userId]: rsvps,
    };

    // Update the isRSVPed status in the main events array
    const eventIndex = state.events.findIndex((e) => e.id === eventId);
    if (eventIndex > -1) {
      const event = state.events[eventIndex];
      state.events = [
        ...state.events.slice(0, eventIndex),
        { ...event, isRSVPed: !event.isRSVPed },
        ...state.events.slice(eventIndex + 1),
      ];
    }
  },

  toggleFavorite: (userId: string, eventId: number) => {
    const favorites = [...(state.favorites[userId] || [])];
    const index = favorites.indexOf(eventId);

    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(eventId);
    }

    state.favorites = {
      ...state.favorites,
      [userId]: favorites,
    };

    // Update the isFavorited status in the main events array
    const eventIndex = state.events.findIndex((e) => e.id === eventId);
    if (eventIndex > -1) {
      const event = state.events[eventIndex];
      state.events = [
        ...state.events.slice(0, eventIndex),
        { ...event, isFavorited: !event.isFavorited },
        ...state.events.slice(eventIndex + 1),
      ];
    }
  },

  createEvent: (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: state.events.length + 1,
      attendees: 0,
      isRSVPed: false,
      isFavorited: false,
      distance: '0.1 miles',
    };
    state.events = [newEvent, ...state.events]; // Add to the beginning of the list
  },

  // Group actions
  getGroupById: (id: number): Group | undefined => {
    return state.groups.find((group) => group.id === id);
  },

  toggleGroupMembership: (userId: string, groupId: number) => {
    const groupIndex = state.groups.findIndex((g) => g.id === groupId);
    if (groupIndex > -1) {
      const group = state.groups[groupIndex];
      const updatedGroup = {
        ...group,
        isJoined: !group.isJoined,
        memberCount: group.isJoined
          ? group.memberCount - 1
          : group.memberCount + 1,
      };

      state.groups = [
        ...state.groups.slice(0, groupIndex),
        updatedGroup,
        ...state.groups.slice(groupIndex + 1),
      ];
    }
  },

  createGroup: (
    groupData: Omit<
      Group,
      'id' | 'memberCount' | 'isJoined' | 'recentActivity' | 'upcomingEvents'
    >
  ) => {
    const newGroup: Group = {
      ...groupData,
      id: state.groups.length + 1,
      memberCount: 1,
      isJoined: true,
      recentActivity: 'just now',
      upcomingEvents: 0,
    };
    state.groups = [newGroup, ...state.groups]; // Add to the beginning of the list
  },
};
