// Lazy import pattern to prevent HMR issues with Next.js/Turbopack
// Module-level imports can cause "module factory is not available" errors during hot reloads
// By using lazy imports, we only load Supabase when actually needed, not at module evaluation time

// Type definition - actual type will be resolved from dynamic import
type SupabaseClient = any;

// Lazy initialization to prevent HMR issues with Next.js/Turbopack
// Module-level singletons can cause "module factory is not available" errors during hot reloads
let supabaseClient: SupabaseClient | null = null;
let createClientFn: any = null;

/**
 * Get Supabase client instance (lazy initialization)
 * This prevents HMR issues by creating the client only when needed
 * Uses dynamic import pattern that works for both server and client
 */
async function getSupabaseClientAsync(): Promise<SupabaseClient | null> {
  // Return cached client if already created
  if (supabaseClient) {
    return supabaseClient;
  }

  // Lazy import Supabase to avoid HMR issues
  // This prevents the module from being evaluated at import time
  if (!createClientFn) {
    try {
      // Use dynamic import for both server and client (works everywhere)
      const supabaseModule = await import('@supabase/supabase-js');
      createClientFn = supabaseModule.createClient;
    } catch (error) {
      console.error('Failed to import Supabase:', error);
      return null;
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Create client only if URL and key are provided
  if (supabaseUrl && supabaseAnonKey) {
    try {
      supabaseClient = createClientFn(supabaseUrl, supabaseAnonKey);
      return supabaseClient;
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      return null;
    }
  }

  return null;
}

/**
 * Synchronous version for server-side use
 * For client-side, this returns null - components should use getSupabaseClientAsync()
 * This prevents HMR issues by avoiding any require() calls at module evaluation time
 * NOTE: This function will only work if createClientFn is already initialized via async version
 */
function getSupabaseClient(): SupabaseClient | null {
  // Return cached client if already created
  if (supabaseClient) {
    return supabaseClient;
  }

  // On server-side, try to use cached createClientFn if available
  // But don't call require() here - it causes HMR issues
  // Server-side code should use getSupabaseClientAsync() instead
  if (typeof window === 'undefined' && createClientFn) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (supabaseUrl && supabaseAnonKey) {
      try {
        supabaseClient = createClientFn(supabaseUrl, supabaseAnonKey);
        return supabaseClient;
      } catch (error) {
        console.error('Failed to create Supabase client:', error);
      }
    }
  }

  // Client-side or if createClientFn not available: return null
  // Components should use getSupabaseClientAsync() instead
  return null;
}

// Export getter function for backward compatibility
// This prevents HMR issues by avoiding module-level instantiation
// All functions below use getSupabaseClient() internally for lazy initialization
// NOTE: On client-side, this will return null - use getSupabaseAsync() instead
export function getSupabase(): SupabaseClient | null {
  // On client-side, always return null to prevent HMR issues
  // Client components should use getSupabaseAsync() instead
  if (typeof window !== 'undefined') {
    return null;
  }
  return getSupabaseClient();
}

// Export async version for client-side components that can handle async
// This is the preferred method for client-side code
export async function getSupabaseAsync(): Promise<SupabaseClient | null> {
  return getSupabaseClientAsync();
}

// For backward compatibility, export a getter function
// This completely prevents any module evaluation at import time
// NOTE: This export is deprecated - use getSupabase() or getSupabaseAsync() instead
// Using a function getter to avoid any Proxy/Object.defineProperty evaluation
export function getSupabaseConstant(): SupabaseClient | null {
  // Always return null on client-side to prevent HMR issues
  if (typeof window !== 'undefined') {
    return null;
  }
  // On server-side, get client
  return getSupabaseClient();
}

// Export as null for backward compatibility
// This prevents any evaluation at module load time
// Components should use getSupabaseAsync() for client-side
// NOTE: This will be null on client-side - use getSupabaseAsync() instead
// WARNING: Do not use this directly - it's always null. Use getSupabaseAsync() instead.
// Export as a constant to ensure it's always defined (even if null)
export const supabase: SupabaseClient | null = null;

export interface SignUpData {
  email: string; // Required for Supabase Auth (may be generated)
  password: string;
  username: string;
  fullName?: string;
  roleAtCursor: string;
  jobTitle: string;
  department?: string;
  analyticsEmail?: string | null; // Optional real email for analytics/insights
}

export interface SignInData {
  email: string;
  password: string;
}

export async function signUp(data: SignUpData) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const { email, password, username, fullName, roleAtBlur, roleAtCursor, jobTitle, department, analyticsEmail } = data;
  const roleAtCompany = roleAtBlur || roleAtCursor || 'Sales Rep'; // Support both, default to Sales Rep

  // Check if email is from @blur.com domain (auto-admin)
  const isBlurEmail = email.toLowerCase().endsWith('@blur.com');

  // Sign up user with admin role in metadata if @blur.com email
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName,
        role: isBlurEmail ? 'admin' : 'user', // Set admin role for @blur.com emails
        role_at_cursor: roleAtCompany,
        role_at_blur: roleAtCompany,
        job_title: jobTitle,
        department: department || null,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error('Failed to create user');
  }

  // Profile creation is now handled by database trigger (handle_new_user)
  // But we'll still try to create it manually with retry logic for robustness
  let profileCreated = false;
  let attempts = 0;
  const maxAttempts = 3;

  while (!profileCreated && attempts < maxAttempts) {
    attempts++;
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: email || null, // Can be null if using generated email
        analytics_email: analyticsEmail || null, // Optional real email for analytics
        username,
        full_name: fullName || null,
        role_at_cursor: roleAtCompany,
        role_at_blur: roleAtCompany,
        job_title: jobTitle,
        department: department || null,
        onboarding_completed: false,
        last_active_at: new Date().toISOString(),
      });

    if (!profileError) {
      profileCreated = true;
    } else if (profileError.code === '23505') {
      // Profile already exists (likely created by trigger)
      profileCreated = true;
      console.log('Profile already exists (likely created by trigger)');
    } else if (attempts < maxAttempts) {
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    } else {
      // Final attempt failed - log but don't fail signup
      console.warn('Profile creation failed after retries, but user signup succeeded:', profileError.message);
      console.warn('Profile will be created by database trigger or can be created manually');
    }
  }

  // Create default preferences (with retry)
  attempts = 0;
  while (attempts < maxAttempts) {
    attempts++;
    const { error: prefsError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: authData.user.id,
      });

    if (!prefsError || prefsError.code === '23505') {
      break; // Success or already exists
    } else if (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }

  // Create default stats (with retry)
  attempts = 0;
  while (attempts < maxAttempts) {
    attempts++;
    const { error: statsError } = await supabase
      .from('user_stats')
      .insert({
        user_id: authData.user.id,
      });

    if (!statsError || statsError.code === '23505') {
      break; // Success or already exists
    } else if (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }

  // Log signup activity
  try {
    await supabase
      .from('user_activity')
      .insert({
        user_id: authData.user.id,
        activity_type: 'signup',
        activity_data: {
          email,
          username,
          role_at_cursor: roleAtCompany,
        role_at_blur: roleAtCompany,
          job_title: jobTitle,
        },
      });
  } catch (error) {
    // Non-blocking - activity logging failure shouldn't break signup
    console.warn('Failed to log signup activity:', error);
  }

  return authData;
}

