/**
 * ElevenLabs SDK Integration
 * Advanced utilities for ElevenLabs voice features with WebSocket support, retry logic, and enhanced error handling
 */

export interface ElevenLabsConfig {
  apiKey?: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
  enableZeroRetention?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface TTSOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  voiceSettings?: VoiceSettings;
  outputFormat?: 'mp3_44100_128' | 'mp3_44100_192' | 'mp3_44100_320' | 'pcm_16000' | 'pcm_22050' | 'pcm_24000' | 'pcm_44100' | 'ulaw_8000';
  enableZeroRetention?: boolean;
}

export interface StreamTTSOptions extends TTSOptions {
  onChunk?: (chunk: ArrayBuffer) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

export interface WebSocketTTSOptions extends TTSOptions {
  onAudioChunk?: (chunk: ArrayBuffer) => void;
  onTextChunk?: (text: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export interface VoiceCloneOptions {
  name: string;
  description?: string;
  files: File[] | Blob[];
  labels?: Record<string, string>;
}

export interface Voice {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
  preview_url?: string;
  labels?: Record<string, string>;
  samples?: Array<{
    file_name: string;
    file_id: string;
  }>;
}

export interface SubscriptionInfo {
  character_count: number;
  character_limit: number;
  can_extend_character_limit: boolean;
  remaining_characters: number;
  reset_at?: string;
  tier?: string;
}

export class ElevenLabsClient {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private wsUrl = 'wss://api.elevenlabs.io/v1';
  private defaultVoiceId: string;
  private defaultModelId: string;
  private defaultVoiceSettings: VoiceSettings;
  private enableZeroRetention: boolean;
  private retryAttempts: number;
  private retryDelay: number;
  private wsConnection: WebSocket | null = null;

  constructor(config: ElevenLabsConfig = {}) {
    this.apiKey = config.apiKey || process.env.ELEVENLABS_API_KEY || '';
    this.defaultVoiceId = config.voiceId || process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    this.defaultModelId = config.modelId || 'eleven_multilingual_v2';
    this.enableZeroRetention = config.enableZeroRetention ?? false;
    this.retryAttempts = config.retryAttempts ?? 3;
    this.retryDelay = config.retryDelay ?? 1000;
    
    this.defaultVoiceSettings = {
      stability: config.stability ?? 0.5,
      similarity_boost: config.similarityBoost ?? 0.75,
      style: config.style,
      use_speaker_boost: config.useSpeakerBoost ?? true
    };

    if (!this.apiKey) {
      console.warn('ElevenLabs API key not provided');
    }
  }

  /**
   * Retry wrapper for API calls
   */
  private async retry<T>(
    fn: () => Promise<T>,
    attempts: number = this.retryAttempts
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on certain errors
        if (lastError.message.includes('401') || lastError.message.includes('403')) {
          throw lastError;
        }
        
        if (i < attempts - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
        }
      }
    }
    
    throw lastError || new Error('Retry failed');
  }

  /**
   * Convert text to speech with retry logic
   */
  async textToSpeech(options: TTSOptions): Promise<ArrayBuffer> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required');
    }

    return this.retry(async () => {
      const voiceId = options.voiceId || this.defaultVoiceId;
      const modelId = options.modelId || this.defaultModelId;
      const voiceSettings = options.voiceSettings || this.defaultVoiceSettings;
      const enableZeroRetention = options.enableZeroRetention ?? this.enableZeroRetention;

      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
          ...(enableZeroRetention && { 'xi-zero-retention': 'true' })
        },
        body: JSON.stringify({
          text: options.text,
          model_id: modelId,
          voice_settings: voiceSettings,
          ...(options.outputFormat && { output_format: options.outputFormat })
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `ElevenLabs API error (${response.status}): ${errorText}`;
        
        // Provide more helpful error messages
        if (response.status === 401) {
          errorMessage = 'Invalid API key. Please check your ElevenLabs API key.';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (response.status === 402) {
          errorMessage = 'Insufficient credits. Please check your ElevenLabs account balance.';
        }
        
        throw new Error(errorMessage);
      }

      return await response.arrayBuffer();
    });
  }

