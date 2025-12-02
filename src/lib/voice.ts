// Voice utilities for recording and playback

export interface VoiceConfig {
  enabled: boolean;
  elevenLabsApiKey?: string;
  voiceId?: string; // ElevenLabs voice ID
  useWebSpeechAPI?: boolean; // Fallback to browser Speech API
}

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private onDataAvailable?: (audioBlob: Blob) => void;
  private onStop?: () => void;

  async startRecording(
    onDataAvailable?: (audioBlob: Blob) => void,
    onStop?: () => void
  ): Promise<void> {
    try {
      this.onDataAvailable = onDataAvailable;
      this.onStop = onStop;
      this.audioChunks = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.stream = stream;

      const options = { mimeType: 'audio/webm' };
      this.mediaRecorder = new MediaRecorder(stream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        if (this.onDataAvailable) {
          this.onDataAvailable(audioBlob);
        }
        if (this.onStop) {
          this.onStop();
        }
        // Stop all tracks
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start recording. Please check microphone permissions.');
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  async cleanup(): Promise<void> {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }
}

export class SpeechToText {
  private recognition: any = null;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.isSupported = !!SpeechRecognition;

      if (this.isSupported) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
      }
    }
  }

  isAvailable(): boolean {
    return this.isSupported;
  }

  async transcribe(audioBlob: Blob): Promise<string> {
    // Use OpenAI Whisper API for transcription
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Transcription failed');
    }

    const data = await response.json();
    return data.text || '';
  }

  startListening(onResult: (text: string) => void, onError?: (error: Error) => void): void {
    if (!this.isSupported || !this.recognition) {
      if (onError) {
        onError(new Error('Speech recognition not supported in this browser'));
      }
      return;
    }

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      if (onError) {
        onError(new Error(event.error));
      }
    };

    this.recognition.start();
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}

export class VoicePlayer {
  private audio: HTMLAudioElement | null = null;

  async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.audio = new Audio(audioUrl);
      this.audio.onended = () => resolve();
      this.audio.onerror = () => reject(new Error('Audio playback failed'));
      this.audio.play().catch(reject);
    });
  }

  async playFromBlob(audioBlob: Blob): Promise<void> {
    const url = URL.createObjectURL(audioBlob);
    try {
      await this.playAudio(url);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  isPlaying(): boolean {
    return this.audio ? !this.audio.paused : false;
  }
}

