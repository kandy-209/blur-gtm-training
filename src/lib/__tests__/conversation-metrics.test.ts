import { calculateConversationMetrics, getTalkToListenRecommendation } from '../conversation-metrics';
import { ConversationMessage } from '../conversation-metrics';

describe('conversation-metrics', () => {
  describe('calculateConversationMetrics', () => {
    it('should calculate balanced talk-to-listen ratio', () => {
      const history: ConversationMessage[] = [
        { role: 'rep', message: 'Hello, how are you?', timestamp: new Date() },
        { role: 'agent', message: 'I am doing well, thank you.', timestamp: new Date() },
        { role: 'rep', message: 'Great to hear!', timestamp: new Date() },
        { role: 'agent', message: 'What can I help you with today?', timestamp: new Date() },
      ];

      const metrics = calculateConversationMetrics(history);

      expect(metrics.talkToListenRatio.ratio).toBeGreaterThan(0);
      expect(metrics.talkToListenRatio.ratio).toBeLessThan(1);
      expect(['balanced', 'rep_dominating', 'rep_too_quiet']).toContain(metrics.talkToListenRatio.status);
    });

    it('should detect discovery questions', () => {
      const history: ConversationMessage[] = [
        { role: 'rep', message: 'What challenges are you facing?', timestamp: new Date() },
        { role: 'agent', message: 'We have some issues.', timestamp: new Date() },
        { role: 'rep', message: 'How does that impact your team?', timestamp: new Date() },
      ];

      const metrics = calculateConversationMetrics(history);

      expect(metrics.questions.discoveryQuestions).toBeGreaterThan(0);
      expect(metrics.questions.repQuestions).toBeGreaterThan(0);
    });

    it('should detect objections', () => {
      const history: ConversationMessage[] = [
        { role: 'rep', message: 'Would you like to learn more?', timestamp: new Date() },
        { role: 'agent', message: 'I am concerned about the price.', timestamp: new Date() },
        { role: 'rep', message: 'I understand your concern.', timestamp: new Date() },
        { role: 'agent', message: 'But we are not sure if we need it.', timestamp: new Date() },
      ];

      const metrics = calculateConversationMetrics(history);

      expect(metrics.objections.detected).toBeGreaterThan(0);
    });

    it('should handle empty conversation', () => {
      const metrics = calculateConversationMetrics([]);

      expect(metrics.talkToListenRatio.ratio).toBe(0.5);
      expect(metrics.questions.repQuestions).toBe(0);
      expect(metrics.objections.detected).toBe(0);
    });
  });

  describe('getTalkToListenRecommendation', () => {
    it('should provide recommendation for balanced ratio', () => {
      const recommendation = getTalkToListenRecommendation(0.5, 'balanced');
      expect(recommendation).toContain('balance');
    });

    it('should provide recommendation for rep dominating', () => {
      const recommendation = getTalkToListenRecommendation(0.8, 'rep_dominating');
      expect(recommendation).toContain('80');
      expect(recommendation).toContain('40-60');
    });
  });
});














