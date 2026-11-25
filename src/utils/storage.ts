import { Conversation, AppSettings } from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'sage_chatbot_conversations_v1',
  ACTIVE_ID: 'sage_chatbot_active_id_v1',
  SETTINGS: 'sage_chatbot_settings_v1',
};

const envApiKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim() || '';

export const defaultSettings: AppSettings = {
  theme: 'light',
  soundEnabled: true,
  speechOutputEnabled: false,
  streamSpeed: Number(import.meta.env.VITE_DEFAULT_STREAM_SPEED) || 15,
  apiKey: envApiKey,
  apiProvider: envApiKey ? 'gemini' : 'builtin',
  userAvatarName: 'You',
};

export const Storage = {
  getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveConversations(conversations: Conversation[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations to localStorage', e);
    }
  },

  getActiveId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
    } catch {
      return null;
    }
  },

  saveActiveId(id: string | null) {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
      }
    } catch (e) {
      console.error('Failed to save active conversation id', e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  },

  saveSettings(settings: AppSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  clearAllData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
    } catch (e) {
      console.error('Failed to clear data', e);
    }
  },
};
