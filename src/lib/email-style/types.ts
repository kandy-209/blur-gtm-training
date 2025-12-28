export type EmailStyle = 'bbq_plain' | 'exec_concise';

export type EmailType =
  | 'cold-outreach'
  | 'follow-up'
  | 'demo-invite'
  | 'objection-response';

export interface BbqScore {
  total: number; // 0–100
  wordBand: number; // 0–30
  buzzwords: number; // 0–30
  structure: number; // 0–30
  clarity: number; // 0–10
}

export type IssueType =
  | 'buzzword'
  | 'filler'
  | 'too_long'
  | 'too_short'
  | 'multi_cta'
  | 'structure';

export interface LintIssue {
  type: IssueType;
  severity: 'info' | 'warn' | 'error';
  message: string;
  offset: number;
  length: number;
  value?: string;
  suggestion?: string;
}

export interface LintResult {
  wordCount: number;
  issues: LintIssue[];
}

export interface TextChange {
  from: string;
  to: string;
  reason: string;
}

export interface CleanResult {
  revised: string;
  changes: TextChange[];
  lintBefore: LintResult;
  lintAfter: LintResult;
  bbqScore: BbqScore;
}


