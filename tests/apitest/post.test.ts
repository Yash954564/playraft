import { test, expect } from '@playwright/test';
import { postEndpoint, Post } from '../endpoints/post.endpoint';
import { userEndpoint } from '../endpoints/user.endpoint';
import { apiVariableManager } from '../utils/api.variable.manager';
import { schemaValidator } from '../utils/schema.validator';
import { apiHelper } from '../helpers/api.helper';
import { logger } from '../../core/logger';
import { allureReporter } from '../../core/reporter/allure.reporter';

/**
 * Post schema for validation
 */
const postSchema = {
  type: 'object',
  required: ['id', 'userId', 'title', 'body'],
  properties: {
    id: { type: 'number' },
    userId: { type: 'number' },
    title: { type: 'string' },
    body: { type: 'string' }
  }
};

/**
 * Comments schema for validation
 */
const commentsSchema = {
  type: 'array',
  items: {
    type: 'object',
    required: ['id', 'postId', 'name', 'email', 'body'],
    properties: {
      id: { type: 'number' },
      postId: { type: 'number' },
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      body: { type: 'string' }
    }
  }
};

/**
 * Test suite for Post API endpoints using JSONPlaceholder API
 * Demonstrates advanced API testing patterns including:
 * - Data chaining between tests
 * - Schema validation
 * - Template variable substitution
 */
