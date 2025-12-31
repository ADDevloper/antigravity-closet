import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface ClothingItem {
  id?: number;
  image: string; // base64
  category: string;
  colors: string[];
  occasions: string[];
  seasons: string[];
  brand?: string;
  size?: string;
  purchaseDate?: string;
  createdAt: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  outfits?: Outfit[];
  timestamp: number;
}

export interface Outfit {
  id: string;
  name: string;
  description: string;
  itemIds: number[];
  rating?: 'up' | 'down';
  isFavorite?: boolean;
}

export interface Conversation {
  id?: number;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface PlannedOutfit {
  id?: number;
  date: string; // YYYY-MM-DD
  itemIds: number[];
  notes?: string;
  createdAt: number;
}

export type ColorSeason = 'warm_spring' | 'cool_summer' | 'warm_autumn' | 'cool_winter';

export interface PCAProfile {
  id?: number;
  // Quiz Results
  quizSeason: ColorSeason;
  quizConfidence: number; // 0-100
  quizAnswers: Record<string, string>;

  // Image Analysis Results
  selfieDataUrl?: string;
  skinUndertone: 'warm' | 'cool';
  skinUndertoneConfidence: number; // 0-1
  contrastLevel: 'high' | 'medium' | 'low';
  hairTone: 'warm' | 'cool' | 'neutral';
  eyeColor: string;

  // Final Results
  recommendedSeason: ColorSeason;
  confidence: number; // 0-1
  reasoning: string;
  agreesWithQuiz: boolean;

  // Color Palettes
  bestColors: string[];
  avoidColors: string[];

  createdAt: number;
  updatedAt: number;
}

interface ClosetDB extends DBSchema {
  items: {
    key: number;
    value: ClothingItem;
    indexes: {
      'by-category': string;
      'by-brand': string;
      'by-size': string;
    };
  };
  conversations: {
    key: number;
    value: Conversation;
    indexes: { 'by-updated': number };
  };
  plannedOutfits: {
    key: number;
    value: PlannedOutfit;
    indexes: { 'by-date': string };
  };
  pcaProfile: {
    key: number;
    value: PCAProfile;
  };
  userProfile: {
    key: string;
    value: UserProfile;
  };
  userSettings: {
    key: string;
    value: UserSettings;
  };
}

export interface UserProfile {
  id: string; // "current"
  name: string;
  email?: string;
  bio?: string;
  avatar?: string;
  createdAt: number;
}

export interface UserSettings {
  id: string; // "current"
  // PCA Settings
  pca: {
    showInProfile: boolean;
    aiMentions: boolean;
    showIndicators: boolean;
    filterByPalette: boolean;
    hideFeature: boolean;
  };
  // Closet Settings
  closet: {
    viewType: "grid" | "list";
    itemsPerRow: number;
    showDetailsOnHover: boolean;
    defaultSort: string;
    rememberFilters: boolean;
  };
  // AI Chat Settings
  aiChat: {
    tone: string;
    includeWeather: boolean;
    considerCalendar: boolean;
    suggestGaps: boolean;
    shoppingRecs: boolean;
    detailLevel: string;
    learnFromFeedback: boolean;
  };
  // Notifications
  notifications: {
    enabled: boolean;
    dailySuggestions: { enabled: boolean; time: string };
    weatherAlerts: boolean;
    unusedReminders: { enabled: boolean; frequency: string };
    announcements: boolean;
  };
  // Privacy
  privacy: {
    storeSelfie: boolean;
  };
  // Appearance
  appearance: {
    theme: "light" | "dark" | "auto";
    language: string;
    highContrast: boolean;
    reduceAnimations: boolean;
    textSize: string;
  };
}

const DB_NAME = 'clothing-closet-v2';
const DB_VERSION = 3; // Increment version for schema change

let dbPromise: Promise<IDBPDatabase<ClosetDB>> | null = null;

export const getDB = () => {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<ClosetDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Items Store
        if (!db.objectStoreNames.contains('items')) {
          const itemStore = db.createObjectStore('items', {
            keyPath: 'id',
            autoIncrement: true,
          });
          itemStore.createIndex('by-category', 'category');
          itemStore.createIndex('by-brand', 'brand');
          itemStore.createIndex('by-size', 'size');
        }

        // Conversations Store
        if (!db.objectStoreNames.contains('conversations')) {
          const convStore = db.createObjectStore('conversations', {
            keyPath: 'id',
            autoIncrement: true,
          });
          convStore.createIndex('by-updated', 'updatedAt');
        }

        // Planned Outfits Store
        if (!db.objectStoreNames.contains('plannedOutfits')) {
          const planStore = db.createObjectStore('plannedOutfits', {
            keyPath: 'id',
            autoIncrement: true,
          });
          planStore.createIndex('by-date', 'date');
        }

        // PCA Profile Store (v2)
        if (oldVersion < 2 && !db.objectStoreNames.contains('pcaProfile')) {
          db.createObjectStore('pcaProfile', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }

        // User Profile & Settings (v3)
        if (oldVersion < 3) {
          if (!db.objectStoreNames.contains('userProfile')) {
            db.createObjectStore('userProfile', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('userSettings')) {
            db.createObjectStore('userSettings', { keyPath: 'id' });
          }
        }
      },
    });
  }
  return dbPromise;
};


