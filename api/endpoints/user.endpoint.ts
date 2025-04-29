/**
 * User Endpoint
 * JSON Placeholder API user endpoint implementation
 */

import { AxiosResponse } from 'axios';
import { apiHelper } from '../helpers/ApiHelper';
import { logger } from '../../utils/logger/logger';

/**
 * User interface
 */
export interface User {
  id?: number;
  name: string;
  username: string;
  email: string;
  address?: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    }
  };
  phone?: string;
  website?: string;
  company?: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

/**
 * UserEndpoint class
 * Provides methods for interacting with the users endpoint
 */
export class UserEndpoint {
  private readonly baseEndpoint: string = '/users';
  
  /**
   * Get all users
   * @returns Promise resolving to list of users
   */
  public async getAll(): Promise<AxiosResponse<User[]>> {
    logger.info('Getting all users');
    return apiHelper.get<User[]>(this.baseEndpoint);
  }
  
  /**
   * Get user by ID
   * @param id User ID
   * @returns Promise resolving to user
   */
  public async getById(id: number): Promise<AxiosResponse<User>> {
    logger.info(`Getting user by ID: ${id}`);
    return apiHelper.get<User>(`${this.baseEndpoint}/${id}`);
  }
  
  /**
   * Create user
   * @param user User data
   * @returns Promise resolving to created user
   */
  public async create(user: User): Promise<AxiosResponse<User>> {
    logger.info('Creating user', { userData: user });
    return apiHelper.post<User>(this.baseEndpoint, user);
  }
  
  /**
   * Update user
   * @param id User ID
   * @param user User data
   * @returns Promise resolving to updated user
   */
  public async update(id: number, user: User): Promise<AxiosResponse<User>> {
    logger.info(`Updating user: ${id}`, { userData: user });
    return apiHelper.put<User>(`${this.baseEndpoint}/${id}`, user);
  }
  
  /**
   * Partially update user
   * @param id User ID
   * @param userData Partial user data
   * @returns Promise resolving to updated user
   */
  public async patch(id: number, userData: Partial<User>): Promise<AxiosResponse<User>> {
    logger.info(`Patching user: ${id}`, { userData });
    return apiHelper.patch<User>(`${this.baseEndpoint}/${id}`, userData);
  }
  
  /**
   * Delete user
   * @param id User ID
   * @returns Promise resolving to deleted response
   */
  public async delete(id: number): Promise<AxiosResponse<{}>> {
    logger.info(`Deleting user: ${id}`);
    return apiHelper.delete(`${this.baseEndpoint}/${id}`);
  }
  
  /**
   * Get posts by user
   * @param userId User ID
   * @returns Promise resolving to list of user posts
   */
  public async getPosts(userId: number): Promise<AxiosResponse<any[]>> {
    logger.info(`Getting posts for user: ${userId}`);
    return apiHelper.get<any[]>(`${this.baseEndpoint}/${userId}/posts`);
  }
  
  /**
   * Get todos by user
   * @param userId User ID
   * @returns Promise resolving to list of user todos
   */
  public async getTodos(userId: number): Promise<AxiosResponse<any[]>> {
    logger.info(`Getting todos for user: ${userId}`);
    return apiHelper.get<any[]>(`${this.baseEndpoint}/${userId}/todos`);
  }
  
  /**
   * Get albums by user
   * @param userId User ID
   * @returns Promise resolving to list of user albums
   */
  public async getAlbums(userId: number): Promise<AxiosResponse<any[]>> {
    logger.info(`Getting albums for user: ${userId}`);
    return apiHelper.get<any[]>(`${this.baseEndpoint}/${userId}/albums`);
  }
}

// Export singleton instance
export const userEndpoint = new UserEndpoint();