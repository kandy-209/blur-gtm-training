export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  roleAtCursor: string; // e.g., "Sales Rep", "Account Executive", "Sales Manager"
  jobTitle: string; // e.g., "Senior Account Executive", "Enterprise Sales Manager"
  department?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRating {
  id: string;
  sessionId: string;
  raterUserId: string;
  ratedUserId: string;
  rating: number; // 1-5 stars
  feedback?: string;
  category: 'communication' | 'product_knowledge' | 'objection_handling' | 'closing' | 'overall';
  createdAt: Date;
}

export interface SessionRating {
  sessionId: string;
  repUserId: string;
  prospectUserId: string;
  repRating?: UserRating;
  prospectRating?: UserRating;
  repScore?: number; // Performance score from AI evaluation
  prospectScore?: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  roleAtCursor: string;
  totalSessions: number;
  averageRating: number;
  totalRatings: number;
  winRate: number; // Percentage of sessions won
  totalScore: number;
  rank: number;
}

