/**
 * Tests for prospect intelligence schemas
 * Validates data structure and edge cases
 */

import { z } from 'zod';
import {
  ProspectIntelligenceSchema,
  HiringDataSchema,
  TechStackSchema,
  EngineeringCultureSchema,
  CompanySizeSchema,
  ICPScoreSchema,
  ThirdPartyToolsSchema,
} from '../schemas';

describe('Prospect Intelligence Schemas', () => {
  describe('HiringDataSchema', () => {
    it('should validate complete hiring data', () => {
      const data = {
        hasOpenEngineeringRoles: true,
        engineeringRoleCount: 5,
        totalOpenRoles: 10,
        jobBoardPlatform: 'Lever',
        engineeringRoleTitles: ['Software Engineer', 'Senior Engineer'],
        seniorityLevels: ['Senior', 'Staff'],
        hiringSignals: ['Urgently hiring', 'Multiple roles'],
        confidenceScore: 90,
      };
      
      expect(() => HiringDataSchema.parse(data)).not.toThrow();
    });

    it('should handle null values for optional fields', () => {
      const data = {
        hasOpenEngineeringRoles: false,
        engineeringRoleCount: null,
        totalOpenRoles: null,
        jobBoardPlatform: null,
        engineeringRoleTitles: [],
        seniorityLevels: [],
        hiringSignals: [],
        confidenceScore: 0,
      };
      
      expect(() => HiringDataSchema.parse(data)).not.toThrow();
    });

    it('should reject invalid confidence scores', () => {
      const data = {
        hasOpenEngineeringRoles: true,
        engineeringRoleCount: 5,
        totalOpenRoles: 10,
        jobBoardPlatform: 'Lever',
        engineeringRoleTitles: [],
        seniorityLevels: [],
        hiringSignals: [],
        confidenceScore: 150, // Invalid: > 100
      };
      
      expect(() => HiringDataSchema.parse(data)).toThrow();
    });

    it('should reject negative confidence scores', () => {
      const data = {
        hasOpenEngineeringRoles: true,
        engineeringRoleCount: 5,
        totalOpenRoles: 10,
        jobBoardPlatform: 'Lever',
        engineeringRoleTitles: [],
        seniorityLevels: [],
        hiringSignals: [],
        confidenceScore: -10, // Invalid: < 0
      };
      
      expect(() => HiringDataSchema.parse(data)).toThrow();
    });
  });

  describe('TechStackSchema', () => {
    it('should validate complete tech stack data', () => {
      const data = {
        primaryFramework: 'React',
        frameworkConfidence: 'high',
        frameworkEvidence: ['__NEXT_DATA__ found'],
        additionalFrameworks: ['Next.js'],
        buildTools: ['Webpack'],
        isModernStack: true,
        confidenceScore: 95,
      };
      
      expect(() => TechStackSchema.parse(data)).not.toThrow();
    });

    it('should handle null primary framework', () => {
      const data = {
        primaryFramework: null,
        frameworkConfidence: 'low',
        frameworkEvidence: [],
        additionalFrameworks: [],
        buildTools: [],
        isModernStack: false,
        confidenceScore: 20,
        fallbackReason: 'No framework detected',
      };
      
      expect(() => TechStackSchema.parse(data)).not.toThrow();
    });

    it('should validate framework confidence enum', () => {
      const data = {
        primaryFramework: 'React',
        frameworkConfidence: 'invalid', // Invalid
        frameworkEvidence: [],
        additionalFrameworks: [],
        buildTools: [],
        isModernStack: true,
        confidenceScore: 80,
      };
      
      expect(() => TechStackSchema.parse(data)).toThrow();
    });
  });

  describe('ICPScoreSchema', () => {
    it('should validate ICP score data', () => {
      const data = {
        overallScore: 8,
        priorityLevel: 'high',
        positiveSignals: ['B2B SaaS', 'Modern stack'],
        negativeSignals: ['Small team'],
        recommendedTalkingPoints: ['Scalability', 'Integration'],
        outreachTiming: 'Urgent',
      };
      
      expect(() => ICPScoreSchema.parse(data)).not.toThrow();
    });

    it('should reject scores outside 1-10 range', () => {
      const data = {
        overallScore: 15, // Invalid: > 10
        priorityLevel: 'high',
        positiveSignals: [],
        negativeSignals: [],
        recommendedTalkingPoints: [],
        outreachTiming: 'Anytime',
      };
      
      expect(() => ICPScoreSchema.parse(data)).toThrow();
    });

    it('should validate priority level enum', () => {
      const data = {
        overallScore: 5,
        priorityLevel: 'invalid', // Invalid
        positiveSignals: [],
        negativeSignals: [],
        recommendedTalkingPoints: [],
        outreachTiming: 'Anytime',
      };
      
      expect(() => ICPScoreSchema.parse(data)).toThrow();
    });
  });

  describe('ProspectIntelligenceSchema', () => {
    it('should validate complete prospect intelligence data', () => {
      const data = {
        companyName: 'Test Company',
        companyWebsite: 'https://example.com',
        companyDescription: 'A test company',
        industry: 'Technology',
        isB2BSaaS: true,
        techStack: {
          primaryFramework: 'React',
          frameworkConfidence: 'high',
          frameworkEvidence: [],
          additionalFrameworks: [],
          buildTools: [],
          isModernStack: true,
          confidenceScore: 90,
        },
        hiring: {
          hasOpenEngineeringRoles: true,
          engineeringRoleCount: 5,
          totalOpenRoles: 10,
          jobBoardPlatform: 'Lever',
          engineeringRoleTitles: ['Software Engineer'],
          seniorityLevels: [],
          hiringSignals: [],
          confidenceScore: 85,
        },
        engineeringCulture: {
          hasEngineeringBlog: true,
          engineeringBlogUrl: 'https://example.com/blog',
          recentBlogTopics: ['Tech'],
          developmentPractices: [],
          techCultureHighlights: [],
          opensourcePresence: false,
        },
        companySize: {
          estimatedEmployeeRange: '100-250',
          estimatedEngineeringTeamSize: null,
          growthIndicators: [],
          fundingInfo: null,
        },
        thirdPartyTools: {
          analytics: [],
          monitoring: [],
          deployment: [],
          chat: [],
          other: [],
        },
        icpScore: {
          overallScore: 8,
          priorityLevel: 'high',
          positiveSignals: [],
          negativeSignals: [],
          recommendedTalkingPoints: [],
          outreachTiming: 'Anytime',
        },
        dataQuality: {
          completenessScore: 80,
          confidenceLevel: 'high',
          sourcesChecked: ['https://example.com'],
          missingData: [],
        },
        extractedAt: new Date().toISOString(),
        extractionDurationMs: 5000,
      };
      
      expect(() => ProspectIntelligenceSchema.parse(data)).not.toThrow();
    });

    it('should accept valid URLs', () => {
      const data = {
        companyName: 'Test',
        companyWebsite: 'https://example.com', // Valid URL
        companyDescription: 'Test',
        industry: 'Tech',
        isB2BSaaS: true,
        techStack: {
          primaryFramework: null,
          frameworkConfidence: 'low',
          frameworkEvidence: [],
          additionalFrameworks: [],
          buildTools: [],
          isModernStack: false,
          confidenceScore: 0,
        },
        hiring: {
          hasOpenEngineeringRoles: false,
          engineeringRoleCount: null,
          totalOpenRoles: null,
          jobBoardPlatform: null,
          engineeringRoleTitles: [],
          seniorityLevels: [],
          hiringSignals: [],
          confidenceScore: 0,
        },
        engineeringCulture: {
          hasEngineeringBlog: false,
          engineeringBlogUrl: null,
          recentBlogTopics: [],
          developmentPractices: [],
          techCultureHighlights: [],
          opensourcePresence: false,
        },
        companySize: {
          estimatedEmployeeRange: null,
          estimatedEngineeringTeamSize: null,
          growthIndicators: [],
          fundingInfo: null,
        },
        thirdPartyTools: {
          analytics: [],
          monitoring: [],
          deployment: [],
          chat: [],
          other: [],
        },
        icpScore: {
          overallScore: 5,
          priorityLevel: 'medium',
          positiveSignals: [],
          negativeSignals: [],
          recommendedTalkingPoints: [],
          outreachTiming: 'Anytime',
        },
        dataQuality: {
          completenessScore: 50,
          confidenceLevel: 'medium',
          sourcesChecked: [],
          missingData: [],
        },
        extractedAt: new Date().toISOString(),
        extractionDurationMs: 1000,
      };
      
      expect(() => ProspectIntelligenceSchema.parse(data)).not.toThrow();
    });

    it('should handle minimal valid data', () => {
      const data = {
        companyName: 'Minimal',
        companyWebsite: 'https://example.com',
        companyDescription: 'Minimal description',
        industry: 'Tech',
        isB2BSaaS: false,
        techStack: {
          primaryFramework: null,
          frameworkConfidence: 'low',
          frameworkEvidence: [],
          additionalFrameworks: [],
          buildTools: [],
          isModernStack: false,
          confidenceScore: 0,
        },
        hiring: {
          hasOpenEngineeringRoles: false,
          engineeringRoleCount: null,
          totalOpenRoles: null,
          jobBoardPlatform: null,
          engineeringRoleTitles: [],
          seniorityLevels: [],
          hiringSignals: [],
          confidenceScore: 0,
        },
        engineeringCulture: {
          hasEngineeringBlog: false,
          engineeringBlogUrl: null,
          recentBlogTopics: [],
          developmentPractices: [],
          techCultureHighlights: [],
          opensourcePresence: false,
        },
        companySize: {
          estimatedEmployeeRange: null,
          estimatedEngineeringTeamSize: null,
          growthIndicators: [],
          fundingInfo: null,
        },
        thirdPartyTools: {
          analytics: [],
          monitoring: [],
          deployment: [],
          chat: [],
          other: [],
        },
        icpScore: {
          overallScore: 1,
          priorityLevel: 'low',
          positiveSignals: [],
          negativeSignals: [],
          recommendedTalkingPoints: [],
          outreachTiming: 'Anytime',
        },
        dataQuality: {
          completenessScore: 10,
          confidenceLevel: 'low',
          sourcesChecked: ['https://example.com'],
          missingData: ['Most data'],
        },
        extractedAt: new Date().toISOString(),
        extractionDurationMs: 100,
      };
      
      expect(() => ProspectIntelligenceSchema.parse(data)).not.toThrow();
    });
  });
});

