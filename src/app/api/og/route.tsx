import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Browserbase GTM Training'
    const description = searchParams.get('description') || 'Master Browserbase sales positioning with AI-powered role-play training'
    const scenario = searchParams.get('scenario') || ''
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            backgroundImage: 'linear-gradient(to bottom, #1a1a1a, #0a0a0a)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', padding: '80px', maxWidth: '1200px' }}>
            <h1
              style={{
                fontSize: 72,
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: 24,
                lineHeight: 1.2,
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: 32,
                color: '#a0a0a0',
                lineHeight: 1.4,
                marginBottom: scenario ? 40 : 0,
              }}
            >
              {description}
            </p>
            {scenario && (
              <div
                style={{
                  marginTop: 40,
                  padding: 16,
                  backgroundColor: '#1a1a1a',
                  borderRadius: 8,
                  border: '1px solid #333',
                }}
              >
                <p style={{ fontSize: 24, color: '#60a5fa', margin: 0 }}>
                  Scenario: {scenario}
                </p>
              </div>
            )}
            <div
              style={{
                marginTop: 60,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  color: '#60a5fa',
                  fontWeight: 600,
                }}
              >
                browserbase.com
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('OG image generation error:', error)
    // Return a simple fallback image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            color: '#ffffff',
            fontSize: 48,
          }}
        >
          Browserbase GTM Training
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }
}

