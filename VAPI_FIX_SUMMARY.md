# Vapi API Fix Summary

## ✅ Fixed: Phone Number Format Error

### Problem
Vapi API was returning error: `"Couldn't Get Phone Number. Need Either phoneNumberId Or phoneNumber"`

### Root Cause
The request body was using the **old format** with nested `customer.number`:
```json
{
  "assistantId": "...",
  "customer": {
    "number": "+15551234567"  // ❌ Wrong - nested format
  }
}
```

### Solution
Changed to **top-level `phoneNumber`** field as required by Vapi:
```json
{
  "assistantId": "...",
  "phoneNumber": "+15551234567",  // ✅ Correct - top level
  "metadata": {
    "userId": "...",
    "scenarioId": "..."
  }
}
```

## 📝 Changes Made

### 1. Request Body Structure (`src/app/api/vapi/sales-call/route.ts`)
- **Line 280-283**: Changed from `customer.number` to top-level `phoneNumber`
- Removed nested `customer` object
- Added proper E.164 format validation

### 2. Phone Number Formatting
- Handles multiple input formats:
  - `(555) 123-4567` → `+15551234567`
  - `5551234567` → `+15551234567`
  - `15551234567` → `+15551234567`
  - `+15551234567` → `+15551234567` (already correct)
- Validates E.164 format (10-15 digits after +)
- Better error messages

### 3. Enhanced Logging
- Logs phone number format validation
- Shows request body structure
- Better error debugging

## 🧪 Testing

### Test Cases Created
- ✅ Phone number formatting edge cases
- ✅ Invalid phone number rejection
- ✅ Request body structure validation
- ✅ Error handling

### How to Test
1. Go to `/sales-training`
2. Select a scenario
3. Enter phone number in any format: `(555) 123-4567` or `+1 (555) 123-4567`
4. Click "Start Training Call"
5. Check server console for detailed logs

## 📊 Expected Request Body
```json
{
  "assistantId": "assistant-abc123",
  "phoneNumber": "+15551234567",
  "metadata": {
    "userId": "user123",
    "scenarioId": "SKEPTIC_VPE_001",
    "trainingMode": "practice",
    "type": "sales-training"
  }
}
```

## ✅ Status
- ✅ Request structure fixed
- ✅ Phone formatting improved
- ✅ Edge case tests added
- ✅ Ready for testing

