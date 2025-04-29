/**
 * Custom error class for API errors with enhanced information
 */
export class ApiError extends Error {
  /**
   * HTTP status code of the error response
   */
  public statusCode: number;
  
  /**
   * Response data from the error
   */
  public responseData: any;
  
  /**
   * Original error object
   */
  public originalError: any;

  /**
   * Constructs a new ApiError instance
   * 
   * @param message Error message
   * @param statusCode HTTP status code
   * @param responseData Response data
   * @param originalError Original error object
   */
  constructor(message: string, statusCode: number, responseData: any, originalError?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.responseData = responseData;
    this.originalError = originalError;
    
    // Ensures proper stack trace in Node.js
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Gets a formatted string representation of the error
   * @returns Formatted error string
   */
  public toString(): string {
    return `ApiError: ${this.message} (Status: ${this.statusCode})`;
  }

  /**
   * Checks if the error is a client error (4xx)
   * @returns True if error is a client error
   */
  public isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Checks if the error is a server error (5xx)
   * @returns True if error is a server error
   */
  public isServerError(): boolean {
    return this.statusCode >= 500 && this.statusCode < 600;
  }

  /**
   * Checks if the error is an authentication error (401)
   * @returns True if error is an authentication error
   */
  public isAuthError(): boolean {
    return this.statusCode === 401;
  }

  /**
   * Checks if the error is a forbidden error (403)
   * @returns True if error is a forbidden error
   */
  public isForbiddenError(): boolean {
    return this.statusCode === 403;
  }

  /**
   * Checks if the error is a not found error (404)
   * @returns True if error is a not found error
   */
  public isNotFoundError(): boolean {
    return this.statusCode === 404;
  }

  /**
   * Checks if the error is a validation error (400)
   * @returns True if error is a validation error
   */
  public isValidationError(): boolean {
    return this.statusCode === 400;
  }
}