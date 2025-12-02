'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { VoiceRecorder, SpeechToText, VoicePlayer } from '@/lib/voice';
import { Card } from '@/components/ui/card';

interface VoiceControlsProps {
  onTranscript: (text: string) => void;
  onPlayAudio: (text: string) => Promise<void>;
  disabled?: boolean;
  voiceId?: string;
}

export default function VoiceControls({
  onTranscript,
  onPlayAudio,
  disabled = false,
  voiceId,
}: VoiceControlsProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const speechToTextRef = useRef<SpeechToText | null>(null);
  const playerRef = useRef<VoicePlayer | null>(null);

  useEffect(() => {
    recorderRef.current = new VoiceRecorder();
    speechToTextRef.current = new SpeechToText();
    playerRef.current = new VoicePlayer();

    return () => {
      recorderRef.current?.cleanup();
    };
  }, []);

  const handleStartRecording = async () => {
    if (!recorderRef.current || disabled) return;

    try {
      setIsRecording(true);
      await recorderRef.current.startRecording(
        async (audioBlob) => {
          setIsProcessing(true);
          try {
            if (speechToTextRef.current) {
              const transcript = await speechToTextRef.current.transcribe(audioBlob);
              onTranscript(transcript);
            }
          } catch (error) {
            console.error('Transcription error:', error);
            alert('Failed to transcribe audio. Please try again.');
          } finally {
            setIsProcessing(false);
            setIsRecording(false);
          }
        },
        () => {
          setIsRecording(false);
        }
      );
    } catch (error) {
      console.error('Recording error:', error);
      alert(error instanceof Error ? error.message : 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording();
    }
  };


  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {isRecording ? (
            <Button
              onClick={handleStopRecording}
              variant="destructive"
              size="lg"
              disabled={disabled || isProcessing}
            >
              <MicOff className="h-5 w-5 mr-2" />
              Stop Recording
            </Button>
          ) : (
            <Button
              onClick={handleStartRecording}
              variant="default"
              size="lg"
              disabled={disabled || isRecording || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Mic className="h-5 w-5 mr-2" />
              )}
              {isProcessing ? 'Processing...' : 'Start Recording'}
            </Button>
          )}
        </div>

        {isRecording && (
          <div className="flex items-center gap-2 text-red-500">
            <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Recording...</span>
          </div>
        )}

        {isPlaying && (
          <div className="flex items-center gap-2 text-blue-500">
            <Volume2 className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-medium">Playing audio...</span>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        {isRecording
          ? 'Speak your response...'
          : 'Click to record your voice response'}
      </p>
    </Card>
  );
}

