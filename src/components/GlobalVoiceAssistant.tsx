'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, HelpCircle, Minimize2, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function GlobalVoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  // Get agent ID from environment or use default
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'agent_9101kb9t1120fjb84wgcem44dey2';

  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]');
    if (existingScript) {
      setIsLoaded(true);
      return;
    }

    // Check if custom element is already defined
    if (customElements.get('elevenlabs-convai')) {
      setIsLoaded(true);
      return;
    }

    // Load the ElevenLabs Conversational AI widget script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    
    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      console.error('Failed to load ElevenLabs widget script');
    };

    document.body.appendChild(script);

    return () => {
      // Don't remove script on unmount to avoid re-registration issues
    };
  }, []);

  useEffect(() => {
    if (isLoaded && isOpen && widgetRef.current) {
      // The widget should auto-initialize when the script loads and the element is present
    }
  }, [isLoaded, isOpen]);

  // Get context-aware title based on current page
  const getPageContext = () => {
    if (pathname?.startsWith('/roleplay/')) {
      return 'AI Voice Role-Play Assistant';
    }
    if (pathname === '/scenarios') {
      return 'AI Training Assistant';
    }
    if (pathname === '/analytics') {
      return 'AI Analytics Assistant';
    }
    if (pathname === '/leaderboard') {
      return 'AI Training Assistant';
    }
    if (pathname === '/live') {
      return 'AI Voice Role-Play Assistant';
    }
    if (pathname === '/features') {
      return 'AI Features Learning Assistant';
    }
    if (pathname === '/enterprise') {
      return 'AI Enterprise Assistant';
    }
    if (pathname === '/chat') {
      return 'AI Training Assistant';
    }
    return 'AI Cursor Training Assistant';
  };

  const getPageDescription = () => {
    if (pathname?.startsWith('/roleplay/')) {
      return 'Powerful AI for voice role-play practice & training questions';
    }
    if (pathname === '/scenarios') {
      return 'AI-powered training: role-play scenarios & ask questions';
    }
    if (pathname === '/analytics') {
      return 'AI assistant: understand analytics & answer training questions';
    }
    if (pathname === '/leaderboard') {
      return 'AI training assistant: role-play practice & Q&A';
    }
    if (pathname === '/live') {
      return 'Powerful AI for live voice role-play & training support';
    }
    if (pathname === '/features') {
      return 'AI-powered learning: understand features & practice role-play';
    }
    if (pathname === '/enterprise') {
      return 'AI assistant: Enterprise training, role-play & Q&A';
    }
    if (pathname === '/chat') {
      return 'Powerful AI assistant: role-play practice & training questions';
    }
    return 'Powerful AI assistant for Cursor training: role-play practice & ask questions';
  };

  return (
    <>
      {/* Floating Chat Widget */}
      {isOpen && (
        <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] transition-all duration-300 ${
          isMinimized 
            ? 'w-[calc(100vw-2rem)] sm:w-80 h-16' 
            : 'w-[calc(100vw-2rem)] sm:w-96 h-[calc(100vh-8rem)] sm:h-[600px] max-h-[600px]'
        }`}>
          <Card className="w-full h-full flex flex-col shadow-2xl border-gray-200 flex-shrink-0">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-200 flex-shrink-0 px-3 sm:px-6">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <CardTitle className="text-xs sm:text-sm font-semibold truncate">{getPageContext()}</CardTitle>
                    <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium bg-purple-100 text-purple-700 rounded flex-shrink-0">
                      AI
                    </span>
                  </div>
                  {!isMinimized && (
                    <CardDescription className="text-[10px] sm:text-xs text-gray-600 mt-0.5 line-clamp-1">
                      {getPageDescription()}
                    </CardDescription>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-gray-100 flex-shrink-0"
                  aria-label={isMinimized ? "Expand" : "Minimize"}
                >
                  <Minimize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(false);
                  }}
                  className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-gray-100 flex-shrink-0"
                  aria-label="Close Voice Assistant"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </CardHeader>
            {!isMinimized && (
              <CardContent className="flex-1 overflow-hidden p-0 flex-shrink">
                <div
                  ref={widgetRef}
                  className="w-full h-full"
                  style={{ minHeight: '500px' }}
                >
                  {/* @ts-ignore - Custom web component */}
                  <elevenlabs-convai agent-id={agentId}></elevenlabs-convai>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Floating Button to Open Widget */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <div className="flex flex-col items-end gap-2">
            {/* Badge above button */}
            <div className="bg-white rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-md border border-gray-200 flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-600 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-medium text-gray-800 whitespace-nowrap">Ask AI</span>
            </div>
            {/* Main Button */}
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="rounded-2xl shadow-lg h-12 w-12 sm:h-14 sm:w-14 bg-gray-900 hover:bg-gray-800 text-white border-0 transition-all hover:scale-105 hover:shadow-xl active:scale-95 flex items-center justify-center p-0 group"
              title="AI Training Assistant - Role-play practice & ask questions"
              aria-label="Open AI Training Assistant"
            >
              {/* Cursor Logo */}
              <img
                src="/logos/cursor-logo.svg"
                alt="Cursor Logo"
                className="h-6 w-6 sm:h-7 sm:w-7 object-contain transition-transform group-hover:scale-110 max-w-full max-h-full"
                width={28}
                height={28}
                loading="eager"
                decoding="async"
                style={{ display: 'block' }}
                onError={(e) => {
                  console.error('Failed to load Cursor logo');
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

