/**
 * Post Endpoint
 * JSON Placeholder API post endpoint implementation
 */

import { AxiosResponse } from 'axios';
import { apiHelper } from '../helpers/ApiHelper';
import { logger } from '../../utils/logger/logger';

/**
 * Post interface
 */
export interface Post {
  id?: number;
  userId: number;
  title: string;
  body: string;
}

/**
 * PostEndpoint class
 * Provides methods for interacting with the posts endpoint
 */
export class PostEndpoint {
  private readonly baseEndpoint: string = '/posts';
  
  /**
   * Get all posts
   * @returns Promise resolving to list of posts
   */
  public async getAll(): Promise<AxiosResponse<Post[]>> {
    logger.info('Getting all posts');
    return apiHelper.get<Post[]>(this.baseEndpoint);
  }
  
  /**
   * Get post by ID
   * @param id Post ID
   * @returns Promise resolving to post
   */
  public async getById(id: number): Promise<AxiosResponse<Post>> {
    logger.info(`Getting post by ID: ${id}`);
    return apiHelper.get<Post>(`${this.baseEndpoint}/${id}`);
  }
  
  /**
   * Get posts by user ID
   * @param userId User ID
   * @returns Promise resolving to list of posts
   */
  public async getByUserId(userId: number): Promise<AxiosResponse<Post[]>> {
    logger.info(`Getting posts by user ID: ${userId}`);
    return apiHelper.get<Post[]>(`${this.baseEndpoint}?userId=${userId}`);
  }
  
  /**
   * Create post
   * @param post Post data
   * @returns Promise resolving to created post
   */
  public async create(post: Post): Promise<AxiosResponse<Post>> {
    logger.info('Creating post', { postData: post });
    return apiHelper.post<Post>(this.baseEndpoint, post);
  }
  
  /**
   * Update post
   * @param id Post ID
   * @param post Post data
   * @returns Promise resolving to updated post
   */
  public async update(id: number, post: Post): Promise<AxiosResponse<Post>> {
    logger.info(`Updating post: ${id}`, { postData: post });
    return apiHelper.put<Post>(`${this.baseEndpoint}/${id}`, post);
  }
  
  /**
   * Partially update post
   * @param id Post ID
   * @param postData Partial post data
   * @returns Promise resolving to updated post
   */
  public async patch(id: number, postData: Partial<Post>): Promise<AxiosResponse<Post>> {
    logger.info(`Patching post: ${id}`, { postData });
    return apiHelper.patch<Post>(`${this.baseEndpoint}/${id}`, postData);
  }
  
  /**
   * Delete post
   * @param id Post ID
   * @returns Promise resolving to deleted response
   */
  public async delete(id: number): Promise<AxiosResponse<{}>> {
    logger.info(`Deleting post: ${id}`);
    return apiHelper.delete(`${this.baseEndpoint}/${id}`);
  }
  
  /**
   * Get comments for post
   * @param postId Post ID
   * @returns Promise resolving to list of comments
   */
  public async getComments(postId: number): Promise<AxiosResponse<any[]>> {
    logger.info(`Getting comments for post: ${postId}`);
    return apiHelper.get<any[]>(`${this.baseEndpoint}/${postId}/comments`);
  }
}

// Export singleton instance
export const postEndpoint = new PostEndpoint();