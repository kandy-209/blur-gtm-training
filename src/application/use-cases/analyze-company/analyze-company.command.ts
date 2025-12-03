/**
 * Analyze Company Command
 * CQRS Command for analyzing a company
 */

export interface AnalyzeCompanyCommand {
  input: string | {
    domain?: string;
    companyName?: string;
    githubRepo?: string;
  };
  forceRefresh?: boolean;
}

