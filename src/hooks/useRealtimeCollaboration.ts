'use client';

import { useEffect, useState, useCallback } from 'react';
import { RealtimeCollaboration, CollaborationMessage } from '@/lib/realtime-collaboration';

export function useRealtimeCollaboration(
  serverUrl: string,
  component: string,
  enabled: boolean = true
) {
  const [collaboration] = useState(() => new RealtimeCollaboration(serverUrl));
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);

  useEffect(() => {
    if (!enabled) return;

    setIsConnected(collaboration.isConnected());

    const unsubscribe = collaboration.subscribe(component, (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Check connection status periodically
    const interval = setInterval(() => {
      setIsConnected(collaboration.isConnected());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [collaboration, component, enabled]);

  const sendMessage = useCallback(
    (type: CollaborationMessage['type'], data: unknown) => {
      collaboration.send({
        type,
        component,
        data,
        userId: 'current-user', // Should come from auth
      });
    },
    [collaboration, component]
  );

  return {
    isConnected,
    messages,
    sendMessage,
    collaboration,
  };
}

