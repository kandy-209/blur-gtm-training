import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase-client'

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    // Get conversion events
    const { data: conversions, error: convError } = await supabase
      .from('conversion_events')
      .select('*')
      .in('event_type', ['meeting_booked', 'demo_requested'])

    if (convError) {
      console.error('Error fetching conversions:', convError)
    }

    // Get all scenario completions
    const { data: completions, error: compError } = await supabase
      .from('conversion_events')
      .select('*')
      .eq('event_type', 'scenario_complete')

    if (compError) {
      console.error('Error fetching completions:', compError)
    }

    // Get funnel data
    const { data: funnelSteps, error: funnelError } = await supabase
      .from('funnel_steps')
      .select('*')

    if (funnelError) {
      console.error('Error fetching funnel steps:', funnelError)
    }

    // Calculate metrics
    const totalConversions = conversions?.length || 0
    const totalCompletions = completions?.length || 0
    const conversionRate = totalCompletions > 0
      ? (totalConversions / totalCompletions) * 100
      : 0

    // Calculate average time to conversion
    const conversionTimes = conversions
      ?.map((c) => c.metadata?.timeToComplete || 0)
      .filter((t) => t > 0) || []
    const averageTimeToConversion =
      conversionTimes.length > 0
        ? conversionTimes.reduce((a, b) => a + b, 0) / conversionTimes.length
        : 0

    // Get top scenarios
    const scenarioMap = new Map<string, { conversions: number; completions: number }>()
    conversions?.forEach((c) => {
      if (c.scenario_id) {
        const current = scenarioMap.get(c.scenario_id) || { conversions: 0, completions: 0 }
        scenarioMap.set(c.scenario_id, { ...current, conversions: current.conversions + 1 })
      }
    })
    completions?.forEach((c) => {
      if (c.scenario_id) {
        const current = scenarioMap.get(c.scenario_id) || { conversions: 0, completions: 0 }
        scenarioMap.set(c.scenario_id, { ...current, completions: current.completions + 1 })
      }
    })

    const topScenarios = Array.from(scenarioMap.entries())
      .map(([scenarioId, data]) => ({
        scenarioId,
        scenarioName: scenarioId, // Could be enhanced to fetch actual names
        conversions: data.conversions,
        conversionRate: data.completions > 0
          ? (data.conversions / data.completions) * 100
          : 0,
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 5)

    // Calculate funnel data
    const started = funnelSteps?.filter((s) => s.step === 'scenario_started').length || 0
    const completed = funnelSteps?.filter((s) => s.step === 'scenario_completed').length || 0
    const converted = totalConversions

    return NextResponse.json({
      totalConversions,
      conversionRate,
      averageTimeToConversion,
      topScenarios,
      funnelData: {
        started,
        completed,
        converted,
      },
    })
  } catch (error) {
    console.error('Error calculating conversion metrics:', error)
    return NextResponse.json(
      {
        totalConversions: 0,
        conversionRate: 0,
        averageTimeToConversion: 0,
        topScenarios: [],
        funnelData: {
          started: 0,
          completed: 0,
          converted: 0,
        },
      },
      { status: 200 } // Return empty data instead of error
    )
  }
}

