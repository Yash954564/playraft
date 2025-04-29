import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import LoginPage from '../../src/ui/pages/login.page';
import DashboardPage from '../../src/ui/pages/dashboard.page';
import { logger } from '../../src/core/logger';
import { allureReporter } from '../../src/core/reporter/allure.reporter';

/**
 * Step definitions for login feature
 */

// This hook will run before each scenario to set context
Given('I am on the login page', async function() {
  // Get page from world object (provided by hooks.ts)
  const page = this.page;
  
  // Initialize login page
  const loginPage = new LoginPage(page);
  
  // Store login page in world object for later steps
  this.loginPage = loginPage;
  
  // Navigate to login page
  await loginPage.navigate();
  
  // Take screenshot
  await loginPage.takeScreenshot('Login Page');
  
  // Verify login page is loaded
  const isLoaded = await loginPage.isLoaded();
  expect(isLoaded).toBeTruthy();
  
  logger.info('Successfully navigated to login page');
});

When('I enter username {string} and password {string}', async function(username: string, password: string) {
  const loginPage = this.loginPage as LoginPage;
  
  allureReporter.startStep(`Enter username "${username}" and password "${password}"`);
  
  try {
    // Type username
    await loginPage.type_text(username, password);
    
    allureReporter.endStep('passed');
    logger.info(`Entered username "${username}" and password`);
  } catch (error) {
    allureReporter.endStep('failed');
    logger.error(`Failed to enter username and password: ${error}`);
    throw error;
  }
});

When('I click the login button', async function() {
  const loginPage = this.loginPage as LoginPage;
  
  allureReporter.startStep('Click login button');
  
  try {
    // Click login button
    await loginPage.click_login();
    
    // Wait for navigation to complete
    await loginPage.helper.wait(1000);
    
    allureReporter.endStep('passed');
    logger.info('Clicked login button');
  } catch (error) {
    allureReporter.endStep('failed');
    logger.error(`Failed to click login button: ${error}`);
    throw error;
  }
});

When('I check the remember me checkbox', async function() {
  const loginPage = this.loginPage as LoginPage;
  
  allureReporter.startStep('Check remember me checkbox');
  
  try {
    // Check remember me
    await loginPage.checkRememberMe();
    
    // Take screenshot
    await loginPage.takeScreenshot('Remember Me Checked');
    
    allureReporter.endStep('passed');
    logger.info('Checked remember me checkbox');
  } catch (error) {
    allureReporter.endStep('failed');
    logger.error(`Failed to check remember me checkbox: ${error}`);
    throw error;
  }
});

When('I logout from the application', async function() {
  // Create dashboard page instance
  const dashboardPage = new DashboardPage(this.page);
  
  allureReporter.startStep('Logout from application');
  
  try {
    // Logout
    await dashboardPage.logout();
    
    // Wait for login page to load
    await this.page.waitForTimeout(1000);
    
    allureReporter.endStep('passed');
    logger.info('Logged out from application');
  } catch (error) {
    allureReporter.endStep('failed');
    logger.error(`Failed to logout: ${error}`);
    throw error;
  }
});

When('I navigate through login form using Tab key', async function() {
  const loginPage = this.loginPage as LoginPage;
  
  allureReporter.startStep('Navigate through login form using Tab key');
  
  try {
    // Press Tab multiple times to navigate through form elements
    await this.page.keyboard.press('Tab'); // Focus username field
    await this.page.waitForTimeout(500);
    
    await this.page.keyboard.press('Tab'); // Focus password field
    await this.page.waitForTimeout(500);
    
    await this.page.keyboard.press('Tab'); // Focus remember me checkbox
    await this.page.waitForTimeout(500);
    
    await this.page.keyboard.press('Tab'); // Focus login button
    await this.page.waitForTimeout(500);
    
    // Take screenshot
    await loginPage.takeScreenshot('Tab Navigation');
    
    allureReporter.endStep('passed');
    logger.info('Navigated through login form using Tab key');
  } catch (error) {
    allureReporter.endStep('failed');
    logger.error(`Failed to navigate with Tab key: ${error}`);
    throw error;
  }
});

