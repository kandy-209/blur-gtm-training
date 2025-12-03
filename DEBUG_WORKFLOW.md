# Debug Agent: Step-by-Step Workflow

## Complete Workflow Checklist

### Phase 1: Preparation

- [ ] **Understand the bug**
  - Read bug report carefully
  - Identify affected components
  - Note expected vs actual behavior

- [ ] **Review logging configuration**
  - Server endpoint: `http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092`
  - Log path: `/Users/lemonbear/Desktop/Blurred Lines/.cursor/debug.log`
  - Verify server is running

- [ ] **Map the codebase**
  - Identify relevant files
  - Understand data flow
  - Note layer boundaries

### Phase 2: Hypothesis Generation

- [ ] **Generate 3-5 hypotheses**
  - Be specific and testable
  - Cover different subsystems
  - Consider edge cases

- [ ] **Document hypotheses**
  - Why each hypothesis could be true
  - What evidence would confirm/reject it
  - Which logs map to which hypothesis

### Phase 3: Instrumentation

- [ ] **Add 3-8 logs per hypothesis**
  - Function entry/exit
  - Before/after critical operations
  - Branch paths
  - Error conditions
  - State mutations

- [ ] **Wrap logs in collapsible regions**
  ```typescript
  // #region agent log
  fetch('...', {...}).catch(()=>{});
  // #endregion
  ```

- [ ] **Include required fields**
  - location: "file.ts:LINE"
  - message: "Description"
  - data: { relevant data }
  - timestamp: Date.now()
  - sessionId: "debug-session"
  - runId: "run1"
  - hypothesisId: "A"

### Phase 4: Reproduction

- [ ] **Clear log file**
  - Use delete_file tool
  - Don't use shell commands

- [ ] **Provide reproduction steps**
  - Clear, numbered steps
  - Include in <reproduction_steps> block
  - Note if services need restart

- [ ] **Wait for user confirmation**
  - User clicks button in UI
  - Don't ask for "done" message

### Phase 5: Analysis

- [ ] **Read log file**
  - Use read_file tool
  - Parse NDJSON format

- [ ] **Create analysis matrix**

| Hypothesis | Log Evidence | Status | Confidence |
|------------|--------------|--------|------------|
| A | Line X shows... | CONFIRMED | 95% |
| B | No log at Y | REJECTED | 100% |
| C | Line Z unclear | INCONCLUSIVE | 50% |

- [ ] **Cite specific log lines**
  - Quote exact log entries
  - Reference line numbers
  - Note timestamps

### Phase 6: Fix

- [ ] **Fix with 100% confidence**
  - Only fix if logs confirm root cause
  - Keep instrumentation active
  - Make targeted, minimal changes

- [ ] **Tag verification logs**
  - Use runId="post-fix"
  - Distinguish from initial run

### Phase 7: Verification

- [ ] **Clear log file again**
- [ ] **User reproduces (should work now)**
- [ ] **Read post-fix logs**
- [ ] **Compare before/after**
  - Cite specific log entries
  - Show improvement
  - Prove fix worked

### Phase 8: Cleanup

- [ ] **User confirms success**
- [ ] **Remove all instrumentation**
- [ ] **Provide commit message**
  - 1-2 lines
  - Describe problem and fix

---

## Common Mistakes to Avoid

❌ **Fixing without logs**
- Don't guess fixes
- Always require runtime evidence

❌ **Removing logs too early**
- Keep logs during fixes
- Only remove after verified success

❌ **Vague hypotheses**
- "Something is wrong" → Too vague
- "Company lookup returns null" → Specific ✅

❌ **Not clearing log file**
- Old logs mix with new
- Always clear before run

❌ **Skipping verification**
- Fixes can fail
- Always verify with logs

---

## Success Criteria

✅ **Hypothesis confirmed with logs**
✅ **Fix implemented**
✅ **Post-fix logs prove success**
✅ **User confirms no more issues**
✅ **Instrumentation removed**
✅ **Commit message provided**

---

Follow this workflow for every bug, and you'll debug systematically with evidence!

