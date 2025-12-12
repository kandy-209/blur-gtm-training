# How to Get Vapi Phone Number ID

## Step-by-Step Guide

### Step 1: Log into Vapi Dashboard
1. Go to: https://dashboard.vapi.ai
2. Log in with your account

### Step 2: Navigate to Phone Numbers
1. In the left sidebar, click on **"Phone Numbers"** or **"Numbers"**
2. Or go to: https://dashboard.vapi.ai/phone-numbers

### Step 3: Get or Create a Phone Number

**If you already have a phone number:**
- You'll see a list of phone numbers
- Click on the phone number you want to use
- Copy the **ID** (it's usually shown at the top or in the details)

**If you need to create/get a phone number:**
1. Click **"Add Phone Number"** or **"Get Number"**
2. Select your country/region
3. Choose a phone number
4. Complete the purchase/setup (may be free depending on your plan)
5. Once created, copy the **ID** of the phone number

### Step 4: The ID Format
The phoneNumberId usually looks like:
- A UUID: `123e4567-e89b-12d3-a456-426614174000`
- Or a shorter ID: `phone_abc123xyz`

### Step 5: Add to Your Project

Once you have the ID, I can help you add it to:
- `.env.local` (for local testing)
- Vercel (for production)

Just share the phoneNumberId with me and I'll add it!

## Alternative: Check Vapi API

You can also list your phone numbers via API:
```bash
curl https://api.vapi.ai/phone-number \
  -H "Authorization: Bearer YOUR_VAPI_API_KEY"
```

This will show all your phone numbers with their IDs.
