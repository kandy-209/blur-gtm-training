/**
 * React hook for ElevenLabs integration
 * Provides easy access to ElevenLabs features
 */

import { useState, useCallback, useEffect } from 'react';
import { ElevenLabsClient, getElevenLabsClient } from '@/lib/elevenlabs';
import type { TTSOptions, StreamTTSOptions, WebSocketTTSOptions, VoiceCloneOptions } from '@/lib/elevenlabs';

export interface UseElevenLabsOptions {
  autoInitialize?: boolean;
  voiceId?: string;
  modelId?: string;
}

export interface UseElevenLabsReturn {
  client: ElevenLabsClient | null;
  isReady: boolean;
  isPlaying: boolean;
  isConnected: boolean;
  currentAudio: HTMLAudioElement | null;
  error: Error | null;
  textToSpeech: (text: string, options?: Partial<TTSOptions>) => Promise<HTMLAudioElement>;
  streamTextToSpeech: (text: string, options?: Partial<StreamTTSOptions>) => Promise<void>;
  streamTextToSpeechWebSocket: (text: string, options?: Partial<WebSocketTTSOptions>) => Promise<void>;
  cloneVoice: (options: VoiceCloneOptions) => Promise<any>;
  getVoices: () => Promise<any[]>;
  getSubscription: () => Promise<any>;
  stopAudio: () => void;
  playAudio: (audioBuffer: ArrayBuffer) => Promise<void>;
  clearError: () => void;
  checkHealth: () => Promise<boolean>;
}

