import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { apiHelper } from '../../src/api/helpers/api.helper';
import { UserEndpoint } from '../../src/api/endpoints/user.endpoint';
import { logger } from '../../src/core/logger';
import { allureReporter } from '../../src/core/reporter/allure.reporter';

// Endpoints
const userEndpoint = new UserEndpoint();

// Test data storage
let apiResponse: any;
let userData: any;
let registrationData: any;
let loginData: any;
let responseTime: number;
let baseUrl: string;

/**
 * API Base URL steps
 */
Given('the API base URL is {string}', async function(url: string) {
  baseUrl = url;
  apiHelper.setBaseUrl(url);
  logger.info(`API base URL set to: ${url}`);
});

/**
 * Request steps
 */
When('I send a GET request to {string}', async function(endpoint: string) {
  const startTime = Date.now();
  try {
    apiResponse = await apiHelper.get(endpoint);
    responseTime = Date.now() - startTime;
    
    logger.info(`GET request to ${endpoint} returned status ${apiResponse.status} in ${responseTime}ms`);
    
    // Add response to Allure report
    allureReporter.attachment(
      'API Response',
      JSON.stringify(apiResponse.data, null, 2),
      'application/json'
    );
  } catch (error) {
    logger.error(`Error making GET request to ${endpoint}: ${error}`);
    
    if (error.response) {
      apiResponse = error.response;
      responseTime = Date.now() - startTime;
    } else {
      throw error;
    }
  }
});

When('I send a POST request to {string} with the user data', async function(endpoint: string) {
  const startTime = Date.now();
  try {
    apiResponse = await apiHelper.post(endpoint, userData);
    responseTime = Date.now() - startTime;
    
    logger.info(`POST request to ${endpoint} returned status ${apiResponse.status} in ${responseTime}ms`);
    
    // Add request and response to Allure report
    allureReporter.attachment(
      'Request Data',
      JSON.stringify(userData, null, 2),
      'application/json'
    );
    
    allureReporter.attachment(
      'API Response',
      JSON.stringify(apiResponse.data, null, 2),
      'application/json'
    );
  } catch (error) {
    logger.error(`Error making POST request to ${endpoint}: ${error}`);
    
    if (error.response) {
      apiResponse = error.response;
      responseTime = Date.now() - startTime;
    } else {
      throw error;
    }
  }
});

When('I send a PUT request to {string} with the user data', async function(endpoint: string) {
  const startTime = Date.now();
  try {
    apiResponse = await apiHelper.put(endpoint, userData);
    responseTime = Date.now() - startTime;
    
    logger.info(`PUT request to ${endpoint} returned status ${apiResponse.status} in ${responseTime}ms`);
    
    // Add request and response to Allure report
    allureReporter.attachment(
      'Request Data',
      JSON.stringify(userData, null, 2),
      'application/json'
    );
    
    allureReporter.attachment(
      'API Response',
      JSON.stringify(apiResponse.data, null, 2),
      'application/json'
    );
  } catch (error) {
    logger.error(`Error making PUT request to ${endpoint}: ${error}`);
    
    if (error.response) {
      apiResponse = error.response;
      responseTime = Date.now() - startTime;
    } else {
      throw error;
    }
  }
});

When('I send a DELETE request to {string}', async function(endpoint: string) {
  const startTime = Date.now();
  try {
    apiResponse = await apiHelper.delete(endpoint);
    responseTime = Date.now() - startTime;
    
    logger.info(`DELETE request to ${endpoint} returned status ${apiResponse.status} in ${responseTime}ms`);
    
    // Add response to Allure report
    allureReporter.attachment(
      'API Response',
      JSON.stringify(apiResponse.data, null, 2),
      'application/json'
    );
  } catch (error) {
    logger.error(`Error making DELETE request to ${endpoint}: ${error}`);
    
    if (error.response) {
      apiResponse = error.response;
      responseTime = Date.now() - startTime;
    } else {
      throw error;
    }
  }
});

When('I send a POST request to {string} with the registration data', async function(endpoint: string) {
  const startTime = Date.now();
  try {
    apiResponse = await apiHelper.post(endpoint, registrationData);
    responseTime = Date.now() - startTime;
    
    logger.info(`POST request to ${endpoint} returned status ${apiResponse.status} in ${responseTime}ms`);
    
    // Add request and response to Allure report
    allureReporter.attachment(
      'Request Data',
      JSON.stringify(registrationData, null, 2),
      'application/json'
    );
    
    allureReporter.attachment(
      'API Response',
      JSON.stringify(apiResponse.data, null, 2),
      'application/json'
    );
  } catch (error) {
    logger.error(`Error making POST request to ${endpoint}: ${error}`);
    
    if (error.response) {
      apiResponse = error.response;
      responseTime = Date.now() - startTime;
    } else {
      throw error;
    }
  }
});

