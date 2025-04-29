/**
 * Base Page
 * Base class for page objects
 */

import { Page, BrowserContext, Locator } from '@playwright/test';
import { logger } from '../utils/logger/logger';
import { aiHelper } from '../ai/utils/AIHelper';

/**
 * Base Page class
 * Provides common functionality for page objects
 */
export class BasePage {
  protected readonly page: Page;
  protected readonly context: BrowserContext;
  protected readonly path: string;
  protected readonly title: string;
  protected readonly baseUrl: string;
  protected aiHelper = aiHelper;
  
  /**
   * Constructor
   * @param page Playwright page
   * @param context Playwright browser context
   * @param path Page path
   * @param title Page title
   * @param baseUrl Base URL
   */
  constructor(
    page: Page,
    context: BrowserContext,
    path: string = '/',
    title: string = 'Page',
    baseUrl: string = 'https://demoqa.com'
  ) {
    this.page = page;
    this.context = context;
    this.path = path;
    this.title = title;
    this.baseUrl = baseUrl;
  }
  
  /**
   * Navigate to page
   * @returns Promise resolving when navigation is complete
   */
  public async navigate(): Promise<void> {
    logger.info(`Navigating to ${this.baseUrl}${this.path}`);
    
    // Navigate to URL
    await this.page.goto(`${this.baseUrl}${this.path}`);
    
    // Wait for page to be loaded
    await this.page.waitForLoadState('networkidle');
    
    logger.info(`Navigated to ${this.baseUrl}${this.path}`);
  }
  
  /**
   * Wait for element to be visible
   * @param selector Element selector
   * @param timeout Timeout in milliseconds
   * @returns Promise resolving to element
   */
  public async waitForElement(
    selector: string,
    timeout: number = 10000
  ): Promise<Locator> {
    logger.debug(`Waiting for element: ${selector}`);
    
    // Wait for element to be visible
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    
    logger.debug(`Element visible: ${selector}`);
    
    return element;
  }
  
  /**
   * Click element
   * @param selector Element selector
   * @param timeout Timeout in milliseconds
   * @returns Promise resolving when element is clicked
   */
  public async clickElement(
    selector: string,
    timeout: number = 10000
  ): Promise<void> {
    logger.debug(`Clicking element: ${selector}`);
    
    // Wait for element to be visible
    const element = await this.waitForElement(selector, timeout);
    
    // Click element
    await element.click();
    
    logger.debug(`Clicked element: ${selector}`);
  }
  
  /**
   * Fill input field
   * @param selector Input selector
   * @param value Value to enter
   * @param timeout Timeout in milliseconds
   * @returns Promise resolving when input is filled
   */
  public async fillInput(
    selector: string,
    value: string,
    timeout: number = 10000
  ): Promise<void> {
    logger.debug(`Filling input: ${selector} with value: ${value}`);
    
    // Wait for element to be visible
    const element = await this.waitForElement(selector, timeout);
    
    // Clear input field
    await element.clear();
    
    // Fill input field
    await element.fill(value);
    
    logger.debug(`Filled input: ${selector} with value: ${value}`);
  }
  
  /**
   * Get text from element
   * @param selector Element selector
   * @param timeout Timeout in milliseconds
   * @returns Promise resolving to element text
   */
  public async getText(
    selector: string,
    timeout: number = 10000
  ): Promise<string> {
    logger.debug(`Getting text from element: ${selector}`);
    
    // Wait for element to be visible
    const element = await this.waitForElement(selector, timeout);
    
    // Get text from element
    const text = await element.textContent() || '';
    
    logger.debug(`Got text from element: ${selector}: ${text}`);
    
    return text;
  }
  
  /**
   * Check if element is visible
   * @param selector Element selector
   * @param timeout Timeout in milliseconds
   * @returns Promise resolving to boolean indicating if element is visible
   */
  public async isElementVisible(
    selector: string,
    timeout: number = 10000
  ): Promise<boolean> {
    logger.debug(`Checking if element is visible: ${selector}`);
    
    try {
      // Wait for element to be visible
      await this.waitForElement(selector, timeout);
      
      logger.debug(`Element is visible: ${selector}`);
      
      return true;
    } catch (error) {
      logger.debug(`Element is not visible: ${selector}`);
      
      return false;
    }
  }
  
