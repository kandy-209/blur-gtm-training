# Debug Agent Deep Dive: Complete System Guide

## Table of Contents
1. [Architecture & Philosophy](#architecture--philosophy)
2. [Hypothesis Generation Strategies](#hypothesis-generation-strategies)
3. [Instrumentation Patterns](#instrumentation-patterns)
4. [Log Analysis Techniques](#log-analysis-techniques)
5. [Multi-Layer Debugging](#multi-layer-debugging)
6. [Real-World Examples](#real-world-examples)
7. [Advanced Scenarios](#advanced-scenarios)
8. [Performance Debugging](#performance-debugging)
9. [State & Race Condition Debugging](#state--race-condition-debugging)
10. [Integration Debugging](#integration-debugging)

---

## Architecture & Philosophy

### Core Principles

**1. Evidence-Based Debugging**
- Never guess from code alone
- Always require runtime data
- Logs are the source of truth

**2. Hypothesis-Driven Investigation**
- Generate 3-5 specific hypotheses
- Test all hypotheses in parallel
- Each hypothesis maps to specific logs

**3. Iterative Refinement**
- If fix fails, generate NEW hypotheses
- Don't just add more logs to same hypothesis
- Explore different subsystems

**4. Verification Required**
- Fixes must be proven with logs
- Before/after comparison mandatory
- User confirmation required before cleanup

### Debug Agent Workflow

```
┌─────────────────┐
│  Bug Reported   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Generate 3-5 Hypotheses     │
│ - Specific, testable        │
│ - Cover different areas     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Instrument Code (3-8 logs)  │
│ - Entry/exit points         │
│ - State changes             │
│ - Branch paths              │
│ - Error conditions          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ User Reproduces Bug         │
│ - Clear steps provided      │
│ - Logs written to file      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Analyze Logs                │
│ - Evaluate each hypothesis  │
│ - CONFIRMED/REJECTED/       │
│   INCONCLUSIVE              │
│ - Cite log lines            │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Fix with 100% Confidence   │
│ - Keep logs active          │
│ - Targeted fix              │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Verify with Logs            │
│ - Before/after comparison   │
│ - Cite specific entries     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Success?                    │
│ Yes → Remove logs           │
│ No  → New hypotheses        │
└─────────────────────────────┘
```

---

## Hypothesis Generation Strategies

### Strategy 1: Layer-by-Layer Analysis

For multi-layer architectures (like your DDD setup):

**Example Bug:** "Discovery call creation fails silently"

**Hypotheses:**
- **A (API Layer):** Request never reaches API route handler
- **B (Validation Layer):** Zod schema validation is rejecting valid data
- **C (Use Case Layer):** Company or Persona lookup failing
- **D (Repository Layer):** Save operation failing silently
- **E (Domain Layer):** Domain entity creation throwing unhandled error

**Instrumentation Points:**
```typescript
// API Route
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:24',message:'API route entry',data:{method:request.method,url:request.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});

// Validation
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:36',message:'Validation result',data:{valid:true,errors:[]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});

// Use Case
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-case.ts:20',message:'Use case execution',data:{companyFound:true,personaFound:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});

// Repository
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'repository.ts:17',message:'Repository save',data:{callId:call.id,success:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
```

### Strategy 2: Data Flow Analysis

Trace data through the system:

**Example Bug:** "Persona generation returns empty data"

**Hypotheses:**
- **A:** Company intelligence is empty/null
- **B:** DeepPersona generator not receiving data
- **C:** DeepPersona generator failing silently
- **D:** Persona data structure invalid
- **E:** Return value not properly constructed

**Instrumentation:**
```typescript
// Input data
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'persona-agent.ts:14',message:'Input intelligence',data:{hasCompany:!!intelligence.company.name,hasFinancial:!!intelligence.financial.revenue},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});

// Generator call
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'persona-agent.ts:15',message:'Calling DeepPersona',data:{settings},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});

// Generator result
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'deeppersona.ts:50',message:'DeepPersona result',data:{hasId:!!persona.id,hasName:!!persona.name,attributeCount:persona.metadata.attributeCount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
```

### Strategy 3: Error Path Analysis

Follow error handling paths:

**Example Bug:** "API returns 500 but no error details"

**Hypotheses:**
- **A:** Error thrown but not caught
- **B:** Error caught but wrong type
- **C:** Error response not properly formatted
- **D:** Error logged but response wrong
- **E:** Multiple errors, last one wins

**Instrumentation:**
```typescript
// Try block entry
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:24',message:'Try block entered',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});

// Catch block entry
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:68',message:'Catch block entered',data:{errorType:error.constructor.name,errorMessage:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});

// Response creation
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:85',message:'Error response',data:{status:500,hasError:!!error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
```

### Strategy 4: State Mutation Analysis

Track state changes:

**Example Bug:** "Conversation history gets corrupted"

**Hypotheses:**
- **A:** State updated before async operation completes
- **B:** Multiple updates race condition
- **C:** State reference shared incorrectly
- **D:** State update logic wrong
- **E:** State reset unexpectedly

**Instrumentation:**
```typescript
// Before state update
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'component.tsx:100',message:'State before update',data:{historyLength:state.conversationHistory.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});

// State update
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'component.tsx:105',message:'State update',data:{newLength:updatedHistory.length,isArray:Array.isArray(updatedHistory)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});

// After state update
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'component.tsx:108',message:'State after update',data:{historyLength:state.conversationHistory.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
```

---

## Instrumentation Patterns

### Pattern 1: Function Entry/Exit

```typescript
async function myFunction(param: string): Promise<Result> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'file.ts:42',message:'Function entry',data:{param},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  const result = await doWork(param);
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'file.ts:50',message:'Function exit',data:{result:result.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  return result;
}
```

### Pattern 2: Before/After Critical Operations

```typescript
// Before operation
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'repo.ts:17',message:'Before save',data:{callId:call.id,mapSize:this.calls.size},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});

this.calls.set(call.id, call);

// After operation
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'repo.ts:19',message:'After save',data:{callId:call.id,mapSize:this.calls.size,found:!!this.calls.get(call.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
```

### Pattern 3: Branch Path Tracking

```typescript
if (condition) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'file.ts:30',message:'If branch taken',data:{condition},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  return pathA();
} else {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'file.ts:35',message:'Else branch taken',data:{condition},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  return pathB();
}
```

### Pattern 4: Error Condition Logging

```typescript
try {
  await riskyOperation();
} catch (error) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'file.ts:45',message:'Error caught',data:{errorType:error.constructor.name,errorMessage:error.message,stack:error.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  throw error;
}
```

### Pattern 5: Async Operation Tracking

```typescript
// Before async
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'file.ts:60',message:'Before async',data:{callId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});

const result = await repository.findById(callId);

// After async
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'file.ts:63',message:'After async',data:{callId,found:!!result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
```

---

## Log Analysis Techniques

### Technique 1: Hypothesis Evaluation Matrix

After reading logs, create a matrix:

| Hypothesis | Log Evidence | Status | Confidence |
|------------|--------------|--------|------------|
| A: API route not reached | No log at route.ts:24 | REJECTED | 100% |
| B: Validation failing | Log shows valid=true | REJECTED | 100% |
| C: Company lookup failing | Log shows companyFound=false | CONFIRMED | 95% |
| D: Repository save failing | No log at repo.ts:17 | INCONCLUSIVE | 50% |

### Technique 2: Timeline Analysis

Order logs by timestamp to see execution flow:

```
00:00.000 - route.ts:24 - API route entry
00:00.050 - route.ts:36 - Validation result (valid=true)
00:00.100 - use-case.ts:20 - Use case execution (companyFound=false)
00:00.150 - route.ts:68 - Catch block entered (Error: Company not found)
```

**Analysis:** Company lookup fails, error caught correctly.

### Technique 3: State Transition Tracking

Track state changes:

```
Before: {historyLength: 2}
Update: {newLength: 3, isArray: true}
After: {historyLength: 3} ✅
```

**Analysis:** State update working correctly.

### Technique 4: Error Propagation Tracking

Follow errors through layers:

```
domain.ts:45 - Error thrown: "Invalid company ID"
use-case.ts:25 - Error caught, rethrown
route.ts:68 - Error caught, formatted response
```

**Analysis:** Error propagates correctly, but format might be wrong.

---

## Multi-Layer Debugging

### Your Architecture Layers

```
┌─────────────────────────────────┐
│   Presentation Layer (API)      │  ← Route handlers
├─────────────────────────────────┤
│   Application Layer (Use Cases) │  ← Business logic
├─────────────────────────────────┤
│   Domain Layer (Entities)        │  ← Core business rules
├─────────────────────────────────┤
│   Infrastructure (Repositories) │  ← Data access
└─────────────────────────────────┘
```

### Example: Debugging Discovery Call Creation

**Bug:** "Discovery call creation returns 500 error"

**Hypotheses by Layer:**

**API Layer (route.ts):**
- A1: Request body parsing fails
- A2: Rate limiting blocking request
- A3: Error handler returning wrong status

**Application Layer (use-case.ts):**
- B1: Company lookup fails
- B2: Persona lookup fails
- B3: DiscoveryCall.create() throws error

**Domain Layer (discovery-call.ts):**
- C1: Invalid CompanyId
- C2: Invalid Persona
- C3: Domain validation failing

**Infrastructure Layer (repository.ts):**
- D1: Save operation failing
- D2: Map operation incorrect
- D3: Return value wrong

**Instrumentation Strategy:**
- Log at each layer boundary
- Track data transformation
- Monitor error propagation

---

## Real-World Examples

### Example 1: Discovery Call Message Not Saving

**Bug Report:** "Messages sent in discovery call disappear after refresh"

**Hypotheses:**
1. **A:** API route not receiving message
2. **B:** Repository save not persisting
3. **C:** In-memory storage (Map) cleared
4. **D:** Response not confirming save
5. **E:** Frontend not updating state correctly

**Instrumentation Points:**
```typescript
// src/app/api/discovery-call/[callId]/message/route.ts
// Line 24: API entry
// Line 36: Validation
// Line 50: Repository findById
// Line 60: addMessage call
// Line 75: Repository save
// Line 85: Response creation

// src/infrastructure/repositories/discovery-call.repository.ts
// Line 13: findById entry
// Line 17: save entry
// Line 18: Map.set operation
```

**Expected Log Flow:**
```
API entry → Validation → Find call → Add message → Save → Response
```

**If logs show:**
- API entry ✅ but no save log → Hypothesis B CONFIRMED
- Save log ✅ but Map size unchanged → Hypothesis C CONFIRMED
- All logs ✅ but frontend shows empty → Hypothesis E CONFIRMED

### Example 2: Persona Generation Returns Empty

**Bug Report:** "Generated persona has no attributes"

**Hypotheses:**
1. **A:** CompanyIntelligence is empty
2. **B:** DeepPersona generator not called
3. **C:** DeepPersona generator returning empty
4. **D:** Persona data structure invalid
5. **E:** Response serialization losing data

**Instrumentation Points:**
```typescript
// src/infrastructure/agents/persona-generation-agent.ts
// Line 14: generate() entry
// Line 15: DeepPersona call
// Line 16: Return value

// src/infrastructure/agents/deeppersona/deeppersona-generator.ts
// Line 50: generatePersona() entry
// Line 55: buildTaxonomyAttributes()
// Line 60: generateStructuredAttributes()
// Line 65: buildPersonaData()
// Line 70: Return value
```

---

## Advanced Scenarios

### Scenario 1: Race Condition Debugging

**Bug:** "Conversation messages appear out of order"

**Hypotheses:**
1. **A:** Multiple async operations racing
2. **B:** State updates not atomic
3. **C:** Timestamp generation wrong
4. **D:** Array insertion order wrong
5. **E:** React state batching issue

**Instrumentation:**
```typescript
// Track async operation IDs
const operationId = Math.random().toString(36);
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'component.tsx:110',message:'Async start',data:{operationId,timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});

const response = await fetch('/api/discovery-call/...');

fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'component.tsx:130',message:'Async complete',data:{operationId,timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
```

**Analysis:** Compare operationId sequences to detect race conditions.

### Scenario 2: Performance Debugging

**Bug:** "Discovery call creation takes 10+ seconds"

**Hypotheses:**
1. **A:** Company lookup slow
2. **B:** Persona lookup slow
3. **C:** DeepPersona generation slow
4. **D:** Repository save slow
5. **E:** Network latency

**Instrumentation:**
```typescript
const startTime = Date.now();
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-case.ts:22',message:'Company lookup start',data:{startTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});

const company = await this.companyRepository.findById(companyId);

const endTime = Date.now();
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-case.ts:24',message:'Company lookup end',data:{endTime,duration:endTime-startTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
```

**Analysis:** Compare durations to find bottleneck.

### Scenario 3: State Corruption Debugging

**Bug:** "Discovery call state becomes inconsistent"

**Hypotheses:**
1. **A:** Multiple state updates racing
2. **B:** State reference shared incorrectly
3. **C:** State mutation instead of replacement
4. **D:** State reset unexpectedly
5. **E:** Async state update timing issue

**Instrumentation:**
```typescript
// Log state before/after each update
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'component.tsx:105',message:'State snapshot',data:{state:JSON.stringify(state),stateId:state.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
```

---

## Performance Debugging

### Identifying Bottlenecks

**Step 1:** Add timing logs at key points
**Step 2:** Calculate durations
**Step 3:** Identify slowest operations
**Step 4:** Drill down into slow operations

### Example: API Route Performance

```typescript
const timings = { start: Date.now() };

// Rate limit check
timings.rateLimitStart = Date.now();
const rateLimitResult = rateLimit(request);
timings.rateLimitDuration = Date.now() - timings.rateLimitStart;

// Validation
timings.validationStart = Date.now();
const validated = CreateDiscoveryCallSchema.parse(body);
timings.validationDuration = Date.now() - timings.validationStart;

// Use case execution
timings.useCaseStart = Date.now();
const discoveryCall = await useCase.execute(...);
timings.useCaseDuration = Date.now() - timings.useCaseStart;

// Log all timings
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:90',message:'Performance metrics',data:timings,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'PERF'})}).catch(()=>{});
```

---

## State & Race Condition Debugging

### Tracking State Mutations

**Key Points to Log:**
1. State before mutation
2. Mutation operation
3. State after mutation
4. Component re-render trigger

### Detecting Race Conditions

**Pattern:**
```typescript
const requestId = `${Date.now()}-${Math.random()}`;
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'component.tsx:110',message:'Request start',data:{requestId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});

// ... async operation ...

fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'component.tsx:130',message:'Request complete',data:{requestId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
```

**Analysis:** If requestIds complete out of order → race condition confirmed.

---

## Integration Debugging

### API Integration Issues

**Common Problems:**
1. External API timeouts
2. Authentication failures
3. Rate limiting
4. Response format changes
5. Network errors

**Instrumentation:**
```typescript
// Before external call
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'agent.ts:50',message:'External API call',data:{url,method:'POST'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'INT'})}).catch(()=>{});

const response = await fetch(externalUrl, options);

// After external call
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'agent.ts:55',message:'External API response',data:{status:response.status,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'INT'})}).catch(()=>{});
```

---

## Best Practices Summary

### DO:
✅ Generate 3-5 specific hypotheses
✅ Log at layer boundaries
✅ Track data transformations
✅ Log before/after critical operations
✅ Use collapsible regions for logs
✅ Clear log file before each run
✅ Keep logs during fixes
✅ Verify with before/after comparison

### DON'T:
❌ Guess fixes without logs
❌ Remove logs before verification
❌ Log secrets/PII
❌ Use artificial delays as fixes
❌ Add logs without hypotheses
❌ Skip verification step

---

## Quick Reference

### Log Format
```json
{
  "location": "file.ts:42",
  "message": "Description",
  "data": { "key": "value" },
  "timestamp": 1733456789000,
  "sessionId": "debug-session",
  "runId": "run1",
  "hypothesisId": "A"
}
```

### Log Endpoint
```
http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092
```

### Log File Path
```
/Users/lemonbear/Desktop/Blurred Lines/.cursor/debug.log
```

### One-Line Log Template
```typescript
fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FILE:LINE',message:'DESC',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'X'})}).catch(()=>{});
```

---

This comprehensive guide covers all aspects of the debug agent system. Use it as a reference when debugging issues in your codebase!

