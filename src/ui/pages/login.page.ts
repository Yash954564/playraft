import { Page } from '@playwright/test';
import BasePage from './base.page';
import { logger } from '../../core/logger';
import { allureReporter } from '../../core/reporter/allure.reporter';

/**
 * Login Page - Page Object Model
 * Represents the login page of the application
 */
export class LoginPage extends BasePage {
  // Selectors
  private usernameSelector = '#username';
  private passwordSelector = '#password';
  private loginButtonSelector = '#log-in';
  private errorMessageSelector = '.alert-warning';
  private rememberMeSelector = '.form-check-input';
  private forgotPasswordSelector = 'a[href="#"]';
  private logoSelector = '.logo-w';
  
  // Constructor
  constructor(page: Page) {
    super(page, 'Login');
    this.baseUrl = 'https://demo.applitools.com/';
  }
  
  /**
   * Check if login page is loaded
   * @returns True if page is loaded, false otherwise
   */
  public async isLoaded(): Promise<boolean> {
    return await this.helper.verifyElementExists(this.usernameSelector) &&
           await this.helper.verifyElementExists(this.passwordSelector) &&
           await this.helper.verifyElementExists(this.loginButtonSelector);
  }
  
  /**
   * Login with credentials
   * @param username - Username or email
   * @param password - Password
   * @returns True if login successful, false otherwise
   */
  public async login(username: string, password: string): Promise<boolean> {
    logger.info(`Logging in with username: ${username}`);
    
    allureReporter.startStep('Login with credentials');
    
    try {
      // Fill username
      await this.fill(this.usernameSelector, username, { clear: true });
      
      // Fill password
      await this.fill(this.passwordSelector, password, { clear: true });
      
      // Take screenshot before login
      await this.takeScreenshot('Before Login');
      
      // Click login button
      await this.click(this.loginButtonSelector);
      
      // Wait for navigation (either to dashboard or error)
      await this.page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {
        // Navigation may not happen if login fails
      });
      
      // Check if login was successful (error message should not be visible)
      const errorVisible = await this.isVisible(this.errorMessageSelector);
      
      if (errorVisible) {
        const errorText = await this.getText(this.errorMessageSelector);
        logger.warn(`Login failed: ${errorText}`);
        
        // Take screenshot after failed login
        await this.takeScreenshot('Login Failed');
        
        allureReporter.endStep('failed');
        return false;
      }
      
      logger.info('Login successful');
      allureReporter.endStep('passed');
      return true;
    } catch (error) {
      logger.error(`Login failed with error: ${error}`);
      await this.takeScreenshot('Login Error');
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Check "Remember Me" checkbox
   * @param check - Whether to check or uncheck
   */
  public async checkRememberMe(check: boolean = true): Promise<void> {
    logger.debug(`${check ? 'Checking' : 'Unchecking'} "Remember Me" checkbox`);
    
    allureReporter.startStep(`${check ? 'Check' : 'Uncheck'} "Remember Me" checkbox`);
    
    try {
      await this.check(this.rememberMeSelector, check);
      allureReporter.endStep('passed');
    } catch (error) {
      logger.error(`Failed to ${check ? 'check' : 'uncheck'} "Remember Me" checkbox: ${error}`);
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Click "Forgot Password" link
   */
  public async clickForgotPassword(): Promise<void> {
    logger.debug('Clicking "Forgot Password" link');
    
    allureReporter.startStep('Click "Forgot Password" link');
    
    try {
      await this.click(this.forgotPasswordSelector);
      allureReporter.endStep('passed');
    } catch (error) {
      logger.error(`Failed to click "Forgot Password" link: ${error}`);
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Get login error message
   * @returns Error message or null if no error
   */
  public async getErrorMessage(): Promise<string | null> {
    if (await this.isVisible(this.errorMessageSelector)) {
      return this.getText(this.errorMessageSelector);
    }
    return null;
  }
  
  /**
   * Verify the logo is displayed
   * @returns True if logo is displayed, false otherwise
   */
  public async verifyLogoDisplayed(): Promise<boolean> {
    return this.isVisible(this.logoSelector);
  }
  
  /**
   * Get the title of the login page
   * @returns Page title
   */
  public async getLoginPageTitle(): Promise<string> {
    return this.getTitle();
  }
  
  /**
   * Wait for login page to load
   * @param timeout - Timeout in milliseconds
   */
  public async waitForLoginPageLoad(timeout: number = 30000): Promise<void> {
    await this.waitForPageLoad(timeout);
  }
  
  /**
   * Verify login page title
   * @returns True if title matches expected value, false otherwise
   */
  public async verifyLoginPageTitle(): Promise<boolean> {
    return this.verifyTitle('ACME Demo App');
  }
}

// Export the LoginPage class
export default LoginPage;