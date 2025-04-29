import { test, expect } from '@playwright/test';
import { userEndpoint } from '../api/endpoints/user.endpoint';
import { allureReporter } from '../utils/allureReporter';
import { logger } from '../utils/logger';
import { dataReader } from '../utils/dataReader';

test.describe('API Tests', () => {
  test.beforeEach(async () => {
    // Reset API helper state for each test
    logger.info('Setting up API test');
  });

  test('Should get list of users', async () => {
    await allureReporter.step('Get list of users', async () => {
      // Get users from API
      const response = await userEndpoint.getUsers();
      
      // Log user count
      logger.info(`Retrieved ${response.data.length} users`);
      
      // Verify response data
      expect(response.page).toBe(1);
      expect(response.per_page).toBe(6);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.total).toBeGreaterThan(0);
      
      // Verify user data structure
      const firstUser = response.data[0];
      expect(firstUser).toHaveProperty('id');
      expect(firstUser).toHaveProperty('email');
      expect(firstUser).toHaveProperty('first_name');
      expect(firstUser).toHaveProperty('last_name');
      expect(firstUser).toHaveProperty('avatar');
    });
  });

  test('Should get single user', async () => {
    await allureReporter.step('Get single user', async () => {
      // Get user with ID 2
      const response = await userEndpoint.getUserById(2);
      
      // Log user info
      logger.info(`Retrieved user: ${response.data.first_name} ${response.data.last_name}`);
      
      // Verify response data
      expect(response.data).toHaveProperty('id', 2);
      expect(response.data).toHaveProperty('email');
      expect(response.data).toHaveProperty('first_name');
      expect(response.data).toHaveProperty('last_name');
      expect(response.data).toHaveProperty('avatar');
    });
  });

  test('Should create new user', async () => {
    await allureReporter.step('Create new user', async () => {
      // Create test data
      const userData = {
        name: 'John Doe',
        job: 'Software Tester'
      };
      
      // Create user
      const response = await userEndpoint.createUser(userData);
      
      // Log created user
      logger.info(`Created user with ID: ${response.id}`);
      
      // Verify response data
      expect(response.name).toBe(userData.name);
      expect(response.job).toBe(userData.job);
      expect(response.id).toBeTruthy();
      expect(response.createdAt).toBeTruthy();
      
      // Verify createdAt is a valid date
      const createdDate = new Date(response.createdAt);
      expect(createdDate).toBeInstanceOf(Date);
      expect(createdDate.toString()).not.toBe('Invalid Date');
    });
  });

  test('Should update user', async () => {
    await allureReporter.step('Update user', async () => {
      // Update data
      const userData = {
        name: 'Jane Smith',
        job: 'QA Engineer'
      };
      
      // Update user with ID 1
      const response = await userEndpoint.updateUser(1, userData);
      
      // Log updated user
      logger.info(`Updated user: ${response.name} - ${response.job}`);
      
      // Verify response data
      expect(response.name).toBe(userData.name);
      expect(response.job).toBe(userData.job);
      expect(response.updatedAt).toBeTruthy();
      
      // Verify updatedAt is a valid date
      const updatedDate = new Date(response.updatedAt);
      expect(updatedDate).toBeInstanceOf(Date);
      expect(updatedDate.toString()).not.toBe('Invalid Date');
    });
  });

  test('Should delete user', async () => {
    await allureReporter.step('Delete user', async () => {
      // Delete user with ID 1
      await userEndpoint.deleteUser(1);
      
      // Log deletion
      logger.info('User deleted successfully');
      
      // No assertions needed - if the call doesn't throw an error, it's successful
    });
  });

  test('Should register user successfully', async () => {
    await allureReporter.step('Register user', async () => {
      // Get test data from config
      const testData = dataReader.getTestData('api');
      const registerData = testData?.registration || { 
        email: 'eve.holt@reqres.in', 
        password: 'pistol' 
      };
      
      // Register user
      const response = await userEndpoint.registerUser(registerData);
      
      // Log registration
      logger.info(`User registered with ID: ${response.id} and token: ${response.token}`);
      
      // Verify response data
      expect(response.id).toBeTruthy();
      expect(response.token).toBeTruthy();
    });
  });

  test('Should login user successfully', async () => {
    await allureReporter.step('Login user', async () => {
      // Get test data from config
      const testData = dataReader.getTestData('api');
      const loginData = testData?.login || { 
        email: 'eve.holt@reqres.in', 
        password: 'cityslicka' 
      };
      
      // Login user
      const response = await userEndpoint.loginUser(loginData);
      
      // Log login
      logger.info(`User logged in with token: ${response.token}`);
      
      // Verify response data
      expect(response.token).toBeTruthy();
    });
  });

  test('Should handle delayed response', async () => {
    await allureReporter.step('Handle delayed response', async () => {
      // Get delayed response (2 seconds)
      const startTime = Date.now();
      const response = await userEndpoint.getDelayedResponse(2);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Log response time
      logger.info(`Response received after ${duration}ms`);
      
      // Verify response took at least 1.5 seconds (allowing for some variability)
      expect(duration).toBeGreaterThan(1500);
      
      // Verify response data
      expect(response.data.length).toBeGreaterThan(0);
    });
  });
});