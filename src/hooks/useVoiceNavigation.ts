'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

// Type definitions for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface VoiceCommand {
  command: string;
  action: () => void;
  description?: string;
}

export interface UseVoiceNavigationOptions {
  enabled?: boolean;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onError?: (error: Error) => void;
}

export function useVoiceNavigation(
  commands: VoiceCommand[],
  options: UseVoiceNavigationOptions = {}
) {
  const {
    enabled = true,
    language = 'en-US',
    continuous = false,
    interimResults = false,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      // Process commands
      if (finalTranscript) {
        const normalized = finalTranscript.toLowerCase().trim();
        for (const cmd of commands) {
          if (normalized.includes(cmd.command.toLowerCase())) {
            cmd.action();
            setTranscript('');
            break;
          }
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const error = new Error(`Speech recognition error: ${event.error}`);
      setIsListening(false);
      if (onError) {
        onError(error);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [commands, continuous, interimResults, language, onError]);

  const startListening = useCallback(() => {
    if (!enabled || !isSupported || !recognitionRef.current) return;

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
    }
  }, [enabled, isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
  };
}

// Predefined voice commands for common actions
export const commonVoiceCommands = {
  navigate: (path: string) => ({
    command: `go to ${path}`,
    action: () => {
      window.location.href = path;
    },
    description: `Navigate to ${path}`,
  }),
  search: (onSearch: (query: string) => void) => ({
    command: 'search for',
    action: () => {
      // Extract search query from transcript
      onSearch('');
    },
    description: 'Search',
  }),
  close: (onClose: () => void) => ({
    command: 'close',
    action: onClose,
    description: 'Close current dialog',
  }),
  submit: (onSubmit: () => void) => ({
    command: 'submit',
    action: onSubmit,
    description: 'Submit form',
  }),
} as const;

