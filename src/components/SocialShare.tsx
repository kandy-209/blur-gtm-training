'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Twitter,
  Linkedin,
  Facebook,
  Link2,
  Check,
  Share2,
} from 'lucide-react';

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  scenarioId?: string;
  scenarioName?: string;
}

export default function SocialShare({
  url,
  title,
  description,
  scenarioId,
  scenarioName,
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = title || 'Browserbase GTM Training';
  const shareDescription = description || 'Master Browserbase sales positioning with AI-powered role-play training';
  const shareText = scenarioName 
    ? `Just completed "${scenarioName}" on Browserbase GTM Training! ${shareDescription}`
    : `${shareTitle} - ${shareDescription}`;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}&via=browserbase`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
  };

  const handleShare = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    const shareUrl = shareLinks[platform];
    window.open(shareUrl, '_blank', 'width=600,height=400');
    
    // Track share event
    if (typeof window !== 'undefined' && window.analytics?.track) {
      window.analytics.track('social_share', {
        platform,
        url: currentUrl,
        scenarioId,
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Track copy event
      if (typeof window !== 'undefined' && window.analytics?.track) {
        window.analytics.track('link_copied', {
          url: currentUrl,
          scenarioId,
        });
      }
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: currentUrl,
        });
        
        // Track native share
        if (typeof window !== 'undefined' && window.analytics?.track) {
          window.analytics.track('native_share', {
            url: currentUrl,
            scenarioId,
          });
        }
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    } else {
      // Fallback to copy if native share not available
      handleCopyLink();
    }
  };

  return (
    <div className="relative">
      {isOpen ? (
        <div className="flex items-center gap-2 p-2 bg-white border rounded-lg shadow-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('twitter')}
            className="flex items-center gap-2"
            title="Share on Twitter"
          >
            <Twitter className="h-4 w-4" />
            <span className="hidden sm:inline">Twitter</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('linkedin')}
            className="flex items-center gap-2"
            title="Share on LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
            <span className="hidden sm:inline">LinkedIn</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('facebook')}
            className="flex items-center gap-2"
            title="Share on Facebook"
          >
            <Facebook className="h-4 w-4" />
            <span className="hidden sm:inline">Facebook</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="flex items-center gap-2"
            title="Copy link"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="ml-2"
          >
            ×
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={navigator.share ? handleNativeShare : () => setIsOpen(true)}
          className="flex items-center gap-2"
          title="Share"
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      )}
    </div>
  );
}