export const addItem = async (item: ClothingItem) => {
  const db = await getDB();
  if (!db) return;
  return db.add('items', item);
};

export const updateItem = async (item: ClothingItem) => {
  const db = await getDB();
  if (!db || !item.id) return;
  return db.put('items', item);
};

export const deleteItem = async (id: number) => {
  const db = await getDB();
  if (!db) return;
  return db.delete('items', id);
};

export const getAllItems = async () => {
  const db = await getDB();
  if (!db) return [];
  return db.getAll('items');
};

export const getItemById = async (id: number) => {
  const db = await getDB();
  if (!db) return null;
  return db.get('items', id);
};

// Conversations
export const addConversation = async (conv: Conversation) => {
  const db = await getDB();
  if (!db) return;
  return db.add('conversations', conv);
};

export const updateConversation = async (conv: Conversation) => {
  const db = await getDB();
  if (!db || !conv.id) return;
  return db.put('conversations', conv);
};

export const deleteConversation = async (id: number) => {
  const db = await getDB();
  if (!db) return;
  return db.delete('conversations', id);
};

export const getAllConversations = async () => {
  const db = await getDB();
  if (!db) return [];
  return db.getAllFromIndex('conversations', 'by-updated');
};

export const getConversationById = async (id: number) => {
  const db = await getDB();
  if (!db) return null;
  return db.get('conversations', id);
};

// Planned Outfits
export const addPlannedOutfit = async (outfit: PlannedOutfit) => {
  const db = await getDB();
  if (!db) return;
  return db.add('plannedOutfits', outfit);
};

export const updatePlannedOutfit = async (outfit: PlannedOutfit) => {
  const db = await getDB();
  if (!db || !outfit.id) return;
  return db.put('plannedOutfits', outfit);
};

export const deletePlannedOutfit = async (id: number) => {
  const db = await getDB();
  if (!db) return;
  return db.delete('plannedOutfits', id);
};

export const getAllPlannedOutfits = async () => {
  const db = await getDB();
  if (!db) return [];
  return db.getAll('plannedOutfits');
};

export const getPlannedOutfitsByDate = async (date: string) => {
  const db = await getDB();
  if (!db) return [];
  return db.getAllFromIndex('plannedOutfits', 'by-date', date);
};

export const savePCAProfile = async (profile: PCAProfile) => {
  const db = await getDB();
  if (!db) return;

  // Delete any existing profile (we only keep one)
  const existing = await getPCAProfile();
  if (existing?.id) {
    await db.delete('pcaProfile', existing.id);
  }

  return db.add('pcaProfile', profile);
};

export const getPCAProfile = async (): Promise<PCAProfile | null> => {
  const db = await getDB();
  if (!db) return null;

  const profiles = await db.getAll('pcaProfile');
  return profiles[0] || null;
};

export const updatePCAProfile = async (profile: PCAProfile) => {
  const db = await getDB();
  if (!db || !profile.id) return;
  return db.put('pcaProfile', profile);
};

export const deletePCAProfile = async () => {
  const db = await getDB();
  if (!db) return;

  const profile = await getPCAProfile();
  if (profile?.id) {
    return db.delete('pcaProfile', profile.id);
  }
};

// User Profile Helpers
export const getUserProfile = async (): Promise<UserProfile | null> => {
  const db = await getDB();
  if (!db) return null;
  const result = await db.get('userProfile', 'current');
  return result || null;
};

export const saveUserProfile = async (profile: UserProfile) => {
  const db = await getDB();
  if (!db) return;
  profile.id = 'current';
  return db.put('userProfile', profile);
};

// User Settings Helpers
export const getUserSettings = async (): Promise<UserSettings | null> => {
  const db = await getDB();
  if (!db) return null;
  const result = await db.get('userSettings', 'current');
  return result || null;
};

export const saveUserSettings = async (settings: UserSettings) => {
  const db = await getDB();
  if (!db) return;
  settings.id = 'current';
  return db.put('userSettings', settings);
};

export const DEFAULT_SETTINGS: Omit<UserSettings, 'id'> = {
  pca: {
    showInProfile: true,
    aiMentions: true,
    showIndicators: true,
    filterByPalette: false,
    hideFeature: false
  },
  closet: {
    viewType: 'grid',
    itemsPerRow: 4,
    showDetailsOnHover: true,
    defaultSort: 'Category',
    rememberFilters: true
  },
  aiChat: {
    tone: 'Casual & Friendly',
    includeWeather: true,
    considerCalendar: true,
    suggestGaps: true,
    shoppingRecs: false,
    detailLevel: 'Balanced',
    learnFromFeedback: true
  },
  notifications: {
    enabled: true,
    dailySuggestions: { enabled: true, time: '09:00' },
    weatherAlerts: true,
    unusedReminders: { enabled: true, frequency: 'Monthly' },
    announcements: true
  },
  privacy: {
    storeSelfie: true
  },
  appearance: {
    theme: 'light',
    language: 'English',
    highContrast: false,
    reduceAnimations: false,
    textSize: 'Medium'
  }
};

