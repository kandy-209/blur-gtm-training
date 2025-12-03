import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sanitizeInput } from '@/lib/security';

// Use service_role key for server-side operations (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      console.error('Supabase not configured. Missing NEXT_PUBLIC_SUPABASE_URL or API key.');
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { sessionId, raterUserId, ratedUserId, rating, feedback, category } = body;

    if (!sessionId || !raterUserId || !ratedUserId || !rating || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const validCategories = ['communication', 'product_knowledge', 'objection_handling', 'closing', 'overall'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('user_ratings')
      .insert({
        session_id: sanitizeInput(sessionId, 100),
        rater_user_id: sanitizeInput(raterUserId, 100),
        rated_user_id: sanitizeInput(ratedUserId, 100),
        rating,
        feedback: feedback ? sanitizeInput(feedback, 1000) : null,
        category,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, rating: data });
  } catch (error: any) {
    console.error('Rating creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create rating' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      console.error('Supabase not configured. Missing NEXT_PUBLIC_SUPABASE_URL or API key.');
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    let query = supabase.from('user_ratings').select('*');

    if (userId) {
      query = query.eq('rated_user_id', userId);
    }

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ratings: data || [] });
  } catch (error: any) {
    console.error('Rating fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}