  /**
   * Stream text to speech with progress tracking
   */
  async streamTextToSpeech(options: StreamTTSOptions): Promise<void> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required');
    }

    const voiceId = options.voiceId || this.defaultVoiceId;
    const modelId = options.modelId || this.defaultModelId;
    const voiceSettings = options.voiceSettings || this.defaultVoiceSettings;
    const enableZeroRetention = options.enableZeroRetention ?? this.enableZeroRetention;

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}/stream`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
          ...(enableZeroRetention && { 'xi-zero-retention': 'true' })
        },
        body: JSON.stringify({
          text: options.text,
          model_id: modelId,
          voice_settings: voiceSettings,
          ...(options.outputFormat && { output_format: options.outputFormat })
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs API error: ${error}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          if (options.onComplete) {
            options.onComplete();
          }
          break;
        }

        receivedLength += value.byteLength;
        
        if (options.onChunk) {
<<<<<<< HEAD
          options.onChunk(value.buffer);
=======
          options.onChunk(value.buffer || value);
>>>>>>> 7bebee991fdf787f8425e500f0aefecb178d47f0
        }

        if (options.onProgress && contentLength > 0) {
          const progress = (receivedLength / contentLength) * 100;
          options.onProgress(Math.min(progress, 100));
        }
      }
    } catch (error) {
      if (options.onError) {
        options.onError(error instanceof Error ? error : new Error('Unknown error'));
      } else {
        throw error;
      }
    }
  }

  /**
   * WebSocket-based real-time text-to-speech
   */
  async streamTextToSpeechWebSocket(options: WebSocketTTSOptions): Promise<void> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required');
    }

    return new Promise((resolve, reject) => {
      const voiceId = options.voiceId || this.defaultVoiceId;
      const modelId = options.modelId || this.defaultModelId;
      const voiceSettings = options.voiceSettings || this.defaultVoiceSettings;

      // Close existing connection if any
      if (this.wsConnection) {
        this.wsConnection.close();
      }

      const ws = new WebSocket(`${this.wsUrl}/text-to-speech/${voiceId}/stream`);
      this.wsConnection = ws;

      ws.onopen = () => {
        if (options.onConnectionChange) {
          options.onConnectionChange(true);
        }

        // Send configuration
        ws.send(JSON.stringify({
          text: options.text,
          model_id: modelId,
          voice_settings: voiceSettings,
          ...(options.outputFormat && { output_format: options.outputFormat })
        }));
      };

      ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          if (options.onAudioChunk) {
            options.onAudioChunk(event.data);
          }
        } else if (typeof event.data === 'string') {
          try {
            const data = JSON.parse(event.data);
            if (data.text && options.onTextChunk) {
              options.onTextChunk(data.text);
            }
          } catch {
            // Not JSON, ignore
          }
        }
      };

      ws.onerror = (error) => {
        const err = new Error('WebSocket error occurred');
        if (options.onError) {
          options.onError(err);
        }
        reject(err);
      };

      ws.onclose = () => {
        if (options.onConnectionChange) {
          options.onConnectionChange(false);
        }
        if (options.onComplete) {
          options.onComplete();
        }
        resolve();
      };
    });
  }

  /**
   * Close WebSocket connection
   */
  closeWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  /**
   * Get available voices with caching
   */
  private voicesCache: Voice[] | null = null;
  private voicesCacheTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getVoices(useCache: boolean = true): Promise<Voice[]> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required');
    }

    // Return cached voices if available and fresh
    if (useCache && this.voicesCache && Date.now() - this.voicesCacheTime < this.CACHE_DURATION) {
      return this.voicesCache;
    }

    return this.retry(async () => {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs API error: ${error}`);
      }

      const data = await response.json();
      const voices = data.voices || [];
      
      // Cache the voices
      this.voicesCache = voices;
      this.voicesCacheTime = Date.now();
      
      return voices;
    });
  }

  /**
   * Get voice by ID
   */
  async getVoice(voiceId: string): Promise<Voice> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required');
    }

    return this.retry(async () => {
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs API error: ${error}`);
      }

      return await response.json();
    });
  }

  /**
   * Clone a voice
   */
  async cloneVoice(options: VoiceCloneOptions): Promise<Voice> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required');
    }

    const formData = new FormData();
    formData.append('name', options.name);
    if (options.description) {
      formData.append('description', options.description);
    }
    if (options.labels) {
      formData.append('labels', JSON.stringify(options.labels));
    }

    options.files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    const response = await fetch(`${this.baseUrl}/voices/add`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${error}`);
    }

    return await response.json();
  }

  /**
   * Get user subscription info
   */
  async getUserSubscription(): Promise<SubscriptionInfo> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required');
    }

    return this.retry(async () => {
      const response = await fetch(`${this.baseUrl}/user/subscription`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs API error: ${error}`);
      }

      return await response.json();
    });
  }

  /**
   * Get usage statistics
   */
  async getUsage(): Promise<any> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required');
    }

    return this.retry(async () => {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs API error: ${error}`);
      }

      return await response.json();
    });
  }

  /**
   * Convert ArrayBuffer to base64 data URL
   */
  arrayBufferToDataURL(arrayBuffer: ArrayBuffer, mimeType: string = 'audio/mpeg'): string {
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Convert ArrayBuffer to Blob URL
   */
  arrayBufferToBlobURL(arrayBuffer: ArrayBuffer, mimeType: string = 'audio/mpeg'): string {
    const blob = new Blob([arrayBuffer], { type: mimeType });
    return URL.createObjectURL(blob);
  }

  /**
   * Play audio from ArrayBuffer
   */
  async playAudio(arrayBuffer: ArrayBuffer, mimeType: string = 'audio/mpeg'): Promise<void> {
    return new Promise((resolve, reject) => {
      const blob = new Blob([arrayBuffer], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(url);
        reject(error);
      };
      
      audio.play().catch(reject);
    });
  }

  /**
   * Check API health
   */
  async checkHealth(): Promise<boolean> {
    try {
      await this.getVoices();
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
let clientInstance: ElevenLabsClient | null = null;

export function getElevenLabsClient(config?: ElevenLabsConfig): ElevenLabsClient {
  if (!clientInstance) {
    clientInstance = new ElevenLabsClient(config);
  }
  return clientInstance;
}

// Helper function to create audio element from TTS
export async function createAudioFromText(
  text: string,
  options?: Partial<TTSOptions>
): Promise<HTMLAudioElement> {
  const client = getElevenLabsClient();
  const audioBuffer = await client.textToSpeech({ text, ...options });
  const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  
  // Clean up URL when audio ends
  audio.addEventListener('ended', () => {
    URL.revokeObjectURL(url);
  });
  
  return audio;
}

// Helper function to stream audio and play as it arrives
export async function streamAndPlayAudio(
  text: string,
  options?: Partial<StreamTTSOptions>
): Promise<void> {
  const client = getElevenLabsClient();
  const audioChunks: ArrayBuffer[] = [];
  
  await client.streamTextToSpeech({
    text,
    ...options,
    onChunk: (chunk) => {
      audioChunks.push(chunk);
      if (options?.onChunk) {
        options.onChunk(chunk);
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
        if (options?.onComplete) {
          options.onComplete();
        }
      };
      
      await audio.play();
    },
    onError: (error) => {
      if (options?.onError) {
        options.onError(error);
      }
    }
  });
}
