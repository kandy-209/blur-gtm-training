/**
 * Email Verification and Finding APIs
 * Integrates with Hunter.io for email verification and discovery
 */

interface EmailVerificationResult {
  email: string;
  valid: boolean;
  score?: number;
  sources?: string[];
  first_name?: string;
  last_name?: string;
  position?: string;
  company?: string;
  linkedin?: string;
  twitter?: string;
  error?: string;
}

interface EmailFindResult {
  email?: string;
  score?: number;
  sources?: string[];
  first_name?: string;
  last_name?: string;
  position?: string;
  company?: string;
  linkedin?: string;
  twitter?: string;
  error?: string;
}

/**
 * Verify email address using Hunter.io
 * Requires HUNTER_API_KEY environment variable
 */
export async function verifyEmailHunter(
  email: string,
  apiKey?: string
): Promise<EmailVerificationResult> {
  const key = apiKey || process.env.HUNTER_API_KEY;
  if (!key) {
    return { email, valid: false, error: 'Hunter.io API key not configured' };
  }

  try {
    const response = await fetch(
      `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${key}`
    );

    if (!response.ok) {
      throw new Error(`Hunter.io API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      email: data.data?.email || email,
      valid: data.data?.result === 'deliverable',
      score: data.data?.score,
      sources: data.data?.sources?.map((s: any) => s.domain),
      first_name: data.data?.first_name,
      last_name: data.data?.last_name,
      position: data.data?.position,
      company: data.data?.company,
      linkedin: data.data?.linkedin,
      twitter: data.data?.twitter,
    };
  } catch (error: any) {
    return { email, valid: false, error: error.message || 'Failed to verify email' };
  }
}

/**
 * Find email address using Hunter.io
 */
export async function findEmailHunter(
  firstName: string,
  lastName: string,
  domain: string,
  apiKey?: string
): Promise<EmailFindResult> {
  const key = apiKey || process.env.HUNTER_API_KEY;
  if (!key) {
    return { error: 'Hunter.io API key not configured' };
  }

  try {
    const params = new URLSearchParams({
      first_name: firstName,
      last_name: lastName,
      domain,
      api_key: key,
    });

    const response = await fetch(`https://api.hunter.io/v2/email-finder?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Hunter.io API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.data?.email) {
      return {
        email: data.data.email,
        score: data.data.score,
        sources: data.data.sources?.map((s: any) => s.domain),
        first_name: data.data.first_name,
        last_name: data.data.last_name,
        position: data.data.position,
        company: data.data.company,
        linkedin: data.data.linkedin,
        twitter: data.data.twitter,
      };
    }

    return { error: 'Email not found' };
  } catch (error: any) {
    return { error: error.message || 'Failed to find email' };
  }
}

/**
 * Search for emails by domain using Hunter.io
 */
export async function searchEmailsByDomain(
  domain: string,
  seniority?: string,
  department?: string,
  apiKey?: string
): Promise<EmailFindResult[]> {
  const key = apiKey || process.env.HUNTER_API_KEY;
  if (!key) {
    return [{ error: 'Hunter.io API key not configured' }];
  }

  try {
    const params = new URLSearchParams({
      domain,
      api_key: key,
      limit: '10',
    });

    if (seniority) params.append('seniority', seniority);
    if (department) params.append('department', department);

    const response = await fetch(`https://api.hunter.io/v2/domain-search?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Hunter.io API error: ${response.status}`);
    }

    const data = await response.json();

    return (data.data?.emails || []).map((email: any) => ({
      email: email.value,
      score: email.score,
      sources: email.sources?.map((s: any) => s.domain),
      first_name: email.first_name,
      last_name: email.last_name,
      position: email.position,
      company: email.company,
      linkedin: email.linkedin,
      twitter: email.twitter,
    }));
  } catch (error: any) {
    return [{ error: error.message || 'Failed to search emails' }];
  }
}











