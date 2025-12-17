import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput, validateText } from '@/lib/security';
import { ElevenLabsClient } from '@/lib/elevenlabs';

// Initialize ElevenLabs client
const elevenLabsClient = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY?.trim(),
  voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID?.trim(),
  modelId: 'eleven_multilingual_v2', // Better model for multilingual support
  stability: 0.5,
  similarityBoost: 0.75,
  useSpeakerBoost: true
});

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

    const { text, voiceId, modelId, stability, similarityBoost, stream, outputFormat } = await request.json();

    // Validate text input and reject XSS patterns (including encoded variants)
    const textStr = String(text || '');
    
    // Decode common encodings to check for XSS
    const decoded = textStr
      .replace(/%3C/gi, '<')
      .replace(/%3E/gi, '>')
      .replace(/&#60;/gi, '<')
      .replace(/&#62;/gi, '>')
      .replace(/\\x3C/gi, '<')
      .replace(/\\x3E/gi, '>')
      .replace(/\\u003C/gi, '<')
      .replace(/\\u003E/gi, '>');
    
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /onerror=/i,
      /onload=/i,
      /onclick=/i,
      /onfocus=/i,
      /<iframe/i,
      /<svg/i,
      /<img/i,
      /<body/i,
      /<input/i,
      /<link/i,
      /<meta/i,
      /<style/i,
      /<object/i,
      /<embed/i,
      /<form/i,
    ];
    
    const hasXSS = xssPatterns.some(pattern => pattern.test(textStr) || pattern.test(decoded));
    if (hasXSS) {
      return NextResponse.json(
        { error: 'Invalid text input: potentially dangerous content detected' },
        { status: 400 }
      );
    }
    
    const textValidation = validateText(textStr, {
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
    const sanitizedVoiceId = voiceId ? sanitizeInput(voiceId, 100) : undefined;
    const sanitizedModelId = modelId ? sanitizeInput(modelId, 50) : undefined;

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    // Validate voice settings
    const voiceSettings = {
      stability: Math.max(0, Math.min(1, stability ?? 0.5)),
      similarity_boost: Math.max(0, Math.min(1, similarityBoost ?? 0.75)),
      use_speaker_boost: true
    };

    // Handle streaming request
    if (stream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            await elevenLabsClient.streamTextToSpeech({
              text: sanitizedText,
              voiceId: sanitizedVoiceId,
              modelId: sanitizedModelId,
              voiceSettings,
              outputFormat: outputFormat as any,
              onChunk: (chunk) => {
                controller.enqueue(chunk);
              },
              onComplete: () => {
                controller.close();
              },
              onError: (error) => {
                controller.error(error);
              }
            });
          } catch (error) {
            controller.error(error);
          }
        }
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Transfer-Encoding': 'chunked',
          'Cache-Control': 'no-cache',
          'X-Accel-Buffering': 'no', // Disable buffering for streaming
        },
      });
    }

    // Non-streaming request
    const audioBuffer = await elevenLabsClient.textToSpeech({
      text: sanitizedText,
      voiceId: sanitizedVoiceId,
      modelId: sanitizedModelId,
      voiceSettings,
      outputFormat: outputFormat as any,
    });

    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      audio: `data:audio/mpeg;base64,${audioBase64}`,
      format: 'mp3',
      size: audioBuffer.byteLength,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('TTS API error:', error);
    
    // Provide more detailed error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'ElevenLabs API key is invalid or missing' },
          { status: 401 }
        );
      }
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return NextResponse.json(
          { error: 'ElevenLabs API quota exceeded' },
          { status: 429 }
        );
      }
      if (error.message.includes('voice')) {
        return NextResponse.json(
          { error: 'Invalid voice ID' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve available voices
export async function GET(request: NextRequest) {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    const voices = await elevenLabsClient.getVoices();
    
    return NextResponse.json({
      voices: voices.map((voice: any) => ({
        voice_id: voice.voice_id,
        name: voice.name,
        category: voice.category,
        description: voice.description,
        preview_url: voice.preview_url,
      })),
      count: voices.length,
    });
  } catch (error) {
    console.error('Error fetching voices:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch voices' },
      { status: 500 }
    );
  }
}
