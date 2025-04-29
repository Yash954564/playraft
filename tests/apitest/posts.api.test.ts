/**
 * API Tests for JSONPlaceholder Posts Endpoints
 * Demonstrates API testing with AI capabilities
 */

import { test, expect } from '@playwright/test';
import { defaultApiHelper, ApiHelper } from '../../api/helpers/api.helper';
import { openAIService } from '../../ai/services/openai.service';
import { logger } from '../../utils/logger/logger';

// Interface for Post data
interface Post {
  id?: number;
  title: string;
  body: string;
  userId: number;
}

// Test for posts API endpoints
test.describe('JSONPlaceholder Posts API Tests', () => {
  let apiHelper: ApiHelper;

  test.beforeAll(async () => {
    // Create API helper with base URL
    apiHelper = new ApiHelper('https://jsonplaceholder.typicode.com');
    logger.info('API Tests started');
  });

  test('GET /posts - Fetch all posts', async () => {
    // Send request to get all posts
    const response = await apiHelper.get('/posts');
    
    // Verify response
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    
    // Verify post structure
    const firstPost = response.data[0];
    expect(firstPost).toHaveProperty('id');
    expect(firstPost).toHaveProperty('title');
    expect(firstPost).toHaveProperty('body');
    expect(firstPost).toHaveProperty('userId');
    
    // Analyze response with OpenAI if enabled
    if (openAIService.isEnabled()) {
      const analysis = await apiHelper.analyzeApiResponse(response, {
        expectedStatus: 200,
        description: 'Get all posts endpoint'
      });
      
      logger.info('AI Analysis of GET /posts response', { analysis });
    }
  });

  test('GET /posts/{id} - Fetch specific post', async () => {
    // Send request to get post with ID 1
    const response = await apiHelper.get('/posts/1');
    
    // Verify response
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id', 1);
    expect(response.data).toHaveProperty('title');
    expect(response.data).toHaveProperty('body');
    expect(response.data).toHaveProperty('userId');
  });

  test('POST /posts - Create new post', async () => {
    // Define test data
    let postData: Post;
    
    // Use AI to generate test data if enabled
    if (openAIService.isEnabled()) {
      try {
        const generatedData = await apiHelper.generateTestData<Post>(
          'Create a JSON object for a new blog post with fields: title (string), body (string), userId (number between 1-10)',
          1,
          ['Title should be between 10-50 characters', 'Body should be between 50-200 characters']
        );
        
        if (generatedData && generatedData.length > 0) {
          postData = generatedData[0];
          logger.info('Using AI-generated test data', { postData });
        } else {
          throw new Error('No data generated');
        }
      } catch (error) {
        logger.error('Failed to generate test data with AI', { error });
        // Fallback to static data if AI fails
        postData = {
          title: 'Test Post Title',
          body: 'This is a test post body created for automated testing.',
          userId: 1
        };
      }
    } else {
      // Use static data if AI is not enabled
      postData = {
        title: 'Test Post Title',
        body: 'This is a test post body created for automated testing.',
        userId: 1
      };
    }
    
    // Send request to create new post
    const response = await apiHelper.post('/posts', postData);
    
    // Verify response
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data.title).toBe(postData.title);
    expect(response.data.body).toBe(postData.body);
    expect(response.data.userId).toBe(postData.userId);
  });

  test('PUT /posts/{id} - Update post', async () => {
    // Define update data
    const updateData: Post = {
      id: 1,
      title: 'Updated Post Title',
      body: 'This post has been updated during automated testing.',
      userId: 1
    };
    
    // Send request to update post with ID 1
    const response = await apiHelper.put('/posts/1', updateData);
    
    // Verify response
    expect(response.status).toBe(200);
    expect(response.data.id).toBe(1);
    expect(response.data.title).toBe(updateData.title);
    expect(response.data.body).toBe(updateData.body);
  });

  test('DELETE /posts/{id} - Delete post', async () => {
    // Send request to delete post with ID 1
    const response = await apiHelper.delete('/posts/1');
    
    // Verify response
    expect(response.status).toBe(200);
    expect(response.data).toEqual({});
  });

  test('GET /posts?userId={id} - Filter posts by user', async () => {
    // Define user ID
    const userId = 1;
    
    // Send request to get posts for user with ID 1
    const response = await apiHelper.get('/posts', { userId });
    
    // Verify response
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    
    // Check that all posts belong to the specified user
    response.data.forEach((post: Post) => {
      expect(post.userId).toBe(userId);
    });
  });

  test('AI-Powered - Generate and execute API test dynamically', async () => {
    // Skip test if OpenAI is not enabled
    test.skip(!openAIService.isEnabled(), 'OpenAI is not enabled');
    
    try {
      // Generate API test dynamically using OpenAI
      const generatedTest = await apiHelper.generateApiTest({
        endpoint: '/comments',
        method: 'GET',
        description: 'Retrieve comments for a specific post',
        queryParams: { postId: 1 }
      });
      
      logger.info('Generated API test code', { generatedTest });
      
      // Execute GET request to /comments?postId=1
      const response = await apiHelper.get('/comments', { postId: 1 });
      
      // Basic verification of the response
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      
      // Verify each comment has the correct postId
      response.data.forEach((comment: any) => {
        expect(comment.postId).toBe(1);
      });
      
      // Analyze the response
      const analysis = await apiHelper.analyzeApiResponse(response, {
        expectedStatus: 200,
        description: 'Get comments for a specific post endpoint'
      });
      
      logger.info('AI Analysis of dynamically generated test', { analysis });
    } catch (error) {
      logger.error('Error in AI-powered test generation', { error });
      throw error;
    }
  });

  test.afterAll(async () => {
    // Clean up
    apiHelper.clearInterceptors();
    logger.info('API Tests completed');
  });
});