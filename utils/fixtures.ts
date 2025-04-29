import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { dataReader } from '../utils/dataReader';
import { configReader } from '../utils/configReader';

// Extend basic test fixtures
export const test = base.extend({
  // Custom fixture for the LoginPage
  loginPage: async ({ page }, use) => {
    // Create LoginPage instance
    const loginPage = new LoginPage(page);
    
    // Use the LoginPage
    await use(loginPage);
  },
  
  // Custom fixture that provides credentials
  credentials: async ({}, use) => {
    // Get credentials from data file
    const credentials = {
      validUser: dataReader.getCredentials('validUser'),
      invalidUser: dataReader.getCredentials('invalidUser'),
      emptyUser: { username: '', password: '' }
    };
    
    // Use the credentials
    await use(credentials);
  },
  
  // Custom fixture for authenticated state
  authenticatedPage: async ({ page }, use) => {
    // Create LoginPage instance
    const loginPage = new LoginPage(page);
    
    // Navigate to login page
    await loginPage.navigate();
    
    // Login with valid credentials
    const credentials = dataReader.getCredentials('validUser');
    await loginPage.login(credentials.username, credentials.password);
    
    // Use the authenticated page
    await use(page);
    
    // Logout after the test (cleanup)
    await loginPage.logout();
  },
  
  // Custom fixture for browser configuration
  browserConfig: async ({}, use) => {
    // Get browser configuration from config file
    const browserConfig = configReader.getValue('browser', {
      headless: true,
      slowMo: 0,
      defaultBrowser: 'chromium',
      viewportWidth: 1280,
      viewportHeight: 720
    });
    
    // Use the browser configuration
    await use(browserConfig);
  },
  
  // Custom fixture for test configuration
  testConfig: async ({}, use) => {
    // Get test configuration from config file
    const testConfig = configReader.getValue('test', {
      retries: 1,
      workers: 1,
      reporter: 'allure'
    });
    
    // Use the test configuration
    await use(testConfig);
  },
  
  // Custom fixture for timeouts
  timeouts: async ({}, use) => {
    // Get timeouts from config file
    const timeouts = configReader.getValue('timeouts', {
      default: 10000,
      pageLoad: 30000,
      implicit: 5000
    });
    
    // Use the timeouts
    await use(timeouts);
  }
});