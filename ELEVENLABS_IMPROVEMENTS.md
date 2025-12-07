# ElevenLabs Integration Improvements

This document outlines the comprehensive improvements made to the ElevenLabs integration in the application.

## Overview

The ElevenLabs integration has been significantly enhanced to leverage the full power of ElevenLabs' Conversational AI platform. The improvements include:

1. **Enhanced Widget Component** (`ElevenLabsConvAI.tsx`)
2. **ElevenLabs SDK Integration** (`lib/elevenlabs.ts`)
3. **Conversation Analytics** (`lib/elevenlabs-analytics.ts`)
4. **React Hook** (`hooks/useElevenLabs.ts`)
5. **Improved TTS API** (`app/api/tts/route.ts`)
6. **TypeScript Definitions** (`types/elevenlabs.d.ts`)

## Key Features

### 1. Enhanced Widget Component

The `ElevenLabsConvAI` component now includes:

- **Scenario Context Injection**: Automatically builds system prompts and first messages from scenario data
- **Conversation Tracking**: Tracks all messages, events, and conversation state
- **Event Handling**: Comprehensive event listeners for conversation lifecycle
- **Export Functionality**: Export conversations as JSON
- **Reset Functionality**: Reset conversations without reloading the widget
- **Minimize/Maximize**: Better UX with window controls
- **Error Handling**: Improved error states and user feedback
- **Accessibility**: Full ARIA support and keyboard shortcuts
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

#### Usage Example

```tsx
import ElevenLabsConvAI from '@/components/ElevenLabsConvAI';
import { scenarios } from '@/data/scenarios';

function RoleplayPage() {
  const scenario = scenarios[0];
  
  return (
    <ElevenLabsConvAI
      agentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'default-agent-id'}
      scenario={scenario}
      userId="user-123"
      onConversationComplete={(conversationId, messages) => {
        console.log('Conversation completed:', conversationId, messages);
      }}
      onError={(error) => {
        console.error('ElevenLabs error:', error);
      }}
    />
  );
}
```

### 2. ElevenLabs SDK Integration

A comprehensive SDK wrapper (`lib/elevenlabs.ts`) provides:

- **Text-to-Speech**: Convert text to high-quality audio
- **Streaming TTS**: Real-time audio streaming for low latency
- **Voice Management**: List and manage available voices
- **Subscription Info**: Check API quota and subscription status
- **Audio Utilities**: Helper functions for audio playback and conversion

#### Usage Example

```typescript
import { getElevenLabsClient } from '@/lib/elevenlabs';

const client = getElevenLabsClient();

// Text to speech
const audioBuffer = await client.textToSpeech({
  text: "Hello, this is a test",
  voiceId: "21m00Tcm4TlvDq8ikWAM",
  modelId: "eleven_multilingual_v2"
});

// Stream text to speech
await client.streamTextToSpeech({
  text: "Long text here...",
  onChunk: (chunk) => {
    // Process audio chunk as it arrives
  },
  onComplete: () => {
    console.log("Streaming complete");
  }
});

// Play audio
await client.playAudio(audioBuffer);
```

### 3. Conversation Analytics

The analytics system (`lib/elevenlabs-analytics.ts`) tracks:

- **Conversation Metrics**: Duration, message count, word count
- **Message Tracking**: All user and assistant messages
- **Event Tracking**: Conversation lifecycle events
- **Sentiment Analysis**: Basic sentiment detection
- **Key Phrase Extraction**: Identify important topics
- **Summary Generation**: Automatic conversation summaries

#### Usage Example

```typescript
import { conversationAnalytics } from '@/lib/elevenlabs-analytics';

// Start tracking
conversationAnalytics.startConversation('conv-123', 'user-456', 'scenario-789');

// Track messages
conversationAnalytics.trackMessage({
  type: 'message',
  role: 'user',
  message: 'Hello',
  conversationId: 'conv-123'
});

// Get analytics
const analytics = conversationAnalytics.getAnalytics('conv-123');
const summary = conversationAnalytics.generateSummary('conv-123');

// End conversation
const metrics = conversationAnalytics.endConversation('conv-123');
```

### 4. React Hook

The `useElevenLabs` hook provides easy access to ElevenLabs features:

