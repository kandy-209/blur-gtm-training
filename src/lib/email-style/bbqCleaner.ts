import { BANNED_PHRASES, REPLACEMENTS, STYLE_CONFIG } from './bbqConfig';
import type { CleanResult, EmailStyle, BbqScore, LintIssue, LintResult, TextChange } from './types';
import { lintText } from './bbqLinter';

const FILLER_PATTERNS: RegExp[] = [
  /I hope this email finds you well[,\.]?/gi,
  /I wanted to reach out[,\.]?/gi,
  /I hope you're doing well[,\.]?/gi,
  /just checking in[,\.]?/gi,
  /checking in to see[,\.]?/gi,
  /circling back[,\.]?/gi,
  /touching base[,\.]?/gi,
  /I know you're busy[,\.]?/gi,
];

function applyReplacements(text: string): { revised: string; changes: TextChange[] } {
  let revised = text;
  const changes: TextChange[] = [];

  // Apply explicit replacements
  for (const [from, to] of Object.entries(REPLACEMENTS)) {
    const pattern = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    if (pattern.test(revised)) {
      revised = revised.replace(pattern, (match) => {
        if (match === to) return match;
        changes.push({ from: match, to, reason: 'Simplified buzzwordy phrase.' });
        return to;
      });
    }
  }

  // Remove filler phrases entirely
  for (const rx of FILLER_PATTERNS) {
    if (rx.test(revised)) {
      revised = revised.replace(rx, (match) => {
        changes.push({ from: match, to: '', reason: 'Removed filler phrase.' });
        return '';
      });
    }
  }

  // As a safety, normalize multiple spaces created by removals
  revised = revised.replace(/\s{2,}/g, ' ').replace(/\n\s+\n/g, '\n\n');

  return { revised, changes };
}

function scoreFromLint(lint: LintResult, style: EmailStyle): BbqScore {
  const { minWords, maxWords } = STYLE_CONFIG[style];
  const { wordCount, issues } = lint;

  // Word band score (0–30)
  let wordBand = 30;
  if (wordCount > maxWords || wordCount < minWords) {
    // simple linear penalty up to 30 points if way off
    const dist = wordCount > maxWords ? wordCount - maxWords : minWords - wordCount;
    const penalty = Math.min(30, dist); // 1 point per word outside band
    wordBand = Math.max(0, 30 - penalty);
  }

  // Buzzword score (0–30)
  const buzzCount = issues.filter((i) => i.type === 'buzzword').length;
  const buzzPenalty = Math.min(30, buzzCount * 5); // 5 points per buzzword
  const buzzwords = Math.max(0, 30 - buzzPenalty);

  // Structure score (0–30)
  let structure = 0;
  const hasQuestion = issues.every((i) => i.type !== 'multi_cta');
  const hasTooLong = issues.some((i) => i.type === 'too_long');
  const hasTooShort = issues.some((i) => i.type === 'too_short');

  if (!hasTooLong && !hasTooShort) {
    structure += 10;
  }
  if (hasQuestion) {
    structure += 10;
  }
  // basic remaining 10 points for having any issues at all
  structure += Math.max(0, 10 - issues.length);

  // Clarity score (0–10) – for now, simple heuristic based on avg sentence length
  const sentences = lint.wordCount === 0 ? [] : (revisedSentenceSplit as any)(lint as any);
  // Fallback clarity: if we don't parse sentences, just base on wordBand
  let clarity = Math.round(wordBand / 6); // ~0–5 as a baseline
  if (sentences && Array.isArray(sentences) && sentences.length > 0) {
    const avgLen = sentences.reduce((sum, s) => sum + s, 0) / sentences.length;
    if (avgLen <= 15) clarity = 10;
    else if (avgLen <= 20) clarity = 8;
    else if (avgLen <= 25) clarity = 6;
    else clarity = 4;
  }

  const total = Math.max(0, Math.min(100, wordBand + buzzwords + structure + clarity));

  return { total, wordBand, buzzwords, structure, clarity };
}

// Very small helper to approximate sentence lengths in words based on punctuation.
function revisedSentenceSplit(lint: LintResult): number[] {
  // We don't have the full text here, so this is intentionally conservative.
  // In the future, this could accept the raw text instead.
  // For now, we approximate clarity from word count alone.
  return [lint.wordCount];
}

export function cleanText(text: string, style: EmailStyle): CleanResult {
  const lintBefore = lintText(text, style);
  const { revised, changes } = applyReplacements(text);
  const lintAfter = lintText(revised, style);
  const bbqScore = scoreFromLint(lintAfter, style);

  // Promote too_long / too_short / multi_cta issues to info only –
  // this function is meant to clean, not block.
  const normalizeIssue = (issue: LintIssue): LintIssue => ({
    ...issue,
    severity: issue.type === 'buzzword' ? issue.severity : 'info',
  });

  return {
    revised,
    changes,
    lintBefore: {
      ...lintBefore,
      issues: lintBefore.issues.map(normalizeIssue),
    },
    lintAfter: {
      ...lintAfter,
      issues: lintAfter.issues.map(normalizeIssue),
    },
    bbqScore,
  };
}


