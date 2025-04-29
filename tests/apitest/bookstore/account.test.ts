/**
 * Book Store API - Account Tests
 * Tests Book Store API functionality for account operations
 */

import { test, expect } from '@playwright/test';
import { accountEndpoint } from '../../../api/endpoints/bookstore/account.endpoint';
import { logger } from '../../../utils/logger/logger';

// Common test data
const testUsername = `testuser_${Date.now()}`;
const testPassword = 'Test@1234!';
let userId: string;
let authToken: string;

// Define test groups with tags
const apiTest = test.extend({});
const bookstoreApiTest = test.extend({});

// Test suite for Book Store API - Account Tests
test.describe('Book Store API - Account Tests', () => {
  
  // Test to create a new user account
  bookstoreApiTest('should create a new user account', async () => {
    logger.info(`Testing create user endpoint with username: ${testUsername}`);
    
    // Create user
    const response = await accountEndpoint.createUser(testUsername, testPassword);
    
    // Verify response
    expect(response.status).toBe(201);
    expect(response.data).toBeDefined();
    expect(response.data.userId).toBeDefined();
    
    // Store user ID for later tests
    userId = response.data.userId;
    
    logger.info(`Created user with ID: ${userId}`);
  });
  
  // Test to generate token
  bookstoreApiTest('should generate token', async () => {
    // Skip if no user created
    test.skip(!userId, 'No user account available');
    
    logger.info(`Testing generate token endpoint with username: ${testUsername}`);
    
    // Generate token
    const response = await accountEndpoint.generateToken(testUsername, testPassword);
    
    // Verify response
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.token).toBeDefined();
    expect(response.data.expires).toBeDefined();
    expect(response.data.status).toBe('Success');
    expect(response.data.result).toBe('User authorized successfully.');
    
    // Store auth token for later tests
    authToken = response.data.token;
    
    logger.info('Generated auth token successfully');
  });
  
  // Test to authorize user
  bookstoreApiTest('should authorize user', async () => {
    // Skip if no user created
    test.skip(!userId, 'No user account available');
    
    logger.info(`Testing authorize user endpoint with username: ${testUsername}`);
    
    // Authorize user
    const response = await accountEndpoint.authorizeUser(testUsername, testPassword);
    
    // Verify response
    expect(response.status).toBe(200);
    expect(response.data).toBe(true);
    
    logger.info('User authorized successfully');
  });
  
  // Test to get user by ID
  bookstoreApiTest('should get user by ID', async () => {
    // Skip if no user created or no auth token
    test.skip(!userId || !authToken, 'No user account or auth token available');
    
    logger.info(`Testing get user endpoint with ID: ${userId}`);
    
    // Get user
    const response = await accountEndpoint.getUser(userId);
    
    // Verify response
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.userId).toBe(userId);
    expect(response.data.username).toBe(testUsername);
    expect(response.data.books).toBeInstanceOf(Array);
    
    logger.info(`Retrieved user with username: ${response.data.username}`);
  });
  
  // Test to get user with invalid ID
  bookstoreApiTest('should handle invalid user ID', async () => {
    // Skip if no auth token
    test.skip(!authToken, 'No auth token available');
    
    const invalidUserId = '00000000-0000-0000-0000-000000000000';
    
    logger.info(`Testing get user endpoint with invalid ID: ${invalidUserId}`);
    
    try {
      // Get user with invalid ID
      await accountEndpoint.getUser(invalidUserId);
      
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      // Verify error
      expect(error.response).toBeDefined();
      expect(error.response.status).toBe(401);
      
      logger.info('Invalid user ID correctly rejected');
    }
  });
  
  // Test to handle invalid credentials
  bookstoreApiTest('should handle invalid credentials', async () => {
    const invalidUsername = 'invaliduser_nonexistent';
    const invalidPassword = 'invalidpassword';
    
    logger.info(`Testing generate token endpoint with invalid credentials: ${invalidUsername}`);
    
    try {
      // Generate token with invalid credentials
      const response = await accountEndpoint.generateToken(invalidUsername, invalidPassword);
      
      // Verify response indicates failure
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.status).toBe('Failed');
      expect(response.data.result).toBe('User authorization failed.');
      
      logger.info('Invalid credentials correctly rejected');
    } catch (error) {
      // Alternative flow if the API returns an error directly
      expect(error.response).toBeDefined();
      expect(error.response.status).toBe(404);
      
      logger.info('Invalid credentials correctly rejected with error');
    }
  });
  
  // Test to delete user
  bookstoreApiTest('should delete user', async () => {
    // Skip if no user created or no auth token
    test.skip(!userId || !authToken, 'No user account or auth token available');
    
    logger.info(`Testing delete user endpoint with ID: ${userId}`);
    
    // Delete user
    const response = await accountEndpoint.deleteUser(userId);
    
    // Verify response
    expect(response.status).toBe(204);
    
    logger.info(`Deleted user with ID: ${userId}`);
    
    // Attempt to get deleted user
    try {
      await accountEndpoint.getUser(userId);
      
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      // Verify error
      expect(error.response).toBeDefined();
      expect([401, 404]).toContain(error.response.status);
      
      logger.info('Verified user was deleted');
    }
  });
});