When('I send a POST request to {string} with the incomplete registration data', async function(endpoint: string) {
  const startTime = Date.now();
  try {
    apiResponse = await apiHelper.post(endpoint, registrationData);
    responseTime = Date.now() - startTime;
    
    logger.info(`POST request to ${endpoint} returned status ${apiResponse.status} in ${responseTime}ms`);
    
    // Add request and response to Allure report
    allureReporter.attachment(
      'Request Data',
      JSON.stringify(registrationData, null, 2),
      'application/json'
    );
    
    allureReporter.attachment(
      'API Response',
      JSON.stringify(apiResponse.data, null, 2),
      'application/json'
    );
  } catch (error) {
    logger.error(`Error making POST request to ${endpoint}: ${error}`);
    
    if (error.response) {
      apiResponse = error.response;
      responseTime = Date.now() - startTime;
    } else {
      throw error;
    }
  }
});

When('I send a POST request to {string} with the login data', async function(endpoint: string) {
  const startTime = Date.now();
  try {
    apiResponse = await apiHelper.post(endpoint, loginData);
    responseTime = Date.now() - startTime;
    
    logger.info(`POST request to ${endpoint} returned status ${apiResponse.status} in ${responseTime}ms`);
    
    // Add request and response to Allure report
    allureReporter.attachment(
      'Request Data',
      JSON.stringify(loginData, null, 2),
      'application/json'
    );
    
    allureReporter.attachment(
      'API Response',
      JSON.stringify(apiResponse.data, null, 2),
      'application/json'
    );
  } catch (error) {
    logger.error(`Error making POST request to ${endpoint}: ${error}`);
    
    if (error.response) {
      apiResponse = error.response;
      responseTime = Date.now() - startTime;
    } else {
      throw error;
    }
  }
});

When('I check the API connection details', async function() {
  // Check if the URL is HTTPS
  const isHttps = baseUrl.startsWith('https://');
  
  // Store this for later assertions
  this.isHttps = isHttps;
  
  logger.info(`API connection uses HTTPS: ${isHttps}`);
});

/**
 * Data setup steps
 */
Given('I have the following user data:', function(dataTable) {
  userData = dataTable.hashes()[0];
  logger.info(`User data prepared: ${JSON.stringify(userData)}`);
});

Given('I have the following registration data:', function(dataTable) {
  registrationData = dataTable.hashes()[0];
  logger.info(`Registration data prepared: ${JSON.stringify(registrationData)}`);
});

Given('I have the following incomplete registration data:', function(dataTable) {
  registrationData = dataTable.hashes()[0];
  logger.info(`Incomplete registration data prepared: ${JSON.stringify(registrationData)}`);
});

Given('I have the following login data:', function(dataTable) {
  loginData = dataTable.hashes()[0];
  logger.info(`Login data prepared: ${JSON.stringify(loginData)}`);
});

/**
 * Response validation steps
 */
Then('the response status code should be {int}', function(statusCode: number) {
  expect(apiResponse.status).toBe(statusCode);
  logger.info(`Response status code verified: ${statusCode}`);
});

Then('the response should contain a list of users', function() {
  expect(apiResponse.data).toBeDefined();
  expect(apiResponse.data.data).toBeDefined();
  expect(Array.isArray(apiResponse.data.data)).toBeTruthy();
  expect(apiResponse.data.data.length).toBeGreaterThan(0);
  
  logger.info(`Response contains a list of ${apiResponse.data.data.length} users`);
});

Then('the response should include pagination information', function() {
  expect(apiResponse.data.page).toBeDefined();
  expect(apiResponse.data.per_page).toBeDefined();
  expect(apiResponse.data.total).toBeDefined();
  expect(apiResponse.data.total_pages).toBeDefined();
  
  logger.info(`Response includes pagination information: Page ${apiResponse.data.page} of ${apiResponse.data.total_pages}, ${apiResponse.data.per_page} items per page, ${apiResponse.data.total} total items`);
});

Then('the response should contain user information', function() {
  expect(apiResponse.data).toBeDefined();
  expect(apiResponse.data.data).toBeDefined();
  expect(apiResponse.data.data.id).toBeDefined();
  
  logger.info(`Response contains user information for user ID ${apiResponse.data.data.id}`);
});

