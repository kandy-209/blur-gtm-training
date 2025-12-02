'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, X } from 'lucide-react';
import { useState } from 'react';

interface ElevenLabsConvAIProps {
  agentId: string;
  scenario?: {
    persona: {
      name: string;
      currentSolution: string;
      primaryGoal: string;
    };
    objection_statement: string;
  };
}

export default function ElevenLabsConvAI({ agentId, scenario }: ElevenLabsConvAIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

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
      // The agent-id attribute triggers the widget initialization
    }
  }, [isLoaded, isOpen]);

  return (
    <>
      {/* Floating Button to Open Widget */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-full shadow-lg h-16 w-16"
          >
            <Volume2 className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Widget Container */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Voice Role-Play</CardTitle>
                {scenario && (
                  <CardDescription>
                    Practicing with: {scenario.persona.name}
                  </CardDescription>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div
                ref={widgetRef}
                className="w-full h-full"
                style={{ minHeight: '500px' }}
              >
                {/* @ts-ignore - Custom web component */}
                <elevenlabs-convai agent-id={agentId}></elevenlabs-convai>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

