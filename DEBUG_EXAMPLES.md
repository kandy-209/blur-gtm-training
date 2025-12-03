# Debug Agent: Practical Examples from Codebase

## Example 1: Discovery Call Creation Failure

### Bug Report
"POST /api/discovery-call/create returns 500 error"

### Step 1: Generate Hypotheses

**Hypothesis A:** Request body parsing fails
- **Why:** JSON.parse() throws on malformed JSON
- **Test:** Log at route entry, check if body exists

**Hypothesis B:** Zod validation rejects valid data
- **Why:** Schema mismatch between frontend and backend
- **Test:** Log validation result, check error details

**Hypothesis C:** Company lookup fails (not found)
- **Why:** CompanyId doesn't exist in repository
- **Test:** Log company lookup result

**Hypothesis D:** Persona lookup fails (not found)
- **Why:** PersonaId doesn't exist in repository
- **Test:** Log persona lookup result

**Hypothesis E:** Repository save operation fails
- **Why:** Map.set() operation fails silently
- **Test:** Log before/after Map size

### Step 2: Instrument Code

```typescript
// src/app/api/discovery-call/create/route.ts

export async function POST(request: NextRequest) {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:24',message:'API route entry',data:{method:request.method},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Rate limiting
    const rateLimitResult = rateLimit(request);
    if (!rateLimitResult || !rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:35',message:'Before body parse',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Validate input
    const body = await request.json();
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:36',message:'Body parsed',data:{hasBody:!!body,hasCompanyId:!!body.companyId,hasPersonaId:!!body.personaId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    const validated = CreateDiscoveryCallSchema.parse(body);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:37',message:'Validation result',data:{valid:true,companyId:validated.companyId,personaId:validated.personaId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Initialize dependencies
    const companyRepository = new CompanyRepository();
    const personaRepository = new PersonaRepository();
    const discoveryCallRepository = new DiscoveryCallRepository();
    const useCase = new CreateDiscoveryCallUseCase(
      companyRepository,
      personaRepository,
      discoveryCallRepository
    );

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:49',message:'Before use case execution',data:{companyId:validated.companyId,personaId:validated.personaId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    // Execute use case
    const discoveryCall = await useCase.execute({
      companyId: validated.companyId,
      personaId: validated.personaId,
      settings: validated.settings,
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:54',message:'Use case complete',data:{callId:discoveryCall.id,isActive:discoveryCall.isActive},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        id: discoveryCall.id,
        companyId: discoveryCall.companyId.value,
        personaId: discoveryCall.persona.id,
        settings: discoveryCall.settings,
        isActive: discoveryCall.isActive,
        startedAt: discoveryCall.createdAt,
      },
    });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:68',message:'Catch block',data:{errorType:error.constructor.name,errorMessage:error.message,isZodError:error instanceof z.ZodError},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    console.error('Create discovery call error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

```typescript
// src/application/use-cases/create-discovery-call/create-discovery-call.use-case.ts

async execute(command: CreateDiscoveryCallCommand): Promise<DiscoveryCall> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-case.ts:20',message:'Use case entry',data:{companyId:command.companyId,personaId:command.personaId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  // 1. Get company
  const companyId = new CompanyId(command.companyId);
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-case.ts:23',message:'Before company lookup',data:{companyId:companyId.value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  const company = await this.companyRepository.findById(companyId);

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-case.ts:24',message:'Company lookup result',data:{found:!!company,companyId:companyId.value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  if (!company) {
    throw new Error(`Company with id ${command.companyId} not found`);
  }

  // 2. Get persona
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-case.ts:30',message:'Before persona lookup',data:{personaId:command.personaId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion

  const persona = await this.personaRepository.findById(command.personaId);

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-case.ts:31',message:'Persona lookup result',data:{found:!!persona,personaId:command.personaId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion

  if (!persona) {
    throw new Error(`Persona with id ${command.personaId} not found`);
  }

  // 3. Create discovery call
  const discoveryCall = DiscoveryCall.create(
    companyId,
    persona,
    command.settings
  );

  // 4. Save discovery call
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-case.ts:44',message:'Before repository save',data:{callId:discoveryCall.id,mapSize:this.discoveryCallRepository['calls'].size},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion

  await this.discoveryCallRepository.save(discoveryCall);

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-case.ts:46',message:'After repository save',data:{callId:discoveryCall.id,mapSize:this.discoveryCallRepository['calls'].size,found:!!this.discoveryCallRepository['calls'].get(discoveryCall.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion

  return discoveryCall;
}
```

### Step 3: Reproduction Steps

<reproduction_steps>
1. Clear log file: Delete `/Users/lemonbear/Desktop/Blurred Lines/.cursor/debug.log` if it exists
2. Start dev server: `npm run dev` (if not already running)
3. Open browser: Navigate to `http://localhost:3000/code-aware-discovery/new`
4. Analyze a company: Enter a company domain (e.g., "github.com") and click "Analyze"
5. Generate a persona: After company analysis, generate a persona with default settings
6. Create discovery call: Use the generated companyId and personaId to create a discovery call via API or UI
7. Check response: Note if you get a 500 error
8. Confirm completion: Click the debug UI button to confirm reproduction is complete
</reproduction_steps>

