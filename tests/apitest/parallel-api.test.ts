import { test, expect } from '@playwright/test';
import { createApiHelper, ApiHelper } from '../../api/helpers/api.helper';

/**
 * Parallel API tests
 * These tests demonstrate parallel test execution with our custom API Helper
 */
test.describe('Parallel API Tests', () => {
  // Enable parallel execution for this test suite
  test.describe.configure({ mode: 'parallel' });
  
  // Create a separate API helper for each test to avoid state contamination
  let apiHelper: ApiHelper;
  
  // Reset API helper before each test
  test.beforeEach(() => {
    apiHelper = createApiHelper('https://jsonplaceholder.typicode.com');
  });
  
  // Test: Parallel GET requests to different endpoints
  for (let i = 1; i <= 10; i++) {
    test(`should make parallel GET request ${i}`, async () => {
      // Modify test timeout to demonstrate parallel execution
      // In a real scenario, all tests would run faster together than sequentially
      test.setTimeout(10000);
      
      // Add a small delay to simulate different API response times
      const delay = Math.floor(Math.random() * 1000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Make request to different endpoints to demonstrate parallel calls
      const endpoint = i % 3 === 0 ? '/users' : (i % 2 === 0 ? '/posts' : '/comments');
      const response = await apiHelper.get(endpoint);
      
      // Verify response
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      
      // Log test ID and response time to demonstrate parallel execution
      console.log(`Test ${i} with endpoint ${endpoint} took ${response.responseTime}ms`);
    });
  }
  
  // Test: Parallel POST requests
  for (let i = 1; i <= 5; i++) {
    test(`should make parallel POST request ${i}`, async () => {
      // Create different data for each test
      const postData = {
        title: `Parallel Test ${i}`,
        body: `This is parallel test ${i} running in the automated framework`,
        userId: 1
      };
      
      // Make POST request
      const response = await apiHelper.post('/posts', postData);
      
      // Verify response
      expect(response.status).toBe(201);
      expect(response.data.title).toBe(postData.title);
      expect(response.data.body).toBe(postData.body);
      
      // Log test ID and response time
      console.log(`POST Test ${i} took ${response.responseTime}ms`);
    });
  }
  
  // Test: Data-driven parallel tests
  const testCases = [
    { id: 1, endpoint: '/users', field: 'name' },
    { id: 2, endpoint: '/posts', field: 'title' },
    { id: 3, endpoint: '/comments', field: 'email' },
    { id: 4, endpoint: '/albums', field: 'title' },
    { id: 5, endpoint: '/photos', field: 'url' }
  ];
  
  for (const tc of testCases) {
    test(`should verify ${tc.endpoint} data in parallel`, async () => {
      // Make GET request
      const response = await apiHelper.get(`${tc.endpoint}/${tc.id}`);
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data[tc.field]).toBeDefined();
      
      // Log test details
      console.log(`Test for ${tc.endpoint}/${tc.id} - ${tc.field}: ${response.data[tc.field]}`);
    });
  }
  
  // Test: Retry mechanism with parallel execution
  test('should retry failed requests in parallel', async () => {
    // Create a helper that will fail on the first attempt
    let attempt = 0;
    
    // Function that will succeed on the second attempt
    const makeRequest = async () => {
      attempt++;
      if (attempt === 1) {
        throw new Error('Simulated first attempt failure');
      }
      
      return await apiHelper.get('/users/1');
    };
    
    // Use retry mechanism
    const response = await apiHelper.retry(makeRequest, 3, 500);
    
    // Verify response
    expect(response.status).toBe(200);
    expect(response.data.id).toBe(1);
    expect(attempt).toBe(2); // Ensure it succeeded on the second attempt
  });
  
  // Test: Parallel requests with different methods
  test('should execute different HTTP methods in parallel', async () => {
    // Create promises for parallel execution
    const promises = [
      apiHelper.get('/posts/1'),
      apiHelper.post('/posts', { title: 'New Post', body: 'Body', userId: 1 }),
      apiHelper.put('/posts/1', { title: 'Updated Post', body: 'Updated Body', userId: 1 }),
      apiHelper.patch('/posts/1', { title: 'Patched Post' }),
      apiHelper.delete('/posts/1')
    ];
    
    // Execute all requests in parallel
    const results = await Promise.all(promises);
    
    // Verify all responses
    results.forEach(response => {
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(300);
    });
    
    // Log all response times
    results.forEach((response, index) => {
      const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
      console.log(`${methods[index]} request took ${response.responseTime}ms`);
    });
  });
});