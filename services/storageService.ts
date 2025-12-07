
import { Member, User, UserRole, TeamMessage, UserCategory } from '../types';
import { TN_DISTRICTS } from '../constants';

const MEMBERS_KEY = 'obt_members_v2';
const STATE_OBT_KEY = 'obt_state_team_v2';
const MASTER_OBT_KEY = 'obt_master_team_v2';
const USERS_KEY = 'obt_users_v2';
const CURRENT_USER_KEY = 'obt_current_user_v2';
const MESSAGES_KEY = 'obt_messages_v2';

// Helper for safe parsing to prevent app crashes on corrupted data
const safeParse = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error);
    // Optionally clear the corrupted key to self-heal
    // localStorage.removeItem(key); 
    return fallback;
  }
};

// --- District Member Management ---

export const getMembers = (district?: string, category?: UserCategory): Member[] => {
  const members = safeParse<Member[]>(MEMBERS_KEY, []);
  
  let filtered = members;

  if (district) {
    filtered = filtered.filter(m => m.district === district);
  }

  if (category) {
    filtered = filtered.filter(m => m.category === category);
  }

  return filtered;
};

export const saveMember = (member: Member): void => {
  const members = safeParse<Member[]>(MEMBERS_KEY, []);
  
  const index = members.findIndex(m => m.id === member.id);
  if (index >= 0) {
    members[index] = member;
  } else {
    members.push(member);
  }
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
};

export const deleteMember = (id: string): void => {
  const members = safeParse<Member[]>(MEMBERS_KEY, []);
  
  const newMembers = members.filter(m => m.id !== id);
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(newMembers));
};

export const getDistrictStats = (category?: UserCategory) => {
  const members = safeParse<Member[]>(MEMBERS_KEY, []);

  const stats: Record<string, number> = {};
  TN_DISTRICTS.forEach(d => {
    const count = members.filter(m => 
      m.district === d && 
      (!category || m.category === category)
    ).length;
    stats[d] = count;
  });
  return stats;
};

// --- Special Teams Management (State OBT & Master OBT) ---

const getSpecialTeam = (key: string): Member[] => {
  return safeParse<Member[]>(key, []);
};

const saveSpecialMember = (key: string, member: Member): void => {
  const members = getSpecialTeam(key);
  const index = members.findIndex(m => m.id === member.id);
  if (index >= 0) {
    members[index] = member;
  } else {
    members.push(member);
  }
  localStorage.setItem(key, JSON.stringify(members));
};

const deleteSpecialMember = (key: string, id: string): void => {
  const members = getSpecialTeam(key);
  const newMembers = members.filter(m => m.id !== id);
  localStorage.setItem(key, JSON.stringify(newMembers));
};

export const getStateObtMembers = () => getSpecialTeam(STATE_OBT_KEY);
export const saveStateObtMember = (m: Member) => saveSpecialMember(STATE_OBT_KEY, m);
export const deleteStateObtMember = (id: string) => deleteSpecialMember(STATE_OBT_KEY, id);

export const getMasterObtMembers = () => getSpecialTeam(MASTER_OBT_KEY);
export const saveMasterObtMember = (m: Member) => saveSpecialMember(MASTER_OBT_KEY, m);
export const deleteMasterObtMember = (id: string) => deleteSpecialMember(MASTER_OBT_KEY, id);


// --- User (Auth) Management ---

export const getAllUsers = (): User[] => {
  const users = safeParse<User[]>(USERS_KEY, []);
  // Data Migration: Ensure 'category' exists for legacy users to prevent crashes
  return users.map(u => ({
    ...u,
    category: u.category || UserCategory.COLLEGE_BOYS
  }));
};

export const findUserByPhone = (phone: string): User | undefined => {
  const users = getAllUsers();
  return users.find(u => u.phone === phone);
};

export const registerUser = (user: User): void => {
  const users = getAllUsers();
  const existing = users.findIndex(u => u.phone === user.phone);
  
  if (existing >= 0) {
    users[existing] = user; 
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const user = safeParse<User | null>(CURRENT_USER_KEY, null);
  if (user) {
    // Ensure category exists on the current user object
    if (!user.category) {
      user.category = UserCategory.COLLEGE_BOYS;
    }
    return user;
  }
  return null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const updateUserProfile = (updatedUser: User): void => {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index >= 0) {
    users[index] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  setCurrentUser(updatedUser);
};

// --- Admin / Approval Management ---

export const getPendingUsers = (): User[] => {
  return getAllUsers().filter(u => !u.isApproved);
};

export const approveUser = (userId: string): void => {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index >= 0) {
    const user = users[index];
    user.isApproved = true;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // AUTOMATICALLY ADD TO DISTRICT MEMBER LIST
    const newMember: Member = {
      id: user.id, // Keep consistent ID
      name: user.name,
      phone: user.phone,
      role: 'Member', // Default role for new signups
      district: user.district,
      category: user.category,
      photoUrl: user.photoUrl,
      joinedAt: new Date().toISOString()
    };
    saveMember(newMember);
  }
};

export const rejectUser = (userId: string): void => {
  const users = getAllUsers();
  const newUsers = users.filter(u => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
};

// --- Messages / Board Management ---

export const getMessages = (): TeamMessage[] => {
  return safeParse<TeamMessage[]>(MESSAGES_KEY, []);
};

export const addMessage = (msg: TeamMessage): void => {
  const msgs = getMessages();
  msgs.unshift(msg); // Add to top
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(msgs));
};
