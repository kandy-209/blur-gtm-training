# 🚀 SaaS Conversion Guide

## Can This Be Turned Into a SaaS Application?

**Yes, absolutely!** This application has a solid foundation that can be converted to a multi-tenant SaaS platform. Here's a comprehensive guide on what's needed.

---

## 📊 Current Architecture Analysis

### ✅ What You Already Have:
- **User Authentication** (Supabase Auth)
- **User Profiles** (Supabase `user_profiles` table)
- **Role-Based Access** (admin/user roles)
- **Analytics Tracking** (training events)
- **Real-time Features** (live role-play sessions)
- **Scenario Management** (scenario builder)

### ❌ What's Missing for SaaS:
- **Multi-Tenancy** (organization/company isolation)
- **Billing/Subscriptions** (Stripe/Paddle integration)
- **Usage Limits** (per organization)
- **Organization Management** (admin dashboards)
- **White-Labeling** (custom branding per org)
- **API Access** (for integrations)

---

## 🏗️ Required Changes

### 1. Database Schema Changes

#### Add Organizations Table
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255),
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  max_users INTEGER DEFAULT 5,
  max_scenarios INTEGER DEFAULT 10,
  features JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Add Organization Membership Table
```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- owner, admin, member
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);
```

#### Update Existing Tables
```sql
-- Add organization_id to user_profiles
ALTER TABLE user_profiles ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Add organization_id to scenarios (if stored in DB)
ALTER TABLE scenarios ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Add organization_id to analytics/events
ALTER TABLE training_events ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Add organization_id to responses
ALTER TABLE responses ADD COLUMN organization_id UUID REFERENCES organizations(id);
```

### 2. Row Level Security (RLS) Policies

```sql
-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Scenarios: Users can only see scenarios from their organization
CREATE POLICY "Users can view own org scenarios"
  ON scenarios FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );
```

### 3. Subscription Tiers

```typescript
interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: {
    maxUsers: number;
    maxScenarios: number;
    aiCredits: number;
    analyticsRetention: number; // days
    customBranding: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
  };
}

const TIERS = {
  free: {
    maxUsers: 5,
    maxScenarios: 10,
    aiCredits: 100,
    analyticsRetention: 30,
  },
  starter: {
    maxUsers: 25,
    maxScenarios: 50,
    aiCredits: 1000,
    analyticsRetention: 90,
    price: 99,
  },
  professional: {
    maxUsers: 100,
    maxScenarios: 200,
    aiCredits: 10000,
    analyticsRetention: 365,
    customBranding: true,
    price: 299,
  },
  enterprise: {
    maxUsers: -1, // unlimited
    maxScenarios: -1,
    aiCredits: -1,
    analyticsRetention: -1,
    customBranding: true,
    apiAccess: true,
    prioritySupport: true,
    price: 999,
  },
};
```

---

## 💳 Billing Integration

### Option 1: Stripe (Recommended)

```typescript
// Install: npm install stripe @stripe/stripe-js

// Create subscription
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function createSubscription(organizationId: string, tierId: string) {
  const org = await getOrganization(organizationId);
  const tier = TIERS[tierId];
  
  const customer = await stripe.customers.create({
    email: org.ownerEmail,
    metadata: { organizationId },
  });
  
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: tier.stripePriceId }],
    metadata: { organizationId, tierId },
  });
  
  // Update organization
  await updateOrganization(organizationId, {
    stripe_customer_id: customer.id,
    stripe_subscription_id: subscription.id,
    subscription_tier: tierId,
  });
}
```

### Option 2: Paddle

Similar structure but uses Paddle's subscription API.

---

## 🔐 Multi-Tenancy Implementation

### Middleware for Organization Context

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Extract organization from subdomain or path
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  
  // Or from path: /org/:orgSlug/...
  const path = request.nextUrl.pathname;
  const orgSlug = path.split('/')[1];
  
  // Set organization context
  const response = NextResponse.next();
  response.headers.set('x-organization-id', orgSlug);
  
  return response;
}
```

### Organization Context Hook

```typescript
// src/hooks/useOrganization.ts
export function useOrganization() {
  const { user } = useAuth();
  const [org, setOrg] = useState<Organization | null>(null);
  
  useEffect(() => {
    if (user) {
      // Get user's organization
      fetchOrganization(user.id).then(setOrg);
    }
  }, [user]);
  
  return org;
}
```

### Data Isolation in API Routes

```typescript
// src/app/api/roleplay/route.ts
export async function POST(request: NextRequest) {
  const orgId = request.headers.get('x-organization-id');
  
  // Verify user belongs to organization
  const isMember = await checkOrganizationMembership(userId, orgId);
  if (!isMember) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  // All queries filtered by organization
  const scenarios = await getScenarios(orgId);
  // ...
}
```

---

## 📈 Usage Tracking & Limits

```typescript
// src/lib/usage.ts
export async function checkUsageLimit(
  organizationId: string,
  resource: 'users' | 'scenarios' | 'aiCredits'
) {
  const org = await getOrganization(organizationId);
  const tier = TIERS[org.subscription_tier];
  const limit = tier.features[resource];
  
  if (limit === -1) return true; // Unlimited
  
  const current = await getCurrentUsage(organizationId, resource);
  return current < limit;
}

