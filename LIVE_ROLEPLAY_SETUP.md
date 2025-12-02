# 🎙️ Live Role-Play Feature Setup Guide

## ✅ What's Been Built

### 1. **Real-Time Chat System**
- ✅ REST API-based messaging (polling every 1 second)
- ✅ Session management with in-memory storage
- ✅ Message history persistence
- ✅ Real-time message updates

### 2. **Lobby & Matching System**
- ✅ User lobby for finding partners
- ✅ Role-based matching (rep/prospect/any)
- ✅ Scenario-based matching
- ✅ Automatic session creation on match

### 3. **Voice Communication (Basic)**
- ✅ Microphone access UI
- ✅ Voice enable/disable controls
- ⚠️ WebRTC peer-to-peer connection (needs implementation)

### 4. **Slack Integration**
- ✅ Slack API integration for notifications
- ✅ Channel messaging support
- ⚠️ Requires `SLACK_BOT_TOKEN` environment variable

## 📁 New Files Created

### API Routes
- `src/app/api/live/lobby/route.ts` - Lobby management
- `src/app/api/live/sessions/route.ts` - Session management
- `src/app/api/live/messages/route.ts` - Message handling
- `src/app/api/slack/notify/route.ts` - Slack notifications

### Components
- `src/components/LiveRoleplayLobby.tsx` - Lobby UI
- `src/components/LiveRoleplaySession.tsx` - Live session UI

### Pages
- `src/app/live/page.tsx` - Main live role-play page

### Types & Utilities
- `src/types/live-roleplay.ts` - Type definitions
- `src/lib/live-session-manager.ts` - Session management logic

## 🚀 How to Use

### 1. **Access Live Role-Play**
Navigate to `/live` in your application

### 2. **Find a Partner**
1. Enter your display name (stored in localStorage)
2. Choose preferred role (Rep/Prospect/Any)
3. Optionally select a scenario
4. Click "Find a Partner"

### 3. **Start Session**
- When matched, session starts automatically
- Chat in real-time with your partner
- Enable voice communication (microphone required)

### 4. **End Session**
- Click "End Session" to finish
- Session history is preserved

## 🔧 Environment Variables Needed

### Slack Integration (Optional)
```bash
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
```

**To get a Slack Bot Token:**
1. Go to https://api.slack.com/apps
2. Create a new app
3. Add "Bot Token Scopes": `chat:write`, `channels:read`
4. Install app to workspace
5. Copy Bot User OAuth Token

## 🎯 Next Steps for Full Implementation

### 1. **WebRTC Voice Communication**
Currently, voice UI is ready but WebRTC peer connection needs implementation:

```typescript
// In LiveRoleplaySession.tsx, implement:
// - WebRTC signaling server
// - Peer connection setup
// - Audio stream handling
```

**Recommended approach:**
- Use `simple-peer` library (already installed)
- Create signaling API endpoint
- Handle ICE candidates and offer/answer exchange

### 2. **WebSocket for Real-Time Updates**
Replace polling with WebSocket for better performance:

```typescript
// Create WebSocket server
// Use Socket.io or native WebSocket
// Update components to use WebSocket instead of polling
```

### 3. **Database Persistence**
Replace in-memory storage with database:

```typescript
// Update live-session-manager.ts to use Supabase
// Store sessions, messages, lobby users in database
```

### 4. **Slack Notifications**
Add notifications for:
- New match found
- Session started
- Session completed
- High scores achieved

Example:
```typescript
// In LiveRoleplaySession.tsx
await fetch('/api/slack/notify', {
  method: 'POST',
  body: JSON.stringify({
    channel: '#sales-training',
    text: `🎉 ${username} started a live role-play session!`,
  }),
});
```

## 📊 Features

### ✅ Completed
- [x] Lobby system
- [x] User matching
- [x] Session management
- [x] Real-time chat (polling)
- [x] Message history
- [x] Voice UI controls
- [x] Slack API integration
- [x] Analytics tracking

### 🚧 In Progress
- [ ] WebRTC voice connection
- [ ] WebSocket real-time updates
- [ ] Database persistence

### 📋 Future Enhancements
- [ ] Video support
- [ ] Screen sharing
- [ ] Session recording
- [ ] AI feedback during live sessions
- [ ] Leaderboards
- [ ] Team challenges

## 🐛 Known Limitations

1. **Polling-based updates**: Currently uses 1-second polling instead of WebSocket
2. **In-memory storage**: Sessions lost on server restart (use database in production)
3. **Voice not connected**: WebRTC peer connection needs implementation
4. **No reconnection**: If connection drops, session is lost

## 🔒 Security Considerations

- ✅ Input sanitization on all API routes
- ✅ User ID validation
- ✅ Session ownership checks
- ⚠️ Add rate limiting for API routes
- ⚠️ Add authentication for production use
- ⚠️ Encrypt voice streams

## 📝 Usage Example

```typescript
// User joins lobby
POST /api/live/lobby
{
  "userId": "user_123",
  "username": "John",
  "preferredRole": "rep",
  "scenarioId": "SKEPTIC_VPE_001"
}

// Create session when matched
POST /api/live/sessions
{
  "repUserId": "user_123",
  "prospectUserId": "user_456",
  "scenarioId": "SKEPTIC_VPE_001"
}

// Send message
POST /api/live/messages
{
  "sessionId": "session_123",
  "userId": "user_123",
  "role": "rep",
  "message": "Hello!",
  "type": "text"
}
```

## 🎉 Ready to Use!

The basic live role-play system is functional. Users can:
- Find partners
- Start sessions
- Chat in real-time
- Enable voice (UI ready, needs WebRTC implementation)

**Deploy and test!** 🚀