Then('the user should have an email address', function() {
  expect(apiResponse.data.data.email).toBeDefined();
  expect(apiResponse.data.data.email).toMatch(/@/);
  
  logger.info(`User has email address: ${apiResponse.data.data.email}`);
});

Then('the user should have an avatar image URL', function() {
  expect(apiResponse.data.data.avatar).toBeDefined();
  expect(apiResponse.data.data.avatar).toMatch(/^https?:\/\//);
  
  logger.info(`User has avatar URL: ${apiResponse.data.data.avatar}`);
});

Then('the response body should be empty', function() {
  expect(apiResponse.data).toBeDefined();
  expect(Object.keys(apiResponse.data).length).toBe(0);
  
  logger.info('Response body is empty as expected');
});

Then('the response should contain the created user data', function() {
  expect(apiResponse.data).toBeDefined();
  expect(apiResponse.data.name).toBe(userData.name);
  expect(apiResponse.data.job).toBe(userData.job);
  
  logger.info(`Response contains created user data: ${JSON.stringify(apiResponse.data)}`);
});

Then('the response should include creation timestamp', function() {
  expect(apiResponse.data.createdAt).toBeDefined();
  const createdAtDate = new Date(apiResponse.data.createdAt);
  expect(createdAtDate).toBeInstanceOf(Date);
  expect(isNaN(createdAtDate.getTime())).toBe(false);
  
  logger.info(`Response includes creation timestamp: ${apiResponse.data.createdAt}`);
});

Then('the created user should have an ID', function() {
  expect(apiResponse.data.id).toBeDefined();
  
  logger.info(`Created user has ID: ${apiResponse.data.id}`);
});

Then('the response should contain the updated user data', function() {
  expect(apiResponse.data).toBeDefined();
  expect(apiResponse.data.name).toBe(userData.name);
  expect(apiResponse.data.job).toBe(userData.job);
  
  logger.info(`Response contains updated user data: ${JSON.stringify(apiResponse.data)}`);
});

Then('the response should include update timestamp', function() {
  expect(apiResponse.data.updatedAt).toBeDefined();
  const updatedAtDate = new Date(apiResponse.data.updatedAt);
  expect(updatedAtDate).toBeInstanceOf(Date);
  expect(isNaN(updatedAtDate.getTime())).toBe(false);
  
  logger.info(`Response includes update timestamp: ${apiResponse.data.updatedAt}`);
});

Then('the response should contain a token', function() {
  expect(apiResponse.data).toBeDefined();
  expect(apiResponse.data.token).toBeDefined();
  expect(typeof apiResponse.data.token).toBe('string');
  expect(apiResponse.data.token.length).toBeGreaterThan(0);
  
  logger.info('Response contains a token');
});

Then('the response should include the user ID', function() {
  expect(apiResponse.data).toBeDefined();
  expect(apiResponse.data.id).toBeDefined();
  
  logger.info(`Response includes user ID: ${apiResponse.data.id}`);
});

Then('the response should contain an error message', function() {
  expect(apiResponse.data).toBeDefined();
  expect(apiResponse.data.error).toBeDefined();
  expect(typeof apiResponse.data.error).toBe('string');
  expect(apiResponse.data.error.length).toBeGreaterThan(0);
  
  logger.info(`Response contains error message: ${apiResponse.data.error}`);
});

Then('the response time should be less than {int} milliseconds', function(maxResponseTime: number) {
  expect(responseTime).toBeLessThan(maxResponseTime);
  
  logger.info(`Response time (${responseTime}ms) is less than ${maxResponseTime}ms`);
});

Then('the connection should use HTTPS protocol', function() {
  expect(this.isHttps).toBe(true);
  
  logger.info('Connection uses HTTPS protocol as expected');
});

Then('the response headers should include security headers', function() {
  // Check for common security headers
  const securityHeaders = [
    'content-security-policy',
    'strict-transport-security',
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection'
  ];
  
  // Convert headers to lowercase for case-insensitive comparison
  const responseHeaders = Object.keys(apiResponse.headers).map(h => h.toLowerCase());
  
  // Check if at least one security header is present
  const foundSecurityHeaders = securityHeaders.filter(h => responseHeaders.includes(h));
  
  logger.info(`Found security headers: ${foundSecurityHeaders.join(', ')}`);
  
  // Some APIs might not have all security headers, so we'll check for at least one
  expect(foundSecurityHeaders.length).toBeGreaterThan(0);
});