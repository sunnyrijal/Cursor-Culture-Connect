// types/userInterestApi.types.ts

export interface CreateUserInterestData {
  activityId: string;
  hasEquipment?: boolean;
  needsEquipment?: boolean;
  equipmentNeeded?: string;
  hasTransport?: boolean;
  needsTransport?: boolean;
  transportDetails?: string;
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  locationRadius?: number;
  additionalNotes?: string;
  isActive?: boolean;
}

export interface UpdateUserInterestData extends Partial<CreateUserInterestData> {}

export interface UserInterestApiResponse {
  id: string;
  userId: string;
  interestId: string;
  hasEquipment: boolean;
  needsEquipment: boolean;
  equipmentNeeded?: string;
  hasTransport: boolean;
  needsTransport: boolean;
  transportDetails?: string;
  skillLevel: string;
  locationRadius: number;
  additionalNotes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  interest: {
    id: string;
    name: string;
    category?: string;
    description?: string;
  };
}

export interface GetUserInterestsResponse {
  userInterests: UserInterestApiResponse[];
}

export interface GetUserInterestsParams {
  userId?: string;
  interestId?: string;
  isActive?: boolean;
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface DeleteUserInterestResponse {
  message: string;
}