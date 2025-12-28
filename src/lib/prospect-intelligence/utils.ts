/**
 * Utility functions for prospect intelligence research
 * Includes retry logic, observation helpers, and error handling
 */

import type { Stagehand } from "@browserbasehq/stagehand";

/**
 * Retries an async operation with exponential backoff
 * @param operation The async function to retry
 * @param retries Max number of retries (default: 3)
 * @param delay Initial delay in ms (default: 1000)
 * @param operationName Name of operation for logging
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000,
  operationName = 'Operation'
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) {
      console.error(`❌ ${operationName} failed after all retries:`, error);
      throw error;
    }
    
    console.log(`⚠️ ${operationName} failed. Retrying in ${delay}ms... (${retries} retries left)`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    
    return withRetry(operation, retries - 1, delay * 2, operationName);
  }
}

/**
 * Check for and handle common page blockers (cookie banners, popups, etc.)
 */
export async function handlePageBlockers(stagehand: Stagehand, modelName?: string): Promise<void> {
  try {
    const page = stagehand.page;
    
    // Wait a bit for dynamic content to load
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Check for cookie banners, popups, or blockers
    const pageContent = await page.content();
    const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
    
    // Common patterns for cookie banners and popups
    const blockerPatterns = [
      'cookie',
      'accept',
      'decline',
      'privacy',
      'gdpr',
      'consent',
      'close',
      'dismiss',
      'got it',
      'i agree',
    ];
    
    const hasBlocker = blockerPatterns.some(pattern => 
      pageText.includes(pattern) || pageContent.toLowerCase().includes(pattern)
    );
    
    if (hasBlocker) {
      console.log('🍪 Detected potential cookie banner or popup. Attempting to close...');
      
      try {
        // Debug logging disabled by default to avoid CSP violations
        // Enable with ENABLE_DEBUG_TELEMETRY=true in .env.local
        // Use Stagehand's act() method for AI-powered interaction
        // This is more resilient than direct DOM manipulation
        // Explicitly pass modelName to ensure Claude is used (not default gpt-4o)
        // Get model from parameter, stagehand instance, or fallback
        const stagehandModel = modelName || (page as any)?.stagehand?.modelName || (stagehand as any)?.modelName || "claude-3-haiku-20240307";
        console.log(`🔍 Using model: ${stagehandModel} for act()`);
        const actOpts: any = {
          action: "Click the 'Accept', 'Agree', 'Close', or 'Dismiss' button if there's a cookie banner, popup, or consent dialog visible on the page",
          modelName: stagehandModel as any,
        };
        // Also pass modelClientOptions if available from stagehand instance
        const stagehandClientOpts = (stagehand as any)?.modelClientOptions || (stagehand as any)?.stagehand?.modelClientOptions;
        if (stagehandClientOpts) {
          actOpts.modelClientOptions = stagehandClientOpts;
          console.log(`🔍 Added modelClientOptions to act() call`);
        }
        await page.act(actOpts);
        // Debug logging disabled by default
        
        // Wait for banner to disappear
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('✅ Cookie banner/popup handled using Stagehand act()');
      } catch (error) {
        console.warn('⚠️ Could not automatically close popup, continuing anyway:', error);
      }
    }
  } catch (error) {
    console.warn('⚠️ Error checking for page blockers:', error);
    // Don't throw - continue anyway
  }
}

/**
 * Wait for page to fully load, checking for loading states
 */
export async function waitForPageReady(stagehand: Stagehand, maxWait = 10000): Promise<boolean> {
  const page = stagehand.page;
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    try {
      const isLoading = await page.evaluate(() => {
        // Check for common loading indicators
        const loaders = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="loader"]');
        const hasLoader = loaders.length > 0 && Array.from(loaders).some((el: any) => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });
        
        // Check if document is still loading
        const docLoading = document.readyState !== 'complete';
        
        // Check for common loading text
        const bodyText = document.body.innerText.toLowerCase();
        const hasLoadingText = bodyText.includes('loading') || bodyText.includes('please wait');
        
        return hasLoader || docLoading || hasLoadingText;
      });
      
      if (!isLoading) {
        return true;
      }
      
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      // If evaluation fails, assume page is ready
      return true;
    }
  }
  
  console.warn('⏳ Page may still be loading after timeout');
  return false;
}

/**
 * Safe navigation with blocker handling and loading detection
 */
/**
 * Safe navigation with error handling for common network errors
 */
export async function safeNavigateWithObservation(
  stagehand: Stagehand,
  url: string,
  maxRetries = 3,
  modelName?: string
): Promise<boolean> {
  return withRetry(async () => {
    try {
      await stagehand.page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      
      // Handle specific network errors
      if (errorMessage.includes('ERR_HTTP2_PROTOCOL_ERROR') || 
          errorMessage.includes('net::ERR_HTTP2_PROTOCOL_ERROR')) {
        console.warn(`⚠️ HTTP/2 protocol error for ${url}. Trying with different wait strategy...`);
        
        // Retry with 'domcontentloaded' instead of 'networkidle' (less strict)
        try {
          await stagehand.page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
          });
        } catch (retryError: any) {
          // If still failing, try 'load' (even less strict)
          console.warn(`⚠️ Retry with domcontentloaded failed. Trying 'load' strategy...`);
          await stagehand.page.goto(url, {
            waitUntil: 'load',
            timeout: 30000,
          });
        }
      } else if (errorMessage.includes('timeout') || errorMessage.includes('Navigation timeout')) {
        console.warn(`⚠️ Navigation timeout for ${url}. Trying with shorter timeout...`);
        // Retry with shorter timeout and less strict wait condition
        await stagehand.page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 15000,
        });
      } else if (errorMessage.includes('net::ERR_') || errorMessage.includes('ERR_')) {
        // Other network errors - provide helpful message
        throw new Error(
          `Network error accessing ${url}: ${errorMessage}. ` +
          `This may be due to bot protection, network issues, or the site blocking automated browsers.`
        );
      } else {
        // Re-throw other errors
        throw error;
      }
    }
    
    // Wait for page to be ready
    await waitForPageReady(stagehand);
    
    // Handle blockers
    await handlePageBlockers(stagehand, modelName);
    
    // Final wait for any dynamic content
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    return true;
  }, maxRetries, 2000, `Navigation to ${url}`);
}

