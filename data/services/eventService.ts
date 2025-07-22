import { EVENT_API } from '../apiConfig';
import { getAuthToken } from './authService';

// Common request function with authentication
const authRequest = async (url: string, method: string, body?: any) => {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  const options: RequestInit = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Get all events
export const getAllEvents = async () => {
  try {
    return await authRequest(EVENT_API.all, 'GET');
  } catch (error) {
    console.error('Get all events error:', error);
    throw error;
  }
};

// Get user's events (attending, favorited, created)
export const getUserEvents = async () => {
  try {
    return await authRequest(EVENT_API.myEvents, 'GET');
  } catch (error) {
    console.error('Get user events error:', error);
    throw error;
  }
};

// Get event by ID
export const getEventById = async (eventId: string | number) => {
  try {
    return await authRequest(EVENT_API.details(eventId), 'GET');
  } catch (error) {
    console.error('Get event by ID error:', error);
    throw error;
  }
};

// Create a new event
export const createEvent = async (eventData: any) => {
  try {
    return await authRequest(EVENT_API.create, 'POST', eventData);
  } catch (error) {
    console.error('Create event error:', error);
    throw error;
  }
};

// Get pending event approval requests
export const getPendingEventRequests = async () => {
  try {
    return await authRequest(EVENT_API.pendingRequests, 'GET');
  } catch (error) {
    console.error('Get pending event requests error:', error);
    throw error;
  }
};

// Respond to event request (approve/reject)
export const respondToEventRequest = async (requestId: string, status: 'approved' | 'rejected', message?: string) => {
  try {
    return await authRequest(EVENT_API.respondToEventRequest(requestId), 'PUT', { 
      status,
      message
    });
  } catch (error) {
    console.error('Respond to event request error:', error);
    throw error;
  }
};

// RSVP to an event (toggle)
export const rsvpToEvent = async (eventId: string | number) => {
  try {
    return await authRequest(EVENT_API.rsvp(eventId), 'POST');
  } catch (error) {
    console.error('RSVP to event error:', error);
    throw error;
  }
};

// Favorite/unfavorite an event (toggle)
export const favoriteEvent = async (eventId: string | number) => {
  try {
    return await authRequest(EVENT_API.favorite(eventId), 'POST');
  } catch (error) {
    console.error('Favorite event error:', error);
    throw error;
  }
};

// Get events for a group
export const getGroupEvents = async (groupId: string | number) => {
  try {
    return await authRequest(EVENT_API.groupEvents(groupId), 'GET');
  } catch (error) {
    console.error('Get group events error:', error);
    throw error;
  }
}; 