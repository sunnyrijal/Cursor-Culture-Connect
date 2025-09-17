import { isNativePlatformSupported } from 'react-native-screens/lib/typescript/core';
import api from './axiosConfig'; // adjust path as needed
import { AxiosResponse } from 'axios';
import { University } from 'lucide-react-native';

export interface EventTime {
  startTime: string;
  endTime: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  eventTimes: EventTime[];
  location: string;
  imageurl?: string;
  groupId: string;
  isPublic: boolean;
  universityOnly: boolean;
  organizerId: string;
  organizerName?: string;
  maxAttendees?: number;
  currentAttendees?: number;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  name: string;
  description: string;
  date: string;
  eventTimes: EventTime[];
  location: string;
  imageurl?: string | null;
  UniversityOnly: boolean;
  associatedGroupId?: string | null;
}

export interface UpdateEventData {
  name?: string;
  description?: string;
  date?: string;
  eventTimes?: EventTime[];
  location?: string;
  imageurl?: string;
  groupId?: string;
  isPublic?: boolean;
  universityOnly?: boolean;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface GetEventsParams {
  page?: number;
  limit?: number;
  groupId?: string;
  location?: string;
  status?: string;
  search?: string;
  isPublic?: boolean;
  universityOnly?: boolean;
  sortBy?: 'date' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

const convertTimeStringToDate = (
  timeString: string,
  eventDate: string
): Date => {
  // Parse the time string (e.g., "5:30", "14:45")
  const [hours, minutes] = timeString
    .split(':')
    .map((num) => parseInt(num, 10));

  // Create a new Date object from the event date
  const date = new Date(eventDate);

  // Set the hours and minutes
  date.setHours(hours, minutes, 0, 0); // hours, minutes, seconds, milliseconds

  return date;
};

// Helper function to process event times array
const processEventTimes = (
  eventTimes: Array<{ startTime: string; endTime: string }>,
  eventDate: string
) => {
  return eventTimes.map((timeSlot) => ({
    startTime: convertTimeStringToDate(timeSlot.startTime, eventDate),
    endTime: convertTimeStringToDate(timeSlot.endTime, eventDate),
  }));
};

export const createEvent = async (eventData: CreateEventData) => {
  console.log(
    'Original eventTimes:',
    eventData.eventTimes,
    'Date:',
    eventData.date
  );

  try {
    const processedEventTimes = processEventTimes(
      eventData.eventTimes,
      eventData.date
    );

    const processedEventData = {
      ...eventData,
      eventTimes: processedEventTimes,
    };

    const response = await api.post('/event/create', processedEventData);
    return response.data;
  } catch (error) {
    console.log(error);
    console.error('Error creating event:', error);
    throw error;
  }
};

export const getEvents = async (params?: GetEventsParams) => {
  try {
    const response = await api.get('/event/all', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const getEvent = async (eventId: string | null) => {
  try {
    const response = await api.get(`/event/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

// Update an event
export const updateEvent = async (
  eventId: string,
  eventData: UpdateEventData
) => {
  try {
    const response = await api.put(`/event/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId: string) => {
  try {
    const response = await api.delete(`/event/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};
