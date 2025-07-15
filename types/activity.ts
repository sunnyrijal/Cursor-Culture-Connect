// project/types/activity.ts

export interface Activity {
  id: string;
  name: string;
  category: ActivityCategory;
  icon: string;
  description: string;
  equipment?: string[];
  transportation?: boolean;
  indoor?: boolean;
  outdoor?: boolean;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  maxParticipants?: number;
  duration?: number; // in minutes
}

export type ActivityCategory = 
  | 'sports' 
  | 'fitness' 
  | 'volunteering' 
  | 'outdoor' 
  | 'social' 
  | 'cultural' 
  | 'hobby';

export interface UserActivityPreference {
  id: string;
  userId: string;
  activityId: string;
  activity: Activity;
  isOpen: boolean;
  locationRadius: number; // in miles/km
  availability: Availability[];
  equipment: EquipmentStatus;
  transportation: TransportationStatus;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Availability {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export type EquipmentStatus = 'have' | 'need' | 'can_share' | 'not_needed';
export type TransportationStatus = 'have_car' | 'need_ride' | 'can_drive' | 'public_transit' | 'walking_distance';

export interface ActivityRequest {
  id: string;
  requesterId: string;
  requester: User;
  activityId: string;
  activity: Activity;
  message: string;
  proposedDateTime?: Date;
  location?: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityMatch {
  id: string;
  user1Id: string;
  user2Id: string;
  activityId: string;
  activity: Activity;
  matchScore: number;
  commonAvailability: Availability[];
  createdAt: Date;
}

// For the AI questionnaire responses
export interface ActivityQuestionnaire {
  activityId: string;
  hasEquipment: boolean;
  equipmentDetails?: string;
  hasTransportation: boolean;
  transportationDetails?: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredTimeSlots: TimeSlot[];
  locationRadius: number;
  additionalNotes?: string;
}

// Import User type
import { User } from './user'; 