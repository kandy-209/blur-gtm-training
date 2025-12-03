'use client';

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: (e: KeyboardEvent) => void;
  preventDefault?: boolean;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      for (const shortcut of shortcuts) {
        const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl === undefined || e.ctrlKey === shortcut.ctrl;
        const shiftMatches = shortcut.shift === undefined || e.shiftKey === shortcut.shift;
        const altMatches = shortcut.alt === undefined || e.altKey === shortcut.alt;
        const metaMatches = shortcut.meta === undefined || e.metaKey === shortcut.meta;

        if (
          keyMatches &&
          ctrlMatches &&
          shiftMatches &&
          altMatches &&
          metaMatches
        ) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault();
          }
          shortcut.handler(e);
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

// Predefined shortcuts for common actions
export const commonShortcuts = {
  search: {
    key: 'k',
    ctrl: true,
    description: 'Open search',
  },
  new: {
    key: 'n',
    ctrl: true,
    description: 'Create new',
  },
  save: {
    key: 's',
    ctrl: true,
    description: 'Save',
  },
  close: {
    key: 'Escape',
    description: 'Close',
  },
  submit: {
    key: 'Enter',
    ctrl: true,
    description: 'Submit',
  },
} as const;
