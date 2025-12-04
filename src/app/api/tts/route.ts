import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput, validateText } from '@/lib/security';
import { log } from '@/lib/logger';
import { successResponse, errorResponse } from '@/lib/api-response';

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
      const errorText = await response.text();
      log.error('ElevenLabs API error', new Error(errorText), {
        status: response.status,
        voiceId: sanitizedVoiceId,
      });
      return errorResponse('Failed to generate speech', {
        status: response.status,
        message: 'Text-to-speech generation failed',
      });
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      audio: `data:audio/mpeg;base64,${audioBase64}`,
    });
  } catch (error) {
    log.error('TTS API error', error instanceof Error ? error : new Error(String(error)));
    return errorResponse(error instanceof Error ? error : new Error('Internal server error'), {
      status: 500,
      message: 'Text-to-speech service unavailable',
    });
  }
}

