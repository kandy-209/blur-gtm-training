/**
 * Sentiment Analysis for Sales Training
 * Analyzes rep responses for quality, tone, and effectiveness
 */

interface SentimentResult {
  score: number; // -1 to 1 (negative to positive)
  magnitude: number; // 0 to 1 (strength of sentiment)
  label: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0 to 1
  entities?: Array<{
    name: string;
    type: string;
    salience: number;
  }>;
  categories?: Array<{
    name: string;
    confidence: number;
  }>;
}

interface ResponseQuality {
  overallScore: number; // 0 to 100
  sentiment: SentimentResult;
  professionalism: number; // 0 to 100
  clarity: number; // 0 to 100
  persuasiveness: number; // 0 to 100
  empathy: number; // 0 to 100
  feedback: string[];
  suggestions: string[];
}

/**
 * Analyze sentiment using Google Cloud Natural Language API
 * Requires GOOGLE_CLOUD_API_KEY environment variable
 */
export async function analyzeSentimentGoogle(
  text: string,
  apiKey?: string
): Promise<SentimentResult | null> {
  const key = apiKey || process.env.GOOGLE_CLOUD_API_KEY;
  if (!key) {
    return null;
  }

  try {
    const response = await fetch(
      `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: {
            type: 'PLAIN_TEXT',
            content: text,
          },
          encodingType: 'UTF8',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      score: data.documentSentiment?.score || 0,
      magnitude: data.documentSentiment?.magnitude || 0,
      label: data.documentSentiment?.score > 0.1 ? 'positive' : data.documentSentiment?.score < -0.1 ? 'negative' : 'neutral',
      confidence: Math.abs(data.documentSentiment?.score || 0),
      entities: data.entities?.map((e: any) => ({
        name: e.name,
        type: e.type,
        salience: e.salience,
      })),
      categories: data.categories?.map((c: any) => ({
        name: c.name,
        confidence: c.confidence,
      })),
    };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return null;
  }
}

/**
 * Analyze response quality using LLM
 * Uses Claude/OpenAI to provide detailed feedback
 */
export async function analyzeResponseQuality(
  repResponse: string,
  context: {
    personaName?: string;
    objectionCategory?: string;
    conversationHistory?: Array<{ role: string; message: string }>;
  }
): Promise<ResponseQuality> {
  try {
    const response = await fetch('/api/llm/analyze-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repResponse,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze response');
    }

    return await response.json();
  } catch (error) {
    // Fallback to basic analysis
    return analyzeResponseQualityBasic(repResponse);
  }
}

/**
 * Basic response quality analysis (fallback)
 */
function analyzeResponseQualityBasic(text: string): ResponseQuality {
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = words.length;

  // Check for professional language
  const professionalWords = ['understand', 'appreciate', 'excellent', 'solution', 'value', 'help'];
  const unprofessionalWords = ['um', 'uh', 'like', 'you know', 'basically'];
  const professionalScore = Math.min(
    100,
    (professionalWords.filter((w) => text.toLowerCase().includes(w)).length / wordCount) * 200
  );
  const unprofessionalPenalty = unprofessionalWords.filter((w) => text.toLowerCase().includes(w)).length * 10;

  // Clarity score (based on sentence length and structure)
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
  const clarityScore = Math.max(0, 100 - Math.abs(avgSentenceLength - 15) * 2);

  // Sentiment (basic)
  const positiveWords = ['great', 'excellent', 'perfect', 'amazing', 'wonderful', 'help', 'solve'];
  const negativeWords = ['problem', 'issue', 'concern', 'worry', 'difficult'];
  const positiveCount = positiveWords.filter((w) => text.toLowerCase().includes(w)).length;
  const negativeCount = negativeWords.filter((w) => text.toLowerCase().includes(w)).length;
  const sentimentScore = (positiveCount - negativeCount) / Math.max(1, wordCount / 10);

  const overallScore = Math.round(
    (professionalScore - unprofessionalPenalty + clarityScore + (sentimentScore + 1) * 50) / 3
  );

  const feedback: string[] = [];
  const suggestions: string[] = [];

  if (wordCount < 20) {
    feedback.push('Response is quite brief');
    suggestions.push('Consider adding more context or details');
  }
  if (unprofessionalPenalty > 0) {
    feedback.push('Contains filler words');
    suggestions.push('Practice speaking more confidently without filler words');
  }
  if (clarityScore < 70) {
    feedback.push('Could be clearer');
    suggestions.push('Break down complex ideas into simpler sentences');
  }

  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    sentiment: {
      score: sentimentScore,
      magnitude: Math.abs(sentimentScore),
      label: sentimentScore > 0.1 ? 'positive' : sentimentScore < -0.1 ? 'negative' : 'neutral',
      confidence: Math.abs(sentimentScore),
    },
    professionalism: Math.max(0, Math.min(100, professionalScore - unprofessionalPenalty)),
    clarity: Math.max(0, Math.min(100, clarityScore)),
    persuasiveness: Math.max(0, Math.min(100, overallScore)),
    empathy: Math.max(0, Math.min(100, overallScore)),
    feedback,
    suggestions,
  };
}

