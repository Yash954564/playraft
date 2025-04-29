import fs from 'fs';
import path from 'path';

/**
 * Logger utility to output logs to console and file
 * Equivalent to the RAFT_UI_TDD/Utilities/logger_utility.py
 */
export class Logger {
  private logDir: string;
  private logLevel: LogLevel;
  private currentDate: string;
  private logFilePath: string;
  
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.logLevel = LogLevel.INFO;
    this.currentDate = this.getFormattedDate();
    this.logFilePath = '';
    
    this.initializeLogger();
  }
  
  /**
   * Initialize logger by creating log directory and file
   */
  private initializeLogger(): void {
    try {
      // Create logs directory if it doesn't exist
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
      
      // Create date folder
      const dateDir = path.join(this.logDir, this.currentDate.split(' ')[0].replace(/-/g, ''));
      if (!fs.existsSync(dateDir)) {
        fs.mkdirSync(dateDir, { recursive: true });
      }
      
      // Create log file
      const timestamp = this.currentDate.split(' ')[1].replace(/:/g, '');
      this.logFilePath = path.join(dateDir, `RAFT_${this.currentDate.split(' ')[0].replace(/-/g, '')}-${timestamp}.log`);
      
      // Write header to log file
      fs.writeFileSync(this.logFilePath, `===== Log started at ${this.currentDate} =====\n\n`);
      
      this.info('Logger initialized');
    } catch (error) {
      console.error(`Failed to initialize logger: ${error}`);
    }
  }
  
  /**
   * Get formatted date string
   * @returns Formatted date string (YYYY-MM-DD HH:MM:SS)
   */
  private getFormattedDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  
  /**
   * Write log message to file and console
   * @param level - Log level
   * @param message - Log message
   * @param args - Additional arguments
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    try {
      if (level < this.logLevel) {
        return;
      }
      
      const timestamp = this.getFormattedDate();
      const levelStr = LogLevel[level].padEnd(5, ' ');
      let logMessage = `${timestamp} [${levelStr}] ${message}`;
      
      // Add additional args
      if (args.length > 0) {
        args.forEach(arg => {
          if (typeof arg === 'object') {
            logMessage += ` ${JSON.stringify(arg)}`;
          } else {
            logMessage += ` ${arg}`;
          }
        });
      }
      
      // Write to console
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(logMessage);
          break;
        case LogLevel.INFO:
          console.info(logMessage);
          break;
        case LogLevel.WARN:
          console.warn(logMessage);
          break;
        case LogLevel.ERROR:
          console.error(logMessage);
          break;
        default:
          console.log(logMessage);
      }
      
      // Write to file
      fs.appendFileSync(this.logFilePath, `${logMessage}\n`);
    } catch (error) {
      console.error(`Failed to write log: ${error}`);
    }
  }
  
  /**
   * Set log level
   * @param level - Log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
  
  /**
   * Log debug message
   * @param message - Log message
   * @param args - Additional arguments
   */
  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }
  
  /**
   * Log info message
   * @param message - Log message
   * @param args - Additional arguments
   */
  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }
  
  /**
   * Log warning message
   * @param message - Log message
   * @param args - Additional arguments
   */
  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }
  
  /**
   * Log error message
   * @param message - Log message
   * @param args - Additional arguments
   */
  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }
}

/**
 * Log levels enum
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// Export singleton instance
export const logger = new Logger();