// project/types/user.ts

import { MockGroup } from "./group";

export interface User {
  id: number | string;
  name: string;
  email?: string;
  university: string;
  major: string;
  year: string;
  title: string;
  heritage: string[];
  languages: string[];
  bio: string;
  image: string;
  verified: boolean;
  mutualConnections?: number;
  location: string;
  country: string;
  state?: string;
  linkedinUrl?: string;
  isPublic?: boolean;
  groupsList?: MockGroup[];
  connectionsList?: User[];
  isConnected?: boolean;
  joinedGroups?: number;
  connections?: number;
  eventsAttended?: number;
  categories?: string[];
}

export interface UserProfile extends User {
  // UserProfile is now just an alias for User to maintain compatibility
}