  /**
   * Wait for navigation to complete
   * @param timeout Timeout in milliseconds
   * @returns Promise resolving when navigation is complete
   */
  public async waitForNavigation(timeout: number = 30000): Promise<void> {
    logger.debug('Waiting for navigation to complete');
    
    // Wait for navigation to complete
    await this.page.waitForLoadState('networkidle', { timeout });
    
    logger.debug('Navigation complete');
  }
  
  /**
   * Take screenshot
   * @param name Screenshot name
   * @returns Promise resolving to screenshot path
   */
  public async takeScreenshot(name: string): Promise<string> {
    logger.debug(`Taking screenshot: ${name}`);
    
    // Create screenshot name
    const screenshotName = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.png`;
    
    // Take screenshot
    const screenshotPath = `./reports/screenshots/${screenshotName}`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    
    logger.debug(`Screenshot taken: ${screenshotPath}`);
    
    return screenshotPath;
  }
  
  /**
   * Get page title
   * @returns Promise resolving to page title
   */
  public async getPageTitle(): Promise<string> {
    logger.debug('Getting page title');
    
    // Get page title
    const title = await this.page.title();
    
    logger.debug(`Page title: ${title}`);
    
    return title;
  }
  
  /**
   * Wait for element to contain text
   * @param selector Element selector
   * @param text Text to wait for
   * @param timeout Timeout in milliseconds
   * @returns Promise resolving when element contains text
   */
  public async waitForText(
    selector: string,
    text: string,
    timeout: number = 10000
  ): Promise<void> {
    logger.debug(`Waiting for element: ${selector} to contain text: ${text}`);
    
    // Wait for element to contain text
    await this.page.locator(selector).filter({ hasText: text }).waitFor({ state: 'visible', timeout });
    
    logger.debug(`Element: ${selector} contains text: ${text}`);
  }
  
  /**
   * Analyze page with AI
   * @returns Promise resolving to analysis
   */
  public async analyzePage(): Promise<string> {
    logger.debug('Analyzing page with AI');
    
    try {
      // Get page HTML
      const html = await this.page.content();
      
      // Take screenshot
      const screenshotPath = await this.takeScreenshot('ai_analysis');
      
      // Read screenshot
      const fs = require('fs');
      const screenshotBuffer = fs.readFileSync(screenshotPath);
      const screenshotBase64 = screenshotBuffer.toString('base64');
      
      // Create prompt
      const prompt = `
        Analyze this webpage content and visual appearance:
        
        URL: ${this.baseUrl}${this.path}
        Title: ${await this.getPageTitle()}
        
        Please provide:
        1. A summary of the page's purpose and structure
        2. Key UI elements and their functions
        3. Potential user interactions
        4. Recommended test scenarios
        5. Usability observations
      `;
      
      // Analyze page with AI
      const analysis = await this.aiHelper.analyzeImage(screenshotBase64, prompt);
      
      logger.debug('Page analysis complete');
      
      return analysis;
    } catch (error) {
      logger.error('Failed to analyze page with AI', { error: String(error) });
      
      return `AI analysis failed: ${String(error)}`;
    }
  }
  
  /**
   * Get current URL
   * @returns Promise resolving to current URL
   */
  public async getCurrentUrl(): Promise<string> {
    logger.debug('Getting current URL');
    
    // Get current URL
    const url = this.page.url();
    
    logger.debug(`Current URL: ${url}`);
    
    return url;
  }
  
  /**
   * Get page HTML
   * @returns Promise resolving to page HTML
   */
  public async getPageHtml(): Promise<string> {
    logger.debug('Getting page HTML');
    
    // Get page HTML
    const html = await this.page.content();
    
    logger.debug(`Got page HTML (${html.length} characters)`);
    
    return html;
  }
}