// TypeScript declarations for ElevenLabs Conversational AI widget

declare namespace JSX {
  interface IntrinsicElements {
    'elevenlabs-convai': {
      'agent-id': string;
      'conversation-id'?: string;
      'conversation-history'?: string; // JSON stringified conversation history
      'first-message'?: string;
      'enable-conversation-history'?: boolean;
      'enable-transcription'?: boolean;
      'language'?: string;
      'voice-id'?: string;
      'model-id'?: string;
      'temperature'?: number;
      'system-prompt'?: string;
      'enable-streaming'?: boolean;
      'enable-voice-cloning'?: boolean;
      'custom-voice-id'?: string;
      'enable-emotion-detection'?: boolean;
      'enable-sentiment-analysis'?: boolean;
      'enable-context-awareness'?: boolean;
      'context-window-size'?: number;
      'enable-memory'?: boolean;
      'enable-multi-turn-conversation'?: boolean;
      'max-conversation-turns'?: number;
      'enable-session-management'?: boolean;
      'session-id'?: string;
      'enable-analytics-tracking'?: boolean;
      'enable-error-handling'?: boolean;
      'enable-fallback-responses'?: boolean;
      'enable-loading-states'?: boolean;
      'enable-accessibility'?: boolean;
      'aria-label'?: string;
      'aria-describedby'?: string;
      'enable-keyboard-shortcuts'?: boolean;
      'enable-voice-commands'?: boolean;
      'enable-screen-reader-support'?: boolean;
      'enable-high-contrast-mode'?: boolean;
      'enable-dark-mode'?: boolean;
      'theme'?: 'light' | 'dark' | 'auto';
      'enable-responsive-design'?: boolean;
      'enable-fullscreen-mode'?: boolean;
      'enable-recording'?: boolean;
      'recording-format'?: 'mp3' | 'wav' | 'ogg' | 'webm';
      'enable-playback-controls'?: boolean;
      'enable-download'?: boolean;
      'enable-export'?: boolean;
      'export-format'?: 'json' | 'csv' | 'txt' | 'pdf';
      children?: React.ReactNode;
      // Event handlers
      onConversationStart?: (event: CustomEvent) => void;
      onConversationEnd?: (event: CustomEvent) => void;
      onMessageSent?: (event: CustomEvent) => void;
      onMessageReceived?: (event: CustomEvent) => void;
      onError?: (event: CustomEvent) => void;
      onLoading?: (event: CustomEvent) => void;
      onLoaded?: (event: CustomEvent) => void;
      onReady?: (event: CustomEvent) => void;
      onStateChange?: (event: CustomEvent) => void;
      onVoiceStart?: (event: CustomEvent) => void;
      onVoiceEnd?: (event: CustomEvent) => void;
      onTranscriptionStart?: (event: CustomEvent) => void;
      onTranscriptionEnd?: (event: CustomEvent) => void;
      onAnalytics?: (event: CustomEvent) => void;
    };
  }
}

// Event types for ElevenLabs widget
export interface ElevenLabsWidgetEvent {
  type: string;
  detail?: any;
  timestamp?: number;
}

export interface ConversationEvent extends ElevenLabsWidgetEvent {
  conversationId?: string;
  messageId?: string;
  userId?: string;
}

export interface MessageEvent extends ConversationEvent {
  message?: string;
  role?: 'user' | 'assistant';
  timestamp?: number;
}

export interface ErrorEvent extends ElevenLabsWidgetEvent {
  error?: Error | string;
  code?: string;
  message?: string;
}

export interface LoadingEvent extends ElevenLabsWidgetEvent {
  isLoading?: boolean;
  progress?: number;
}

export interface StateChangeEvent extends ElevenLabsWidgetEvent {
  state?: string;
  previousState?: string;
}

export interface VoiceEvent extends ElevenLabsWidgetEvent {
  isSpeaking?: boolean;
  duration?: number;
  audioUrl?: string;
}

export interface TranscriptionEvent extends ElevenLabsWidgetEvent {
  text?: string;
  confidence?: number;
  language?: string;
}

export interface AnalyticsEvent extends ElevenLabsWidgetEvent {
  eventName?: string;
  properties?: Record<string, any>;
}
