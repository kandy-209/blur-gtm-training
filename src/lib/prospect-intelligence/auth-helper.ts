/**
 * Authentication helper for Prospect Intelligence API routes
 * Gets the current user ID from Supabase auth session
 */

import { getSupabaseClient } from '@/lib/supabase-client';

/**
 * Get the current authenticated user ID from the request
 * Returns null if user is not authenticated
 * 
 * In API routes, we need to get the auth token from the request headers
 * and use it to get the user from Supabase
 */
export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // If Supabase not configured, allow anonymous access
      return null;
    }

    // Get auth token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    if (token) {
      // Verify token and get user
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user?.id) {
        return user.id;
      }
    }

    // Try to get user from session (if using cookies)
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user?.id) {
        return user.id;
      }
    } catch (sessionError) {
      // Session not available - that's okay, user is anonymous
    }

    // Fallback: Check for user ID in headers (for development/testing only)
    // In production, this should always come from auth
    if (process.env.NODE_ENV === 'development') {
      const headerUserId = request.headers.get('x-user-id');
      if (headerUserId) {
        console.warn('⚠️ Using x-user-id header for authentication (development only)');
        return headerUserId;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting user ID from request:', error);
    return null;
  }
}

/**
 * Require authentication - throws error if user is not authenticated
 */
export async function requireAuth(request: Request): Promise<string> {
  const userId = await getUserIdFromRequest(request);
  
  if (!userId) {
    throw new Error('Authentication required. Please sign in to use this feature.');
  }

  return userId;
}
