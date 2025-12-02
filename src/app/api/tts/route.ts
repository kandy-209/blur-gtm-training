import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput, validateText } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    // Validate content type
    const contentType = request.headers?.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const { text, voiceId } = await request.json();

    // Validate text input
    const textValidation = validateText(text || '', {
      minLength: 1,
      maxLength: 5000, // Limit text length for TTS
    });

    if (!textValidation.valid) {
      return NextResponse.json(
        { error: textValidation.error || 'Invalid text input' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedText = sanitizeInput(text, 5000);
    const sanitizedVoiceId = voiceId ? sanitizeInput(voiceId, 100) : null;

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    // Use ElevenLabs API for text-to-speech
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${sanitizedVoiceId || '21m00Tcm4TlvDq8ikWAM'}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: sanitizedText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate speech' },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      audio: `data:audio/mpeg;base64,${audioBase64}`,
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