### Step 4: Log Analysis

After reproduction, read the log file and analyze:

**Expected Log Flow:**
```
route.ts:24 - API route entry
route.ts:35 - Before body parse
route.ts:36 - Body parsed (hasBody: true)
route.ts:37 - Validation result (valid: true)
use-case.ts:20 - Use case entry
use-case.ts:23 - Before company lookup
use-case.ts:24 - Company lookup result (found: true/false)
use-case.ts:30 - Before persona lookup
use-case.ts:31 - Persona lookup result (found: true/false)
use-case.ts:44 - Before repository save
use-case.ts:46 - After repository save
route.ts:54 - Use case complete
```

**Analysis Matrix:**

| Hypothesis | Log Evidence | Status |
|------------|--------------|--------|
| A: Body parsing fails | Log at route.ts:36 shows hasBody: true | REJECTED |
| B: Validation fails | Log at route.ts:37 shows valid: true | REJECTED |
| C: Company lookup fails | Log at use-case.ts:24 shows found: false | CONFIRMED |
| D: Persona lookup fails | No log at use-case.ts:31 (execution stopped) | INCONCLUSIVE |
| E: Repository save fails | No log at use-case.ts:46 (execution stopped) | INCONCLUSIVE |

**Root Cause:** Company lookup fails, throwing error that stops execution.

### Step 5: Fix

```typescript
// Fix: Ensure company exists before creating call
// Or: Create company if it doesn't exist
// Or: Return better error message
```

### Step 6: Verify

Run reproduction again, compare logs:
- **Before:** Company lookup shows found: false → error thrown
- **After:** Company created first → Company lookup shows found: true → Success

---

## Example 2: Conversation Agent Not Responding Realistically

### Bug Report
"Conversation agent always agrees, doesn't push back on objections"

### Hypotheses

**A:** Objection detection not working
**B:** Pushback level always 0
**C:** Response generation ignoring difficulty
**D:** Personality settings not applied
**E:** Response selection always picks "easy" path

### Instrumentation Points

```typescript
// src/infrastructure/agents/conversation/conversation-agent.ts

// Line 50: detectObjectionTriggers()
// Line 80: getObjectionState()
// Line 95: generateResponseBasedOnPersonality()
// Line 120: generatePushbackResponse()
```

---

## Example 3: Persona Attributes Missing

### Bug Report
"Generated persona has only 5 attributes instead of hundreds"

### Hypotheses

**A:** DeepPersona not being called
**B:** generateStructuredAttributes() returning empty
**C:** Attribute count calculation wrong
**D:** Data structure not properly populated
**E:** Response serialization losing data

### Instrumentation Points

```typescript
// src/infrastructure/agents/persona-generation-agent.ts
// Line 14: generate() entry
// Line 15: DeepPersona call

// src/infrastructure/agents/deeppersona/deeppersona-generator.ts
// Line 50: generatePersona() entry
// Line 60: generateStructuredAttributes()
// Line 65: buildPersonaData()
```

---

## Quick Debug Checklist

- [ ] Generated 3-5 hypotheses
- [ ] Instrumented code with logs (3-8 per hypothesis)
- [ ] Wrapped logs in collapsible regions
- [ ] Cleared log file before run
- [ ] User reproduced bug
- [ ] Read and analyzed logs
- [ ] Evaluated each hypothesis (CONFIRMED/REJECTED/INCONCLUSIVE)
- [ ] Fixed with 100% confidence
- [ ] Verified with before/after logs
- [ ] User confirmed success
- [ ] Removed instrumentation

---

Use these examples as templates for debugging your own issues!

