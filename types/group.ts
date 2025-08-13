// project/types/group.ts

export interface Meeting {
  date: string;
  time: string;
  location: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  location: string;
  isPublic: boolean;
  isJoined: boolean;
  recentActivity: string;
  image: string;
  upcomingEvents: number;
  universityOnly?: boolean; 
  allowedUniversity?: string;
  meetings?: Meeting[];
  meetingTime?: string;
  meetingDate?: string;
  meetingLocation?: string;
  meetingDays?: string[];
  presidentId?: string;
  officerIds?: string[];
}

// Alias for backward compatibility
export interface MockGroup extends Group {}

export interface ApiGroup {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}