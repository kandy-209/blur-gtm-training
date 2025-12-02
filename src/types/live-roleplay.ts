export interface LiveSession {
  id: string;
  scenarioId: string;
  repUserId: string;
  prospectUserId: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  conversationHistory: LiveMessage[];
  repRole: 'rep' | 'prospect';
  prospectRole: 'rep' | 'prospect';
}

export interface LiveMessage {
  id: string;
  sessionId: string;
  userId: string;
  role: 'rep' | 'prospect';
  message: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'system';
}

export interface LobbyUser {
  userId: string;
  username: string;
  preferredRole: 'rep' | 'prospect' | 'any';
  scenarioId?: string;
  status: 'waiting' | 'matched' | 'in-session';
  joinedAt: Date;
}

export interface MatchRequest {
  userId: string;
  username: string;
  preferredRole: 'rep' | 'prospect' | 'any';
  scenarioId?: string;
}

export interface VoiceCall {
  sessionId: string;
  repPeerId?: string;
  prospectPeerId?: string;
  status: 'connecting' | 'connected' | 'disconnected';
}

