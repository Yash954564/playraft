/**
 * Logger
 * Centralized logging utility
 */

import winston, { Logger as WinstonLogger, format } from 'winston';
import path from 'path';
import fs from 'fs';
import { testConfig } from '../../config/testConfig';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(logColors);

/**
 * Logger options
 */
interface LoggerOptions {
  logLevel: string;
  logToConsole: boolean;
  logToFile: boolean;
  logDirectory: string;
  testName?: string;
}

/**
 * Logger class
 * Provides centralized logging functionality
 */
class Logger {
  private logger: WinstonLogger;
  private initialized: boolean = false;
  private logFilePath: string;
  private testName: string;

  /**
   * Constructor
   */
  constructor() {
    // Set default options
    const options = this.getDefaultOptions();
    
    // Set test name
    this.testName = options.testName || 'test';
    
    // Ensure log directory exists
    this.ensureLogDirectoryExists(options.logDirectory);
    
    // Set log file path
    this.logFilePath = path.join(
      options.logDirectory,
      `${this.testName}-${this.getFormattedDate()}.log`
    );
    
    // Create transports array
    const transports = [];
    
    // Add console transport if enabled
    if (options.logToConsole) {
      transports.push(
        new winston.transports.Console({
          format: format.combine(
            format.colorize({ all: true }),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(
              (info) => `${info.timestamp} ${info.level}: ${info.message}${
                info.meta ? `\n${JSON.stringify(info.meta, null, 2)}` : ''
              }`
            )
          ),
        })
      );
    }
    
    // Add file transport if enabled
    if (options.logToFile) {
      transports.push(
        new winston.transports.File({
          filename: this.logFilePath,
          format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(
              (info) => `${info.timestamp} ${info.level}: ${info.message}${
                info.meta ? `\n${JSON.stringify(info.meta, null, 2)}` : ''
              }`
            )
          ),
        })
      );
    }
    
    // Create logger
    this.logger = winston.createLogger({
      level: options.logLevel,
      levels: logLevels,
      transports,
    });
    
    // Set initialized flag
    this.initialized = true;
    
    // Log initialization
    this.info('Logger initialized');
  }

  /**
   * Get default options
   * @returns Logger options
   */
  private getDefaultOptions(): LoggerOptions {
    return {
      logLevel: testConfig.logger.level,
      logToConsole: testConfig.logger.logToConsole,
      logToFile: testConfig.logger.logToFile,
      logDirectory: testConfig.logger.logPath,
    };
  }

  /**
   * Ensure log directory exists
   * @param directory Log directory
   */
  private ensureLogDirectoryExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  /**
   * Get formatted date
   * @returns Formatted date string
   */
  private getFormattedDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  }
  
  /**
   * Format message with meta data
   * @param message Log message
   * @param meta Optional meta data
   * @returns Formatted message
   */
  private formatMessage(message: string, meta?: any): { message: string, meta?: any } {
    if (meta) {
      return { message, meta };
    }
    
    return { message };
  }

  /**
   * Log error message
   * @param message Error message
   * @param meta Optional meta data
   */
  public error(message: string, meta?: any): void {
    if (!this.initialized) return;
    this.logger.error(this.formatMessage(message, meta));
  }

  /**
   * Log warning message
   * @param message Warning message
   * @param meta Optional meta data
   */
  public warn(message: string, meta?: any): void {
    if (!this.initialized) return;
    this.logger.warn(this.formatMessage(message, meta));
  }

  /**
   * Log info message
   * @param message Info message
   * @param meta Optional meta data
   */
  public info(message: string, meta?: any): void {
    if (!this.initialized) return;
    this.logger.info(this.formatMessage(message, meta));
  }

  /**
   * Log HTTP message
   * @param message HTTP message
   * @param meta Optional meta data
   */
  public http(message: string, meta?: any): void {
    if (!this.initialized) return;
    this.logger.http(this.formatMessage(message, meta));
  }

  /**
   * Log debug message
   * @param message Debug message
   * @param meta Optional meta data
   */
  public debug(message: string, meta?: any): void {
    if (!this.initialized) return;
    this.logger.debug(this.formatMessage(message, meta));
  }
  
  /**
   * Set test name
   * @param testName Test name
   */
  public setTestName(testName: string): void {
    this.testName = testName;
  }
  
  /**
   * Get log file path
   * @returns Log file path
   */
  public getLogFilePath(): string {
    return this.logFilePath;
  }
}

// Export logger instance
export const logger = new Logger();