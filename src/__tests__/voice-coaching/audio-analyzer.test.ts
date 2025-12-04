/**
 * Audio Analyzer Tests
 */

import { AudioAnalyzer } from '@/lib/voice-coaching/audio-analyzer';
import { PaceTracker } from '@/lib/voice-coaching/pace-tracker';
import { PitchDetector } from '@/lib/voice-coaching/pitch-detector';
import { VolumeMeter } from '@/lib/voice-coaching/volume-meter';
import { PauseDetector } from '@/lib/voice-coaching/pause-detector';

// Mock Web Audio API
global.AudioContext = jest.fn().mockImplementation(() => ({
  createAnalyser: jest.fn(() => ({
    fftSize: 2048,
    frequencyBinCount: 1024,
    smoothingTimeConstant: 0.8,
    getByteFrequencyData: jest.fn(),
    getFloatTimeDomainData: jest.fn(),
  })),
  createMediaStreamSource: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
  })),
  resume: jest.fn().mockResolvedValue(undefined),
  state: 'running',
  sampleRate: 44100,
  close: jest.fn(),
})) as any;

global.MediaStream = jest.fn().mockImplementation(() => ({
  getTracks: jest.fn(() => [
    { stop: jest.fn() },
  ]),
})) as any;

global.navigator = {
  mediaDevices: {
    getUserMedia: jest.fn().mockResolvedValue(new MediaStream()),
  },
} as any;

describe('AudioAnalyzer', () => {
  let analyzer: AudioAnalyzer;
  const mockConversationId = 'test_conv_123';
  const mockOnMetricsUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    analyzer = new AudioAnalyzer(
      mockConversationId,
      undefined,
      {
        enabled: true,
        updateInterval: 200,
        feedbackEnabled: true,
      },
      mockOnMetricsUpdate
    );
  });

  afterEach(() => {
    if (analyzer) {
      analyzer.stopAnalysis();
    }
  });

  describe('Initialization', () => {
    it('should create analyzer instance', () => {
      expect(analyzer).toBeInstanceOf(AudioAnalyzer);
    });

    it('should not be active initially', () => {
      expect(analyzer.isActive()).toBe(false);
    });
  });

  describe('startAnalysis', () => {
    it('should start analysis successfully', async () => {
      await analyzer.startAnalysis();
      expect(analyzer.isActive()).toBe(true);
    });

    it('should handle getUserMedia errors', async () => {
      (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValueOnce(
        new Error('Permission denied')
      );

      await expect(analyzer.startAnalysis()).rejects.toThrow();
    });

    it('should handle missing getUserMedia', async () => {
      const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
      delete (navigator.mediaDevices as any).getUserMedia;

      await expect(analyzer.startAnalysis()).rejects.toThrow();

      navigator.mediaDevices.getUserMedia = originalGetUserMedia;
    });
  });

  describe('stopAnalysis', () => {
    it('should stop analysis', async () => {
      await analyzer.startAnalysis();
      analyzer.stopAnalysis();
      expect(analyzer.isActive()).toBe(false);
    });
  });

  describe('getCurrentMetrics', () => {
    it('should return null when not active', () => {
      expect(analyzer.getCurrentMetrics()).toBeNull();
    });

    it('should return metrics when active', async () => {
      await analyzer.startAnalysis();
      const metrics = analyzer.getCurrentMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics).toHaveProperty('pace');
      expect(metrics).toHaveProperty('pitch');
      expect(metrics).toHaveProperty('volume');
    });
  });
});

describe('PaceTracker', () => {
  let tracker: PaceTracker;

  beforeEach(() => {
    tracker = new PaceTracker();
  });

  it('should initialize with zero words', () => {
    tracker.start();
    expect(tracker.getCurrentWPM()).toBe(0);
  });

  it('should calculate WPM correctly', () => {
    tracker.start();
    tracker.recordWords(10);
    // Wait a bit to simulate time passing
    jest.advanceTimersByTime(60000); // 1 minute
    expect(tracker.getCurrentWPM()).toBeGreaterThan(0);
  });

  it('should track pace trend', () => {
    tracker.start();
    tracker.recordWords(5);
    const trend = tracker.getPaceTrend();
    expect(['increasing', 'decreasing', 'stable']).toContain(trend);
  });
});

describe('VolumeMeter', () => {
  let meter: VolumeMeter;
  let mockAnalyser: AnalyserNode;

  beforeEach(() => {
    mockAnalyser = {
      frequencyBinCount: 1024,
      getByteFrequencyData: jest.fn((arr: Uint8Array) => {
        // Fill with test data
        for (let i = 0; i < arr.length; i++) {
          arr[i] = 128; // Mid-range value
        }
      }),
    } as any;

    meter = new VolumeMeter(mockAnalyser);
  });

  it('should calculate RMS volume', () => {
    const volume = meter.getRMS();
    expect(typeof volume).toBe('number');
    expect(volume).toBeLessThanOrEqual(0);
  });

  it('should categorize volume level', () => {
    const level = meter.getVolumeLevel();
    expect(['too-quiet', 'quiet', 'normal', 'loud', 'too-loud']).toContain(level);
  });
});

