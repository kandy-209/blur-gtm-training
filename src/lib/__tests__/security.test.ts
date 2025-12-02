import { sanitizeInput, validateText, validateFile, validateJSONStructure } from '@/lib/security';

describe('Security Utilities', () => {
  describe('sanitizeInput', () => {
    it('should remove null bytes', () => {
      const input = 'test\x00string';
      expect(sanitizeInput(input)).toBe('teststring');
    })

    it('should limit length', () => {
      const input = 'a'.repeat(20000);
      expect(sanitizeInput(input, 100).length).toBe(100);
    })

    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
    })

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null as any)).toBe('');
    })
  })

  describe('validateText', () => {
    it('should validate text length', () => {
      const result = validateText('test', { maxLength: 10 });
      expect(result.valid).toBe(true);
    })

    it('should reject text exceeding max length', () => {
      const result = validateText('a'.repeat(100), { maxLength: 10 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceed');
    })

    it('should validate min length', () => {
      const result = validateText('ab', { minLength: 3, maxLength: 10 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least');
    })

    it('should validate pattern', () => {
      const result = validateText('test123', { maxLength: 10, pattern: /^[a-z]+$/ });
      expect(result.valid).toBe(false);
    })
  })

  describe('validateFile', () => {
    it('should validate file size', () => {
      const file = new File(['test'], 'test.webm', { type: 'audio/webm' });
      Object.defineProperty(file, 'size', { value: 30 * 1024 * 1024 }); // 30MB
      
      const result = validateFile(file, {
        maxSize: 25 * 1024 * 1024,
        allowedTypes: ['audio/webm'],
      });
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('size');
    })

    it('should validate file type', () => {
      const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
      
      const result = validateFile(file, {
        maxSize: 1024,
        allowedTypes: ['audio/webm'],
      });
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('type');
    })

    it('should accept valid file', () => {
      const file = new File(['test'], 'test.webm', { type: 'audio/webm' });
      Object.defineProperty(file, 'size', { value: 1024 });
      
      const result = validateFile(file, {
        maxSize: 25 * 1024 * 1024,
        allowedTypes: ['audio/webm'],
      });
      
      expect(result.valid).toBe(true);
    })
  })

  describe('validateJSONStructure', () => {
    it('should validate structure', () => {
      const data = { name: 'test', age: 25 };
      const schema = {
        name: (v: unknown) => typeof v === 'string',
        age: (v: unknown) => typeof v === 'number',
      };
      
      expect(validateJSONStructure(data, schema)).toBe(true);
    })

    it('should reject invalid structure', () => {
      const data = { name: 'test' };
      const schema = {
        name: (v: unknown) => typeof v === 'string',
        age: (v: unknown) => typeof v === 'number',
      };
      
      expect(validateJSONStructure(data, schema)).toBe(false);
    })
  })
})

