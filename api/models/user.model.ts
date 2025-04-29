import { AbstractBaseModel } from './base.model';

/**
 * User role enum
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

/**
 * User status enum
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  LOCKED = 'locked'
}

/**
 * User model interface
 */
export interface IUser {
  id?: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  phone?: string;
  profileImage?: string;
  isEmailVerified?: boolean;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    notifications?: boolean;
    twoFactorAuth?: boolean;
  };
}

/**
 * User model class
 * Represents a user in the system
 */
export class User extends AbstractBaseModel implements IUser {
  public id?: string;
  public username: string;
  public email: string;
  public firstName?: string;
  public lastName?: string;
  public role?: UserRole = UserRole.USER;
  public status?: UserStatus = UserStatus.ACTIVE;
  public password?: string;
  public createdAt?: Date;
  public updatedAt?: Date;
  public lastLoginAt?: Date;
  public address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  public phone?: string;
  public profileImage?: string;
  public isEmailVerified?: boolean = false;
  public preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    notifications?: boolean;
    twoFactorAuth?: boolean;
  };
  
  /**
   * Constructor
   * @param data - User data
   */
  constructor(data: Partial<IUser>) {
    super();
    this.id = data.id;
    this.username = data.username || '';
    this.email = data.email || '';
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.role = data.role || UserRole.USER;
    this.status = data.status || UserStatus.ACTIVE;
    this.password = data.password;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.lastLoginAt = data.lastLoginAt;
    this.address = data.address;
    this.phone = data.phone;
    this.profileImage = data.profileImage;
    this.isEmailVerified = data.isEmailVerified !== undefined ? data.isEmailVerified : false;
    this.preferences = data.preferences;
  }
  
  /**
   * Convert model to plain object
   * @returns Plain object representation of the model
   */
  public toObject(): Record<string, any> {
    const obj: Record<string, any> = {
      username: this.username,
      email: this.email
    };
    
    // Add optional properties if they exist
    if (this.id) obj.id = this.id;
    if (this.firstName) obj.firstName = this.firstName;
    if (this.lastName) obj.lastName = this.lastName;
    if (this.role) obj.role = this.role;
    if (this.status) obj.status = this.status;
    if (this.password) obj.password = this.password;
    if (this.createdAt) obj.createdAt = this.createdAt.toISOString();
    if (this.updatedAt) obj.updatedAt = this.updatedAt.toISOString();
    if (this.lastLoginAt) obj.lastLoginAt = this.lastLoginAt.toISOString();
    if (this.address) obj.address = this.address;
    if (this.phone) obj.phone = this.phone;
    if (this.profileImage) obj.profileImage = this.profileImage;
    if (this.isEmailVerified !== undefined) obj.isEmailVerified = this.isEmailVerified;
    if (this.preferences) obj.preferences = this.preferences;
    
    return obj;
  }
  
  /**
   * Validate model
   * @returns True if valid, false otherwise
   */
  public validate(): boolean {
    // Clear previous validation errors
    this.clearValidationErrors();
    
    // Validate required fields
    if (this.isEmpty(this.username)) {
      this.addValidationError('Username is required');
    } else if (this.username.length < 3) {
      this.addValidationError('Username must be at least 3 characters long');
    }
    
    if (this.isEmpty(this.email)) {
      this.addValidationError('Email is required');
    } else if (!this.isValidEmail(this.email)) {
      this.addValidationError('Email is invalid');
    }
    
    // Validate password if provided
    if (this.password && !this.isValidPassword(this.password)) {
      this.addValidationError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
    }
    
    // Validate phone if provided
    if (this.phone && !this.isValidPhoneNumber(this.phone)) {
      this.addValidationError('Phone number is invalid');
    }
    
    // Validate profile image URL if provided
    if (this.profileImage && !this.isValidURL(this.profileImage)) {
      this.addValidationError('Profile image URL is invalid');
    }
    
    // Return true if no validation errors
    return this.validationErrors.length === 0;
  }
  
  /**
   * Get full name
   * @returns Full name
   */
  public getFullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    } else if (this.firstName) {
      return this.firstName;
    } else if (this.lastName) {
      return this.lastName;
    } else {
      return this.username;
    }
  }
  
  /**
   * Check if user is admin
   * @returns True if user is admin, false otherwise
   */
  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }
  
  /**
   * Check if user is active
   * @returns True if user is active, false otherwise
   */
  public isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }
  
  /**
   * Create user from JSON string
   * @param json - JSON string
   * @returns User instance
   */
  public static fromJSON(json: string): User {
    const data = JSON.parse(json);
    
    // Convert date strings to Date objects
    if (data.createdAt) data.createdAt = new Date(data.createdAt);
    if (data.updatedAt) data.updatedAt = new Date(data.updatedAt);
    if (data.lastLoginAt) data.lastLoginAt = new Date(data.lastLoginAt);
    
    return new User(data);
  }
}

// Export the User class, UserRole enum, and UserStatus enum
export default User;