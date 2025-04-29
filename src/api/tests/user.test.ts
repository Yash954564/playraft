import { test, expect } from '@playwright/test';
import { userEndpoint, User } from '../endpoints/user.endpoint';
import { apiVariableManager } from '../utils/api.variable.manager';
import { apiHelper } from '../helpers/api.helper';
import { logger } from '../../core/logger';
import { allureReporter } from '../../core/reporter/allure.reporter';

/**
 * Test suite for User API endpoints using JSONPlaceholder API
 * Demonstrates advanced API testing patterns
 */
test.describe('User API Tests', () => {
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

  // Test: Get all users
  test('should get all users', async () => {
    // Start allure reporting for this test
    allureReporter.startTest('Get All Users')
      .feature('User API')
      .story('List Users')
      .severity('normal');
    
    try {
      // Get all users
      const response = await userEndpoint.getAllUsers();
      
      // Verify response status
      expect(response.status).toBe(200);
      
      // Verify response data
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      
      // Verify schema of first user
      const firstUser = response.data[0];
      expect(firstUser.id).toBeDefined();
      expect(firstUser.name).toBeDefined();
      expect(firstUser.username).toBeDefined();
      expect(firstUser.email).toBeDefined();
      
      // Verify we stored the first user ID
      const firstUserId = apiVariableManager.getVariable('firstUserId');
      expect(firstUserId).toBeDefined();
      expect(firstUserId).toBe(firstUser.id.toString());
      
      // Log successful test
      logger.info(`Successfully retrieved ${response.data.length} users`);
      allureReporter.endTest('passed');
    } catch (error) {
      // Log error and fail test
      logger.error(`Test failed: ${error.message}`);
      allureReporter.endTest('failed');
      throw error;
    }
  });

  // Test: Get user by ID
  test('should get user by ID', async () => {
    // Start allure reporting for this test
    allureReporter.startTest('Get User By ID')
      .feature('User API')
      .story('User Details')
      .severity('normal');
    
    try {
      // Use the first user ID stored from previous test
      const userId = apiVariableManager.getVariable('firstUserId', '1');
      
      // Get user by ID
      const response = await userEndpoint.getUserById(userId);
      
      // Verify response status
      expect(response.status).toBe(200);
      
      // Verify response data
      expect(response.data).toBeDefined();
      expect(response.data.id.toString()).toBe(userId);
      expect(response.data.name).toBeDefined();
      expect(response.data.username).toBeDefined();
      expect(response.data.email).toBeDefined();
      
      // Log successful test
      logger.info(`Successfully retrieved user with ID: ${userId}`);
      allureReporter.endTest('passed');
    } catch (error) {
      // Log error and fail test
      logger.error(`Test failed: ${error.message}`);
      allureReporter.endTest('failed');
      throw error;
    }
  });

  // Test: Create new user
  test('should create new user', async () => {
    // Start allure reporting for this test
    allureReporter.startTest('Create New User')
      .feature('User API')
      .story('User Creation')
      .severity('critical');
    
    try {
      // Create user data
      const userData: User = {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john.doe@example.com',
        address: {
          street: '123 Main St',
          suite: 'Apt 1',
          city: 'Anytown',
          zipcode: '12345',
          geo: {
            lat: '40.7128',
            lng: '-74.0060'
          }
        },
        phone: '555-123-4567',
        website: 'johndoe.example.com',
        company: {
          name: 'Example Inc',
          catchPhrase: 'Leading the way',
          bs: 'innovative solutions'
        }
      };
      
      // Create new user
      const response = await userEndpoint.createUser(userData);
      
      // Verify response status
      expect(response.status).toBe(201);
      
      // Verify response data
      expect(response.data).toBeDefined();
      expect(response.data.id).toBeDefined();
      expect(response.data.name).toBe(userData.name);
      expect(response.data.username).toBe(userData.username);
      expect(response.data.email).toBe(userData.email);
      
      // Verify we stored the new user ID
      const newUserId = apiVariableManager.getVariable('newUserId');
      expect(newUserId).toBeDefined();
      expect(newUserId).toBe(response.data.id.toString());
      
      // Log successful test
      logger.info(`Successfully created user with ID: ${newUserId}`);
      allureReporter.endTest('passed');
    } catch (error) {
      // Log error and fail test
      logger.error(`Test failed: ${error.message}`);
      allureReporter.endTest('failed');
      throw error;
    }
  });

  // Test: Update user
  test('should update user', async () => {
    // Start allure reporting for this test
    allureReporter.startTest('Update User')
      .feature('User API')
      .story('User Updates')
      .severity('normal');
    
    try {
      // Use the new user ID stored from previous test
      const userId = apiVariableManager.getVariable('newUserId', '1');
      
      // Update data
      const updateData: Partial<User> = {
        name: 'John Doe Updated',
        email: 'john.updated@example.com'
      };
      
      // Update user
      const response = await userEndpoint.updateUser(userId, updateData);
      
      // Verify response status
      expect(response.status).toBe(200);
      
      // Verify response data
      expect(response.data).toBeDefined();
      expect(response.data.id.toString()).toBe(userId);
      expect(response.data.name).toBe(updateData.name);
      expect(response.data.email).toBe(updateData.email);
      
      // Log successful test
      logger.info(`Successfully updated user with ID: ${userId}`);
      allureReporter.endTest('passed');
    } catch (error) {
      // Log error and fail test
      logger.error(`Test failed: ${error.message}`);
      allureReporter.endTest('failed');
      throw error;
    }
  });

  // Test: Patch user
  test('should patch user', async () => {
    // Start allure reporting for this test
    allureReporter.startTest('Patch User')
      .feature('User API')
      .story('User Partial Updates')
      .severity('normal');
    
    try {
      // Use the first user ID
      const userId = apiVariableManager.getVariable('firstUserId', '1');
      
      // Patch data
      const patchData: Partial<User> = {
        website: 'updated-website.example.com'
      };
      
      // Patch user
      const response = await userEndpoint.patchUser(userId, patchData);
      
      // Verify response status
      expect(response.status).toBe(200);
      
      // Verify response data
      expect(response.data).toBeDefined();
      expect(response.data.id.toString()).toBe(userId);
      expect(response.data.website).toBe(patchData.website);
      
      // Log successful test
      logger.info(`Successfully patched user with ID: ${userId}`);
      allureReporter.endTest('passed');
    } catch (error) {
      // Log error and fail test
      logger.error(`Test failed: ${error.message}`);
      allureReporter.endTest('failed');
      throw error;
    }
  });

  // Test: Delete user
  test('should delete user', async () => {
    // Start allure reporting for this test
    allureReporter.startTest('Delete User')
      .feature('User API')
      .story('User Deletion')
      .severity('critical');
    
    try {
      // Use the new user ID stored from previous test
      const userId = apiVariableManager.getVariable('newUserId', '1');
      
      // Delete user
      const response = await userEndpoint.deleteUser(userId);
      
      // Verify response status
      expect(response.status).toBe(200);
      
      // Log successful test
      logger.info(`Successfully deleted user with ID: ${userId}`);
      allureReporter.endTest('passed');
    } catch (error) {
      // Log error and fail test
      logger.error(`Test failed: ${error.message}`);
      allureReporter.endTest('failed');
      throw error;
    }
  });

  // Test: Get user posts
  test('should get user posts', async () => {
    // Start allure reporting for this test
    allureReporter.startTest('Get User Posts')
      .feature('User API')
      .story('User Content')
      .severity('minor');
    
    try {
      // Use the first user ID
      const userId = apiVariableManager.getVariable('firstUserId', '1');
      
      // Get user posts
      const response = await userEndpoint.getUserPosts(userId);
      
      // Verify response status
      expect(response.status).toBe(200);
      
      // Verify response data
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      
      // Store the first post for this user
      if (response.data.length > 0) {
        apiVariableManager.setVariable('firstPostId', response.data[0].id.toString());
        apiVariableManager.storeObject('firstPost', response.data[0]);
      }
      
      // Log successful test
      logger.info(`Successfully retrieved ${response.data.length} posts for user with ID: ${userId}`);
      allureReporter.endTest('passed');
    } catch (error) {
      // Log error and fail test
      logger.error(`Test failed: ${error.message}`);
      allureReporter.endTest('failed');
      throw error;
    }
  });

  // Test: Template processing with variables
  test('should process templates with variables', async () => {
    // Start allure reporting for this test
    allureReporter.startTest('Process Templates')
      .feature('API Variables')
      .story('Template Processing')
      .severity('minor');
    
    try {
      // Set variables
      apiVariableManager.setVariable('username', 'testuser');
      apiVariableManager.setVariable('apiVersion', 'v1');
      
      // Process template
      const template = 'Hello, ${username}! Using API version ${apiVersion}.';
      const processed = apiVariableManager.processTemplate(template);
      
      // Verify processed template
      expect(processed).toBe('Hello, testuser! Using API version v1.');
      
      // Process object template
      const templateObject = {
        url: 'https://api.example.com/${apiVersion}/users',
        user: '${username}',
        credentials: {
          username: '${username}',
          version: '${apiVersion}'
        }
      };
      
      const processedObject = apiVariableManager.processObjectTemplate(templateObject);
      
      // Verify processed object
      expect(processedObject.url).toBe('https://api.example.com/v1/users');
      expect(processedObject.user).toBe('testuser');
      expect(processedObject.credentials.username).toBe('testuser');
      expect(processedObject.credentials.version).toBe('v1');
      
      // Log successful test
      logger.info('Successfully processed templates with variables');
      allureReporter.endTest('passed');
    } catch (error) {
      // Log error and fail test
      logger.error(`Test failed: ${error.message}`);
      allureReporter.endTest('failed');
      throw error;
    }
  });
});