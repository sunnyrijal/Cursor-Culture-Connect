// project/types/user.ts

import { MockGroup } from "./group";

export type User = {
  id: string;
  name: string;
  email: string;
  image?:string
  password: string;
  heritage: string;
  profileImage: string;
  bio: string;
  interests: string[];
  university: string;
  connections: string[];
  state?:string;
  city?:string;
  phone?:string;
  // linkedIn:string;
};

export interface UserProfile extends User {
  // UserProfile is now just an alias for User to maintain compatibility
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  classYear: string;
  university: string;
  profilePicture?: any;
  pronouns: string;
  ethnicity: string[];
  countryOfOrigin: string;
  city: string;
  state: string;
  languagesSpoken: string[];
  interests: string[];
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingOptIn: boolean;
}