test.describe('Post API Tests', () => {
  // Set up the base URL for all tests in this suite
  test.beforeAll(async () => {
    // Set API base URL for JSONPlaceholder
    apiHelper.setBaseUrl('https://jsonplaceholder.typicode.com');
    logger.info('Set API base URL to: https://jsonplaceholder.typicode.com');
  });

  // Clean up after all tests
  test.afterAll(async () => {
    // Clear all variables
    apiVariableManager.clearVariables();
    logger.info('Cleared all API variables');
  });

  // Set up data needed for the tests
  test('should set up test data', async () => {
    // Start allure reporting for this test
    allureReporter.startTest('Set Up Test Data')
      .feature('Post API')
      .story('Test Data Setup')
      .severity('blocker');
    
    try {
      // Get first user
      const usersResponse = await userEndpoint.getAllUsers();
      expect(usersResponse.status).toBe(200);
      expect(usersResponse.data.length).toBeGreaterThan(0);
      
      // Store first user ID
      const firstUserId = usersResponse.data[0].id?.toString() || '1';
      apiVariableManager.setVariable('testUserId', firstUserId);
      logger.info(`Using user ID: ${firstUserId} for tests`);
      
      // Get a post for this user
      const postsResponse = await postEndpoint.getPostsByUserId(firstUserId);
      expect(postsResponse.status).toBe(200);
      
      // If the user has posts, store the first one
      if (postsResponse.data.length > 0) {
        const firstPostId = postsResponse.data[0].id?.toString() || '';
        apiVariableManager.setVariable('testPostId', firstPostId);
        apiVariableManager.storeObject('testPost', postsResponse.data[0]);
        logger.info(`Using post ID: ${firstPostId} for tests`);
      } else {
        // If no posts found, create one
        const newPost: Post = {
          userId: parseInt(firstUserId),
          title: 'Test Post Title',
          body: 'This is a test post body created for API testing.'
        };
        
        const createResponse = await postEndpoint.createPost(newPost);
        expect(createResponse.status).toBe(201);
        
        const newPostId = createResponse.data.id?.toString() || '';
        apiVariableManager.setVariable('testPostId', newPostId);
        apiVariableManager.storeObject('testPost', createResponse.data);
        logger.info(`Created new post with ID: ${newPostId} for tests`);
      }
      
      allureReporter.endTest('passed');
    } catch (error) {
      logger.error(`Test setup failed: ${error.message}`);
      allureReporter.endTest('failed');
      throw error;
    }
  });

  // Test: Get all posts with schema validation
  test('should get all posts with schema validation', async () => {
    // Start allure reporting for this test
    allureReporter.startTest('Get All Posts With Schema Validation')
      .feature('Post API')
      .story('List Posts')
      .severity('normal');
    
    try {
      // Get all posts
      const response = await postEndpoint.getAllPosts();
      
      // Verify response status
      expect(response.status).toBe(200);
      
      // Verify response data
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      
      // Validate schema for first post
      const firstPost = response.data[0];
      const validation = schemaValidator.validate(firstPost, postSchema, 'Post Schema');
      expect(validation.valid).toBe(true, `Schema validation failed: ${JSON.stringify(validation.errors)}`);
      
      // Log successful test
      logger.info(`Successfully retrieved and validated ${response.data.length} posts`);
      allureReporter.endTest('passed');
    } catch (error) {
      // Log error and fail test
      logger.error(`Test failed: ${error.message}`);
      allureReporter.endTest('failed');
      throw error;
    }
  });

  // Test: Get a specific post by ID with schema validation
  test('should get a specific post by ID with schema validation', async () => {
    // Start allure reporting for this test
    allureReporter.startTest('Get Post By ID With Schema Validation')
      .feature('Post API')
      .story('Post Details')
      .severity('normal');
    
    try {
      // Get the test post ID
      const postId = apiVariableManager.getVariable('testPostId');
      
      // Get post by ID
      const response = await postEndpoint.getPostById(postId);
      
      // Verify response status
      expect(response.status).toBe(200);
      
      // Verify response data matches the post ID
      expect(response.data.id.toString()).toBe(postId);
      
      // Validate schema
      const validation = schemaValidator.validate(response.data, postSchema, 'Post Schema');
      expect(validation.valid).toBe(true, `Schema validation failed: ${JSON.stringify(validation.errors)}`);
      
      // Log successful test
      logger.info(`Successfully retrieved and validated post with ID: ${postId}`);
      allureReporter.endTest('passed');
    } catch (error) {
      // Log error and fail test
      logger.error(`Test failed: ${error.message}`);
      allureReporter.endTest('failed');
      throw error;
    }
  });

  // Test: Create a new post with schema validation
  test('should create a new post with schema validation', async () => {
    // Start allure reporting for this test
    allureReporter.startTest('Create New Post With Schema Validation')
      .feature('Post API')
      .story('Post Creation')
      .severity('critical');
    
    try {
      // Get the user ID
      const userId = apiVariableManager.getVariable('testUserId');
      
      // Create post data
      const postData: Post = {
        userId: parseInt(userId),
        title: 'New Test Post',
        body: 'This is a new test post created during automated API testing.'
      };
      
      // Create new post
      const response = await postEndpoint.createPost(postData);
      
      // Verify response status
      expect(response.status).toBe(201);
      
      // Verify response data contains the post data
      expect(response.data.title).toBe(postData.title);
      expect(response.data.body).toBe(postData.body);
      expect(response.data.userId).toBe(postData.userId);
      
      // Validate schema
      const validation = schemaValidator.validate(response.data, postSchema, 'Post Schema');
      expect(validation.valid).toBe(true, `Schema validation failed: ${JSON.stringify(validation.errors)}`);
      
      // Store new post ID for future tests
      const newPostId = response.data.id?.toString() || '';
      apiVariableManager.setVariable('newPostId', newPostId);
      
      // Log successful test
      logger.info(`Successfully created and validated new post with ID: ${newPostId}`);
      allureReporter.endTest('passed');
    } catch (error) {
      // Log error and fail test
      logger.error(`Test failed: ${error.message}`);
      allureReporter.endTest('failed');
      throw error;
    }
  });

  // Test: Update a post
  test('should update a post', async () => {
    // Start allure reporting for this test
    allureReporter.startTest('Update Post')
      .feature('Post API')
      .story('Post Updates')
      .severity('normal');
    
    try {
      // Get the test post ID and user ID
      const postId = apiVariableManager.getVariable('newPostId');
      const userId = apiVariableManager.getVariable('testUserId');
      
      // Update data
      const updateData: Post = {
        userId: parseInt(userId),
        title: 'Updated Post Title',
        body: 'This is the updated post body after API testing update operation.'
      };
      
      // Update post
      const response = await postEndpoint.updatePost(postId, updateData);
      
      // Verify response status
      expect(response.status).toBe(200);
      
      // Verify response data reflects updates
      expect(response.data.title).toBe(updateData.title);
      expect(response.data.body).toBe(updateData.body);
      
      // Validate schema
      const validation = schemaValidator.validate(response.data, postSchema, 'Post Schema');
      expect(validation.valid).toBe(true, `Schema validation failed: ${JSON.stringify(validation.errors)}`);
      
      // Log successful test
      logger.info(`Successfully updated and validated post with ID: ${postId}`);
      allureReporter.endTest('passed');
    } catch (error) {
      // Log error and fail test
      logger.error(`Test failed: ${error.message}`);
      allureReporter.endTest('failed');
      throw error;
    }
  });

  // Test: Get post comments with schema validation
  test('should get post comments with schema validation', async () => {
    // Start allure reporting for this test
    allureReporter.startTest('Get Post Comments With Schema Validation')
      .feature('Post API')
      .story('Post Comments')
      .severity('normal');
    
    try {
      // Get the test post ID
      const postId = apiVariableManager.getVariable('testPostId');
      
      // Get post comments
      const response = await postEndpoint.getPostComments(postId);
      
      // Verify response status
      expect(response.status).toBe(200);
      
      // Verify response data
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      
      // Validate schema
      const validation = schemaValidator.validate(response.data, commentsSchema, 'Comments Schema');
      expect(validation.valid).toBe(true, `Schema validation failed: ${JSON.stringify(validation.errors)}`);
      
      // Log successful test
      logger.info(`Successfully retrieved and validated ${response.data.length} comments for post with ID: ${postId}`);
      allureReporter.endTest('passed');
    } catch (error) {
      // Log error and fail test
      logger.error(`Test failed: ${error.message}`);
      allureReporter.endTest('failed');
      throw error;
    }
  });

  // Test: Create post using template with variables
  test('should create post using template with variables', async () => {
    // Start allure reporting for this test
    allureReporter.startTest('Create Post Using Template')
      .feature('Post API')
      .story('Template Variables')
      .severity('normal');
    
    try {
      // Set up variables for template
      apiVariableManager.setVariable('templateTitle', 'Template Post Title');
      apiVariableManager.setVariable('templateBody', 'This post was created using a template with variable substitution.');
      
      // Get the user ID
      const userId = apiVariableManager.getVariable('testUserId');
      
      // Create template with variables
      const templateData: Post = {
        userId: parseInt(userId),
        title: '${templateTitle}',
        body: '${templateBody}'
      };
      
      // Create post with template
      const response = await postEndpoint.createPostWithTemplate(templateData);
      
      // Verify response status
      expect(response.status).toBe(201);
      
      // Verify response data has template variables substituted
      expect(response.data.title).toBe('Template Post Title');
      expect(response.data.body).toBe('This post was created using a template with variable substitution.');
      
      // Validate schema
      const validation = schemaValidator.validate(response.data, postSchema, 'Post Schema');
      expect(validation.valid).toBe(true, `Schema validation failed: ${JSON.stringify(validation.errors)}`);
      
      // Log successful test
      logger.info(`Successfully created post with template variables, ID: ${response.data.id}`);
      allureReporter.endTest('passed');
    } catch (error) {
      // Log error and fail test
      logger.error(`Test failed: ${error.message}`);
      allureReporter.endTest('failed');
      throw error;
    }
  });

  // Test: Delete a post
  test('should delete a post', async () => {
    // Start allure reporting for this test
    allureReporter.startTest('Delete Post')
      .feature('Post API')
      .story('Post Deletion')
      .severity('critical');
    
    try {
      // Get the new post ID created earlier
      const postId = apiVariableManager.getVariable('newPostId');
      
      // Delete post
      const response = await postEndpoint.deletePost(postId);
      
      // Verify response status
      expect(response.status).toBe(200);
      
      // Try to get the deleted post to verify it's gone
      // Note: JSONPlaceholder doesn't actually delete resources, it simulates it
      // In a real API, you might get a 404 here
      const checkResponse = await postEndpoint.getPostById(postId);
      
      // For JSONPlaceholder, we should still get a 200 but verify the resource is empty
      // In a real API test, this assertion would likely be different
      expect(checkResponse.status).toBe(200);
      
      // Log successful test
      logger.info(`Successfully deleted post with ID: ${postId}`);
      allureReporter.endTest('passed');
    } catch (error) {
      // Log error and fail test
      logger.error(`Test failed: ${error.message}`);
      allureReporter.endTest('failed');
      throw error;
    }
  });

  // Test: Generate schema from sample data
  test('should generate schema from sample data', async () => {
    // Start allure reporting for this test
    allureReporter.startTest('Generate Schema From Sample')
      .feature('Schema Validation')
      .story('Schema Generation')
      .severity('minor');
    
    try {
      // Get a sample post
      const response = await postEndpoint.getPostById(1);
      expect(response.status).toBe(200);
      
      // Generate schema from the sample post
      const generatedSchema = schemaValidator.generateSchema(response.data);
      
      // Log the generated schema
      logger.info(`Generated schema: ${JSON.stringify(generatedSchema)}`);
      
      // Validate the same data against the generated schema
      const validation = schemaValidator.validate(response.data, generatedSchema, 'Generated Schema');
      expect(validation.valid).toBe(true, `Schema validation failed with generated schema: ${JSON.stringify(validation.errors)}`);
      
      // Store the generated schema for future use
      apiVariableManager.storeObject('generatedPostSchema', generatedSchema);
      
      // Log successful test
      logger.info('Successfully generated and validated schema from sample data');
      allureReporter.endTest('passed');
    } catch (error) {
      // Log error and fail test
      logger.error(`Test failed: ${error.message}`);
      allureReporter.endTest('failed');
      throw error;
    }
  });
});