import { NextRequest, NextResponse } from 'next/server'
import { FunnelStep } from '@/lib/conversion-tracking'
import { getSupabaseClient } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const funnelData: FunnelStep = await request.json()

    // Validate required fields
    if (!funnelData.step || !funnelData.userId) {
      return NextResponse.json(
        { error: 'Missing required fields: step, userId' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // Store funnel step in database
    const { error } = await supabase.from('funnel_steps').insert({
      step: funnelData.step,
      user_id: funnelData.userId,
      metadata: funnelData.metadata || {},
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Database error:', error)
      // Don't fail the request if database insert fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Funnel tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track funnel step' },
      { status: 500 }
    )
  }
}

