# How Vapi Connection Works

## 🔌 Connection Method

I'm using **direct HTTP fetch calls** to Vapi's REST API - no separate client library needed. Here's how it works:

---

## 📡 API Connection Flow

### 1. **Server-Side API Routes** (Secure)
All Vapi API calls happen on the **server-side** through Next.js API routes:

```
Frontend → Next.js API Route → Vapi REST API
```

**Why?** Keeps the Vapi API key secure (never exposed to client)

### 2. **API Endpoints Created**

#### `/api/vapi/sales-call` (POST)
- Creates Vapi assistant
- Initiates phone call
- Returns call ID

#### `/api/vapi/call/[callId]/status` (GET)
- Gets call status from Vapi
- Returns duration, transcript, recording URL

#### `/api/vapi/call/[callId]/end` (POST)
- Ends the call via Vapi API

---

## 🔑 Authentication

**Vapi API Key** is stored in **server-side environment variable**:
```bash
VAPI_API_KEY=your_vapi_api_key
```

**Never exposed to client** - all calls go through server API routes.

---

## 📋 How It Works Step-by-Step

### Step 1: User Initiates Call
```typescript
// Frontend calls our API route
POST /api/vapi/sales-call
{
  phoneNumber: "+15551234567",
  userId: "user_123",
  scenarioId: "SKEPTIC_VPE_001"
}
```

### Step 2: Server Creates Vapi Assistant
```typescript
// Our API route calls Vapi
POST https://api.vapi.ai/assistant
Headers: Authorization: Bearer ${VAPI_API_KEY}
Body: {
  name: "Sales Training - Skeptical VP",
  model: { provider: "openai", model: "gpt-4" },
  voice: { provider: "elevenlabs", voiceId: "..." },
  firstMessage: "Thanks for the overview..."
}
```

### Step 3: Server Initiates Call
```typescript
// Our API route calls Vapi
POST https://api.vapi.ai/call
Headers: Authorization: Bearer ${VAPI_API_KEY}
Body: {
  phoneNumberId: "+15551234567",
  assistantId: "assistant_123",
  metadata: { userId, scenarioId }
}
```

### Step 4: Call Happens
- Vapi handles the actual phone call
- User answers and practices
- Vapi records and transcribes

### Step 5: Get Call Status (Polling)
```typescript
// Frontend polls our API route
GET /api/vapi/call/{callId}/status

// Our API route calls Vapi
GET https://api.vapi.ai/call/{callId}
Headers: Authorization: Bearer ${VAPI_API_KEY}
```

### Step 6: Get Analysis
```typescript
// After call ends, get analysis
GET /api/vapi/sales-call?callId={callId}&scenarioId={scenarioId}

// Our API route calls Modal for analysis
POST {MODAL_FUNCTION_URL}
Body: { call_id, scenario_id, transcript }
```

---

## 🔒 Security

✅ **API Key Security**
- Vapi API key stored in `VAPI_API_KEY` env var (server-side only)
- Never exposed to client
- All Vapi calls go through Next.js API routes

✅ **Input Validation**
- Phone number format validation
- Scenario validation
- Input sanitization

✅ **Error Handling**
- Graceful error messages
- No sensitive data leaked in errors

---

## 📝 Code Structure

### API Routes (Server-Side)
```
src/app/api/vapi/
├── sales-call/route.ts          # Main endpoint (create assistant + call)
└── call/
    ├── [callId]/
    │   ├── status/route.ts      # Get call status
    │   └── end/route.ts          # End call
```

### Frontend Component
```
src/components/SalesTraining/
└── PhoneCallTraining.tsx         # UI component (calls our API routes)
```

---

## 🚀 Setup Required

### 1. Get Vapi API Key
1. Sign up at https://vapi.ai
2. Get your API key from dashboard
3. Add to Vercel environment variables: `VAPI_API_KEY`

### 2. Configure Phone Number
- Vapi needs a phone number configured in their dashboard
- Or use their test phone number for development

### 3. Test Connection
```bash
# Test API route
curl -X POST http://localhost:3000/api/vapi/sales-call \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+15551234567",
    "userId": "test_user",
    "scenarioId": "SKEPTIC_VPE_001"
  }'
```

---

## 🔍 Direct API Calls (No Client Library)

I'm using **native fetch()** calls to Vapi's REST API:

```typescript
// Example: Create Assistant
const response = await fetch('https://api.vapi.ai/assistant', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${VAPI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Sales Training Assistant',
    model: { provider: 'openai', model: 'gpt-4' },
    voice: { provider: 'elevenlabs', voiceId: '...' },
  }),
});
```

**Why no client library?**
- Vapi's API is simple REST
- Native fetch is sufficient
- Less dependencies
- Easier to maintain

---

## 📚 Vapi API Documentation

Full API docs: https://docs.vapi.ai

**Key Endpoints Used:**
- `POST /assistant` - Create AI assistant
- `POST /call` - Initiate phone call
- `GET /call/{callId}` - Get call status/transcript
- `POST /call/{callId}/end` - End call

---

## ✅ Status

**Connection Method:** ✅ Implemented
- Direct HTTP fetch calls to Vapi REST API
- Server-side API routes for security
- Frontend component for UI

**Ready to Use:** ⏳ Needs Vapi API Key
- Add `VAPI_API_KEY` to Vercel environment variables
- Test with a phone number

---

**No separate Vapi client library needed** - using direct REST API calls through secure server-side routes! 🚀