When('I enter username {string} and password {string} using keyboard', async function(username: string, password: string) {
  const loginPage = this.loginPage as LoginPage;
  
  allureReporter.startStep(`Enter credentials using keyboard`);
  
  try {
    // Press Tab to focus username field
    await this.page.keyboard.press('Tab');
    
    // Type username
    await this.page.keyboard.type(username);
    
    // Press Tab to focus password field
    await this.page.keyboard.press('Tab');
    
    // Type password
    await this.page.keyboard.type(password);
    
    allureReporter.endStep('passed');
    logger.info('Entered credentials using keyboard');
  } catch (error) {
    allureReporter.endStep('failed');
    logger.error(`Failed to enter credentials with keyboard: ${error}`);
    throw error;
  }
});

When('I press Enter to submit the login form', async function() {
  allureReporter.startStep('Press Enter to submit form');
  
  try {
    // Press Enter
    await this.page.keyboard.press('Enter');
    
    // Wait for navigation to complete
    await this.page.waitForTimeout(2000);
    
    allureReporter.endStep('passed');
    logger.info('Pressed Enter to submit login form');
  } catch (error) {
    allureReporter.endStep('failed');
    logger.error(`Failed to press Enter: ${error}`);
    throw error;
  }
});

When('I enter password {string}', async function(password: string) {
  const loginPage = this.loginPage as LoginPage;
  
  allureReporter.startStep(`Enter password`);
  
  try {
    // Enter password only
    await loginPage.fill_password(password);
    
    allureReporter.endStep('passed');
    logger.info('Entered password');
  } catch (error) {
    allureReporter.endStep('failed');
    logger.error(`Failed to enter password: ${error}`);
    throw error;
  }
});

When('I click on the show password icon', async function() {
  const loginPage = this.loginPage as LoginPage;
  
  allureReporter.startStep('Click show password icon');
  
  try {
    // Click show password icon
    await loginPage.click_show_password();
    
    // Wait a moment
    await this.page.waitForTimeout(500);
    
    allureReporter.endStep('passed');
    logger.info('Clicked show password icon');
  } catch (error) {
    allureReporter.endStep('failed');
    logger.error(`Failed to click show password icon: ${error}`);
    throw error;
  }
});

Then('I should be logged in successfully', async function() {
  // Create dashboard page instance
  const dashboardPage = new DashboardPage(this.page);
  
  // Store dashboard page in world object for later steps
  this.dashboardPage = dashboardPage;
  
  allureReporter.startStep('Verify successful login');
  
  try {
    // Verify dashboard page is loaded
    const isLoaded = await dashboardPage.isLoaded();
    expect(isLoaded).toBeTruthy();
    
    // Take screenshot
    await dashboardPage.takeScreenshot('After Login');
    
    allureReporter.endStep('passed');
    logger.info('Successfully logged in');
  } catch (error) {
    allureReporter.endStep('failed');
    logger.error(`Failed to verify successful login: ${error}`);
    throw error;
  }
});

Then('I should be redirected to the dashboard page', async function() {
  const dashboardPage = this.dashboardPage as DashboardPage;
  
  allureReporter.startStep('Verify redirect to dashboard');
  
  try {
    // Verify URL contains dashboard path
    const currentUrl = await dashboardPage.getCurrentUrl();
    expect(currentUrl).toContain('index.html');
    
    allureReporter.endStep('passed');
    logger.info(`Redirected to dashboard: ${currentUrl}`);
  } catch (error) {
    allureReporter.endStep('failed');
    logger.error(`Failed to verify dashboard redirect: ${error}`);
    throw error;
  }
});

Then('I should see my profile name displayed', async function() {
  const dashboardPage = this.dashboardPage as DashboardPage;
  
  allureReporter.startStep('Verify profile name is displayed');
  
  try {
    // Get profile name
    const profileName = await dashboardPage.getProfileName();
    
    // Verify profile name is not null or empty
    expect(profileName).toBeTruthy();
    
    allureReporter.endStep('passed');
    logger.info(`Profile name is displayed: ${profileName}`);
  } catch (error) {
    allureReporter.endStep('failed');
    logger.error(`Failed to verify profile name: ${error}`);
    throw error;
  }
});

