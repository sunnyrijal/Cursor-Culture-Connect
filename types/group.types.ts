// Frontend types for Group functionality

export enum GroupRole {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
  CREATOR = 'CREATOR'
}

// Base interfaces
export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: string; // ISO date string
  user: User;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isPrivate: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  creatorId: string;
  creator: User;
  members: GroupMember[];
  _count?: {
    members: number;
  };
}

// Request types
export interface CreateGroupRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  isPrivate?: boolean;
  meetingLocation?:string
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  isPrivate?: boolean;
}

export interface AddMemberRequest {
  userId: string;
}

export interface AddMultipleMembersRequest {
  userIds: string[];
}

export interface UpdateMemberRoleRequest {
  role: GroupRole;
}

// Response types
export interface GroupResponse {
  group: Group;
}

export interface GroupsResponse {
  groups: Group[];
}

export interface MemberResponse {
  member: GroupMember;
}

export interface AddMultipleMembersResponse {
  message: string;
  addedMembers: GroupMember[];
  existingMembers: {
    userId: string;
    email: string;
    name: string | null;
    reason: string;
  }[];
  invalidUserIds: string[];
}

export interface MessageResponse {
  message: string;
}

// Error response type
export interface ApiError {
  error: string;
}

// Utility types for forms and components
export interface GroupFormData {
  name: string;
  description: string;
  imageUrl: string;
  isPrivate: boolean;
}

export interface MemberWithRole extends User {
  role: GroupRole;
  joinedAt: string;
  membershipId: string;
}

// Filter and search types
export interface GroupFilters {
  search?: string;
  isPrivate?: boolean;
  role?: GroupRole;
  createdBy?: string;
}

export interface GroupMemberFilters {
  search?: string;
  role?: GroupRole;
}

// Pagination types (if needed)
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'memberCount';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Component state types
export interface GroupState {
  groups: Group[];
  selectedGroup: Group | null;
  loading: boolean;
  error: string | null;
}

export interface GroupMemberState {
  members: GroupMember[];
  loading: boolean;
  error: string | null;
}

// Form validation types
export interface GroupFormErrors {
  name?: string;
  description?: string;
  imageUrl?: string;
  general?: string;
}

export interface AddMemberFormErrors {
  userId?: string;
  userIds?: string;
  general?: string;
}

// Permission helper types
export interface GroupPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canAddMembers: boolean;
  canRemoveMembers: boolean;
  canUpdateRoles: boolean;
  canLeave: boolean;
}

// Activity/History types (if you plan to add activity tracking)
export interface GroupActivity {
  id: string;
  groupId: string;
  userId: string;
  action: 'CREATED' | 'UPDATED' | 'MEMBER_ADDED' | 'MEMBER_REMOVED' | 'ROLE_CHANGED' | 'LEFT';
  details: string;
  createdAt: string;
  user: User;
}