/**
 * Social Sharing Utilities
 * Provides functions for sharing content on social media platforms
 */

export interface ShareData {
  title: string;
  text: string;
  url: string;
  hashtags?: string[];
}

/**
 * Generate Twitter share URL
 */
export function getTwitterShareUrl(data: ShareData): string {
  const params = new URLSearchParams({
    text: data.text,
    url: data.url,
  });
  
  if (data.hashtags && data.hashtags.length > 0) {
    params.append('hashtags', data.hashtags.join(','));
  }
  
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Generate LinkedIn share URL
 */
export function getLinkedInShareUrl(data: ShareData): string {
  const params = new URLSearchParams({
    url: data.url,
    title: data.title,
    summary: data.text,
  });
  
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

/**
 * Generate Facebook share URL
 */
export function getFacebookShareUrl(data: ShareData): string {
  const params = new URLSearchParams({
    u: data.url,
    quote: data.text,
  });
  
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

/**
 * Share using Web Share API (native sharing)
 */
export async function shareNative(data: ShareData): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      });
    } catch (error) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed:', error);
    }
  } else {
    // Fallback to copying URL
    await copyToClipboard(data.url);
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }
}

/**
 * Generate email share URL
 */
export function getEmailShareUrl(data: ShareData): string {
  const subject = encodeURIComponent(data.title);
  const body = encodeURIComponent(`${data.text}\n\n${data.url}`);
  return `mailto:?subject=${subject}&body=${body}`;
}

/**
 * Generate WhatsApp share URL
 */
export function getWhatsAppShareUrl(data: ShareData): string {
  const text = encodeURIComponent(`${data.text} ${data.url}`);
  return `https://wa.me/?text=${text}`;
}

