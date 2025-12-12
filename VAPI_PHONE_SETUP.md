# Vapi Phone Number Setup

## The Issue

Vapi requires one of two options for making outbound calls:

### Option 1: Use Vapi Phone Number ID (Recommended - Easiest)

Vapi can provide you with a phone number. You just need to get the `phoneNumberId` from your Vapi dashboard.

**Steps:**
1. Go to [Vapi Dashboard](https://dashboard.vapi.ai)
2. Navigate to **Phone Numbers** section
3. Either:
   - Use an existing phone number (copy its ID)
   - Or purchase/configure a new phone number
4. Copy the `phoneNumberId`

**Add to `.env.local`:**
```bash
VAPI_PHONE_NUMBER_ID=your_phone_number_id_here
```

**Add to Vercel:**
- Settings → Environment Variables
- Add `VAPI_PHONE_NUMBER_ID` = your phone number ID
- Redeploy

### Option 2: Use Twilio Integration

If you have a Twilio account, you can use it with Vapi.

**Steps:**
1. Get your Twilio credentials:
   - Account SID
   - Auth Token
2. Add to `.env.local`:
```bash
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
```

**Add to Vercel:**
- Settings → Environment Variables
- Add both `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
- Redeploy

## Current Status

✅ **VAPI_API_KEY** - Configured and working
❌ **Phone Number Configuration** - Missing (need either phoneNumberId or Twilio)

## Quick Check

Test your setup:
```bash
curl http://localhost:3000/api/vapi/test
```

Look for phone number configuration status.

## Which Option Should You Choose?

**Option 1 (phoneNumberId)** is easier if:
- You don't have a Twilio account
- You want Vapi to handle phone numbers
- You're just getting started

**Option 2 (Twilio)** is better if:
- You already have a Twilio account
- You want more control over phone numbers
- You have existing phone numbers you want to use
