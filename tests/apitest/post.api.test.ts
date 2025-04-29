/**
 * Post API Tests
 * Tests for the JSONPlaceholder Post API
 */

import { test, expect } from '@playwright/test';
import { apiHelper } from '../../api/helpers/api.helper';
import { allureReporter } from '../../utils/reporting/allureReporter';

// Define types for API responses
interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

// Define test data
const newPost = {
  title: 'Test Post Title',
  body: 'This is a test post created for API testing',
  userId: 1
};

const updatedPost = {
  title: 'Updated Post Title',
  body: 'This post has been updated via API'
};

test.describe('Post API Tests', () => {
  
  // Set up test metadata
  test.beforeEach(async ({ }, testInfo) => {
    allureReporter.startTest(testInfo.title, 'Tests for the JSONPlaceholder Post API', [
      { type: 'feature', value: 'Posts API' },
      { type: 'story', value: 'CRUD Operations' },
      { type: 'severity', value: 'normal' },
      { type: 'framework', value: 'hybrid-playwright' }
    ]);
  });
  
  // Clean up after tests
  test.afterEach(async ({ }, testInfo) => {
    if (testInfo.status === 'failed') {
      allureReporter.endTest(testInfo.title, 'failed', testInfo.duration);
    } else if (testInfo.status === 'skipped') {
      allureReporter.endTest(testInfo.title, 'skipped', testInfo.duration);
    } else {
      allureReporter.endTest(testInfo.title, 'passed', testInfo.duration);
    }
  });
  
  test('should get all posts', async () => {
    // Send GET request to posts endpoint
    const response = await apiHelper.get<Post[]>('posts');
    
    // Verify response status
    expect(response.status).toBe(200);
    
    // Verify response data
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBeTruthy();
    expect(response.data.length).toBeGreaterThan(0);
    
    // Verify post structure
    const firstPost = response.data[0];
    expect(firstPost.id).toBeDefined();
    expect(firstPost.title).toBeDefined();
    expect(firstPost.body).toBeDefined();
    expect(firstPost.userId).toBeDefined();
    
    // Log first post ID
    console.log(`First post ID: ${firstPost.id}`);
  });
  
  test('should get a specific post', async () => {
    // Send GET request to specific post endpoint
    const response = await apiHelper.get<Post>('posts/1');
    
    // Verify response status
    expect(response.status).toBe(200);
    
    // Verify response data
    expect(response.data).toBeDefined();
    expect(response.data.id).toBe(1);
    
    // Verify post title
    expect(response.data.title).toBe(
      'sunt aut facere repellat provident occaecati excepturi optio reprehenderit'
    );
    
    // Verify post body contains expected text
    expect(response.data.body).toContain('quia et suscipit');
  });
  
  test('should create a new post', async () => {
    // Send POST request to create a new post
    const response = await apiHelper.post<Post>('posts', newPost);
    
    // Verify response status
    expect(response.status).toBe(201);
    
    // Verify response data
    expect(response.data).toBeDefined();
    expect(response.data.id).toBeDefined();
    
    // Verify post data matches what we sent
    expect(response.data.title).toBe(newPost.title);
    expect(response.data.body).toBe(newPost.body);
    expect(response.data.userId).toBe(newPost.userId);
  });
  
  test('should update an existing post', async () => {
    // Send PUT request to update a post
    const response = await apiHelper.put<Post>('posts/1', updatedPost);
    
    // Verify response status
    expect(response.status).toBe(200);
    
    // Verify response data
    expect(response.data).toBeDefined();
    
    // Verify post data was updated
    expect(response.data.title).toBe(updatedPost.title);
    expect(response.data.body).toBe(updatedPost.body);
    expect(response.data.id).toBe(1);
  });
  
  test('should delete a post', async () => {
    // Send DELETE request to delete a post
    const response = await apiHelper.delete('posts/1');
    
    // Verify response status
    expect(response.status).toBe(200);
    
    // Note: JSONPlaceholder doesn't actually delete resources, it just pretends to
    // In a real API, we would verify the post no longer exists by trying to get it
  });
  
  test('should get comments for a post', async () => {
    // Send GET request to get comments for a post
    const response = await apiHelper.get<Comment[]>('posts/1/comments');
    
    // Verify response status
    expect(response.status).toBe(200);
    
    // Verify response data
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBeTruthy();
    expect(response.data.length).toBeGreaterThan(0);
    
    // Verify comment structure
    const firstComment = response.data[0];
    expect(firstComment.id).toBeDefined();
    expect(firstComment.postId).toBe(1);
    expect(firstComment.name).toBeDefined();
    expect(firstComment.email).toBeDefined();
    expect(firstComment.body).toBeDefined();
  });
  
  test('should verify API response time for getting posts', async () => {
    // Start timer
    const startTime = Date.now();
    
    // Send GET request to posts endpoint
    const response = await apiHelper.get<Post[]>('posts');
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Verify response status
    expect(response.status).toBe(200);
    
    // Verify response time is within acceptable range (1000ms)
    expect(responseTime).toBeLessThan(1000);
    
    // Log response time
    console.log(`Response time: ${responseTime}ms`);
  });
});