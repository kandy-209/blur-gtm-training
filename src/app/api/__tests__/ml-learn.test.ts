import { POST, GET } from '../../api/ml/learn/route';
import { ContinuousLearningAgent } from '@/lib/ml/continuous-learning';

// Mock ContinuousLearningAgent
jest.mock('@/lib/ml/continuous-learning', () => ({
  ContinuousLearningAgent: {
    learnFromData: jest.fn(),
    evaluateModelImprovement: jest.fn(),
  },
}));

// Mock NextRequest
class MockNextRequest {
  public headers: Headers;
  public url: string;
  public method: string;
  private bodyData: any;

  constructor(url: string, init?: RequestInit) {
    this.url = url;
    this.method = init?.method || 'GET';
    this.headers = new Headers(init?.headers);
    if (init?.body) {
      this.bodyData = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
    }
  }

  async json() {
    return Promise.resolve(this.bodyData || {});
  }

  async text() {
    return Promise.resolve(typeof this.bodyData === 'string' ? this.bodyData : JSON.stringify(this.bodyData || {}));
  }
}

describe('/api/ml/learn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should trigger learning and return insights', async () => {
      const mockInsights = [
        {
          id: 'insight_1',
          type: 'pattern' as const,
          category: 'Competitive_SelfHosted',
          insight: 'Test insight',
          confidence: 85,
          evidence: ['Evidence 1'],
          recommendation: 'Test recommendation',
          timestamp: new Date(),
        },
      ];

      (ContinuousLearningAgent.learnFromData as jest.Mock).mockResolvedValue(mockInsights);

      const request = new MockNextRequest('http://localhost/api/ml/learn', {
        method: 'POST',
        body: JSON.stringify({ objectionCategory: 'Competitive_SelfHosted' }),
        headers: { 'Content-Type': 'application/json' },
      }) as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.insights).toBeDefined();
      expect(data.count).toBe(1);
    });

    it('should return 400 for missing objectionCategory', async () => {
      const request = new MockNextRequest('http://localhost/api/ml/learn', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      }) as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      (ContinuousLearningAgent.learnFromData as jest.Mock).mockRejectedValue(
        new Error('Learning failed')
      );

      const request = new MockNextRequest('http://localhost/api/ml/learn', {
        method: 'POST',
        body: JSON.stringify({ objectionCategory: 'Competitive_SelfHosted' }),
        headers: { 'Content-Type': 'application/json' },
      }) as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe('GET', () => {
    it('should return insights and improvement', async () => {
      const mockInsights = [
        {
          id: 'insight_1',
          type: 'pattern' as const,
          category: 'Competitive_SelfHosted',
          insight: 'Test insight',
          confidence: 85,
          evidence: ['Evidence 1'],
          recommendation: 'Test recommendation',
          timestamp: new Date(),
        },
      ];

      const mockImprovement = {
        before: { averageScore: 75, successRate: 0.75 },
        after: { averageScore: 85, successRate: 0.85 },
        improvement: 13.3,
        changes: ['Improvement 1'],
      };

      (ContinuousLearningAgent.learnFromData as jest.Mock).mockResolvedValue(mockInsights);
      (ContinuousLearningAgent.evaluateModelImprovement as jest.Mock).mockResolvedValue(mockImprovement);

      const request = new MockNextRequest('http://localhost/api/ml/learn?category=Competitive_Copilot', {
        method: 'GET',
      }) as any;

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.insights).toBeDefined();
      expect(data.improvement).toBeDefined();
    });

    it('should return 400 for missing category', async () => {
      const request = new MockNextRequest('http://localhost/api/ml/learn', {
        method: 'GET',
      }) as any;

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      (ContinuousLearningAgent.learnFromData as jest.Mock).mockRejectedValue(
        new Error('Learning failed')
      );

      const request = new MockNextRequest('http://localhost/api/ml/learn?category=Competitive_Copilot', {
        method: 'GET',
      }) as any;

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });
});
