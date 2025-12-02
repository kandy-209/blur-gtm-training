import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client only if URL and key are provided
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  fullName?: string;
  roleAtCursor: string;
  jobTitle: string;
  department?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export async function signUp(data: SignUpData) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const { email, password, username, fullName, roleAtCursor, jobTitle, department } = data;

  // Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error('Failed to create user');
  }

  // Create user profile
  // Note: Profile creation might fail due to RLS policies, but we'll try anyway
  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      id: authData.user.id,
      email,
      username,
      full_name: fullName,
      role_at_cursor: roleAtCursor,
      job_title: jobTitle,
      department,
    });

  if (profileError) {
    // Log error but don't fail signup - profile can be created later via database trigger or manually
    console.error('Profile creation error (non-blocking):', profileError);
    // Check if it's a duplicate key error (profile might already exist)
    if (profileError.code === '23505') {
      console.log('Profile already exists, continuing...');
    } else {
      // For other errors (like RLS policy violations), log but continue
      // The user can still sign in, and profile can be created later
      console.warn('Profile creation failed but user signup succeeded:', profileError.message);
    }
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
}>) {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      username: updates.username,
      full_name: updates.fullName,
      role_at_cursor: updates.roleAtCursor,
      job_title: updates.jobTitle,
      department: updates.department,
      bio: updates.bio,
      avatar_url: updates.avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

