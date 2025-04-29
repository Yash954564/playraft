/**
 * Login Page
 * Page object for the login page
 */

import { Page, BrowserContext } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger/logger';

/**
 * Login Page class
 * Provides methods for interacting with the login page
 */
export class LoginPage extends BasePage {
  // Selectors
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
    // Call parent constructor with page path and title
    super(page, context, '/login', 'Login Page', 'https://demoqa.com');
    logger.info('LoginPage initialized');
  }
  
  /**
   * Enter username
   * @param username Username to enter
   * @returns Promise resolving when username is entered
   */
  public async enterUsername(username: string): Promise<void> {
    logger.info(`Entering username: ${username}`);
    
    // Fill username input
    await this.fillInput(this.usernameInputSelector, username);
  }
  
  /**
   * Enter password
   * @param password Password to enter
   * @returns Promise resolving when password is entered
   */
  public async enterPassword(password: string): Promise<void> {
    logger.info(`Entering password: ${password}`);
    
    // Fill password input
    await this.fillInput(this.passwordInputSelector, password);
  }
  
  /**
   * Click login button
   * @returns Promise resolving when login button is clicked
   */
  public async clickLogin(): Promise<void> {
    logger.info('Clicking login button');
    
    // Click login button
    await this.clickElement(this.loginButtonSelector);
    
    // Wait for navigation to complete
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
    
    // Enter credentials
    await this.enterUsername(username);
    await this.enterPassword(password);
    
    // Click login button
    await this.clickLogin();
  }
  
  /**
   * Check if invalid credentials message is displayed
   * @returns Promise resolving to boolean indicating if invalid credentials message is displayed
   */
  public async isInvalidCredentialsDisplayed(): Promise<boolean> {
    logger.info('Checking if invalid credentials message is displayed');
    
    // Check if invalid credentials message is displayed
    return await this.isElementVisible(this.invalidCredentialsSelector);
  }
  
  /**
   * Get invalid credentials message
   * @returns Promise resolving to invalid credentials message
   */
  public async getInvalidCredentialsMessage(): Promise<string> {
    logger.info('Getting invalid credentials message');
    
    // Get invalid credentials message
    return await this.getText(this.invalidCredentialsSelector);
  }
  
  /**
   * Click new user button
   * @returns Promise resolving when new user button is clicked
   */
  public async clickNewUser(): Promise<void> {
    logger.info('Clicking new user button');
    
    // Click new user button
    await this.clickElement(this.newUserButtonSelector);
    
    // Wait for navigation to complete
    await this.waitForNavigation();
  }
  
  /**
   * Check if login page is displayed
   * @returns Promise resolving to boolean indicating if login page is displayed
   */
  public async isLoginPageDisplayed(): Promise<boolean> {
    logger.info('Checking if login page is displayed');
    
    // Check if login button is displayed
    return await this.isElementVisible(this.loginButtonSelector);
  }
  
  /**
   * Analyze login page with AI
   * @returns Promise resolving to analysis
   */
  public async analyzeLoginPage(): Promise<string> {
    logger.info('Analyzing login page with AI');
    
    // Analyze page with AI
    return await this.analyzePage();
  }
  
  /**
   * Get current URL
   * This extends the base class method with specific login page logging
   * @returns Promise resolving to current URL
   */
  public override async getCurrentUrl(): Promise<string> {
    logger.info('Getting current URL from login page');
    
    // Call parent method
    return await super.getCurrentUrl();
  }
  
  /**
   * Get page HTML
   * This extends the base class method with specific login page logging
   * @returns Promise resolving to page HTML
   */
  public override async getPageHtml(): Promise<string> {
    logger.info('Getting page HTML from login page');
    
    // Call parent method
    return await super.getPageHtml();
  }
}