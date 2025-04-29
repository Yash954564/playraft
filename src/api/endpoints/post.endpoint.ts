import { apiHelper, ApiResponse } from '../helpers/api.helper';
import { apiVariableManager } from '../utils/api.variable.manager';
import { logger } from '../../core/logger';
import { allureReporter } from '../../core/reporter/allure.reporter';

/**
 * Post model for the JSONPlaceholder API
 */
export interface Post {
  id?: number;
  userId: number;
  title: string;
  body: string;
}

/**
 * Comment model for the JSONPlaceholder API
 */
export interface Comment {
  id?: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

/**
 * Post endpoint class for the JSONPlaceholder API
 * Implements post-related API operations
 */
export class PostEndpoint {
  private readonly baseEndpoint = '/posts';

  /**
   * Get all posts
   * @returns Promise resolving to the API response
   */
  public async getAllPosts(): Promise<ApiResponse<Post[]>> {
    logger.info('Getting all posts');
    allureReporter.startStep('Get all posts');
    
    try {
      const response = await apiHelper.get<Post[]>(this.baseEndpoint);
      
      // Store the first post ID for future use
      if (response.data && response.data.length > 0) {
        const firstPostId = response.data[0].id?.toString() || '';
        apiVariableManager.setVariable('firstPostId', firstPostId);
        logger.info(`Stored first post ID: ${firstPostId}`);
      }
      
      allureReporter.endStep('passed');
      return response;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Get a post by ID
   * @param postId Post ID
   * @returns Promise resolving to the API response
   */
  public async getPostById(postId: string | number): Promise<ApiResponse<Post>> {
    logger.info(`Getting post by ID: ${postId}`);
    allureReporter.startStep(`Get post by ID: ${postId}`);
    
    try {
      const response = await apiHelper.get<Post>(`${this.baseEndpoint}/${postId}`);
      allureReporter.endStep('passed');
      return response;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Get posts by user ID
   * @param userId User ID
   * @returns Promise resolving to the API response
   */
  public async getPostsByUserId(userId: string | number): Promise<ApiResponse<Post[]>> {
    logger.info(`Getting posts by user ID: ${userId}`);
    allureReporter.startStep(`Get posts by user ID: ${userId}`);
    
    try {
      const response = await apiHelper.get<Post[]>(`${this.baseEndpoint}?userId=${userId}`);
      allureReporter.endStep('passed');
      return response;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Create a new post
   * @param postData Post data
   * @returns Promise resolving to the API response
   */
  public async createPost(postData: Post): Promise<ApiResponse<Post>> {
    logger.info(`Creating new post: ${postData.title}`);
    allureReporter.startStep('Create new post');
    
    try {
      const response = await apiHelper.post<Post>(this.baseEndpoint, postData);
      
      // Store the new post data for future use
      if (response.data && response.data.id) {
        apiVariableManager.setVariable('newPostId', response.data.id.toString());
        apiVariableManager.storeObject('newPost', response.data);
        logger.info(`Stored new post data with ID: ${response.data.id}`);
      }
      
      allureReporter.endStep('passed');
      return response;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Update a post
   * @param postId Post ID
   * @param postData Updated post data
   * @returns Promise resolving to the API response
   */
  public async updatePost(postId: string | number, postData: Post): Promise<ApiResponse<Post>> {
    logger.info(`Updating post with ID: ${postId}`);
    allureReporter.startStep(`Update post: ${postId}`);
    
    try {
      const response = await apiHelper.put<Post>(`${this.baseEndpoint}/${postId}`, postData);
      allureReporter.endStep('passed');
      return response;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Patch a post (partial update)
   * @param postId Post ID
   * @param postData Partial post data to update
   * @returns Promise resolving to the API response
   */
  public async patchPost(postId: string | number, postData: Partial<Post>): Promise<ApiResponse<Post>> {
    logger.info(`Patching post with ID: ${postId}`);
    allureReporter.startStep(`Patch post: ${postId}`);
    
    try {
      const response = await apiHelper.patch<Post>(`${this.baseEndpoint}/${postId}`, postData);
      allureReporter.endStep('passed');
      return response;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Delete a post
   * @param postId Post ID
   * @returns Promise resolving to the API response
   */
  public async deletePost(postId: string | number): Promise<ApiResponse<any>> {
    logger.info(`Deleting post with ID: ${postId}`);
    allureReporter.startStep(`Delete post: ${postId}`);
    
    try {
      const response = await apiHelper.delete(`${this.baseEndpoint}/${postId}`);
      allureReporter.endStep('passed');
      return response;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Get comments for a post
   * @param postId Post ID
   * @returns Promise resolving to the API response
   */
  public async getPostComments(postId: string | number): Promise<ApiResponse<Comment[]>> {
    logger.info(`Getting comments for post with ID: ${postId}`);
    allureReporter.startStep(`Get comments for post: ${postId}`);
    
    try {
      const response = await apiHelper.get<Comment[]>(`${this.baseEndpoint}/${postId}/comments`);
      
      // Store the first comment ID for future use
      if (response.data && response.data.length > 0) {
        const firstCommentId = response.data[0].id?.toString() || '';
        apiVariableManager.setVariable('firstCommentId', firstCommentId);
        logger.info(`Stored first comment ID: ${firstCommentId}`);
      }
      
      allureReporter.endStep('passed');
      return response;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Create a custom post with dynamic data and variable substitution
   * @param templateData Post template data with variables
   * @returns Promise resolving to the API response
   */
  public async createPostWithTemplate(templateData: Post): Promise<ApiResponse<Post>> {
    logger.info('Creating post with template data');
    allureReporter.startStep('Create post with template');
    
    try {
      // Process template variables
      const processedData = apiVariableManager.processObjectTemplate(templateData);
      
      logger.info(`Processed template data: ${JSON.stringify(processedData)}`);
      
      // Create post with processed data
      const response = await this.createPost(processedData);
      
      allureReporter.endStep('passed');
      return response;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
}

// Create singleton instance
export const postEndpoint = new PostEndpoint();