/**
 * Book Store API Configuration
 * Configuration for the Book Store API tests
 */

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Book Store API Configuration
 */
export const bookStoreConfig = {
  // Base URL for the Book Store API
  baseUrl: process.env.BOOK_STORE_API_URL || 'https://demoqa.com',
  
  // Default timeout for API requests
  defaultTimeout: 30000, // 30 seconds
  
  // Default user credentials
  defaultUser: {
    username: `testuser_${Date.now()}`,
    password: 'Test@1234!'
  },
  
  // Test data
  testData: {
    // Invalid user for negative testing
    invalidUser: {
      username: 'invaliduser',
      password: 'invalidPassword123!'
    },
    
    // Invalid ISBN for negative testing
    invalidIsbn: '0000000000000'
  }
};

/**
 * Generate a random username
 * @returns Random username
 */
export function generateRandomUsername(): string {
  return `testuser_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

/**
 * Generate test credentials
 * @returns Test credentials
 */
export function generateTestCredentials(): { username: string; password: string } {
  return {
    username: generateRandomUsername(),
    password: 'Test@1234!'
  };
}