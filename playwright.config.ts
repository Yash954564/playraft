/**
 * Playwright Configuration
 * This file configures Playwright for the test framework
 */

import { PlaywrightTestConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from .env file
if (fs.existsSync('.env')) {
  dotenv.config();
}

// Define test environments (local, dev, staging, prod)
const environment = process.env.TEST_ENV || 'local';

// Base URLs for different environments
const baseUrls = {
  local: 'https://jsonplaceholder.typicode.com',
  dev: 'https://dev.jsonplaceholder.typicode.com',
  staging: 'https://staging.jsonplaceholder.typicode.com',
  prod: 'https://jsonplaceholder.typicode.com',
};

// Screenshots, videos, and reports directories
const rootDir = path.join(__dirname);
const artifactsDir = path.join(rootDir, 'artifacts');
const screenshotsDir = path.join(artifactsDir, 'screenshots');
const videosDir = path.join(artifactsDir, 'videos');
const reportsDir = path.join(rootDir, 'reports');

// Create directories if they don't exist
for (const dir of [artifactsDir, screenshotsDir, videosDir, reportsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Default timeout values
const defaultTimeoutMs = 30000; // 30 seconds
const defaultNavigationTimeoutMs = 60000; // 60 seconds

// Determine number of workers
// Default to 50% of available CPU cores, with a minimum of 1 and maximum of 4
const cpuCount = require('os').cpus().length;
const defaultWorkers = Math.max(1, Math.min(4, Math.floor(cpuCount / 2)));
const workers = process.env.CI ? 1 : defaultWorkers;

// Playwright configuration
const config: PlaywrightTestConfig = {
  // Test directory
  testDir: './tests',
  
  // Test file pattern
  testMatch: '**/*.test.ts',
  
  // Timeout
  timeout: defaultTimeoutMs,
  
  // Expect timeout
  expect: {
    timeout: defaultTimeoutMs,
  },
  
  // Disable test reuse across workers
  fullyParallel: true,
  
  // Fail the test on console errors
  forbidOnly: !!process.env.CI,
  
  // Retry failed tests
  retries: process.env.CI ? 2 : 0,
  
  // Number of parallel workers
  workers,
  
  // Reporter
  reporter: [
    ['html', { outputFolder: reportsDir }],
    ['list'],
    ['json', { outputFile: path.join(reportsDir, 'test-results.json') }],
    // ReportPortal reporter - uncomment when environment is properly configured
    // ['@reportportal/agent-js-playwright', {
    //   configFile: path.join(__dirname, 'reportportal.config.js'),
    //   launchAttributes: [
    //     {
    //       key: 'framework',
    //       value: 'playwright'
    //     },
    //     {
    //       key: 'environment', 
    //       value: environment
    //     }
    //   ],
    //   reportLogs: true,
    //   reportScreenshots: true,
    // }]
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL
    baseURL: baseUrls[environment as keyof typeof baseUrls],
    
    // Automatic screenshots on failure
    screenshot: 'only-on-failure',
    
    // Capture trace on failure
    trace: 'retain-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Navigation timeout
    navigationTimeout: defaultNavigationTimeoutMs,
    
    // Action timeout
    actionTimeout: defaultTimeoutMs,
    
    // Headless mode
    headless: true,
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Accept browser downloads
    acceptDownloads: true,
  },
  
  // Projects for different test types and browsers
  projects: [
    // API tests
    {
      name: 'api',
      testMatch: '**/apitest/**/*.test.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    
    // Book Store API tests
    {
      name: 'bookstore-api',
      testMatch: '**/apitest/bookstore/**/*.test.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    
    // AI tests
    {
      name: 'ai-tests',
      testMatch: '**/aitest/**/*.test.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    
    // UI tests - Chrome
    {
      name: 'ui-chrome',
      testMatch: '**/uitest/**/*.test.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    
    // UI tests - Firefox
    {
      name: 'ui-firefox',
      testMatch: '**/uitest/**/*.test.ts',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    
    // UI tests - Safari
    {
      name: 'ui-safari',
      testMatch: '**/uitest/**/*.test.ts',
      use: {
        ...devices['Desktop Safari'],
      },
    },
    
    // Mobile tests - iPhone
    {
      name: 'mobile-iphone',
      testMatch: '**/mobiletest/**/*.test.ts',
      use: {
        ...devices['iPhone 13'],
      },
    },
    
    // Mobile tests - Android
    {
      name: 'mobile-android',
      testMatch: '**/mobiletest/**/*.test.ts',
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],
  
  // Folder for snapshots
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
  
  // Output directories
  outputDir: artifactsDir,
  
  // Global setup
  globalSetup: './global-setup.ts',
  
  // Global teardown
  // globalTeardown: './global-teardown.ts',
};

export default config;