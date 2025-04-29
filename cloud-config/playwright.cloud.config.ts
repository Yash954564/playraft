import { PlaywrightTestConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import { configReader } from '../utils/configReader';
import { browserStackService } from '../integrations/cloud/browserstack-service';
import { lambdaTestService } from '../integrations/cloud/lambdatest-service';

// Load environment variables from .env file
dotenv.config();

// Get cloud provider from environment or config
const cloudProvider = process.env.CLOUD_PROVIDER || configReader.getValue<string>('integrations.cloud.provider', 'browserstack');

/**
 * BrowserStack configuration
 */
const browserStackConfig: PlaywrightTestConfig = {
  // Test directory
  testDir: './tests',
  
  // Test timeout
  timeout: 60000,
  
  // Retry failed tests
  retries: 1,
  
  // Run tests in sequence
  workers: 1,
  
  // Reporter
  reporter: [
    ['html', { open: 'never' }],
    ['list', { printSteps: true }]
  ],
  
  // Test runner features
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'on',
    // Connect through BrowserStack
    connectOptions: {
      wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=
        ${encodeURIComponent(JSON.stringify({
          browser: 'chrome',
          os: 'Windows',
          os_version: '10',
          name: 'Playwright Test',
          build: `Cloud Test Run ${new Date().toISOString()}`,
          'browserstack.username': process.env.BROWSERSTACK_USERNAME || configReader.getValue<string>('integrations.browserstack.username', ''),
          'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY || configReader.getValue<string>('integrations.browserstack.accessKey', '')
        }))}`
    }
  },
  
  // Device configurations
  projects: [
    // Chrome on Windows
    {
      name: 'Chrome Windows',
      use: {
        connectOptions: browserStackService.generateCapabilities({
          os: 'Windows',
          osVersion: '10',
          browser: 'Chrome',
          browserVersion: 'latest'
        }, {
          buildName: `Playwright Tests ${new Date().toISOString()}`,
          projectName: 'Playwright Framework',
          sessionName: 'Windows 10 - Chrome Latest',
          debug: true,
          video: true,
          networkLogs: true,
          consoleLogs: 'info'
        })
      }
    },
    
    // Firefox on Windows
    {
      name: 'Firefox Windows',
      use: {
        connectOptions: browserStackService.generateCapabilities({
          os: 'Windows',
          osVersion: '10',
          browser: 'Firefox',
          browserVersion: 'latest'
        }, {
          buildName: `Playwright Tests ${new Date().toISOString()}`,
          projectName: 'Playwright Framework',
          sessionName: 'Windows 10 - Firefox Latest',
          debug: true,
          video: true,
          networkLogs: true,
          consoleLogs: 'info'
        })
      }
    },
    
    // Safari on macOS
    {
      name: 'Safari macOS',
      use: {
        connectOptions: browserStackService.generateCapabilities({
          os: 'OS X',
          osVersion: 'Monterey',
          browser: 'Safari',
          browserVersion: 'latest'
        }, {
          buildName: `Playwright Tests ${new Date().toISOString()}`,
          projectName: 'Playwright Framework',
          sessionName: 'macOS Monterey - Safari Latest',
          debug: true,
          video: true,
          networkLogs: true,
          consoleLogs: 'info'
        })
      }
    },
    
    // iPhone (Mobile Safari)
    {
      name: 'iPhone',
      use: {
        connectOptions: browserStackService.generateCapabilities({
          os: 'OS X',
          osVersion: 'Monterey',
          browser: 'Safari',
          device: 'iPhone 14',
          real_mobile: true,
          deviceOrientation: 'portrait'
        }, {
          buildName: `Playwright Tests ${new Date().toISOString()}`,
          projectName: 'Playwright Framework',
          sessionName: 'iPhone 14 - Mobile Safari',
          debug: true,
          video: true,
          networkLogs: true,
          consoleLogs: 'info'
        })
      }
    },
    
    // Android (Chrome)
    {
      name: 'Android',
      use: {
        connectOptions: browserStackService.generateCapabilities({
          os: 'Android',
          osVersion: '12.0',
          browser: 'chrome',
          device: 'Samsung Galaxy S22',
          real_mobile: true,
          deviceOrientation: 'portrait'
        }, {
          buildName: `Playwright Tests ${new Date().toISOString()}`,
          projectName: 'Playwright Framework',
          sessionName: 'Samsung Galaxy S22 - Chrome',
          debug: true,
          video: true,
          networkLogs: true,
          consoleLogs: 'info'
        })
      }
    }
  ]
};

/**
 * LambdaTest configuration
 */
const lambdaTestConfig: PlaywrightTestConfig = {
  // Test directory
  testDir: './tests',
  
  // Test timeout
  timeout: 60000,
  
  // Retry failed tests
  retries: 1,
  
  // Run tests in sequence
  workers: 1,
  
  // Reporter
  reporter: [
    ['html', { open: 'never' }],
    ['list', { printSteps: true }]
  ],
  
  // Common test settings
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'on'
  },
  
  // Device configurations
  projects: [
    // Chrome on Windows
    {
      name: 'Chrome Windows',
      use: {
        connectOptions: lambdaTestService.generateCapabilities({
          browserName: 'Chrome',
          browserVersion: 'latest',
          platform: 'Windows 10',
          resolution: '1920x1080',
          build: `Playwright Tests ${new Date().toISOString()}`,
          name: 'Windows 10 - Chrome Latest',
          projectName: 'Playwright Framework',
          video: true,
          network: true,
          console: true,
          visual: true,
          tunnel: false
        })
      }
    },
    
    // Firefox on Windows
    {
      name: 'Firefox Windows',
      use: {
        connectOptions: lambdaTestService.generateCapabilities({
          browserName: 'Firefox',
          browserVersion: 'latest',
          platform: 'Windows 10',
          resolution: '1920x1080',
          build: `Playwright Tests ${new Date().toISOString()}`,
          name: 'Windows 10 - Firefox Latest',
          projectName: 'Playwright Framework',
          video: true,
          network: true,
          console: true,
          visual: true,
          tunnel: false
        })
      }
    },
    
    // Safari on macOS
    {
      name: 'Safari macOS',
      use: {
        connectOptions: lambdaTestService.generateCapabilities({
          browserName: 'Safari',
          browserVersion: 'latest',
          platform: 'macOS Monterey',
          resolution: '1920x1080',
          build: `Playwright Tests ${new Date().toISOString()}`,
          name: 'macOS Monterey - Safari Latest',
          projectName: 'Playwright Framework',
          video: true,
          network: true,
          console: true,
          visual: true,
          tunnel: false
        })
      }
    }
  ]
};

/**
 * Select the cloud configuration based on the specified provider
 */
const cloudTestConfig: PlaywrightTestConfig = cloudProvider.toLowerCase() === 'lambdatest' ? lambdaTestConfig : browserStackConfig;

// Export the cloud configuration
export default cloudTestConfig;