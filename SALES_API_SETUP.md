# Sales Training AI API Setup Guide

This guide explains how to set up the various APIs and services that enhance the sales training AI system.

## Required Environment Variables

Add these to your `.env.local` file:

### 1. Clearbit API (Company & Contact Enrichment)
```bash
CLEARBIT_API_KEY=your_clearbit_api_key
```

**Setup:**
1. Sign up at https://clearbit.com
2. Navigate to API Keys section
3. Copy your API key
4. Free tier: 50 API calls/month

**Features:**
- Company data enrichment (revenue, employees, industry)
- Contact discovery
- Domain-based company lookup

---

### 2. Hunter.io API (Email Verification & Finding)
```bash
HUNTER_API_KEY=your_hunter_api_key
```

**Setup:**
1. Sign up at https://hunter.io
2. Go to Settings > API
3. Copy your API key
4. Free tier: 25 searches/month, 50 verifications/month

**Features:**
- Email verification
- Email finding by name + domain
- Domain-based email search

---

### 3. Google Cloud Natural Language API (Sentiment Analysis)
```bash
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
```

**Setup:**
1. Go to https://console.cloud.google.com
2. Enable "Cloud Natural Language API"
3. Create API credentials
4. Free tier: 5,000 units/month

**Features:**
- Sentiment analysis of responses
- Entity extraction
- Content categorization

---

## Optional APIs (Future Enhancements)

### 4. ZoomInfo API
```bash
ZOOMINFO_API_KEY=your_zoominfo_api_key
ZOOMINFO_USERNAME=your_username
ZOOMINFO_PASSWORD=your_password
```

**Setup:**
1. Contact ZoomInfo sales
2. Get API credentials
3. More comprehensive B2B data

---

### 5. Apollo.io API
```bash
APOLLO_API_KEY=your_apollo_api_key
```

**Setup:**
1. Sign up at https://apollo.io
2. Navigate to Settings > API
3. Copy API key
4. Free tier: Limited

---

### 6. LinkedIn Sales Navigator API
```bash
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
```

**Setup:**
1. Apply for LinkedIn Partner Program
2. Create LinkedIn app
3. Request Sales Navigator API access
4. Requires approval

---

### 7. AWS Transcribe (Call Transcription)
```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

**Setup:**
1. Create AWS account
2. Enable Amazon Transcribe service
3. Create IAM user with Transcribe permissions
4. Free tier: 60 minutes/month

---

## Current Features Using APIs

### ✅ Implemented
1. **Company Enrichment** - Clearbit + Alpha Vantage fallback
2. **Email Verification** - Hunter.io
3. **Email Finding** - Hunter.io
4. **Email Template Generation** - AI-powered (fallback to rule-based)
5. **Response Quality Analysis** - Basic sentiment + AI analysis
6. **Prospect Research Tool** - Company + contact discovery

### 🚧 Planned
1. **Call Transcription** - AWS Transcribe
2. **Advanced Sentiment Analysis** - Google Cloud NL
3. **CRM Integration** - Salesforce/HubSpot
4. **LinkedIn Integration** - Profile enrichment
5. **Competitive Intelligence** - Crunchbase/SimilarWeb

## Testing Without API Keys

The system includes fallback mechanisms:
- **Company Enrichment**: Falls back to Alpha Vantage (already configured)
- **Email Templates**: Uses rule-based generation
- **Sentiment Analysis**: Uses basic text analysis
- **Email Verification**: Shows error but doesn't break

## Usage Examples

### Company Enrichment
```typescript
import { enrichCompanyMultiSource } from '@/lib/sales-enhancements/company-enrichment';

const result = await enrichCompanyMultiSource('Acme Corp', 'acme.com');
```

### Email Verification
```typescript
import { verifyEmailHunter } from '@/lib/sales-enhancements/email-verification';

const result = await verifyEmailHunter('john@acme.com');
```

### Email Template Generation
```typescript
import { generateEmailTemplate } from '@/lib/sales-enhancements/email-templates';

const template = await generateEmailTemplate({
  companyName: 'Acme Corp',
  emailType: 'cold-outreach',
  tone: 'professional',
});
```

## API Rate Limits & Costs

| Service | Free Tier | Paid Plans |
|---------|----------|------------|
| Clearbit | 50/month | $99+/month |
| Hunter.io | 25 searches, 50 verifications/month | $49+/month |
| Google Cloud NL | 5,000 units/month | Pay-as-you-go |
| Alpha Vantage | 5 calls/min, 500/day | Free tier sufficient |

## Troubleshooting

### "API key not configured" errors
- Check `.env.local` file exists
- Restart dev server after adding keys
- Verify key format (no quotes, no spaces)

### Rate limit errors
- Check API usage in service dashboard
- Implement caching for repeated requests
- Use fallback mechanisms

### 404/Not Found errors
- Verify company domain is correct
- Check API key permissions
- Some services require paid plans for certain features

## Security Notes

- Never commit API keys to git
- Use environment variables only
- Rotate keys periodically
- Monitor API usage for anomalies
- Use least-privilege access when possible





