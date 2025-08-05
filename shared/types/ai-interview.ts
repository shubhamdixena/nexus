export interface InterviewSession {
  id: string;
  user_id: string;
  school_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  total_turns?: number;
  duration_seconds?: number;
  completion_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationTurn {
  session_id: string;
  turn_number: number;
  speaker: 'user' | 'agent' | 'system';
  message_text: string;
  message_metadata?: {
    confidence_score?: number;
    id?: string;
    timestamp?: string;
    [key: string]: any;
  };
  timestamp: string;
}

export interface TranscriptEntry {
  id: string;
  speaker: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  confidence?: number;
  messageOrder?: number;
}

export interface SchoolPersona {
  id: string;
  school_id: string;
  interviewer_name: string;
  interviewer_title: string;
  tone: string;
  background: string;
  greeting: string;
  closing: string;
  school_context: string;
  behavioral_notes: string;
  is_active: boolean;
}

export interface InterviewQuestion {
  id: string;
  school_id: string;
  question_text: string;
  question_category: string;
  priority: number;
  is_active: boolean;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'audio' | 'text' | 'setup' | 'session_update' | 'error' | 'connected' | 'transcript_update';
  data?: any;
  sessionId?: string;
  schoolId?: string;
  error?: string;
}

// Connection states
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
export type InterviewState = 'setup' | 'ready' | 'in_progress' | 'completed' | 'error';
