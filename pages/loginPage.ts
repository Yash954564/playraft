/**
 * Login Page
 * Page object for the login page
 */

import { Page, BrowserContext } from '@playwright/test';
import { BasePage } from './basePage';
import { logger } from '../utils/logger/logger';
import { testConfig } from '../config/testConfig';

/**
 * Login Page class
 * Provides methods for interacting with the login page
 */
export class LoginPage extends BasePage {
  // Login page selectors
  private readonly usernameInputSelector: string = '#userName';
  private readonly passwordInputSelector: string = '#password';
  private readonly loginButtonSelector: string = '#login';
  private readonly invalidCredentialsSelector: string = '#name';
  private readonly newUserButtonSelector: string = '#newUser';

  /**
   * Constructor
   * @param page Playwright page
   * @param context Playwright browser context
   */
  constructor(page: Page, context: BrowserContext) {
    // Initialize base page with DemoQA login page path
    super(
      page,
      context,
      testConfig.sites.bookStore.loginUrl,
      'DEMOQA',
      testConfig.sites.bookStore.baseUrl
    );
    
    logger.debug('LoginPage initialized');
  }

  /**
   * Enter username
   * @param username Username to enter
   * @returns Promise resolving when username is entered
   */
  public async enterUsername(username: string): Promise<void> {
    logger.info(`Entering username: ${username}`);
    await this.fillInput(this.usernameInputSelector, username);
  }

  /**
   * Enter password
   * @param password Password to enter
   * @returns Promise resolving when password is entered
   */
  public async enterPassword(password: string): Promise<void> {
    logger.info('Entering password');
    await this.fillInput(this.passwordInputSelector, password);
  }

  /**
   * Click login button
   * @returns Promise resolving when login button is clicked
   */
  public async clickLogin(): Promise<void> {
    logger.info('Clicking login button');
    await this.clickElement(this.loginButtonSelector);
    await this.waitForNavigation();
  }

  /**
   * Login with credentials
   * @param username Username
   * @param password Password
   * @returns Promise resolving when login is complete
   */
  public async login(username: string, password: string): Promise<void> {
    logger.info(`Logging in with username: ${username}`);
    
    await this.navigate();
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
    
    logger.info('Login completed');
  }

  /**
   * Check if invalid credentials message is displayed
   * @returns Promise resolving to boolean indicating if invalid credentials message is displayed
   */
  public async isInvalidCredentialsDisplayed(): Promise<boolean> {
    logger.debug('Checking if invalid credentials message is displayed');
    return await this.isElementVisible(this.invalidCredentialsSelector);
  }

  /**
   * Get invalid credentials message
   * @returns Promise resolving to invalid credentials message
   */
  public async getInvalidCredentialsMessage(): Promise<string> {
    logger.debug('Getting invalid credentials message');
    
    if (await this.isInvalidCredentialsDisplayed()) {
      const message = await this.getText(this.invalidCredentialsSelector);
      logger.debug(`Invalid credentials message: ${message}`);
      return message;
    }
    
    logger.debug('No invalid credentials message displayed');
    return '';
  }

  /**
   * Click new user button
   * @returns Promise resolving when new user button is clicked
   */
  public async clickNewUser(): Promise<void> {
    logger.info('Clicking new user button');
    await this.clickElement(this.newUserButtonSelector);
    await this.waitForNavigation();
  }

  /**
   * Check if login page is displayed
   * @returns Promise resolving to boolean indicating if login page is displayed
   */
  public async isLoginPageDisplayed(): Promise<boolean> {
    logger.debug('Checking if login page is displayed');
    
    try {
      // Check if login button and username input are visible
      await this.waitForElement(this.loginButtonSelector);
      await this.waitForElement(this.usernameInputSelector);
      
      logger.debug('Login page is displayed');
      return true;
    } catch (error) {
      logger.debug('Login page is not displayed', { error: String(error) });
      return false;
    }
  }

  /**
   * Get current URL
   * This extends the base class method with specific login page logging
   * @returns Promise resolving to current URL
   */
  public override async getCurrentUrl(): Promise<string> {
    logger.debug('Getting current URL from login page');
    return super.getCurrentUrl();
  }

  /**
   * Get page HTML
   * This extends the base class method with specific login page logging
   * @returns Promise resolving to page HTML
   */
  public override async getPageHtml(): Promise<string> {
    logger.debug('Getting page HTML from login page');
    return super.getPageHtml();
  }
}