'use client';

import { useEffect, useState, useCallback } from 'react';

export interface AccessibilityPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

const defaultPreferences: AccessibilityPreferences = {
  highContrast: false,
  reducedMotion: false,
  fontSize: 'medium',
  screenReader: false,
  keyboardNavigation: true,
  colorBlindMode: 'none',
};

const STORAGE_KEY = 'accessibility_preferences';

export function useAccessibilityPreferences() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    if (typeof window === 'undefined') return defaultPreferences;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultPreferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load accessibility preferences:', error);
    }

    return defaultPreferences;
  });

  const updatePreferences = useCallback((updates: Partial<AccessibilityPreferences>) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, ...updates };
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
      } catch (error) {
        console.error('Failed to save accessibility preferences:', error);
      }

      // Apply preferences to document
      applyPreferences(newPrefs);

      return newPrefs;
    });
  }, []);

  useEffect(() => {
    applyPreferences(preferences);

    // Listen for system preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      updatePreferences({ reducedMotion: e.matches });
    };
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [preferences, updatePreferences]);

  return {
    preferences,
    updatePreferences,
    resetPreferences: () => updatePreferences(defaultPreferences),
  };
}

function applyPreferences(prefs: AccessibilityPreferences): void {
  const root = document.documentElement;

  // High contrast
  root.classList.toggle('high-contrast', prefs.highContrast);

  // Reduced motion
  root.classList.toggle('reduced-motion', prefs.reducedMotion);

  // Font size
  root.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
  root.classList.add(`font-${prefs.fontSize}`);

  // Color blind mode
  root.classList.remove('color-protanopia', 'color-deuteranopia', 'color-tritanopia');
  if (prefs.colorBlindMode !== 'none') {
    root.classList.add(`color-${prefs.colorBlindMode}`);
  }

  // Set CSS variables
  root.style.setProperty('--font-size-multiplier', getFontSizeMultiplier(prefs.fontSize));
}

function getFontSizeMultiplier(size: AccessibilityPreferences['fontSize']): string {
  switch (size) {
    case 'small':
      return '0.875';
    case 'medium':
      return '1';
    case 'large':
      return '1.125';
    case 'xlarge':
      return '1.25';
    default:
      return '1';
  }
}

