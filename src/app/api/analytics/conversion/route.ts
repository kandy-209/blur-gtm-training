import { NextRequest, NextResponse } from 'next/server'
import { ConversionEvent } from '@/lib/conversion-tracking'
import { getSupabaseClient } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const event: ConversionEvent = await request.json()

    // Validate required fields
    if (!event.eventType || !event.userId) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, userId' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // Store conversion event in database
    const { error } = await supabase.from('conversion_events').insert({
      event_type: event.eventType,
      scenario_id: event.scenarioId || null,
      user_id: event.userId,
      metadata: event.metadata || {},
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Database error:', error)
      // Don't fail the request if database insert fails
      // Analytics should be resilient
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Conversion tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track conversion' },
      { status: 500 }
    )
  }
}

