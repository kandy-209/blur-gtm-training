# Voice Role-Play Setup Guide

This application now supports voice-based role-play using ElevenLabs for text-to-speech and OpenAI Whisper for speech-to-text.

## Features

- 🎤 **Voice Recording**: Record your responses using your microphone
- 🔊 **Text-to-Speech**: AI prospect responses are converted to natural-sounding speech
- 📝 **Speech-to-Text**: Your voice responses are automatically transcribed
- 🎯 **Auto-Play**: Optionally auto-play AI responses in voice mode

## Setup Instructions

### 1. Get ElevenLabs API Key

1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Go to your profile settings
3. Copy your API key

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# OpenAI API Key (already configured)
OPENAI_API_KEY=your_openai_api_key_here

# ElevenLabs API Key (for text-to-speech)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Optional: ElevenLabs Voice ID (default voice is used if not specified)
# You can find voice IDs in your ElevenLabs dashboard
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=your_voice_id_here
```

### 3. Restart the Development Server

After adding the environment variables, restart your server:

```bash
npm run dev
```

## Using Voice Mode

1. **Enable Voice Mode**: Click the "Voice Off" button in the top right to toggle voice mode on
2. **Record Response**: Click "Start Recording" and speak your response
3. **Auto-Transcription**: Your speech will be automatically transcribed and submitted
4. **Listen to AI**: AI responses will automatically play as audio (if auto-play is enabled)
5. **Manual Playback**: Click "Play Audio" on any AI message to replay it

## Voice Settings

- **Voice Mode Toggle**: Enable/disable voice features
- **Auto-Play**: When enabled, AI responses automatically play as audio
- **Manual Playback**: Click "Play Audio" on any message to replay it

## Browser Compatibility

- **Microphone Access**: Requires browser permission for microphone access
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (may require HTTPS in production)

## Troubleshooting

### Microphone Not Working
- Check browser permissions for microphone access
- Ensure your microphone is connected and working
- Try refreshing the page and granting permissions again

### Audio Not Playing
- Check that ElevenLabs API key is configured correctly
- Verify your browser allows audio playback
- Check browser console for error messages

### Transcription Errors
- Ensure OpenAI API key is configured
- Check that audio file format is supported (WebM)
- Verify internet connection is stable

## Cost Considerations

- **ElevenLabs**: Charges per character for text-to-speech
- **OpenAI Whisper**: Charges per minute of audio transcribed
- Consider usage limits and costs when using voice features extensively

## Default Voice

The default ElevenLabs voice ID is `21m00Tcm4TlvDq8ikWAM` (Rachel - professional female voice). You can change this by setting `NEXT_PUBLIC_ELEVENLABS_VOICE_ID` in your `.env.local` file.

