/**
 * News and Sentiment Analysis APIs
 * Free APIs for company news and sentiment
 */

import { cachedRouteHandler } from './next-cache-wrapper';
import { retryWithBackoff } from './error-recovery';
import { log } from './logger';

const NEWS_API_KEY = process.env.NEWS_API_KEY; // Free tier: https://newsapi.org
const ALPHA_VANTAGE_NEWS_API_KEY = process.env.ALPHA_VANTAGE_API_KEY; // Can use same key

export interface NewsArticle {
  title: string;
  description?: string;
  url: string;
  publishedAt: string;
  source: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentimentScore?: number;
}

export interface CompanyNews {
  symbol?: string;
  companyName: string;
  articles: NewsArticle[];
  sentimentSummary: {
    positive: number;
    negative: number;
    neutral: number;
    averageScore: number;
  };
}

/**
 * Get company news from NewsAPI (free tier: 100 requests/day)
 */
export async function getCompanyNewsFromNewsAPI(
  companyName: string,
  symbol?: string
): Promise<CompanyNews | null> {
  if (!NEWS_API_KEY) {
    log.warn('NewsAPI key not configured');
    return null;
  }

  const query = symbol ? `${companyName} OR ${symbol}` : companyName;

  const cachedResult = await cachedRouteHandler(
    `news-api:${companyName}:${symbol || ''}`,
    async () => {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=20&apiKey=${NEWS_API_KEY}`;
      
      const apiResult = await retryWithBackoff(
        async () => {
          const response = await fetch(url);
          
          if (response.status === 429) {
            throw new Error('Rate limit exceeded');
          }
          
          if (!response.ok) {
            throw new Error(`NewsAPI error: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.status !== 'ok') {
            throw new Error(data.message || 'NewsAPI error');
          }

          const articles: NewsArticle[] = (data.articles || []).map((article: any) => ({
            title: article.title,
            description: article.description,
            url: article.url,
            publishedAt: article.publishedAt,
            source: article.source?.name || 'Unknown',
          }));

          // Simple sentiment analysis (can be enhanced with AI)
          const sentimentSummary = analyzeSentiment(articles);

          return {
            symbol,
            companyName,
            articles,
            sentimentSummary,
          };
        },
        {
          maxRetries: 2,
          retryDelay: 1000,
        }
      );

      if (!apiResult.success || !apiResult.data) {
        return null;
      }

      return apiResult.data;
    },
    {
      revalidate: 3600, // 1 hour
      tags: [`news-${companyName}`, 'news-api'],
      useRedis: true,
    }
  );

  return cachedResult.data;
}

/**
 * Simple sentiment analysis (can be enhanced with AI)
 */
function analyzeSentiment(articles: NewsArticle[]): CompanyNews['sentimentSummary'] {
  let positive = 0;
  let negative = 0;
  let neutral = 0;
  let totalScore = 0;

  const positiveWords = ['growth', 'profit', 'success', 'gain', 'up', 'rise', 'increase', 'strong', 'beat', 'exceed'];
  const negativeWords = ['loss', 'decline', 'down', 'fall', 'drop', 'weak', 'miss', 'fail', 'layoff', 'cut'];

  articles.forEach(article => {
    const text = `${article.title} ${article.description || ''}`.toLowerCase();
    
    let score = 0;
    positiveWords.forEach(word => {
      if (text.includes(word)) score += 1;
    });
    negativeWords.forEach(word => {
      if (text.includes(word)) score -= 1;
    });

    if (score > 0) {
      positive++;
      article.sentiment = 'positive';
    } else if (score < 0) {
      negative++;
      article.sentiment = 'negative';
    } else {
      neutral++;
      article.sentiment = 'neutral';
    }

    article.sentimentScore = Math.max(-1, Math.min(1, score / 10));
    totalScore += article.sentimentScore || 0;
  });

  return {
    positive,
    negative,
    neutral,
    averageScore: articles.length > 0 ? totalScore / articles.length : 0,
  };
}

