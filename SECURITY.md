# Security Enhancements

This document outlines the security measures implemented in the Cursor GTM Training Platform.

## Security Features Implemented

### 1. Rate Limiting
- **API Routes**: 20 requests per minute per IP address
- **Automatic Cleanup**: Old rate limit records are cleaned up periodically
- **Headers**: Rate limit information is included in response headers
- **Status Code**: Returns 429 (Too Many Requests) when limit exceeded

### 2. Input Validation & Sanitization
- **Content-Type Validation**: All API routes validate Content-Type headers
- **Input Sanitization**: All user inputs are sanitized to prevent injection attacks
- **Length Limits**: 
  - Text inputs: Max 5,000-10,000 characters
  - File uploads: Max 25MB
  - Conversation history: Max 50 messages
- **Null Byte Removal**: Prevents null byte injection
- **JSON Structure Validation**: Validates request body structure before processing

### 3. File Upload Security
- **File Type Validation**: Only allowed audio types (webm, mpeg, mp3, wav, ogg)
- **File Size Limits**: Maximum 25MB per file
- **Type Checking**: Validates file object before processing

### 4. Security Headers
All responses include security headers:
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Permissions-Policy` - Restricts browser features
- `Content-Security-Policy` - Controls resource loading
- `Strict-Transport-Security` - Forces HTTPS (in production)
- `X-DNS-Prefetch-Control` - Controls DNS prefetching

### 5. CORS Configuration
- **Configurable Origins**: Set via `ALLOWED_ORIGINS` environment variable
- **Preflight Handling**: Proper OPTIONS request handling
- **Secure Defaults**: Restrictive CORS policy by default

### 6. API Route Security
- **Content-Type Validation**: All routes validate Content-Type
- **Request Size Limits**: Implicit limits through validation
- **Error Handling**: Generic error messages to prevent information leakage
- **Input Sanitization**: All inputs sanitized before processing

### 7. Environment Variable Security
- **Server-Side Only**: API keys never exposed to client
- **Validation**: API key format validation
- **Secure Storage**: Use environment variables, never hardcode

### 8. Data Protection
- **Analytics Limits**: Maximum 10,000 events stored in memory
- **Response Limits**: API responses limited to prevent large payloads
- **Sanitized Logging**: Sensitive data not logged

### 9. Next.js Security Configuration
- **Powered-By Header**: Removed (X-Powered-By)
- **Compression**: Enabled for better performance
- **React Strict Mode**: Enabled for additional safety checks

## Security Best Practices

### For Developers

1. **Never commit API keys** - Use environment variables
2. **Validate all inputs** - Use the security utilities provided
3. **Sanitize user data** - Always sanitize before processing
4. **Limit response sizes** - Prevent large payload attacks
5. **Monitor rate limits** - Watch for abuse patterns

### Environment Variables

Required secure environment variables:
- `OPENAI_API_KEY` - Server-side only
- `ELEVENLABS_API_KEY` - Server-side only (optional)
- `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` - Public (safe to expose)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins (optional)

### Production Checklist

- [ ] All environment variables set securely
- [ ] HTTPS enabled
- [ ] Rate limiting configured appropriately
- [ ] CORS origins restricted to production domains
- [ ] Security headers verified
- [ ] File upload limits appropriate for use case
- [ ] Monitoring and logging enabled
- [ ] Regular security audits scheduled

## Security Utilities

The following utilities are available in `src/lib/security.ts`:

- `rateLimit()` - Rate limiting for API routes
- `sanitizeInput()` - Input sanitization
- `validateText()` - Text validation
- `validateFile()` - File validation
- `validateJSONStructure()` - JSON structure validation
- `getSecurityHeaders()` - Security headers generator
- `getCORSHeaders()` - CORS headers generator

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:
1. Do not open a public issue
2. Contact the security team directly
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before disclosure

## Security Testing

All security features are covered by unit tests:
- Input validation tests
- Rate limiting tests
- File validation tests
- Sanitization tests

Run tests with: `npm test`

