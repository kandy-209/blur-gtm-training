import { NextRequest, NextResponse } from 'next/server'
import { scenarios } from '@/data/scenarios'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    if (!query.trim()) {
      return NextResponse.json({ results: [], total: 0 })
    }

    const searchTerm = query.toLowerCase().trim()
    
    // Search scenarios by persona name, objection category, objection statement, and key points
    const results = scenarios
      .map((scenario) => {
        const personaName = scenario.persona.name.toLowerCase()
        const objectionCategory = scenario.objection_category.toLowerCase()
        const objectionStatement = scenario.objection_statement.toLowerCase()
        const keyPoints = scenario.keyPoints.join(' ').toLowerCase()
        const currentSolution = scenario.persona.currentSolution.toLowerCase()
        const primaryGoal = scenario.persona.primaryGoal.toLowerCase()

        // Calculate relevance score
        let score = 0
        if (personaName.includes(searchTerm)) score += 10
        if (objectionCategory.includes(searchTerm)) score += 8
        if (objectionStatement.includes(searchTerm)) score += 6
        if (keyPoints.includes(searchTerm)) score += 4
        if (currentSolution.includes(searchTerm)) score += 3
        if (primaryGoal.includes(searchTerm)) score += 2

        return {
          scenario,
          score,
        }
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => ({
        id: item.scenario.id,
        type: 'scenario',
        title: item.scenario.persona.name,
        description: item.scenario.objection_statement.substring(0, 150),
        url: `/roleplay/${item.scenario.id}`,
        category: item.scenario.objection_category,
        score: item.score,
      }))

    return NextResponse.json({
      results,
      total: results.length,
      query: searchTerm,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed', results: [], total: 0 },
      { status: 500 }
    )
  }
}

