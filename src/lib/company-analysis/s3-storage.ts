/**
 * S3 Storage for company analysis results
 * Stores analysis data for caching and historical tracking
 * 
 * This module uses lazy initialization to prevent startup crashes
 * if S3 credentials are not configured. S3 features will gracefully
 * degrade when credentials are missing or invalid.
 */

import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// ⚠️ SECURITY: Never hardcode credentials! Always use environment variables.
const S3_ENDPOINT = process.env.S3_ENDPOINT;
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
const S3_BUCKET = process.env.S3_BUCKET;
const S3_REGION = process.env.S3_REGION || 'us-east-1';

// Check if S3 credentials are configured (without throwing)
const isS3Configured = Boolean(
  S3_ENDPOINT && 
  S3_ACCESS_KEY_ID && 
  S3_SECRET_ACCESS_KEY && 
  S3_BUCKET &&
  S3_ENDPOINT.trim() !== '' &&
  S3_ACCESS_KEY_ID.trim() !== '' &&
  S3_SECRET_ACCESS_KEY.trim() !== '' &&
  S3_BUCKET.trim() !== ''
);

// Lazy initialization - only create client when actually needed
let s3Client: S3Client | null = null;
let s3ClientInitialized = false;
let s3ClientError: Error | null = null;

/**
 * Get or initialize the S3 client lazily
 * Returns null if S3 is not configured or initialization fails
 */
function getS3Client(): S3Client | null {
  // Return cached client if already initialized successfully
  if (s3ClientInitialized) {
    return s3Client;
  }

  // Mark as initialized to prevent retry loops
  s3ClientInitialized = true;

  // Check if credentials are configured
  if (!isS3Configured) {
    // Only log warning once, not on every function call
    if (!s3ClientError) {
      console.warn('S3 credentials not configured. S3 storage features will be disabled.');
    }
    return null;
  }

  // Try to initialize the client
  try {
    s3Client = new S3Client({
      endpoint: S3_ENDPOINT!,
      region: S3_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID!,
        secretAccessKey: S3_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true, // Required for custom endpoints
    });
    return s3Client;
  } catch (error) {
    // Store error to prevent repeated initialization attempts
    s3ClientError = error instanceof Error ? error : new Error(String(error));
    console.error('Failed to initialize S3 client:', s3ClientError.message);
    console.warn('S3 storage features will be disabled.');
    return null;
  }
}

/**
 * Store company analysis result in S3
 */
export async function storeAnalysis(
  ticker: string,
  analysis: any,
  metadata?: { companyName?: string; analysisDate?: string }
): Promise<string | null> {
  const client = getS3Client();
  if (!client) {
    return null; // Gracefully skip if S3 not configured
  }
  
  try {
    const key = `company-analysis/${ticker.toUpperCase()}/${Date.now()}.json`;
    const data = JSON.stringify({
      ...analysis,
      metadata: {
        ...metadata,
        storedAt: new Date().toISOString(),
        version: '1.0',
      },
    }, null, 2);

    const upload = new Upload({
      client,
      params: {
        Bucket: S3_BUCKET!,
        Key: key,
        Body: data,
        ContentType: 'application/json',
        CacheControl: 'max-age=3600', // Cache for 1 hour
      },
    });

    await upload.done();
    return key;
  } catch (error) {
    console.error('Error storing analysis in S3:', error);
    return null;
  }
}

/**
 * Retrieve latest company analysis from S3
 */
export async function getLatestAnalysis(ticker: string): Promise<any | null> {
  const client = getS3Client();
  if (!client) {
    return null; // Gracefully skip if S3 not configured
  }
  
  try {
    // Try to get the most recent analysis
    // In production, you'd list objects and get the latest
    // For now, we'll try a common pattern
    const key = `company-analysis/${ticker.toUpperCase()}/latest.json`;

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET!,
      Key: key,
    });

    const response = await client.send(command);
    const body = await response.Body?.transformToString();
    
    if (!body) {
      return null;
    }

    return JSON.parse(body);
  } catch (error) {
    // File doesn't exist or other error - return null
    return null;
  }
}

/**
 * Check if analysis exists and is fresh (within cache TTL)
 */
export async function isAnalysisCached(ticker: string, ttlHours: number = 24): Promise<boolean> {
  const client = getS3Client();
  if (!client) {
    return false; // Gracefully skip if S3 not configured
  }
  
  try {
    const key = `company-analysis/${ticker.toUpperCase()}/latest.json`;
    
    const command = new HeadObjectCommand({
      Bucket: S3_BUCKET!,
      Key: key,
    });

    const response = await client.send(command);
    
    if (!response.LastModified) {
      return false;
    }

    const ageHours = (Date.now() - response.LastModified.getTime()) / (1000 * 60 * 60);
    return ageHours < ttlHours;
  } catch (error) {
    return false;
  }
}

/**
 * Store raw 10-K filing text for later processing
 */
export async function storeFiling(
  ticker: string,
  filingText: string,
  filingType: string = '10-K'
): Promise<string | null> {
  const client = getS3Client();
  if (!client) {
    return null; // Gracefully skip if S3 not configured
  }
  
  try {
    const key = `filings/${ticker.toUpperCase()}/${filingType}/${Date.now()}.txt`;
    
    const upload = new Upload({
      client,
      params: {
        Bucket: S3_BUCKET!,
        Key: key,
        Body: filingText,
        ContentType: 'text/plain',
      },
    });

    await upload.done();
    return key;
  } catch (error) {
    console.error('Error storing filing in S3:', error);
    return null;
  }
}

















