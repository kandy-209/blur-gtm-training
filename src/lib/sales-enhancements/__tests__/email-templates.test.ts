import { generateEmailTemplate, generateEmailVariants } from '../email-templates';

global.fetch = jest.fn();

describe('Email Templates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateEmailTemplate', () => {
    it('should generate cold outreach template', async () => {
      const request = {
        companyName: 'Acme Corp',
        emailType: 'cold-outreach' as const,
        tone: 'professional' as const,
      };

      const template = await generateEmailTemplate(request);

      expect(template.subject).toBeDefined();
      expect(template.body).toBeDefined();
      expect(template.cta).toBeDefined();
      expect(template.personalization.companyName).toBe('Acme Corp');
    });

    it('should include prospect name when provided', async () => {
      const request = {
        prospectName: 'John',
        companyName: 'Acme Corp',
        emailType: 'cold-outreach' as const,
        tone: 'professional' as const,
      };

      const template = await generateEmailTemplate(request);

      expect(template.body).toContain('John');
      expect(template.personalization.contactName).toBe('John');
    });

    it('should handle different email types', async () => {
      const types = ['cold-outreach', 'follow-up', 'demo-invite', 'objection-response'] as const;

      for (const emailType of types) {
        const template = await generateEmailTemplate({
          companyName: 'Acme Corp',
          emailType,
          tone: 'professional' as const,
        });

        expect(template.subject).toBeDefined();
        expect(template.body).toBeDefined();
        expect(template.cta).toBeDefined();
      }
    });

    it('should handle different tones', async () => {
      const tones = ['professional', 'friendly', 'urgent', 'consultative'] as const;

      for (const tone of tones) {
        const template = await generateEmailTemplate({
          companyName: 'Acme Corp',
          emailType: 'cold-outreach' as const,
          tone,
        });

        expect(template.body).toBeDefined();
      }
    });

    it('should handle objection response with context', async () => {
      const template = await generateEmailTemplate({
        companyName: 'Acme Corp',
        emailType: 'objection-response' as const,
        tone: 'professional' as const,
        context: 'Security concerns',
      });

      expect(template.body).toBeDefined();
      expect(template.body.length).toBeGreaterThan(0);
    });

    it('should handle empty company name', async () => {
      const template = await generateEmailTemplate({
        companyName: '',
        emailType: 'cold-outreach' as const,
        tone: 'professional' as const,
      });

      expect(template.subject).toBeDefined();
      expect(template.body).toBeDefined();
    });

    it('should handle special characters in company name', async () => {
      const template = await generateEmailTemplate({
        companyName: "O'Brien & Associates",
        emailType: 'cold-outreach' as const,
        tone: 'professional' as const,
      });

      expect(template.body).toContain("O'Brien & Associates");
    });

    it('should handle very long company names', async () => {
      const longName = 'A'.repeat(200);
      const template = await generateEmailTemplate({
        companyName: longName,
        emailType: 'cold-outreach' as const,
        tone: 'professional' as const,
      });

      expect(template.body).toBeDefined();
    });

    it('should handle API failure and use fallback', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));

      const template = await generateEmailTemplate({
        companyName: 'Acme Corp',
        emailType: 'cold-outreach' as const,
        tone: 'professional' as const,
      });

      expect(template.subject).toBeDefined();
      expect(template.body).toBeDefined();
    });
  });

  describe('generateEmailVariants', () => {
    it('should generate multiple variants', async () => {
      const baseTemplate = {
        subject: 'Test Subject',
        body: 'Test body',
        cta: 'Test CTA',
        personalization: {},
      };

      const variants = await generateEmailVariants(baseTemplate, 3);

      expect(variants).toBeDefined();
      expect(variants?.length).toBeGreaterThan(0);
      expect(variants?.length).toBeLessThanOrEqual(3);
    });

    it('should handle zero count', async () => {
      const baseTemplate = {
        subject: 'Test',
        body: 'Test',
        cta: 'Test',
        personalization: {},
      };

      const variants = await generateEmailVariants(baseTemplate, 0);

      expect(variants).toEqual([]);
    });

    it('should handle large count', async () => {
      const baseTemplate = {
        subject: 'Test',
        body: 'Test',
        cta: 'Test',
        personalization: {},
      };

      const variants = await generateEmailVariants(baseTemplate, 100);

      expect(variants?.length).toBeLessThanOrEqual(3); // Limited by available variants
    });

    it('should create unique variants', async () => {
      const baseTemplate = {
        subject: 'Test Subject',
        body: 'Test body',
        cta: 'Test CTA',
        personalization: {},
      };

      const variants = await generateEmailVariants(baseTemplate, 3);

      if (variants && variants.length > 1) {
        const subjects = variants.map((v) => v.subject);
        const uniqueSubjects = new Set(subjects);
        expect(uniqueSubjects.size).toBeGreaterThan(1);
      }
    });
  });
});















