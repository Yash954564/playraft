import * as winston from 'winston';
import * as fs from 'fs';
import * as path from 'path';
import { configReader } from '../utils/config.reader';

/**
 * Custom formatter for console logging
 * @param info Log information object
 * @returns Formatted log string
 */
const consoleFormat = winston.format.printf(({ level, message, timestamp }) => {
  const colorizedLevel = colorizeLevel(level);
  return `${timestamp} ${colorizedLevel}: ${message}`;
});

/**
 * Colorize log level for console output
 * @param level Log level
 * @returns Colorized log level
 */
function colorizeLevel(level: string): string {
  const colors: Record<string, string> = {
    error: '\x1b[31m', // Red
    warn: '\x1b[33m',  // Yellow
    info: '\x1b[36m',  // Cyan
    debug: '\x1b[32m', // Green
    silly: '\x1b[35m', // Magenta
    reset: '\x1b[0m',  // Reset
  };

  return `${colors[level] || ''}${level.toUpperCase()}${colors.reset}`;
}

/**
 * Advanced logger for the framework
 * Supports console and file logging with configurable levels
 */
class Logger {
  private logger: winston.Logger;
  private logsDir: string;
  private currentLogFilePath: string;

  constructor() {
    // Create logs directory if it doesn't exist
    this.logsDir = path.resolve(process.cwd(), 'reports', 'logs');
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }

    // Set log file path with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    this.currentLogFilePath = path.join(this.logsDir, `test-run-${timestamp}.log`);

    // Get log levels from config
    const consoleLogLevel = configReader.getEnv('CONSOLE_LOG_LEVEL', 'info');
    const fileLogLevel = configReader.getEnv('FILE_LOG_LEVEL', 'debug');

    // Configure Winston logger
    this.logger = winston.createLogger({
      level: 'debug', // Capture all logs up to this level
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: { service: 'playwright-test-framework' },
      transports: [
        // Console transport with custom format
        new winston.transports.Console({
          level: consoleLogLevel,
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            consoleFormat
          ),
        }),
        // File transport with JSON format
        new winston.transports.File({
          filename: this.currentLogFilePath,
          level: fileLogLevel,
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            winston.format.json()
          ),
        }),
      ],
    });

    this.info(`Logger initialized. Log file: ${this.currentLogFilePath}`);
  }

  /**
   * Log informational message
   * @param message Message to log
   * @param meta Additional metadata
   */
  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  /**
   * Log debug message
   * @param message Message to log
   * @param meta Additional metadata
   */
  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  /**
   * Log error message
   * @param message Message to log
   * @param meta Additional metadata (e.g., error object)
   */
  public error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  /**
   * Log warning message
   * @param message Message to log
   * @param meta Additional metadata
   */
  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  /**
   * Get current log file path
   * @returns Log file path
   */
  public getLogFilePath(): string {
    return this.currentLogFilePath;
  }

  /**
   * Get logs directory path
   * @returns Logs directory path
   */
  public getLogsDir(): string {
    return this.logsDir;
  }

  /**
   * Add step to log (for test steps)
   * @param step Step name
   */
  public step(step: string): void {
    this.info(`[STEP] ${step}`);
  }

  /**
   * Log test start
   * @param testName Test name
   */
  public testStart(testName: string): void {
    this.info(`[TEST START] ${testName}`, { test: testName, event: 'start' });
  }

  /**
   * Log test end
   * @param testName Test name
   * @param status Test status
   * @param duration Test duration in milliseconds
   */
  public testEnd(testName: string, status: 'passed' | 'failed' | 'skipped', duration?: number): void {
    this.info(`[TEST END] ${testName} - ${status.toUpperCase()}${duration ? ` (${duration}ms)` : ''}`, {
      test: testName,
      event: 'end',
      status,
      duration,
    });
  }

  /**
   * Log test failure
   * @param testName Test name
   * @param error Error object or message
   */
  public testFailed(testName: string, error: Error | string): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    this.error(`[TEST FAILED] ${testName} - ${errorMessage}`, {
      test: testName,
      event: 'failed',
      error: errorMessage,
      stack: errorStack,
    });
  }

  /**
   * Log API request
   * @param method HTTP method
   * @param url Request URL
   * @param headers Request headers
   * @param body Request body
   */
  public apiRequest(method: string, url: string, headers?: Record<string, string>, body?: any): void {
    this.debug(`[API REQUEST] ${method} ${url}`, {
      type: 'api_request',
      method,
      url,
      headers,
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
  }

  /**
   * Log API response
   * @param method HTTP method
   * @param url Request URL
   * @param status HTTP status code
   * @param headers Response headers
   * @param body Response body
   * @param duration Response time in milliseconds
   */
  public apiResponse(
    method: string,
    url: string,
    status: number,
    headers?: Record<string, string>,
    body?: any,
    duration?: number
  ): void {
    this.debug(`[API RESPONSE] ${method} ${url} - ${status}${duration ? ` (${duration}ms)` : ''}`, {
      type: 'api_response',
      method,
      url,
      status,
      headers,
      body: typeof body === 'string' ? body : JSON.stringify(body),
      duration,
    });
  }

  /**
   * Log browser action
   * @param action Action name
   * @param selector Element selector
   * @param details Additional details
   */
  public browserAction(action: string, selector?: string, details?: any): void {
    this.debug(`[BROWSER] ${action}${selector ? ` - ${selector}` : ''}${details ? ` - ${JSON.stringify(details)}` : ''}`, {
      type: 'browser_action',
      action,
      selector,
      details,
    });
  }
}

// Create singleton instance
export const logger = new Logger();