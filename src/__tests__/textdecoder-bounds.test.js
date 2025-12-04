/**
 * Test TextDecoder polyfill bounds checking
 * Verifies that incomplete UTF-8 sequences don't cause out-of-bounds access
 */

describe('TextDecoder polyfill bounds checking', () => {
  let decoder;

  beforeEach(() => {
    // Create a fresh TextDecoder instance
    decoder = new TextDecoder();
  });

  it('should handle incomplete 2-byte UTF-8 sequence', () => {
    // Starts 2-byte sequence but missing second byte
    const bytes = new Uint8Array([0xc2]);
    const result = decoder.decode(bytes);
    
    // Should not throw and should use replacement character
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    // Should not contain NaN
    expect(result).not.toContain('NaN');
    // Should use replacement character (U+FFFD)
    expect(result.charCodeAt(0)).toBe(0xFFFD);
  });

  it('should handle incomplete 3-byte UTF-8 sequence (missing 2 bytes)', () => {
    // Starts 3-byte sequence but missing second and third bytes
    const bytes = new Uint8Array([0xe0]);
    const result = decoder.decode(bytes);
    
    expect(result).toBeDefined();
    expect(result).not.toContain('NaN');
    expect(result.charCodeAt(0)).toBe(0xFFFD);
  });

  it('should handle incomplete 3-byte UTF-8 sequence (missing 1 byte)', () => {
    // Starts 3-byte sequence but missing third byte
    const bytes = new Uint8Array([0xe0, 0xa0]);
    const result = decoder.decode(bytes);
    
    expect(result).toBeDefined();
    expect(result).not.toContain('NaN');
    expect(result.charCodeAt(0)).toBe(0xFFFD);
  });

  it('should handle incomplete 4-byte UTF-8 sequence (missing 3 bytes)', () => {
    // Starts 4-byte sequence but missing second, third, and fourth bytes
    const bytes = new Uint8Array([0xf0]);
    const result = decoder.decode(bytes);
    
    expect(result).toBeDefined();
    expect(result).not.toContain('NaN');
    expect(result.charCodeAt(0)).toBe(0xFFFD);
  });

  it('should handle incomplete 4-byte UTF-8 sequence (missing 2 bytes)', () => {
    // Starts 4-byte sequence but missing third and fourth bytes
    const bytes = new Uint8Array([0xf0, 0x90]);
    const result = decoder.decode(bytes);
    
    expect(result).toBeDefined();
    expect(result).not.toContain('NaN');
    expect(result.charCodeAt(0)).toBe(0xFFFD);
  });

  it('should handle incomplete 4-byte UTF-8 sequence (missing 1 byte)', () => {
    // Starts 4-byte sequence but missing fourth byte
    const bytes = new Uint8Array([0xf0, 0x90, 0x80]);
    const result = decoder.decode(bytes);
    
    expect(result).toBeDefined();
    expect(result).not.toContain('NaN');
    expect(result.charCodeAt(0)).toBe(0xFFFD);
  });

  it('should correctly decode valid UTF-8 sequences', () => {
    // Valid 2-byte sequence (non-breaking space)
    const bytes2 = new Uint8Array([0xc2, 0xa0]);
    const result2 = decoder.decode(bytes2);
    expect(result2.charCodeAt(0)).toBe(0x00A0);
    
    // Valid 3-byte sequence
    const bytes3 = new Uint8Array([0xe0, 0xa0, 0x80]);
    const result3 = decoder.decode(bytes3);
    expect(result3.charCodeAt(0)).toBe(0x0800);
    
    // Valid 4-byte sequence (U+10000) - requires surrogate pair
    const bytes4 = new Uint8Array([0xf0, 0x90, 0x80, 0x80]);
    const result4 = decoder.decode(bytes4);
    // 4-byte sequences produce surrogate pairs, so check both characters
    expect(result4.length).toBe(2);
    const high = result4.charCodeAt(0);
    const low = result4.charCodeAt(1);
    // Reconstruct code point from surrogate pair
    const codePoint = (high - 0xD800) * 0x400 + (low - 0xDC00) + 0x10000;
    expect(codePoint).toBe(0x10000);
  });

  it('should handle mixed valid and invalid sequences', () => {
    // Mix of valid ASCII, incomplete sequence, and valid UTF-8
    const bytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0xc2, 0x20]);
    const result = decoder.decode(bytes);
    
    expect(result).toBeDefined();
    expect(result).not.toContain('NaN');
    // Should decode "Hello" correctly
    expect(result.substring(0, 5)).toBe('Hello');
  });

  it('should not access out-of-bounds array indices', () => {
    // This test verifies no undefined access occurs
    const incompleteBytes = [
      new Uint8Array([0xc2]), // Incomplete 2-byte
      new Uint8Array([0xe0]), // Incomplete 3-byte
      new Uint8Array([0xe0, 0xa0]), // Incomplete 3-byte
      new Uint8Array([0xf0]), // Incomplete 4-byte
      new Uint8Array([0xf0, 0x90]), // Incomplete 4-byte
      new Uint8Array([0xf0, 0x90, 0x80]), // Incomplete 4-byte
    ];

    incompleteBytes.forEach((bytes, index) => {
      expect(() => {
        const result = decoder.decode(bytes);
        // Verify no NaN characters
        Array.from(result).forEach((char, charIndex) => {
          const code = char.charCodeAt(0);
          expect(isNaN(code)).toBe(false);
          expect(code).not.toBeUndefined();
        });
      }).not.toThrow();
    });
  });
});

