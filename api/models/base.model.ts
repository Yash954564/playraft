/**
 * Base Model interface
 * All API models should extend or implement this interface
 */
export interface BaseModel {
  /**
   * Convert model to JSON string
   * @returns JSON string representation of the model
   */
  toJSON(): string;
  
  /**
   * Convert model to plain object
   * @returns Plain object representation of the model
   */
  toObject(): Record<string, any>;
  
  /**
   * Validate model
   * @returns True if valid, false otherwise
   */
  validate(): boolean;
  
  /**
   * Get validation errors
   * @returns Array of validation error messages
   */
  getValidationErrors(): string[];
}

/**
 * Abstract Base Model class
 * Implements common functionality for all models
 */
export abstract class AbstractBaseModel implements BaseModel {
  /**
   * Protected array to store validation errors
   */
  protected validationErrors: string[] = [];
  
  /**
   * Convert model to JSON string
   * @returns JSON string representation of the model
   */
  public toJSON(): string {
    return JSON.stringify(this.toObject());
  }
  
  /**
   * Convert model to plain object
   * This should be implemented by child classes
   * @returns Plain object representation of the model
   */
  public abstract toObject(): Record<string, any>;
  
  /**
   * Validate model
   * This should be implemented by child classes
   * @returns True if valid, false otherwise
   */
  public abstract validate(): boolean;
  
  /**
   * Get validation errors
   * @returns Array of validation error messages
   */
  public getValidationErrors(): string[] {
    return [...this.validationErrors];
  }
  
  /**
   * Add validation error
   * @param error - Error message
   */
  protected addValidationError(error: string): void {
    this.validationErrors.push(error);
  }
  
  /**
   * Clear validation errors
   */
  protected clearValidationErrors(): void {
    this.validationErrors = [];
  }
  
  /**
   * Check if string is empty or null
   * @param value - String value to check
   * @returns True if empty or null, false otherwise
   */
  protected isEmpty(value: string | null | undefined): boolean {
    return value === null || value === undefined || value.trim() === '';
  }
  
  /**
   * Validate email format
   * @param email - Email to validate
   * @returns True if valid, false otherwise
   */
  protected isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validate password strength
   * @param password - Password to validate
   * @param minLength - Minimum length (default: 8)
   * @returns True if valid, false otherwise
   */
  protected isValidPassword(password: string, minLength: number = 8): boolean {
    // Check minimum length
    if (password.length < minLength) {
      return false;
    }
    
    // Must contain at least one uppercase letter, one lowercase letter, and one number
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    return hasUppercase && hasLowercase && hasNumber;
  }
  
  /**
   * Validate date format (YYYY-MM-DD)
   * @param date - Date string to validate
   * @returns True if valid, false otherwise
   */
  protected isValidDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return false;
    }
    
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  }
  
  /**
   * Validate UUID format
   * @param uuid - UUID string to validate
   * @returns True if valid, false otherwise
   */
  protected isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
  
  /**
   * Validate URL format
   * @param url - URL string to validate
   * @returns True if valid, false otherwise
   */
  protected isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Validate phone number format
   * @param phone - Phone number to validate
   * @returns True if valid, false otherwise
   */
  protected isValidPhoneNumber(phone: string): boolean {
    // Basic phone number validation (accepts various formats)
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone);
  }
}

/**
 * Type guard to check if an object is a BaseModel
 * @param obj - Object to check
 * @returns True if object is a BaseModel, false otherwise
 */
export function isBaseModel(obj: any): obj is BaseModel {
  return typeof obj.toJSON === 'function' &&
         typeof obj.toObject === 'function' &&
         typeof obj.validate === 'function' &&
         typeof obj.getValidationErrors === 'function';
}

// Export the BaseModel interface and AbstractBaseModel class
export default BaseModel;