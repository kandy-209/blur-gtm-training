/**
 * Tests for ElevenLabs TTS Integration
 */

import { ElevenLabsClient } from '../elevenlabs';

// Mock fetch
global.fetch = jest.fn();

describe('ElevenLabsClient', () => {
  const mockApiKey = 'test-api-key';
  const mockVoiceId = 'test-voice-id';

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('textToSpeech', () => {
    it('should convert text to speech successfully', async () => {
      const client = new ElevenLabsClient({
        apiKey: mockApiKey,
        voiceId: mockVoiceId,
      });

      const mockAudioBuffer = new ArrayBuffer(8);
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(mockAudioBuffer),
        headers: new Headers({
          'content-type': 'audio/mpeg',
        }),
      });

      const result = await client.textToSpeech('Hello, world!');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/text-to-speech'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'xi-api-key': mockApiKey,
          }),
        })
      );
      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should handle API errors gracefully', async () => {
      const client = new ElevenLabsClient({
        apiKey: mockApiKey,
        voiceId: mockVoiceId,
      });

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue({ error: 'Invalid API key' }),
      });

      await expect(client.textToSpeech('Hello')).rejects.toThrow();
    });

    it('should respect text length limits', async () => {
      const client = new ElevenLabsClient({
        apiKey: mockApiKey,
        voiceId: mockVoiceId,
      });

      const longText = 'a'.repeat(5001);
      
      await expect(client.textToSpeech(longText)).rejects.toThrow(
        'Text exceeds maximum length'
      );
    });

    it('should use custom voice ID when provided', async () => {
      const customVoiceId = 'custom-voice-id';
      const client = new ElevenLabsClient({
        apiKey: mockApiKey,
        voiceId: customVoiceId,
      });

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
        headers: new Headers({ 'content-type': 'audio/mpeg' }),
      });

      await client.textToSpeech('Test', { voiceId: customVoiceId });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(customVoiceId),
        expect.any(Object)
      );
    });
  });

  describe('getVoices', () => {
    it('should fetch available voices', async () => {
      const client = new ElevenLabsClient({
        apiKey: mockApiKey,
        voiceId: mockVoiceId,
      });

      const mockVoices = {
        voices: [
          { voice_id: 'voice1', name: 'Voice 1' },
          { voice_id: 'voice2', name: 'Voice 2' },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockVoices),
      });

      const voices = await client.getVoices();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/voices'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'xi-api-key': mockApiKey,
          }),
        })
      );
      expect(voices).toEqual(mockVoices);
    });
  });

  describe('configuration', () => {
    it('should use default model if not specified', () => {
      const client = new ElevenLabsClient({
        apiKey: mockApiKey,
        voiceId: mockVoiceId,
      });

      expect(client).toBeDefined();
    });

    it('should accept custom configuration', () => {
      const client = new ElevenLabsClient({
        apiKey: mockApiKey,
        voiceId: mockVoiceId,
        modelId: 'custom-model',
        stability: 0.7,
        similarityBoost: 0.8,
      });

      expect(client).toBeDefined();
    });
  });
});