export function useElevenLabs(options: UseElevenLabsOptions = {}): UseElevenLabsReturn {
  const [client, setClient] = useState<ElevenLabsClient | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Initialize client
  useEffect(() => {
    if (options.autoInitialize !== false) {
      try {
        const elevenLabsClient = getElevenLabsClient({
          voiceId: options.voiceId,
          modelId: options.modelId,
        });
        setClient(elevenLabsClient);
        setIsReady(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize ElevenLabs client'));
        setIsReady(false);
      }
    }
  }, [options.autoInitialize, options.voiceId, options.modelId]);

  // Text to speech
  const textToSpeech = useCallback(async (text: string, ttsOptions?: Partial<TTSOptions>): Promise<HTMLAudioElement> => {
    if (!client) {
      throw new Error('ElevenLabs client not initialized');
    }

    try {
      setError(null);
      const audioBuffer = await client.textToSpeech({
        text,
        voiceId: options.voiceId,
        modelId: options.modelId,
        ...ttsOptions,
      });

      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onended = () => {
        URL.revokeObjectURL(url);
        setIsPlaying(false);
        setCurrentAudio(null);
      };

      audio.onerror = (err) => {
        URL.revokeObjectURL(url);
        setError(new Error('Audio playback failed'));
        setIsPlaying(false);
        setCurrentAudio(null);
      };

      setCurrentAudio(audio);
      setIsPlaying(true);
      await audio.play();

      return audio;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Text-to-speech failed');
      setError(error);
      throw error;
    }
  }, [client, options.voiceId, options.modelId]);

  // Stream text to speech
  const streamTextToSpeech = useCallback(async (
    text: string,
    streamOptions?: Partial<StreamTTSOptions>
  ): Promise<void> => {
    if (!client) {
      throw new Error('ElevenLabs client not initialized');
    }

    try {
      setError(null);
      setIsPlaying(true);

      const audioChunks: ArrayBuffer[] = [];

      await client.streamTextToSpeech({
        text,
        voiceId: options.voiceId,
        modelId: options.modelId,
        ...streamOptions,
        onChunk: (chunk) => {
          audioChunks.push(chunk);
          if (streamOptions?.onChunk) {
            streamOptions.onChunk(chunk);
          }
        },
        onComplete: async () => {
          // Combine all chunks
          const totalLength = audioChunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
          const combined = new Uint8Array(totalLength);
          let offset = 0;

          for (const chunk of audioChunks) {
            combined.set(new Uint8Array(chunk), offset);
            offset += chunk.byteLength;
          }

          // Play the combined audio
          const blob = new Blob([combined], { type: 'audio/mpeg' });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);

          audio.onended = () => {
            URL.revokeObjectURL(url);
            setIsPlaying(false);
            setCurrentAudio(null);
            if (streamOptions?.onComplete) {
              streamOptions.onComplete();
            }
          };

          audio.onerror = () => {
            URL.revokeObjectURL(url);
            setError(new Error('Audio playback failed'));
            setIsPlaying(false);
            setCurrentAudio(null);
          };

          setCurrentAudio(audio);
          await audio.play();
        },
        onError: (err) => {
          setError(err);
          setIsPlaying(false);
          setCurrentAudio(null);
          if (streamOptions?.onError) {
            streamOptions.onError(err);
          }
        }
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Stream text-to-speech failed');
      setError(error);
      setIsPlaying(false);
      throw error;
    }
  }, [client, options.voiceId, options.modelId]);

  // Stop audio
  const stopAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  }, [currentAudio]);

  // Play audio from buffer
  const playAudio = useCallback(async (audioBuffer: ArrayBuffer): Promise<void> => {
    if (!client) {
      throw new Error('ElevenLabs client not initialized');
    }

    try {
      setError(null);
      await client.playAudio(audioBuffer);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Audio playback failed');
      setError(error);
      throw error;
    }
  }, [client]);

  // Stream via WebSocket
  const streamTextToSpeechWebSocket = useCallback(async (
    text: string,
    wsOptions?: Partial<WebSocketTTSOptions>
  ): Promise<void> => {
    if (!client) {
      throw new Error('ElevenLabs client not initialized');
    }

    try {
      setError(null);
      setIsConnected(true);

      await client.streamTextToSpeechWebSocket({
        text,
        ...wsOptions,
        onConnectionChange: (connected) => {
          setIsConnected(connected);
          if (wsOptions?.onConnectionChange) {
            wsOptions.onConnectionChange(connected);
          }
        },
        onAudioChunk: (chunk) => {
          if (wsOptions?.onAudioChunk) {
            wsOptions.onAudioChunk(chunk);
          }
        },
        onTextChunk: (text) => {
          if (wsOptions?.onTextChunk) {
            wsOptions.onTextChunk(text);
          }
        },
        onComplete: () => {
          setIsConnected(false);
          if (wsOptions?.onComplete) {
            wsOptions.onComplete();
          }
        },
        onError: (err) => {
          setError(err);
          setIsConnected(false);
          if (wsOptions?.onError) {
            wsOptions.onError(err);
          }
        }
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('WebSocket streaming failed');
      setError(error);
      setIsConnected(false);
      throw error;
    }
  }, [client]);

  // Clone voice
  const cloneVoice = useCallback(async (options: VoiceCloneOptions): Promise<any> => {
    if (!client) {
      throw new Error('ElevenLabs client not initialized');
    }

    try {
      setError(null);
      return await client.cloneVoice(options);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Voice cloning failed');
      setError(error);
      throw error;
    }
  }, [client]);

  // Get voices
  const getVoices = useCallback(async (): Promise<any[]> => {
    if (!client) {
      throw new Error('ElevenLabs client not initialized');
    }

    try {
      setError(null);
      return await client.getVoices();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch voices');
      setError(error);
      throw error;
    }
  }, [client]);

  // Get subscription info
  const getSubscription = useCallback(async (): Promise<any> => {
    if (!client) {
      throw new Error('ElevenLabs client not initialized');
    }

    try {
      setError(null);
      return await client.getUserSubscription();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch subscription');
      setError(error);
      throw error;
    }
  }, [client]);

  // Check health
  const checkHealth = useCallback(async (): Promise<boolean> => {
    if (!client) {
      return false;
    }

    try {
      return await client.checkHealth();
    } catch {
      return false;
    }
  }, [client]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    client,
    isReady,
    isPlaying,
    isConnected,
    currentAudio,
    error,
    textToSpeech,
    streamTextToSpeech,
    streamTextToSpeechWebSocket,
    cloneVoice,
    getVoices,
    getSubscription,
    stopAudio,
    playAudio,
    clearError,
    checkHealth,
  };
}

