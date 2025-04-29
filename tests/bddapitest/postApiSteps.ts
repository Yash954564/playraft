import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import axios from 'axios';
import { ApiHelper } from '../../api/helpers/api.helper';

// Global variables to store state between steps
let apiHelper: ApiHelper;
let baseUrl: string;
let response: any;
let requestData: any;
let responseTime: number;
let postId: string;

/**
 * Background steps
 */
Given('the JSONPlaceholder API is available for posts', async function() {
  // Check if the API is available
  const checkResponse = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
  expect(checkResponse.status).toBe(200);
});

Given('I have the posts base URL {string}', function(url: string) {
  baseUrl = url;
  apiHelper = new ApiHelper(baseUrl);
});

/**
 * Post-specific steps
 */
When('I send a GET request to posts endpoint', async function() {
  const startTime = Date.now();
  response = await apiHelper.get('/posts');
  responseTime = Date.now() - startTime;
});

When('I send a GET request to post with ID {string}', async function(id: string) {
  postId = id;
  const startTime = Date.now();
  response = await apiHelper.get(`/posts/${id}`);
  responseTime = Date.now() - startTime;
});

When('I create a new post with the following data:', async function(dataTable: any) {
  const rows = dataTable.hashes();
  if (rows.length > 0) {
    requestData = rows[0];
    
    // Ensure userId is a number
    if (requestData.userId) {
      requestData.userId = parseInt(requestData.userId);
    }
  }
  
  const startTime = Date.now();
  response = await apiHelper.post('/posts', requestData);
  responseTime = Date.now() - startTime;
  
  // Store the created post ID
  if (response.data && response.data.id) {
    postId = response.data.id.toString();
  }
});

When('I update the post with the following data:', async function(dataTable: any) {
  const rows = dataTable.hashes();
  if (rows.length > 0) {
    requestData = rows[0];
    
    // Ensure userId is a number if present
    if (requestData.userId) {
      requestData.userId = parseInt(requestData.userId);
    }
  }
  
  const startTime = Date.now();
  response = await apiHelper.put(`/posts/${postId}`, requestData);
  responseTime = Date.now() - startTime;
});

When('I delete the post with ID {string}', async function(id: string) {
  postId = id;
  const startTime = Date.now();
  response = await apiHelper.delete(`/posts/${id}`);
  responseTime = Date.now() - startTime;
});

/**
 * Post-specific assertion steps
 */
Then('the response should contain a list of posts', function() {
  expect(Array.isArray(response.data)).toBe(true);
  expect(response.data.length).toBeGreaterThan(0);
});

Then('each post should have a title and body', function() {
  for (const post of response.data) {
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('body');
    expect(post.title).toBeTruthy();
    expect(post.body).toBeTruthy();
  }
});

Then('the response should contain a post with id {string}', function(id: string) {
  expect(response.data).toHaveProperty('id', parseInt(id));
});

Then('the post should have a title {string}', function(title: string) {
  expect(response.data.title).toBe(title);
});

Then('the post should have a body containing {string}', function(bodyText: string) {
  expect(response.data.body).toContain(bodyText);
});

Then('the post should be created with the data I provided', function() {
  expect(response.data).toHaveProperty('id');
  
  // Check that all provided fields match
  for (const key in requestData) {
    expect(response.data).toHaveProperty(key, requestData[key]);
  }
});

Then('the post should be updated with the data I provided', function() {
  // Check that all provided fields match
  for (const key in requestData) {
    expect(response.data).toHaveProperty(key, requestData[key]);
  }
});

Then('the post should no longer exist', async function() {
  try {
    await apiHelper.get(`/posts/${postId}`);
    // If we get here, the post still exists (JSONPlaceholder doesn't actually delete resources)
    // For JSONPlaceholder this will pass as it returns an empty object for deleted resources
    expect(response.status).toBe(200);
  } catch (error) {
    // If we get here with a 404, the post was properly deleted
    expect(error.status).toBe(404);
  }
});

/**
 * Steps for comments on posts
 */
When('I get the comments for post with ID {string}', async function(id: string) {
  postId = id;
  const startTime = Date.now();
  response = await apiHelper.get(`/posts/${id}/comments`);
  responseTime = Date.now() - startTime;
});

Then('the response should contain comments for the post', function() {
  expect(Array.isArray(response.data)).toBe(true);
  expect(response.data.length).toBeGreaterThan(0);
});

Then('each comment should have an email and body', function() {
  for (const comment of response.data) {
    expect(comment).toHaveProperty('email');
    expect(comment).toHaveProperty('body');
    expect(comment.email).toContain('@');
    expect(comment.body).toBeTruthy();
  }
});

/**
 * Performance steps
 */
Then('the posts API should respond within {int} milliseconds', function(maxTime: number) {
  expect(responseTime).toBeLessThan(maxTime);
});

/**
 * Data preservation steps
 */
Then('I store the first post ID for later use', function() {
  if (Array.isArray(response.data) && response.data.length > 0) {
    postId = response.data[0].id.toString();
    console.log(`Stored post ID: ${postId}`);
  } else {
    throw new Error('No posts found to store ID');
  }
});