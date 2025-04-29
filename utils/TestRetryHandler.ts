/**
 * Test Retry Handler
 * Handles retrying operations with exponential backoff and jitter
 */

import { logger } from './logger/logger';
import { testConfig } from '../config/testConfig';

/**
 * Retry options for test retry handler
 */
interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
  jitter?: boolean;
  retryCondition?: (error: Error) => boolean;
}

/**
 * Test Retry Handler class
 * Provides methods for retrying operations with exponential backoff and jitter
 */
export class TestRetryHandler {
  /**
   * Retry with exponential backoff and optional jitter
   * @param fn Function to retry
   * @param options Retry options
   * @returns Promise resolving to result of function
   */
  public async retryWithBackoff<T>(
    fn: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> {
    // Set default options
    const maxRetries = options?.maxRetries ?? testConfig.api.maxRetries;
    const initialDelay = options?.initialDelay ?? testConfig.retryDelay;
    const maxDelay = options?.maxDelay ?? 30000; // 30 seconds
    const factor = options?.factor ?? 2;
    const jitter = options?.jitter ?? true;
    const retryCondition = options?.retryCondition ?? (() => true);
    
    // Initialize retry counter
    let retryCount = 0;
    
    // Start retry loop
    while (true) {
      try {
        // Execute function
        return await fn();
      } catch (error) {
        // Check if max retries reached
        if (retryCount >= maxRetries) {
          logger.error('Operation failed after ' + maxRetries + ' retries', { error: String(error) });
          throw error;
        }
        
        // Check if error should be retried
        if (!retryCondition(error as Error)) {
          logger.error('Operation failed with non-retryable error', { error: String(error) });
          throw error;
        }
        
        // Increment retry counter
        retryCount++;
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          maxDelay,
          initialDelay * Math.pow(factor, retryCount - 1)
        );
        
        // Add jitter if enabled (between 80% and 100% of delay)
        const actualDelay = jitter ? delay * (0.8 + Math.random() * 0.2) : delay;
        
        // Log retry attempt
        logger.warn(
          `Retry attempt ${retryCount} of ${maxRetries} after ${actualDelay}ms delay`,
          { error: String(error) }
        );
        
        // Wait for delay
        await new Promise(resolve => setTimeout(resolve, actualDelay));
      }
    }
  }

  /**
   * Retry on specific error types
   * @param fn Function to retry
   * @param errorTypes Array of error types to retry on
   * @param options Retry options
   * @returns Promise resolving to result of function
   */
  public async retryOnSpecificErrors<T>(
    fn: () => Promise<T>,
    errorTypes: Array<string | RegExp>,
    options?: RetryOptions
  ): Promise<T> {
    return this.retryWithBackoff(fn, {
      ...options,
      retryCondition: (error: Error) => {
        if (!error) return false;
        
        const errorMessage = error.message || '';
        
        // Check if error matches any of the specified error types
        return errorTypes.some(errorType => {
          if (typeof errorType === 'string') {
            return errorMessage.includes(errorType);
          } else {
            return errorType.test(errorMessage);
          }
        });
      },
    });
  }

  /**
   * Retry on network errors
   * @param fn Function to retry
   * @param options Retry options
   * @returns Promise resolving to result of function
   */
  public async retryOnNetworkErrors<T>(
    fn: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> {
    return this.retryOnSpecificErrors(
      fn,
      [
        'ECONNRESET',
        'ETIMEDOUT',
        'ECONNREFUSED',
        'EPIPE',
        'EHOSTUNREACH',
        'ENETUNREACH',
        'ENOTFOUND',
        'socket hang up',
        'network error',
        'Network Error',
        'Connection reset',
        'Connection refused',
        'connection failure',
        /^5\d\d$/, // 5xx errors
        'timeout',
        'Timeout',
        'aborted',
        'socket disconnected',
        'Cannot connect',
        'connection closed',
      ],
      options
    );
  }

  /**
   * Retry on rate limit errors
   * @param fn Function to retry
   * @param options Retry options
   * @returns Promise resolving to result of function
   */
  public async retryOnRateLimitErrors<T>(
    fn: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> {
    return this.retryOnSpecificErrors(
      fn,
      [
        'rate limit',
        'Rate limit',
        'ratelimit',
        'RateLimit',
        'Too Many Requests',
        'too many requests',
        '429',
        'quota',
        'Quota',
        'exceeded',
        'Exceeded',
        'throttled',
        'Throttled',
      ],
      options
    );
  }

  /**
   * Wait for condition with timeout
   * @param condition Function that returns a promise resolving to a boolean
   * @param timeout Timeout in milliseconds
   * @param interval Interval between checks in milliseconds
   * @param timeoutMessage Timeout message
   * @returns Promise resolving when condition is true
   */
  public async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = 30000,
    interval: number = 500,
    timeoutMessage: string = 'Condition timeout'
  ): Promise<void> {
    // Set start time
    const startTime = Date.now();
    
    // Check condition in a loop
    while (Date.now() - startTime < timeout) {
      try {
        // Check condition
        if (await condition()) {
          return;
        }
      } catch (error) {
        logger.warn('Error checking condition', { error: String(error) });
      }
      
      // Wait for interval
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    // Timeout
    throw new Error(timeoutMessage || `Timed out after ${timeout}ms waiting for condition`);
  }
}

// Export default instance
export const testRetryHandler = new TestRetryHandler();