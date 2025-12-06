
export const TN_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
  "Dindigul", "Erode", "Kallakurichi", "Kancheepuram", "Karur", "Krishnagiri",
  "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur",
  "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur",
  "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram",
  "Virudhunagar"
].sort();

export const APP_NAME = "OBT Connect";
export const MAX_MEMBERS_PER_DISTRICT = 30;

// Master Admin Access Configuration
export const MASTER_PHONES = [
  '7010303021', // Main Admin
  '8489143405',
  '9384993968'
];

export const MASTER_SECRET_CODE = 'OBT Master'; // Shared secret code for all masters

export const MASTER_CREDENTIALS = {
  // Kept for backward compatibility if needed, but logic now uses MASTER_PHONES
  phone: '7010303021', 
  password: MASTER_SECRET_CODE
};

// State Head Credentials (Manages State & Master OBT Teams)
export const STATE_HEAD_CREDENTIALS = {
  phone: '8010101010',
  password: 'statehead'
};
