# Database & Analytics Features

This document describes the database system for storing user responses, tracking top responses, and capturing technical questions.

## Overview

The application includes a comprehensive database system that:
1. **Stores user responses** during role-play sessions
2. **Tracks top-performing responses** for learning and improvement
3. **Captures technical questions** asked by developers
4. **Provides AI insights** to improve the role-play experience

## Database Schema

### UserResponse
Stores each user's response during a role-play turn:
- `id`: Unique identifier
- `userId`: User identifier
- `scenarioId`: Scenario being practiced
- `turnNumber`: Turn number in the conversation
- `objectionCategory`: Type of objection being handled
- `userMessage`: The user's response text
- `aiResponse`: AI's response to the user
- `evaluation`: PASS, FAIL, or REJECT
- `confidenceScore`: Score (50-100)
- `timestamp`: When the response was recorded
- `keyPointsMentioned`: Array of key points the user mentioned

### TechnicalQuestion
Stores technical questions asked by users:
- `id`: Unique identifier
- `userId`: User who asked the question
- `scenarioId`: Related scenario
- `question`: The question text
- `category`: Question category
- `timestamp`: When asked
- `upvotes`: Number of upvotes (community validation)

### ResponseAnalytics
Aggregated analytics for responses:
- `response`: The response text
- `count`: How many times this response was used
- `averageScore`: Average confidence score
- `successRate`: Percentage of successful evaluations
- `scenarioId`: Related scenario
- `objectionCategory`: Related objection category

## API Endpoints

### POST `/api/responses`
Save a user response to the database.

**Request Body:**
```json
{
  "userId": "user123",
  "scenarioId": "scenario1",
  "turnNumber": 1,
  "objectionCategory": "Competitive_Copilot",
  "userMessage": "Cursor provides codebase-wide context...",
  "aiResponse": "That's interesting. How does it handle...",
  "evaluation": "PASS",
  "confidenceScore": 85,
  "keyPointsMentioned": ["codebase context", "editing capabilities"]
}
```

**Response:**
```json
{
  "success": true,
  "response": { /* UserResponse object */ }
}
```

### GET `/api/responses`
Retrieve user responses with optional filters.

**Query Parameters:**
- `userId`: Filter by user ID
- `scenarioId`: Filter by scenario
- `objectionCategory`: Filter by objection category
- `limit`: Maximum number of results (default: 50, max: 100)

**Response:**
```json
{
  "responses": [ /* Array of UserResponse objects */ ]
}
```

### GET `/api/analytics/top-responses`
Get top-performing responses based on success rate and usage count.

**Query Parameters:**
- `scenarioId`: Filter by scenario
- `objectionCategory`: Filter by objection category
- `minScore`: Minimum confidence score (default: 70)
- `limit`: Maximum number of results (default: 20, max: 100)

**Response:**
```json
{
  "topResponses": [ /* Array of ResponseAnalytics objects */ ]
}
```

### GET `/api/questions`
Retrieve technical questions.

**Query Parameters:**
- `scenarioId`: Filter by scenario
- `category`: Filter by category
- `limit`: Maximum number of results (default: 20, max: 100)

**Response:**
```json
{
  "questions": [ /* Array of TechnicalQuestion objects */ ]
}
```

### POST `/api/questions`
Save a technical question.

**Request Body:**
```json
{
  "userId": "user123",
  "scenarioId": "scenario1",
  "question": "How does Cursor handle large codebases?",
  "category": "Competitive_Copilot"
}
```

### PUT `/api/questions`
Upvote a technical question.

**Request Body:**
```json
{
  "questionId": "q_1234567890_abc"
}
```

### GET `/api/ai-insights`
Get comprehensive insights for AI improvement.

**Query Parameters:**
- `scenarioId`: Required
- `objectionCategory`: Required

**Response:**
```json
{
  "insights": {
    "topResponses": [ /* Array of ResponseAnalytics */ ],
    "commonQuestions": [ /* Array of TechnicalQuestion */ ],
    "averageScore": 82,
    "successRate": 75.5
  }
}
```

## UI Components

### TopResponses
Displays the most successful responses from other users.

**Props:**
- `scenarioId`: Optional filter by scenario
- `objectionCategory`: Optional filter by category
- `limit`: Number of responses to show (default: 10)

**Usage:**
```tsx
<TopResponses 
  scenarioId="scenario1" 
  objectionCategory="Competitive_Copilot"
  limit={10}
/>
```

### TechnicalQuestions
Displays technical questions with upvote functionality.

**Props:**
- `scenarioId`: Optional filter by scenario
- `category`: Optional filter by category
- `limit`: Number of questions to show (default: 10)

**Usage:**
```tsx
<TechnicalQuestions 
  scenarioId="scenario1"
  category="Competitive_Copilot"
  limit={10}
/>
```

## Automatic Features

### Response Tracking
When a user submits a response in the role-play engine, it's automatically saved to the database with:
- User ID (from analytics)
- Scenario and turn information
- Evaluation and score
- Key points detected

### Question Extraction
The system automatically extracts technical questions from user responses:
- Detects questions ending with "?"
- Filters for technical keywords
- Saves to the technical questions database

### AI Enhancement
The role-play API can use database insights to improve AI responses:
- Top responses inform better evaluation
- Common questions help anticipate user needs
- Success rates guide scoring calibration

## Data Storage

**Current Implementation:** In-memory storage (Map-based)
- Fast and simple for development
- Data is lost on server restart
- Suitable for testing and small deployments

**Production Recommendation:** Replace with:
- **Supabase/PostgreSQL**: For persistent storage
- **Redis**: For caching and rate limiting
- **Database migrations**: For schema management

## Integration Points

### RoleplayEngine Component
Automatically saves responses after each turn:
```typescript
await fetch('/api/responses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: analytics.getUserId(),
    scenarioId: scenario.id,
    // ... response data
  }),
});
```

### Roleplay API Route
Uses insights to enhance AI responses:
```typescript
const insights = await db.getAIInsights(
  scenarioInput.scenario_id, 
  scenarioInput.objection_category
);
// Use insights to improve AI evaluation
```

## Analytics Dashboard

The analytics page (`/analytics`) displays:
1. **Training Statistics**: Overall performance metrics
2. **Top Responses**: Most successful responses
3. **Technical Questions**: Common developer questions

## Future Enhancements

1. **Machine Learning**: Use response data to train models
2. **Personalized Recommendations**: Suggest responses based on user history
3. **A/B Testing**: Test different AI prompts using response data
4. **Export Functionality**: Export data for analysis
5. **Real-time Updates**: WebSocket support for live analytics
6. **Advanced Filtering**: More sophisticated query options
7. **Response Clustering**: Group similar responses for insights

## Security Considerations

- All inputs are sanitized before storage
- User IDs are anonymized/hashed
- Rate limiting prevents abuse
- Response size limits prevent DoS
- SQL injection protection (when using SQL database)

## Testing

Database functionality is covered by unit tests:
- Response saving and retrieval
- Top response calculation
- Question management
- AI insights generation

Run tests: `npm test`

