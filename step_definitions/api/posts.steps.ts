/**
 * API Posts Step Definitions
 * Implements BDD steps for the Posts API feature
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ApiHelper } from '../../api/helpers/api.helper';
import { logger } from '../../utils/logger/logger';
import { AIHelper } from '../../ai/utils/ai.helper';

// Test context for sharing data between steps
import { TestContext } from '../support/TestContext';

// Initialize API helper
const apiHelper = new ApiHelper('https://jsonplaceholder.typicode.com');

// Store API responses and metrics
let apiResponse: any;
let responseTime: number;
let postData: any;

// API Steps
Given('the JSONPlaceholder API is available', async function() {
  logger.info('Checking if JSONPlaceholder API is available');
  
  try {
    // Make a simple request to verify API is available
    const response = await apiHelper.get('/posts/1');
    expect(response.status).toBe(200);
    logger.info('JSONPlaceholder API is available');
  } catch (error) {
    logger.error('JSONPlaceholder API is not available', { error });
    throw new Error('JSONPlaceholder API is not available');
  }
});

Given('I have the following post data:', async function(this: TestContext, docString: string) {
  logger.info('Setting post data');
  
  try {
    // Parse the JSON string
    postData = JSON.parse(docString);
    logger.debug('Post data parsed', { postData });
    
    // Store in test context
    this.setTestData('postData', postData);
  } catch (error) {
    logger.error('Failed to parse post data', { error, docString });
    throw new Error(`Failed to parse post data: ${error.message}`);
  }
});

When('I send a GET request to {string}', async function(this: TestContext, endpoint: string) {
  logger.info(`Sending GET request to ${endpoint}`);
  
  try {
    // Make GET request
    const startTime = Date.now();
    apiResponse = await apiHelper.get(endpoint);
    const endTime = Date.now();
    responseTime = endTime - startTime;
    
    // Store in test context
    this.setTestData('apiResponse', apiResponse);
    this.setTestData('responseTime', responseTime);
    
    logger.debug('GET request successful', { 
      status: apiResponse.status, 
      responseTime: `${responseTime}ms`
    });
  } catch (error) {
    logger.error(`Failed to send GET request to ${endpoint}`, { error });
    throw error;
  }
});

When('I send a POST request to {string} with the post data', async function(this: TestContext, endpoint: string) {
  logger.info(`Sending POST request to ${endpoint}`);
  
  try {
    // Get post data from context
    const data = this.getTestData('postData') || postData;
    
    // Make POST request
    const startTime = Date.now();
    apiResponse = await apiHelper.post(endpoint, data);
    const endTime = Date.now();
    responseTime = endTime - startTime;
    
    // Store in test context
    this.setTestData('apiResponse', apiResponse);
    this.setTestData('responseTime', responseTime);
    
    logger.debug('POST request successful', { 
      status: apiResponse.status, 
      responseTime: `${responseTime}ms`
    });
  } catch (error) {
    logger.error(`Failed to send POST request to ${endpoint}`, { error });
    throw error;
  }
});

When('I send a PUT request to {string} with the post data', async function(this: TestContext, endpoint: string) {
  logger.info(`Sending PUT request to ${endpoint}`);
  
  try {
    // Get post data from context
    const data = this.getTestData('postData') || postData;
    
    // Make PUT request
    const startTime = Date.now();
    apiResponse = await apiHelper.put(endpoint, data);
    const endTime = Date.now();
    responseTime = endTime - startTime;
    
    // Store in test context
    this.setTestData('apiResponse', apiResponse);
    this.setTestData('responseTime', responseTime);
    
    logger.debug('PUT request successful', { 
      status: apiResponse.status, 
      responseTime: `${responseTime}ms`
    });
  } catch (error) {
    logger.error(`Failed to send PUT request to ${endpoint}`, { error });
    throw error;
  }
});

When('I send a DELETE request to {string}', async function(this: TestContext, endpoint: string) {
  logger.info(`Sending DELETE request to ${endpoint}`);
  
  try {
    // Make DELETE request
    const startTime = Date.now();
    apiResponse = await apiHelper.delete(endpoint);
    const endTime = Date.now();
    responseTime = endTime - startTime;
    
    // Store in test context
    this.setTestData('apiResponse', apiResponse);
    this.setTestData('responseTime', responseTime);
    
    logger.debug('DELETE request successful', { 
      status: apiResponse.status, 
      responseTime: `${responseTime}ms`
    });
  } catch (error) {
    logger.error(`Failed to send DELETE request to ${endpoint}`, { error });
    throw error;
  }
});

When('I measure the response time for a GET request to {string}', async function(this: TestContext, endpoint: string) {
  logger.info(`Measuring response time for GET request to ${endpoint}`);
  
  try {
    // Make multiple requests to get a more reliable measurement
    const numRequests = 3;
    let totalTime = 0;
    
    for (let i = 0; i < numRequests; i++) {
      const startTime = Date.now();
      const response = await apiHelper.get(endpoint);
      const endTime = Date.now();
      totalTime += (endTime - startTime);
      
      // Store the last response
      if (i === numRequests - 1) {
        apiResponse = response;
        this.setTestData('apiResponse', apiResponse);
      }
    }
    
    // Calculate average response time
    responseTime = totalTime / numRequests;
    this.setTestData('responseTime', responseTime);
    
    logger.debug('Response time measurement complete', { 
      averageResponseTime: `${responseTime}ms`,
      numRequests
    });
  } catch (error) {
    logger.error(`Failed to measure response time for ${endpoint}`, { error });
    throw error;
  }
});

Then('the response status should be {int}', async function(this: TestContext, expectedStatus: number) {
  logger.info(`Verifying response status is ${expectedStatus}`);
  
  // Get response from context
  const response = this.getTestData('apiResponse') || apiResponse;
  
  try {
    expect(response.status).toBe(expectedStatus);
    logger.debug('Response status verified', { 
      expected: expectedStatus, 
      actual: response.status
    });
  } catch (error) {
    logger.error('Response status verification failed', { 
      expected: expectedStatus, 
      actual: response.status,
      error
    });
    throw error;
  }
});

Then('the response should be a JSON array', async function(this: TestContext) {
  logger.info('Verifying response is a JSON array');
  
  // Get response from context
  const response = this.getTestData('apiResponse') || apiResponse;
  
  try {
    expect(Array.isArray(response.data)).toBeTruthy();
    logger.debug('Response is a JSON array', { 
      arrayLength: response.data.length
    });
  } catch (error) {
    logger.error('Response is not a JSON array', { 
      dataType: typeof response.data,
      error
    });
    throw error;
  }
});

Then('the response should be a JSON object', async function(this: TestContext) {
  logger.info('Verifying response is a JSON object');
  
  // Get response from context
  const response = this.getTestData('apiResponse') || apiResponse;
  
  try {
    expect(typeof response.data).toBe('object');
    expect(Array.isArray(response.data)).toBeFalsy();
    logger.debug('Response is a JSON object');
  } catch (error) {
    logger.error('Response is not a JSON object', { 
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      error
    });
    throw error;
  }
});

Then('the response should contain at least {int} posts', async function(this: TestContext, minCount: number) {
  logger.info(`Verifying response contains at least ${minCount} posts`);
  
  // Get response from context
  const response = this.getTestData('apiResponse') || apiResponse;
  
  try {
    expect(Array.isArray(response.data)).toBeTruthy();
    expect(response.data.length).toBeGreaterThanOrEqual(minCount);
    logger.debug('Response contains expected number of posts', { 
      expected: `>= ${minCount}`, 
      actual: response.data.length
    });
  } catch (error) {
    logger.error('Response does not contain expected number of posts', { 
      expected: `>= ${minCount}`, 
      actual: response.data.length,
      error
    });
    throw error;
  }
});

Then('the response should include the following fields:', async function(this: TestContext, dataTable: any) {
  logger.info('Verifying response includes expected fields');
  
  // Get response from context
  const response = this.getTestData('apiResponse') || apiResponse;
  
  try {
    // Get rows from table (excluding header)
    const rows = dataTable.rows().slice(1);
    
    for (const [field, type] of rows) {
      // Check field exists
      expect(response.data).toHaveProperty(field);
      
      // Check field type
      if (type === 'string') {
        expect(typeof response.data[field]).toBe('string');
      } else if (type === 'number') {
        expect(typeof response.data[field]).toBe('number');
      } else if (type === 'boolean') {
        expect(typeof response.data[field]).toBe('boolean');
      } else if (type === 'object') {
        expect(typeof response.data[field]).toBe('object');
      } else if (type === 'array') {
        expect(Array.isArray(response.data[field])).toBeTruthy();
      }
    }
    
    logger.debug('Response includes all expected fields', { 
      fields: rows.map(([field]: string[]) => field).join(', ')
    });
  } catch (error) {
    logger.error('Response field verification failed', { error });
    throw error;
  }
});

Then('the response should include the post data', async function(this: TestContext) {
  logger.info('Verifying response includes the post data');
  
  // Get response and post data from context
  const response = this.getTestData('apiResponse') || apiResponse;
  const data = this.getTestData('postData') || postData;
  
  try {
    // Check each field from the post data
    for (const [key, value] of Object.entries(data)) {
      expect(response.data).toHaveProperty(key);
      expect(response.data[key]).toEqual(value);
    }
    
    logger.debug('Response includes post data', { 
      fields: Object.keys(data).join(', ')
    });
  } catch (error) {
    logger.error('Response does not include expected post data', { error });
    throw error;
  }
});

Then('the response should include an {string} field', async function(this: TestContext, field: string) {
  logger.info(`Verifying response includes ${field} field`);
  
  // Get response from context
  const response = this.getTestData('apiResponse') || apiResponse;
  
  try {
    expect(response.data).toHaveProperty(field);
    logger.debug(`Response includes ${field} field`, { 
      fieldValue: response.data[field]
    });
  } catch (error) {
    logger.error(`Response does not include ${field} field`, { error });
    throw error;
  }
});

Then('the response should include an {string} field with value {int}', async function(this: TestContext, field: string, value: number) {
  logger.info(`Verifying response includes ${field} field with value ${value}`);
  
  // Get response from context
  const response = this.getTestData('apiResponse') || apiResponse;
  
  try {
    expect(response.data).toHaveProperty(field);
    expect(response.data[field]).toBe(value);
    logger.debug(`Response includes ${field} field with correct value`);
  } catch (error) {
    logger.error(`Response field verification failed`, { 
      field,
      expectedValue: value,
      actualValue: response.data[field],
      error
    });
    throw error;
  }
});

Then('every post in the response should have {string} equal to {int}', async function(this: TestContext, field: string, value: number) {
  logger.info(`Verifying every post has ${field} equal to ${value}`);
  
  // Get response from context
  const response = this.getTestData('apiResponse') || apiResponse;
  
  try {
    expect(Array.isArray(response.data)).toBeTruthy();
    
    response.data.forEach((post: any, index: number) => {
      expect(post).toHaveProperty(field);
      expect(post[field]).toBe(value);
    });
    
    logger.debug(`All posts have ${field} equal to ${value}`, { 
      postCount: response.data.length
    });
  } catch (error) {
    logger.error('Not all posts have the expected field value', { error });
    throw error;
  }
});

Then('the response time should be less than {int} milliseconds', async function(this: TestContext, maxTime: number) {
  logger.info(`Verifying response time is less than ${maxTime}ms`);
  
  // Get response time from context
  const time = this.getTestData('responseTime') || responseTime;
  
  try {
    expect(time).toBeLessThan(maxTime);
    logger.debug('Response time is within acceptable range', { 
      expected: `< ${maxTime}ms`, 
      actual: `${time}ms`
    });
  } catch (error) {
    logger.error('Response time is too slow', { 
      expected: `< ${maxTime}ms`, 
      actual: `${time}ms`,
      error
    });
    throw error;
  }
});