```typescript
import { useElevenLabs } from '@/hooks/useElevenLabs';

function MyComponent() {
  const {
    isReady,
    isPlaying,
    error,
    textToSpeech,
    streamTextToSpeech,
    stopAudio,
    clearError
  } = useElevenLabs({
    voiceId: '21m00Tcm4TlvDq8ikWAM',
    modelId: 'eleven_multilingual_v2'
  });

  const handleSpeak = async () => {
    try {
      await textToSpeech('Hello, world!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {isReady && <button onClick={handleSpeak}>Speak</button>}
      {isPlaying && <button onClick={stopAudio}>Stop</button>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### 5. Improved TTS API

The TTS API route (`app/api/tts/route.ts`) now supports:

- **Streaming**: Real-time audio streaming
- **Custom Voice Settings**: Stability, similarity boost, etc.
- **Multiple Models**: Support for different ElevenLabs models
- **Output Formats**: Various audio formats
- **Voice Listing**: GET endpoint to list available voices
- **Better Error Handling**: Detailed error messages

#### API Endpoints

**POST /api/tts**
```json
{
  "text": "Hello, world!",
  "voiceId": "21m00Tcm4TlvDq8ikWAM",
  "modelId": "eleven_multilingual_v2",
  "stability": 0.5,
  "similarityBoost": 0.75,
  "stream": false,
  "outputFormat": "mp3_44100_128"
}
```

**GET /api/tts**
Returns list of available voices.

### 6. TypeScript Definitions

Comprehensive TypeScript definitions for:

- Widget attributes
- Event types
- SDK interfaces
- Analytics types

## Widget Attributes

The ElevenLabs widget supports many attributes for customization:

- `agent-id`: Required agent identifier
- `conversation-id`: Unique conversation identifier
- `first-message`: Initial message to start conversation
- `system-prompt`: Custom system prompt for the agent
- `enable-conversation-history`: Enable conversation history
- `enable-transcription`: Enable speech-to-text transcription
- `enable-context-awareness`: Enable context awareness
- `enable-multi-turn-conversation`: Enable multi-turn conversations
- `enable-analytics-tracking`: Enable analytics tracking
- `enable-recording`: Enable conversation recording
- `enable-playback-controls`: Enable audio playback controls
- `enable-accessibility`: Enable accessibility features
- `theme`: Widget theme (light, dark, auto)

## Event Handling

The widget emits various events:

- `conversation-start`: Conversation started
- `conversation-end`: Conversation ended
- `message-sent`: User message sent
- `message-received`: Assistant message received
- `error`: Error occurred
- `voice-start`: Voice started speaking
- `voice-end`: Voice finished speaking
- `transcription-start`: Transcription started
- `transcription-end`: Transcription finished

## Scenario Integration

The component automatically integrates with scenarios:

1. **System Prompt Generation**: Creates detailed system prompts from scenario persona data
2. **First Message**: Uses objection statement as first message
3. **Context Injection**: Injects scenario context into the conversation
4. **Key Points**: Includes key points the rep should address

## Best Practices

1. **Always provide scenario data** for better conversation quality
2. **Use conversation analytics** to track user progress
3. **Handle errors gracefully** with proper error boundaries
4. **Export conversations** for review and analysis
5. **Use streaming** for better user experience with long texts
6. **Monitor API quota** to avoid rate limiting

## Environment Variables

Required:
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key
- `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`: Your Conversational AI agent ID

Optional:
- `NEXT_PUBLIC_ELEVENLABS_VOICE_ID`: Default voice ID for TTS

## Performance Considerations

1. **Lazy Loading**: Widget script loads only when needed
2. **Streaming**: Use streaming for better perceived performance
3. **Caching**: TTS responses are cached for 1 hour
4. **Analytics**: Analytics tracking is lightweight and non-blocking

## Security

1. **API Key Protection**: API keys are server-side only
2. **Input Sanitization**: All inputs are sanitized
3. **Rate Limiting**: Built-in rate limiting support
4. **Error Handling**: Errors don't expose sensitive information

## Future Enhancements

Potential future improvements:

1. Voice cloning support
2. Custom voice training
3. Advanced sentiment analysis
4. Real-time collaboration
5. Multi-language support
6. Voice effects and filters
7. Background music
8. Noise reduction
9. Echo cancellation
10. Advanced analytics dashboard

## Troubleshooting

### Widget not loading
- Check internet connection
- Verify script URL is accessible
- Check browser console for errors

### Audio not playing
- Check microphone permissions
- Verify API key is valid
- Check API quota

### Conversation not starting
- Verify agent ID is correct
- Check scenario data is valid
- Ensure widget is fully loaded

## Support

For issues or questions:
1. Check the ElevenLabs documentation
2. Review error messages in console
3. Check API quota status
4. Verify environment variables




