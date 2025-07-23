// project/types/event.ts

export interface Event {
  id: string | number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string[];
  organizer?: string;
  attendees?: number;
  maxAttendees?: number;
  isRSVPed?: boolean;
  isFavorited?: boolean;
  image?: string;
  price?: string | number;
  distance?: string;
  universityOnly?: boolean;
  allowedUniversity?: string;
  groupId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  creatorId?: string;
}

// Alias for backward compatibility
export interface MockEvent extends Event {}