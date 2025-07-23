// project/types/user.ts

import { MockGroup } from "./group";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  heritage: string;
  profileImage: string;
  bio: string;
  interests: string[];
  university: string;
  connections: string[];
};

export interface UserProfile extends User {
  // UserProfile is now just an alias for User to maintain compatibility
}