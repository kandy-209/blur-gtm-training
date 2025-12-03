/**
 * Real-time conversation metrics calculation
 * Tracks talk-to-listen ratio, questions, objections, etc.
 */

export interface ConversationMessage {
  role: 'rep' | 'agent' | 'prospect';
  message: string;
  timestamp: Date;
}

export interface ConversationMetrics {
  talkToListenRatio: {
    ratio: number; // 0-1, rep talking time / total time
    repWordCount: number;
    prospectWordCount: number;
    status: 'balanced' | 'rep_dominating' | 'rep_too_quiet';
  };
  questions: {
    repQuestions: number;
    prospectQuestions: number;
    discoveryQuestions: number;
  };
  objections: {
    detected: number;
    handled: number;
  };
  conversationFlow: {
    repTurns: number;
    prospectTurns: number;
    averageResponseLength: number;
  };
}

/**
 * Calculate real-time conversation metrics
 */
export function calculateConversationMetrics(
  conversationHistory: ConversationMessage[]
): ConversationMetrics {
  const repMessages = conversationHistory.filter(m => m.role === 'rep');
  const prospectMessages = conversationHistory.filter(m => m.role === 'agent' || m.role === 'prospect');

  // Calculate word counts
  const repWordCount = repMessages.reduce((sum, msg) => {
    return sum + msg.message.split(/\s+/).filter(w => w.length > 0).length;
  }, 0);

  const prospectWordCount = prospectMessages.reduce((sum, msg) => {
    return sum + msg.message.split(/\s+/).filter(w => w.length > 0).length;
  }, 0);

  const totalWordCount = repWordCount + prospectWordCount;
  const talkToListenRatio = totalWordCount > 0 ? repWordCount / totalWordCount : 0.5;

  // Determine status
  let status: 'balanced' | 'rep_dominating' | 'rep_too_quiet';
  if (talkToListenRatio >= 0.4 && talkToListenRatio <= 0.6) {
    status = 'balanced';
  } else if (talkToListenRatio > 0.6) {
    status = 'rep_dominating';
  } else {
    status = 'rep_too_quiet';
  }

  // Count questions
  const repQuestions = repMessages.filter(m => m.message.includes('?')).length;
  const prospectQuestions = prospectMessages.filter(m => m.message.includes('?')).length;
  
  // Discovery questions (open-ended)
  const discoveryQuestions = repMessages.filter(m => {
    const lower = m.message.toLowerCase();
    return (
      m.message.includes('?') &&
      (lower.includes('what') ||
       lower.includes('how') ||
       lower.includes('why') ||
       lower.includes('tell me') ||
       lower.includes('can you explain'))
    );
  }).length;

  // Detect objections
  const objections = prospectMessages.filter(m => {
    const lower = m.message.toLowerCase();
    return (
      lower.includes('concern') ||
      lower.includes('worried') ||
      lower.includes('not sure') ||
      lower.includes('but') ||
      lower.includes('however') ||
      lower.includes('problem') ||
      lower.includes('issue')
    );
  }).length;

  // Calculate average response length
  const allMessages = [...repMessages, ...prospectMessages];
  const averageResponseLength = allMessages.length > 0
    ? allMessages.reduce((sum, msg) => sum + msg.message.length, 0) / allMessages.length
    : 0;

  return {
    talkToListenRatio: {
      ratio: talkToListenRatio,
      repWordCount,
      prospectWordCount,
      status,
    },
    questions: {
      repQuestions,
      prospectQuestions,
      discoveryQuestions,
    },
    objections: {
      detected: objections,
      handled: Math.max(0, objections - Math.floor(objections * 0.3)), // Estimate handled
    },
    conversationFlow: {
      repTurns: repMessages.length,
      prospectTurns: prospectMessages.length,
      averageResponseLength,
    },
  };
}

/**
 * Get recommendation based on metrics
 */
export function getTalkToListenRecommendation(ratio: number, status: string): string {
  if (status === 'balanced') {
    return 'Great balance! Continue listening actively.';
  } else if (status === 'rep_dominating') {
    return `You're talking ${(ratio * 100).toFixed(0)}% of the time. Aim for 40-60%. Ask questions and pause longer for responses.`;
  } else {
    return 'You might be too quiet. Share more value and ask follow-up questions.';
  }
}