export async function signIn(data: SignInData) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const { email, password } = data;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return authData;
}

export async function signOut() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error(error.message);
  }
  return user;
}

export async function getUserProfile(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<{
  username: string;
  fullName: string;
  roleAtCursor: string;
  jobTitle: string;
  department: string;
  bio: string;
  avatarUrl: string;
  onboardingCompleted?: boolean;
  onboardingData?: Record<string, any>;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  timezone?: string;
  locale?: string;
  metadata?: Record<string, any>;
}>) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  // Build update object with only provided fields
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.username !== undefined) updateData.username = updates.username;
  if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
  if (updates.roleAtBlur !== undefined) {
    updateData.role_at_blur = updates.roleAtBlur;
    updateData.role_at_cursor = updates.roleAtBlur; // Keep both for compatibility
  }
  if (updates.roleAtCursor !== undefined) {
    updateData.role_at_cursor = updates.roleAtCursor;
    updateData.role_at_blur = updates.roleAtCursor; // Sync to new field
  }
  if (updates.jobTitle !== undefined) updateData.job_title = updates.jobTitle;
  if (updates.department !== undefined) updateData.department = updates.department;
  if (updates.bio !== undefined) updateData.bio = updates.bio;
  if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
  if (updates.onboardingCompleted !== undefined) updateData.onboarding_completed = updates.onboardingCompleted;
  if (updates.onboardingData !== undefined) updateData.onboarding_data = updates.onboardingData;
  if (updates.skillLevel !== undefined) updateData.skill_level = updates.skillLevel;
  if (updates.timezone !== undefined) updateData.timezone = updates.timezone;
  if (updates.locale !== undefined) updateData.locale = updates.locale;
  if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Log profile update activity
  try {
    await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        activity_type: 'profile_update',
        activity_data: {
          updated_fields: Object.keys(updates),
        },
      });
  } catch (activityError) {
    // Non-blocking - activity logging failure shouldn't break profile update
    console.warn('Failed to log profile update activity:', activityError);
  }

  return data;
}

