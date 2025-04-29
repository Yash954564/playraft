/**
 * User API Tests
 * Tests for user endpoints from JSONPlaceholder API
 */

import { test, expect } from '@playwright/test';
import { userEndpoint, User } from '../../api/endpoints/user.endpoint';
import { logger } from '../../utils/logger/logger';

/**
 * Test suite for User API
 */
test.describe('User API Tests', () => {
  // Test data
  let createdUserId: number;

  // Base test - Get all users
  test('should get all users', async () => {
    logger.info('Running test: should get all users');
    
    // Get all users
    const response = await userEndpoint.getAllUsers();
    
    // Assertions
    expect(response.status).toBe(200);
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBeGreaterThan(0);
    
    // Log response info
    logger.info(`Got ${response.data.length} users`);
  });

  // Get single user
  test('should get user by ID', async () => {
    logger.info('Running test: should get user by ID');
    
    // Get user with ID 1
    const response = await userEndpoint.getUserById(1);
    
    // Assertions
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.id).toBe(1);
    expect(response.data.name).toBeDefined();
    expect(response.data.email).toBeDefined();
    expect(response.data.username).toBeDefined();
    
    // Log response info
    logger.info(`Got user: ${response.data.name} (${response.data.email})`);
  });

  // Create new user
  test('should create a new user', async () => {
    logger.info('Running test: should create a new user');
    
    // Test data
    const newUser: Omit<User, 'id'> = {
      name: 'Test User',
      username: 'testuser',
      email: 'testuser@example.com',
      address: {
        street: 'Test Street',
        suite: 'Apt. 123',
        city: 'Test City',
        zipcode: '12345-6789',
        geo: {
          lat: '12.3456',
          lng: '65.4321'
        }
      },
      phone: '123-456-7890',
      website: 'test.example.com',
      company: {
        name: 'Test Company',
        catchPhrase: 'Testing is fun',
        bs: 'innovative testing'
      }
    };
    
    // Create user
    const response = await userEndpoint.createUser(newUser);
    
    // Assertions
    expect(response.status).toBe(201);
    expect(response.data).toBeDefined();
    expect(response.data.id).toBeDefined();
    expect(response.data.name).toBe(newUser.name);
    expect(response.data.email).toBe(newUser.email);
    
    // Store user ID for later tests
    createdUserId = response.data.id as number;
    
    // Log response info
    logger.info(`Created user with ID: ${createdUserId}`);
  });

  // Update user
  test('should update a user', async () => {
    logger.info('Running test: should update a user');
    
    // Test data
    const updatedUser: Partial<User> = {
      name: 'Updated Test User',
      email: 'updated@example.com'
    };
    
    // Update user
    const response = await userEndpoint.updateUser(1, updatedUser);
    
    // Assertions
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.name).toBe(updatedUser.name);
    expect(response.data.email).toBe(updatedUser.email);
    
    // Log response info
    logger.info(`Updated user: ${response.data.name} (${response.data.email})`);
  });

  // Patch user
  test('should partially update a user', async () => {
    logger.info('Running test: should partially update a user');
    
    // Test data
    const patchedUser: Partial<User> = {
      email: 'patched@example.com'
    };
    
    // Patch user
    const response = await userEndpoint.patchUser(1, patchedUser);
    
    // Assertions
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.email).toBe(patchedUser.email);
    
    // Log response info
    logger.info(`Patched user email: ${response.data.email}`);
  });

  // Delete user
  test('should delete a user', async () => {
    logger.info('Running test: should delete a user');
    
    // Delete user
    const response = await userEndpoint.deleteUser(1);
    
    // Assertions
    expect(response.status).toBe(200);
    
    // Log response info
    logger.info('Deleted user successfully');
  });

  // Get user's posts
  test('should get user posts', async () => {
    logger.info('Running test: should get user posts');
    
    // Get user posts
    const response = await userEndpoint.getUserPosts(1);
    
    // Assertions
    expect(response.status).toBe(200);
    expect(response.data).toBeInstanceOf(Array);
    
    // JSONPlaceholder returns posts for user 1
    const hasPosts = response.data.length > 0;
    expect(hasPosts).toBeTruthy();
    
    // Log response info
    logger.info(`Got ${response.data.length} posts for user`);
  });

  // Get user's todos
  test('should get user todos', async () => {
    logger.info('Running test: should get user todos');
    
    // Get user todos
    const response = await userEndpoint.getUserTodos(1);
    
    // Assertions
    expect(response.status).toBe(200);
    expect(response.data).toBeInstanceOf(Array);
    
    // JSONPlaceholder returns todos for user 1
    const hasTodos = response.data.length > 0;
    expect(hasTodos).toBeTruthy();
    
    // Log response info
    logger.info(`Got ${response.data.length} todos for user`);
  });

  // Get user's albums
  test('should get user albums', async () => {
    logger.info('Running test: should get user albums');
    
    // Get user albums
    const response = await userEndpoint.getUserAlbums(1);
    
    // Assertions
    expect(response.status).toBe(200);
    expect(response.data).toBeInstanceOf(Array);
    
    // JSONPlaceholder returns albums for user 1
    const hasAlbums = response.data.length > 0;
    expect(hasAlbums).toBeTruthy();
    
    // Log response info
    logger.info(`Got ${response.data.length} albums for user`);
  });

  // Error case - Get non-existent user
  test('should handle non-existent user', async () => {
    logger.info('Running test: should handle non-existent user');
    
    // Get non-existent user (using a very large ID)
    const response = await userEndpoint.getUserById(9999999);
    
    // Assertions
    expect(response.status).toBe(404);
    expect(response.data).toEqual({});
    
    // Log response info
    logger.info('Correctly handled non-existent user request');
  });
});