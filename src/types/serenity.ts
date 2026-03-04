
export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingSources?: GroundingSource[];
}

export enum SessionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export enum ChatMode {
  TEXT = 'TEXT',
  VOICE = 'VOICE'
}

export interface EmotionState {
  user: { label: string; color: string; icon: string; type?: string };
  ai: { label: string; color: string; icon: string; type?: string };
}

export interface UserProfile {
  name?: string;
  keyConcerns: string[];
  emotionalBaseline: string;
  journeyNarrative: string; // 核心：对话产生的成长/进展叙述
  userPreferences: string[]; // 用户喜欢的支持方式（如：直白、温柔、多倾听）
  lastUpdated: string;
}

export interface VoiceConfig {
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
}
