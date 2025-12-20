import type { EmailStyle } from './types';

export interface StyleConfig {
  minWords: number;
  maxWords: number;
}

export const STYLE_CONFIG: Record<EmailStyle, StyleConfig> = {
  bbq_plain: {
    minWords: 50,
    maxWords: 75,
  },
  exec_concise: {
    minWords: 40,
    maxWords: 60,
  },
};

// Core list of overused / vague words and phrases we want to avoid.
// This is not exhaustive, but covers the highest-signal offenders.
export const BANNED_PHRASES: string[] = [
  'leverage',
  'delve',
  'meticulous',
  'elevate',
  'revolutionize',
  'holistic',
  'holistic approach',
  'empower',
  'realm',
  'seamless',
  'enhance',
  'reinvent',
  'fast-paced',
  'embark',
  'reimagined',
  'game-changer',
  'game changer',
  'enable',
  'redefine',
  'redefining',
  'unprecedented',
  'embrace',
  'harness the power',
  'next-level',
  'ensure',
  'navigate',
  'best-in-class',
  'disruptive',
  'disruptive innovation',
  'emerge',
  'deep dive',
  'dive into',
  'unleash',
  'synergy',
  'ever-evolving',
  'ever-changing',
  'unveil',
  'mission-critical',
  'unlock',
  'paradigm shift',
  'tailored',
  'bespoke',
  'utilize',
  'cutting-edge',
  'landscape',
  'digital landscape',
  'underscore',
  'diverse sources',
  'streamline',
  'supercharge',
  'intricate',
  'laser-focused',
  'conventional solutions',
  'orchestrating',
  'orchestrate',
  'manifests',
];

// Simple default replacements. These are intentionally conservative
// and can be refined over time from real user edits.
export const REPLACEMENTS: Record<string, string> = {
  leverage: 'use',
  utilize: 'use',
  elevate: 'make better',
  enhance: 'make better',
  streamline: 'make simpler',
  'holistic approach': 'the way everything fits together',
  holistic: 'the way everything fits together',
  'best-in-class': 'that people actually keep using',
  'cutting-edge': 'new',
  'next-level': 'better',
  'mission-critical': "you can't afford for this to fail",
  'fast-paced': 'where things change quickly',
  'digital landscape': 'world of tools you use',
  landscape: 'space',
  synergy: 'work better together',
  'harness the power': 'use',
  'paradigm shift': 'big change',
  'disruptive innovation': 'a different way to do this',
  seamless: 'simple',
  seamlessly: 'easily',
  'quick call': 'quick look',
  'schedule a quick call': 'see a quick overview',
  '30-minute call': 'short overview',
  '30 minute call': 'short overview',
  '15-minute call': 'short overview',
  '15 minute call': 'short overview',
  'schedule a call': 'see a short overview',
  simplely: 'easily',
};