Then('I should see an error message', async function() {
  const loginPage = this.loginPage as LoginPage;
  
  allureReporter.startStep('Verify error message is displayed');
  
  try {
    // Verify error message is displayed
    const isErrorDisplayed = await loginPage.is_error_displayed();
    expect(isErrorDisplayed).toBeTruthy();
    
    // Get error message
    const errorMessage = await loginPage.get_error_message();
    
    // Take screenshot
    await loginPage.takeScreenshot('Error Message');
    
    allureReporter.endStep('passed');
    logger.info(`Error message is displayed: ${errorMessage}`);
  } catch (error) {
    allureReporter.endStep('failed');
    logger.error(`Failed to verify error message: ${error}`);
    throw error;
  }
});

Then('I should remain on the login page', async function() {
  const loginPage = this.loginPage as LoginPage;
  
  allureReporter.startStep('Verify still on login page');
  
  try {
    // Verify login page is loaded
    const isLoaded = await loginPage.isLoaded();
    expect(isLoaded).toBeTruthy();
    
    allureReporter.endStep('passed');
    logger.info('Still on login page as expected');
  } catch (error) {
    allureReporter.endStep('failed');
    logger.error(`Failed to verify login page: ${error}`);
    throw error;
  }
});

Then('I should see my username remembered on the login page', async function() {
  const loginPage = this.loginPage as LoginPage;
  
  allureReporter.startStep('Verify username is remembered');
  
  try {
    // Get username value
    const username = await loginPage.get_username_value();
    
    // Verify username is not empty
    expect(username).toBeTruthy();
    expect(username).toBe('testuser');
    
    // Take screenshot
    await loginPage.takeScreenshot('Username Remembered');
    
    allureReporter.endStep('passed');
    logger.info(`Username is remembered: ${username}`);
  } catch (error) {
    allureReporter.endStep('failed');
    logger.error(`Failed to verify remembered username: ${error}`);
    throw error;
  }
});

Then('I should see user role as {string}', async function(expectedRole: string) {
  const dashboardPage = this.dashboardPage as DashboardPage;
  
  allureReporter.startStep(`Verify user role is ${expectedRole}`);
  
  try {
    // Get user role
    const role = await dashboardPage.getUserRole();
    
    // Verify role matches expected role
    expect(role).toBe(expectedRole);
    
    allureReporter.endStep('passed');
    logger.info(`User role verified: ${role}`);
  } catch (error) {
    allureReporter.endStep('failed');
    logger.error(`Failed to verify user role: ${error}`);
    throw error;
  }
});

Then('the password should be masked', async function() {
  const loginPage = this.loginPage as LoginPage;
  
  allureReporter.startStep('Verify password is masked');
  
  try {
    // Check if password field type is password
    const isPasswordMasked = await loginPage.is_password_masked();
    expect(isPasswordMasked).toBeTruthy();
    
    // Take screenshot
    await loginPage.takeScreenshot('Password Masked');
    
    allureReporter.endStep('passed');
    logger.info('Password is masked');
  } catch (error) {
    allureReporter.endStep('failed');
    logger.error(`Failed to verify password masking: ${error}`);
    throw error;
  }
});

Then('the password should be unmasked', async function() {
  const loginPage = this.loginPage as LoginPage;
  
  allureReporter.startStep('Verify password is unmasked');
  
  try {
    // Check if password field type is text
    const isPasswordMasked = await loginPage.is_password_masked();
    expect(isPasswordMasked).toBeFalsy();
    
    // Take screenshot
    await loginPage.takeScreenshot('Password Unmasked');
    
    allureReporter.endStep('passed');
    logger.info('Password is unmasked');
  } catch (error) {
    allureReporter.endStep('failed');
    logger.error(`Failed to verify password unmasking: ${error}`);
    throw error;
  }
});