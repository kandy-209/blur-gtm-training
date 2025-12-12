import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client only if URL and key are provided
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const { email, password, username, fullName, roleAtCursor, jobTitle, department, analyticsEmail } = data;

  // Check if email is from @cursor.com domain (auto-admin)
  const isCursorEmail = email.toLowerCase().endsWith('@cursor.com');

  // Sign up user with admin role in metadata if @cursor.com email
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName,
        role: isCursorEmail ? 'admin' : 'user', // Set admin role for @cursor.com emails
        role_at_cursor: roleAtCursor,
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
        role_at_cursor: roleAtCursor,
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
          role_at_cursor: roleAtCursor,
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
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser() {
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
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  // Build update object with only provided fields
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.username !== undefined) updateData.username = updates.username;
  if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
  if (updates.roleAtCursor !== undefined) updateData.role_at_cursor = updates.roleAtCursor;
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

