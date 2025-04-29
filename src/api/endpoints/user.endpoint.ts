import { apiHelper, ApiResponse } from '../helpers/api.helper';
import { apiVariableManager } from '../utils/api.variable.manager';
import { logger } from '../../core/logger';
import { allureReporter } from '../../core/reporter/allure.reporter';

/**
 * User address geo coordinates model
 */
export interface UserGeo {
  lat: string;
  lng: string;
}

/**
 * User address model
 */
export interface UserAddress {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: UserGeo;
}

/**
 * User company model
 */
export interface UserCompany {
  name: string;
  catchPhrase: string;
  bs: string;
}

/**
 * User model for the JSONPlaceholder API
 */
export interface User {
  id?: number;
  name: string;
  username: string;
  email: string;
  address: UserAddress;
  phone: string;
  website: string;
  company: UserCompany;
}

/**
 * Post for the user
 */
export interface UserPost {
  id?: number;
  userId: number;
  title: string;
  body: string;
}

/**
 * User endpoint class for the JSONPlaceholder API
 * Implements user-related API operations
 */
export class UserEndpoint {
  private readonly baseEndpoint = '/users';

  /**
   * Get all users
   * @returns Promise resolving to the API response
   */
  public async getAllUsers(): Promise<ApiResponse<User[]>> {
    logger.info('Getting all users');
    allureReporter.startStep('Get all users');
    
    try {
      const response = await apiHelper.get<User[]>(this.baseEndpoint);
      
      // Store the first user ID for future use
      if (response.data && response.data.length > 0) {
        const firstUserId = response.data[0].id?.toString() || '';
        apiVariableManager.setVariable('firstUserId', firstUserId);
        logger.info(`Stored first user ID: ${firstUserId}`);
      }
      
      allureReporter.endStep('passed');
      return response;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Get a user by ID
   * @param userId User ID
   * @returns Promise resolving to the API response
   */
  public async getUserById(userId: string | number): Promise<ApiResponse<User>> {
    logger.info(`Getting user by ID: ${userId}`);
    allureReporter.startStep(`Get user by ID: ${userId}`);
    
    try {
      const response = await apiHelper.get<User>(`${this.baseEndpoint}/${userId}`);
      allureReporter.endStep('passed');
      return response;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Create a new user
   * @param userData User data
   * @returns Promise resolving to the API response
   */
  public async createUser(userData: User): Promise<ApiResponse<User>> {
    logger.info(`Creating new user: ${userData.name}`);
    allureReporter.startStep('Create new user');
    
    try {
      const response = await apiHelper.post<User>(this.baseEndpoint, userData);
      
      // Store the new user data for future use
      if (response.data && response.data.id) {
        apiVariableManager.setVariable('newUserId', response.data.id.toString());
        apiVariableManager.storeObject('newUser', response.data);
        logger.info(`Stored new user data with ID: ${response.data.id}`);
      }
      
      allureReporter.endStep('passed');
      return response;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Update a user
   * @param userId User ID
   * @param userData Updated user data
   * @returns Promise resolving to the API response
   */
  public async updateUser(userId: string | number, userData: Partial<User>): Promise<ApiResponse<User>> {
    logger.info(`Updating user with ID: ${userId}`);
    allureReporter.startStep(`Update user: ${userId}`);
    
    try {
      const response = await apiHelper.put<User>(`${this.baseEndpoint}/${userId}`, userData);
      allureReporter.endStep('passed');
      return response;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Patch a user (partial update)
   * @param userId User ID
   * @param userData Partial user data to update
   * @returns Promise resolving to the API response
   */
  public async patchUser(userId: string | number, userData: Partial<User>): Promise<ApiResponse<User>> {
    logger.info(`Patching user with ID: ${userId}`);
    allureReporter.startStep(`Patch user: ${userId}`);
    
    try {
      const response = await apiHelper.patch<User>(`${this.baseEndpoint}/${userId}`, userData);
      allureReporter.endStep('passed');
      return response;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Delete a user
   * @param userId User ID
   * @returns Promise resolving to the API response
   */
  public async deleteUser(userId: string | number): Promise<ApiResponse<any>> {
    logger.info(`Deleting user with ID: ${userId}`);
    allureReporter.startStep(`Delete user: ${userId}`);
    
    try {
      const response = await apiHelper.delete(`${this.baseEndpoint}/${userId}`);
      allureReporter.endStep('passed');
      return response;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Get posts by user
   * @param userId User ID
   * @returns Promise resolving to the API response with user's posts
   */
  public async getUserPosts(userId: string | number): Promise<ApiResponse<UserPost[]>> {
    logger.info(`Getting posts for user with ID: ${userId}`);
    allureReporter.startStep(`Get posts for user: ${userId}`);
    
    try {
      const response = await apiHelper.get<UserPost[]>(`${this.baseEndpoint}/${userId}/posts`);
      allureReporter.endStep('passed');
      return response;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Get todos by user
   * @param userId User ID
   * @returns Promise resolving to the API response with user's todos
   */
  public async getUserTodos(userId: string | number): Promise<ApiResponse<any[]>> {
    logger.info(`Getting todos for user with ID: ${userId}`);
    allureReporter.startStep(`Get todos for user: ${userId}`);
    
    try {
      const response = await apiHelper.get<any[]>(`${this.baseEndpoint}/${userId}/todos`);
      allureReporter.endStep('passed');
      return response;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Get albums by user
   * @param userId User ID
   * @returns Promise resolving to the API response with user's albums
   */
  public async getUserAlbums(userId: string | number): Promise<ApiResponse<any[]>> {
    logger.info(`Getting albums for user with ID: ${userId}`);
    allureReporter.startStep(`Get albums for user: ${userId}`);
    
    try {
      const response = await apiHelper.get<any[]>(`${this.baseEndpoint}/${userId}/albums`);
      allureReporter.endStep('passed');
      return response;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
}

// Create singleton instance
export const userEndpoint = new UserEndpoint();