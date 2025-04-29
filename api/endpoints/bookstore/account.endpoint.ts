/**
 * Account Endpoint
 * Handles Book Store API account endpoints
 */

import { AxiosResponse } from 'axios';
import { ApiHelper, apiHelper } from '../../helpers/ApiHelper';
import { logger } from '../../../utils/logger/logger';

/**
 * User interface
 */
export interface User {
  userId: string;
  username: string;
  books: any[];
}

/**
 * Auth token interface
 */
export interface AuthToken {
  token: string;
  expires: string;
  status: string;
  result: string;
}

/**
 * Account Endpoint class
 * Provides methods for interacting with Book Store API account endpoints
 */
export class AccountEndpoint {
  private readonly apiHelper: ApiHelper;
  private readonly baseEndpoint: string = '/Account/v1';
  
  /**
   * Constructor
   * @param apiHelper API helper instance
   */
  constructor(apiHelper: ApiHelper) {
    this.apiHelper = apiHelper;
    logger.info('AccountEndpoint initialized');
  }
  
  /**
   * Create user
   * @param username Username
   * @param password Password
   * @returns Promise resolving to create user response
   */
  public async createUser(username: string, password: string): Promise<AxiosResponse<{ userID: string; username: string; books: any[] }>> {
    logger.info(`Creating user with username: ${username}`);
    
    // Create user payload
    const payload = {
      userName: username,
      password
    };
    
    return await this.apiHelper.post<{ userID: string; username: string; books: any[] }>(`${this.baseEndpoint}/User`, payload);
  }
  
  /**
   * Generate token
   * @param username Username
   * @param password Password
   * @returns Promise resolving to generate token response
   */
  public async generateToken(username: string, password: string): Promise<AxiosResponse<AuthToken>> {
    logger.info(`Generating token for username: ${username}`);
    
    // Generate token payload
    const payload = {
      userName: username,
      password
    };
    
    // Generate token
    const response = await this.apiHelper.post<AuthToken>(`${this.baseEndpoint}/GenerateToken`, payload);
    
    // Set auth token if successful
    if (response.data.status === 'Success') {
      this.apiHelper.setAuthToken(response.data.token);
    }
    
    return response;
  }
  
  /**
   * Authorize user
   * @param username Username
   * @param password Password
   * @returns Promise resolving to authorize user response
   */
  public async authorizeUser(username: string, password: string): Promise<AxiosResponse<boolean>> {
    logger.info(`Authorizing user with username: ${username}`);
    
    // Authorize user payload
    const payload = {
      userName: username,
      password
    };
    
    return await this.apiHelper.post<boolean>(`${this.baseEndpoint}/Authorized`, payload);
  }
  
  /**
   * Get user
   * @param userId User ID
   * @returns Promise resolving to user
   */
  public async getUser(userId: string): Promise<AxiosResponse<User>> {
    logger.info(`Getting user with ID: ${userId}`);
    
    // Set auth token if available
    const authToken = this.apiHelper.getAuthToken();
    if (!authToken) {
      logger.warn('No authentication token set for getUser');
    }
    
    return await this.apiHelper.get<User>(`${this.baseEndpoint}/User/${userId}`);
  }
  
  /**
   * Delete user
   * @param userId User ID
   * @returns Promise resolving to delete user response
   */
  public async deleteUser(userId: string): Promise<AxiosResponse<void>> {
    logger.info(`Deleting user with ID: ${userId}`);
    
    // Set auth token if available
    const authToken = this.apiHelper.getAuthToken();
    if (!authToken) {
      logger.warn('No authentication token set for deleteUser');
    }
    
    // Delete user
    const response = await this.apiHelper.delete<void>(`${this.baseEndpoint}/User/${userId}`);
    
    // Clear auth token after deleting user
    this.apiHelper.clearAuthToken();
    
    return response;
  }
}

// Export account endpoint instance
export const accountEndpoint = new AccountEndpoint(apiHelper);