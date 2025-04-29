/**
 * Global Setup
 * Runs once before all tests
 */

import * as fs from 'fs';
import * as path from 'path';
import { chromium, FullConfig } from '@playwright/test';
import { logger } from './utils/logger/logger';

/**
 * Setup function
 * Performs global setup before tests
 */
async function globalSetup(config: FullConfig): Promise<void> {
  logger.info('Starting global setup');
  
  // Create required directories
  createDirectories();
  
  try {
    // Set up auth state if needed
    await setupAuth(config);
    
    logger.info('Global setup completed successfully');
  } catch (error) {
    logger.error('Error during global setup', { error: String(error) });
    throw error;
  }
}

/**
 * Create required directories
 */
function createDirectories(): void {
  // Create artifacts directories
  const directories = [
    'artifacts',
    'artifacts/screenshots',
    'artifacts/videos',
    'artifacts/reports',
    'artifacts/downloads',
    'logs',
  ];
  
  for (const dir of directories) {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      logger.debug(`Creating directory: ${dirPath}`);
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}

/**
 * Setup authentication
 * Performs authentication and saves state
 */
async function setupAuth(config: FullConfig): Promise<void> {
  // In a real application, we would set up authentication here
  // For JSONPlaceholder and Book Store API, we'll use API-based auth
  
  // Check if we need to perform auth (can be controlled via env var)
  const skipAuth = process.env.SKIP_AUTH === 'true';
  
  if (skipAuth) {
    logger.info('Skipping authentication setup');
    return;
  }
  
  logger.info('Setting up authentication');
  
  try {
    // For API testing, we'll just create a mock authentication state
    // In a real application, we would call the authentication API here
    
    // Create a simple storage state with auth tokens
    const storageState = {
      cookies: [],
      origins: [
        {
          origin: 'https://jsonplaceholder.typicode.com',
          localStorage: [
            {
              name: 'demo_authenticated',
              value: 'true'
            },
            {
              name: 'demo_username',
              value: 'testuser'
            },
            {
              name: 'demo_token',
              value: `demo-token-${Date.now()}`
            }
          ]
        },
        {
          origin: 'https://demoqa.com',
          localStorage: [
            {
              name: 'bookstore_auth_token',
              value: `bookstore-token-${Date.now()}`
            },
            {
              name: 'bookstore_user_id',
              value: 'test-user-id'
            }
          ]
        }
      ]
    };
    
    // Save storage state
    const storageStatePath = path.join(__dirname, 'artifacts', 'storage-state.json');
    
    logger.debug(`Saving storage state to: ${storageStatePath}`);
    fs.writeFileSync(storageStatePath, JSON.stringify(storageState, null, 2));
    
    logger.info('Authentication setup completed');
  } catch (error) {
    logger.error('Error during authentication setup', { error: String(error) });
    
    // Rethrow the error
    throw error;
  }
}

export default globalSetup;