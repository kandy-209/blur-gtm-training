import { BANNED_PHRASES, STYLE_CONFIG } from './bbqConfig';
import type { EmailStyle, LintIssue, LintResult } from './types';

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function lintText(text: string, style: EmailStyle): LintResult {
  const issues: LintIssue[] = [];
  const lower = text.toLowerCase();

  // Buzzword / banned phrase detection
  for (const phrase of BANNED_PHRASES) {
    const idx = lower.indexOf(phrase.toLowerCase());
    if (idx !== -1) {
      issues.push({
        type: 'buzzword',
        severity: 'warn',
        message: `Avoid overused phrase: "${phrase}"`,
        offset: idx,
        length: phrase.length,
        value: phrase,
      });
    }
  }

  // Light check for ROI / percentage-heavy claims (e.g. "30% boost")
  const percentRegex = /\b\d{1,3}\s*%/g;
  if (percentRegex.test(text)) {
    issues.push({
      type: 'structure',
      severity: 'info',
      message:
        'Email includes percentage-based claims (e.g. \"30%\" or \"40%\"). Consider rewriting as a concrete outcome instead of ROI stats in the first email.',
      offset: 0,
      length: 0,
    });
  }

  const wordCount = countWords(text);
  const { minWords, maxWords } = STYLE_CONFIG[style];

  if (wordCount > maxWords) {
    issues.push({
      type: 'too_long',
      severity: 'info',
      message: `Body is longer than ideal for ${style} (${wordCount} words, target ${minWords}-${maxWords}).`,
      offset: 0,
      length: 0,
    });
  } else if (wordCount < minWords) {
    issues.push({
      type: 'too_short',
      severity: 'info',
      message: `Body is shorter than ideal for ${style} (${wordCount} words, target ${minWords}-${maxWords}).`,
      offset: 0,
      length: 0,
    });
  }

  // Simple CTA heuristic: count question marks
  const questionCount = (text.match(/\?/g) || []).length;
  if (questionCount > 1) {
    issues.push({
      type: 'multi_cta',
      severity: 'warn',
      message: 'Email appears to contain multiple questions. Aim for a single clear CTA.',
      offset: 0,
      length: 0,
    });
  }

  return { wordCount, issues };
}


