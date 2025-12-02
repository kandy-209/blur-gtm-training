import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { validateFile } from '@/lib/security';

// Initialize OpenAI client lazily to avoid build-time errors
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Validate content type (multipart/form-data may have boundary parameter)
    const contentType = request.headers?.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate file
    const fileValidation = validateFile(file, {
      maxSize: 25 * 1024 * 1024, // 25MB max
      allowedTypes: ['audio/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
    });

    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.error || 'Invalid file' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Convert File to OpenAI File format
    const buffer = Buffer.from(await file.arrayBuffer());
    const blob = new Blob([buffer], { type: file.type });

    // Create a File-like object for OpenAI
    const openaiFile = new File([blob], file.name, { type: file.type });

    // Use OpenAI Whisper API for transcription
    const openai = getOpenAIClient();
    const transcription = await openai.audio.transcriptions.create({
      file: openaiFile,
      model: 'whisper-1',
      language: 'en',
    });

    return NextResponse.json({
      text: transcription.text,
    });
  } catch (error) {
    console.error('Transcription API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

