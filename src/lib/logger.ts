/**
 * Structured Logging with Winston
 * Production-ready logging with JSON output and log levels
 */

import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Custom format for production (JSON) and development (readable)
const logFormat = process.env.NODE_ENV === 'production'
  ? winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    )
  : winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
      })
    );

// Create logger instance
export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: {
    service: 'blur-gtm-training',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport (always enabled)
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
    // File transport for errors (production)
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
        ]
      : []),
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Stream for HTTP request logging
export const httpLogger = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Helper functions for structured logging
export const logContext = {
  request: (req: { method: string; url: string; ip?: string }) => ({
    type: 'http_request',
    method: req.method,
    url: req.url,
    ip: req.ip,
  }),
  error: (error: Error, context?: Record<string, any>) => ({
    type: 'error',
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...context,
  }),
  performance: (operation: string, duration: number, metadata?: Record<string, any>) => ({
    type: 'performance',
    operation,
    duration,
    ...metadata,
  }),
  security: (event: string, details: Record<string, any>) => ({
    type: 'security',
    event,
    ...details,
  }),
};

// Export convenience methods
export const log = {
  error: (message: string, error?: Error, context?: Record<string, any>) => {
    logger.error(message, { ...logContext.error(error || new Error(message), context) });
  },
  warn: (message: string, context?: Record<string, any>) => {
    logger.warn(message, context);
  },
  info: (message: string, context?: Record<string, any>) => {
    logger.info(message, context);
  },
  debug: (message: string, context?: Record<string, any>) => {
    logger.debug(message, context);
  },
  http: (message: string, req: { method: string; url: string; ip?: string }) => {
    logger.info(message, logContext.request(req));
  },
  performance: (operation: string, duration: number, metadata?: Record<string, any>) => {
    logger.info(`Performance: ${operation}`, logContext.performance(operation, duration, metadata));
  },
  security: (event: string, details: Record<string, any>) => {
    logger.warn(`Security: ${event}`, logContext.security(event, details));
  },
};

// Generate unique request ID for tracing
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export default logger;

