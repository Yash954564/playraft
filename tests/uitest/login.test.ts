/**
 * Login Tests
 * Tests login functionality
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '../../pages/loginPage';
import { logger } from '../../utils/logger/logger';
import { testConfig } from '../../config/testConfig';

// Define test fixture with login page
interface LoginFixture {
  loginPage: LoginPage;
}

// Configure test with login page fixture
const loginTest = test.extend<LoginFixture>({
  loginPage: async ({ page, context }, use) => {
    // Create login page
    const loginPage = new LoginPage(page, context);
    
    // Use login page
    await use(loginPage);
  },
});

// Login test suite
loginTest.describe('Login Tests', () => {
  // Test to verify login page loads
  loginTest('should load login page', async ({ loginPage }) => {
    logger.info('Starting login page load test');
    
    // Navigate to login page
    await loginPage.navigate();
    
    // Verify login page is displayed
    const isLoginPageDisplayed = await loginPage.isLoginPageDisplayed();
    expect(isLoginPageDisplayed).toBe(true);
    
    logger.info('Login page load test completed successfully');
  });
  
  // Test to verify valid login
  loginTest('should login with valid credentials', async ({ loginPage }) => {
    logger.info('Starting valid login test');
    
    // Login with valid credentials
    await loginPage.login(
      testConfig.loginCredentials.username,
      testConfig.loginCredentials.password
    );
    
    // Check URL after login
    const url = await loginPage.getCurrentUrl();
    expect(url).toContain('/profile');
    
    logger.info('Valid login test completed successfully');
  });
  
  // Test to verify invalid login
  loginTest('should show error with invalid credentials', async ({ loginPage }) => {
    logger.info('Starting invalid login test');
    
    // Login with invalid credentials
    await loginPage.login('invaliduser', 'invalidpassword');
    
    // Check if invalid credentials message is displayed
    const isInvalidCredentialsDisplayed = await loginPage.isInvalidCredentialsDisplayed();
    expect(isInvalidCredentialsDisplayed).toBe(true);
    
    // Check invalid credentials message
    const message = await loginPage.getInvalidCredentialsMessage();
    expect(message).toContain('Invalid');
    
    logger.info('Invalid login test completed successfully');
  });
  
  // Test to verify new user button navigation
  loginTest('should navigate to registration page when clicking new user', async ({ loginPage }) => {
    logger.info('Starting new user navigation test');
    
    // Navigate to login page
    await loginPage.navigate();
    
    // Click new user button
    await loginPage.clickNewUser();
    
    // Check URL after navigation
    const url = await loginPage.getCurrentUrl();
    expect(url).toContain('/register');
    
    logger.info('New user navigation test completed successfully');
  });
});