export async function trackUsage(
  organizationId: string,
  resource: 'users' | 'scenarios' | 'aiCredits',
  amount: number = 1
) {
  await incrementUsage(organizationId, resource, amount);
  
  // Check if limit exceeded
  const withinLimit = await checkUsageLimit(organizationId, resource);
  if (!withinLimit) {
    // Notify admin, block action, etc.
    throw new Error(`${resource} limit exceeded`);
  }
}
```

---

## 🎨 White-Labeling (Optional)

```typescript
// src/lib/branding.ts
export async function getOrganizationBranding(organizationId: string) {
  const org = await getOrganization(organizationId);
  
  return {
    logo: org.settings.logo || '/default-logo.svg',
    primaryColor: org.settings.primaryColor || '#000000',
    companyName: org.name,
    customDomain: org.domain,
  };
}
```

---

## 📊 Organization Admin Dashboard

### New Pages Needed:

1. **`/org/[slug]/settings`** - Organization settings
2. **`/org/[slug]/members`** - Team member management
3. **`/org/[slug]/billing`** - Subscription & billing
4. **`/org/[slug]/usage`** - Usage statistics
5. **`/org/[slug]/analytics`** - Organization-wide analytics

---

## 🚀 Migration Strategy

### Phase 1: Foundation (Week 1-2)
- [ ] Add organizations table
- [ ] Add organization_members table
- [ ] Update existing tables with organization_id
- [ ] Implement RLS policies
- [ ] Create organization context middleware

### Phase 2: Multi-Tenancy (Week 3-4)
- [ ] Update all API routes for org isolation
- [ ] Update all queries to filter by organization
- [ ] Implement organization switching/selection
- [ ] Add organization admin pages

### Phase 3: Billing (Week 5-6)
- [ ] Integrate Stripe/Paddle
- [ ] Create subscription management
- [ ] Implement usage limits
- [ ] Add billing dashboard

### Phase 4: Polish (Week 7-8)
- [ ] White-labeling (if needed)
- [ ] API access (if needed)
- [ ] Advanced analytics
- [ ] Documentation

---

## 💰 Pricing Strategy

### Suggested Tiers:

| Tier | Price | Users | Scenarios | AI Credits | Features |
|------|-------|-------|-----------|------------|----------|
| **Free** | $0 | 5 | 10 | 100/month | Basic training |
| **Starter** | $99/mo | 25 | 50 | 1,000/month | Advanced analytics |
| **Professional** | $299/mo | 100 | 200 | 10,000/month | Custom branding |
| **Enterprise** | Custom | Unlimited | Unlimited | Unlimited | API, SSO, Support |

---

## 🔧 Technical Stack Additions

### Required Packages:
```json
{
  "stripe": "^14.0.0",
  "@stripe/stripe-js": "^2.0.0",
  "zod": "^3.22.0", // For validation
  "react-hook-form": "^7.48.0", // For forms
  "@tanstack/react-query": "^5.0.0" // For data fetching
}
```

### Environment Variables:
```env
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_APP_URL=https://app.yoursaas.com
```

---

## 📝 Key Considerations

### 1. **Data Migration**
- Existing users need to be assigned to a default organization
- Historical data needs organization_id backfilled
- Consider creating a "Cursor" organization for existing data

### 2. **Performance**
- Add database indexes on organization_id
- Consider caching organization data
- Optimize queries with proper RLS

### 3. **Security**
- Strict RLS policies
- Organization membership verification
- API rate limiting per organization
- Audit logging

### 4. **Scalability**
- Consider separate databases per tier (enterprise)
- CDN for static assets
- Queue system for AI processing
- Background jobs for analytics

---

## ✅ Benefits of SaaS Conversion

1. **Revenue Stream**: Recurring subscription revenue
2. **Scalability**: Serve multiple organizations
3. **Market Expansion**: Beyond Cursor to other companies
4. **Feature Gating**: Premium features for paid tiers
5. **Analytics**: Organization-level insights
6. **Support**: Tiered support levels

---

## 🎯 Next Steps

1. **Validate Market**: Research if other companies need this
2. **MVP Planning**: Start with free + one paid tier
3. **Prototype**: Build organization management first
4. **Beta Test**: Get 5-10 organizations to test
5. **Launch**: Public launch with marketing

---

**This is definitely feasible! The architecture is already well-structured for SaaS conversion.** 🚀

Would you like me to start implementing any of these features?



