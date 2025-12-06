
export enum UserRole {
  MASTER = 'MASTER',
  STATE_HEAD = 'STATE_HEAD',
  CAPTAIN = 'CAPTAIN',
  MEMBER = 'MEMBER'
}

export enum UserCategory {
  SCHOOL_BOYS = 'School Boys',
  SCHOOL_GIRLS = 'School Girls',
  COLLEGE_BOYS = 'College Boys',
  COLLEGE_GIRLS = 'College Girls'
}

export interface User {
  id: string;
  name: string;
  phone: string;
  district: string;
  role: UserRole;
  category: UserCategory; // New field for user base
  password?: string; // Only for auth check
  photoUrl?: string;
  isApproved: boolean;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  role: string;
  district: string;
  category: UserCategory; // New field for user base
  photoUrl?: string;
  joinedAt: string;
}

export interface TeamMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

export interface District {
  id: string;
  name: string;
  memberCount: number;
}

export type ViewState = 
  | { type: 'AUTH' }
  | { type: 'HOME_MENU' }
  | { type: 'DASHBOARD' }
  | { type: 'DISTRICT_DETAIL'; districtName: string }
  | { type: 'STATE_OBT' }
  | { type: 'MASTER_OBT' }
  | { type: 'PROFILE' }
  | { type: 'ADMIN_UPDATES' };
