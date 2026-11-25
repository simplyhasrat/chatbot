export type MessageRole = 'user' | 'assistant' | 'system';

export interface Attachment {
  name: string;
  type: string;
  size?: number;
  dataUrl?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  rating?: 'up' | 'down';
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  personaId: string;
}

export interface Persona {
  id: string;
  name: string;
  tagline: string;
  description: string;
  avatarIcon: string;
  accentColor: string;
  systemPrompt: string;
  suggestedPrompts: {
    title: string;
    description: string;
    prompt: string;
    icon: string;
  }[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  speechOutputEnabled: boolean;
  streamSpeed: number; // ms delay per token, 0 = instant
  apiKey?: string;
  apiProvider?: 'builtin' | 'gemini';
  userAvatarName: string;
}
