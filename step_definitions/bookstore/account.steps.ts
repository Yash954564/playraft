/**
 * Account Step Definitions
 * Cucumber step definitions for Book Store Account feature
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { accountEndpoint, UserAccount } from '../../api/endpoints/bookstore/account.endpoint';
import { generateTestCredentials } from '../../api/endpoints/bookstore/bookstore.config';
import { apiHelper } from '../../api/helpers/ApiHelper';
import { logger } from '../../utils/logger/logger';

// Test context
interface TestContext {
  credentials?: { username: string; password: string };
  userId?: string;
  token?: string;
  apiResponse?: any;
  errorResponse?: any;
}

// Initialize test context
const testContext: TestContext = {};

// Background
Given('the Book Store API is available', async function() {
  logger.info('Verifying Book Store API availability');
  
  try {
    // Make a simple request to verify API availability
    const response = await apiHelper.get('/BookStore/v1/Books');
    expect(response.status).toBe(200);
    
    logger.info('Book Store API is available');
  } catch (error) {
    logger.error('Book Store API is not available', { error: String(error) });
    throw error;
  }
});

// Account creation
When('I create a new user account with random credentials', async function() {
  logger.info('Creating new user account with random credentials');
  
  // Generate random credentials
  testContext.credentials = generateTestCredentials();
  
  try {
    // Create user account
    const response = await accountEndpoint.createUser(testContext.credentials);
    testContext.apiResponse = response;
    testContext.userId = response.data.userID;
    
    logger.info(`Created user account with ID: ${testContext.userId}`);
  } catch (error) {
    logger.error('Error creating user account', { error: String(error) });
    testContext.errorResponse = error.response;
    throw error;
  }
});

Then('the user account should be created successfully', function() {
  logger.info('Verifying user account creation');
  
  expect(testContext.apiResponse.status).toBe(201);
  expect(testContext.apiResponse.data).toBeDefined();
  
  logger.info('User account created successfully');
});

Then('I should receive a valid user ID', function() {
  logger.info('Verifying user ID');
  
  expect(testContext.userId).toBeDefined();
  expect(typeof testContext.userId).toBe('string');
  expect(testContext.userId.length).toBeGreaterThan(0);
  
  logger.info(`Valid user ID received: ${testContext.userId}`);
});

// Token generation
Given('I have a valid user account', async function() {
  logger.info('Ensuring valid user account exists');
  
  if (!testContext.credentials || !testContext.userId) {
    // Create new user account if not already created
    testContext.credentials = generateTestCredentials();
    
    const response = await accountEndpoint.createUser(testContext.credentials);
    testContext.userId = response.data.userID;
    
    logger.info(`Created new user account with ID: ${testContext.userId}`);
  } else {
    logger.info(`Using existing user account with ID: ${testContext.userId}`);
  }
});

When('I generate an authentication token with my credentials', async function() {
  logger.info('Generating authentication token');
  
  try {
    // Generate token
    const response = await accountEndpoint.generateToken(testContext.credentials!);
    testContext.apiResponse = response;
    testContext.token = response.data.token;
    
    logger.info('Authentication token generated');
  } catch (error) {
    logger.error('Error generating token', { error: String(error) });
    testContext.errorResponse = error.response;
    throw error;
  }
});

Then('I should receive a valid token', function() {
  logger.info('Verifying token');
  
  expect(testContext.token).toBeDefined();
  expect(typeof testContext.token).toBe('string');
  expect(testContext.token.length).toBeGreaterThan(0);
  
  logger.info('Valid token received');
});

Then('the token status should be {string}', function(status: string) {
  logger.info(`Verifying token status is ${status}`);
  
  expect(testContext.apiResponse.data.status).toBe(status);
  
  logger.info(`Token status is ${status}`);
});

// Authorization verification
When('I verify authorization with my credentials', async function() {
  logger.info('Verifying authorization');
  
  try {
    // Verify authorization
    const response = await accountEndpoint.isAuthorized(testContext.credentials!);
    testContext.apiResponse = response;
    
    logger.info('Authorization verification complete');
  } catch (error) {
    logger.error('Error verifying authorization', { error: String(error) });
    testContext.errorResponse = error.response;
    throw error;
  }
});

Then('I should be authorized', function() {
  logger.info('Verifying authorization result');
  
  expect(testContext.apiResponse.status).toBe(200);
  expect(testContext.apiResponse.data).toBe(true);
  
  logger.info('User is authorized');
});

// Get user information
Given('I have a valid authentication token', async function() {
  logger.info('Ensuring valid authentication token exists');
  
  if (!testContext.token) {
    // Generate token if not already generated
    const response = await accountEndpoint.generateToken(testContext.credentials!);
    testContext.token = response.data.token;
    
    logger.info('Generated new authentication token');
  } else {
    logger.info('Using existing authentication token');
  }
});

When('I request my user information', async function() {
  logger.info('Requesting user information');
  
  try {
    // Get user information
    const response = await accountEndpoint.getUserById(testContext.userId!, testContext.token!);
    testContext.apiResponse = response;
    
    logger.info('User information retrieved');
  } catch (error) {
    logger.error('Error getting user information', { error: String(error) });
    testContext.errorResponse = error.response;
    throw error;
  }
});

Then('I should receive my user details', function() {
  logger.info('Verifying user details');
  
  expect(testContext.apiResponse.status).toBe(200);
  expect(testContext.apiResponse.data).toBeDefined();
  expect(testContext.apiResponse.data.userId).toBe(testContext.userId);
  
  logger.info('User details received');
});

Then('the username should match my credentials', function() {
  logger.info('Verifying username matches credentials');
  
  expect(testContext.apiResponse.data.username).toBe(testContext.credentials!.username);
  
  logger.info('Username matches credentials');
});

// Invalid credentials
When('I try to generate a token with invalid credentials', async function() {
  logger.info('Generating token with invalid credentials');
  
  // Invalid credentials
  const invalidCredentials = {
    username: 'invaliduser',
    password: 'invalidPassword123!'
  };
  
  try {
    // Generate token with invalid credentials
    const response = await accountEndpoint.generateToken(invalidCredentials);
    testContext.apiResponse = response;
    
    logger.info('Attempt to generate token with invalid credentials complete');
  } catch (error) {
    logger.error('Error generating token with invalid credentials', { error: String(error) });
    testContext.errorResponse = error.response;
    throw error;
  }
});

Then('the result should indicate authorization failure', function() {
  logger.info('Verifying authorization failure result');
  
  expect(testContext.apiResponse.data.result).toBe('User authorization failed.');
  
  logger.info('Authorization failure result verified');
});

// Delete account
When('I delete my user account', async function() {
  logger.info('Deleting user account');
  
  try {
    // Delete user account
    const response = await accountEndpoint.deleteUser(testContext.userId!, testContext.token!);
    testContext.apiResponse = response;
    
    logger.info('User account deleted');
  } catch (error) {
    logger.error('Error deleting user account', { error: String(error) });
    testContext.errorResponse = error.response;
    throw error;
  }
});

Then('the account should be deleted successfully', function() {
  logger.info('Verifying account deletion');
  
  expect(testContext.apiResponse.status).toBe(204);
  
  // Clear test context after successful deletion
  testContext.userId = undefined;
  testContext.token = undefined;
  
  logger.info('Account deleted successfully');
});