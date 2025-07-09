// project/types/event.ts

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string[];
  organizer: string;
  attendees: number;
  maxAttendees?: number;
  isRSVPed: boolean;
  isFavorited: boolean;
  image: string;
  price?: string;
  distance: string;
  universityOnly?: boolean;
  allowedUniversity?: string;
}

// Alias for backward compatibility
export interface MockEvent extends Event {}