import { Page } from '@playwright/test';
import BaseHelper from '../../../src/core/helpers/base.helper';
import { logger } from '../../../src/core/logger';
import { allureReporter } from '../../../src/core/reporter/allure.reporter';

/**
 * Base Page Object class that all page objects should extend
 * This class wraps the BaseHelper functionality to provide a cleaner Page Object interface
 */
export class BasePage {
  protected page: Page;
  protected helper: BaseHelper;
  protected pageName: string;
  protected baseUrl: string;
  
  /**
   * Constructor for BasePage
   * @param page - Playwright Page object
   * @param pageName - Name of the page for logging purposes
   */
  constructor(page: Page, pageName: string) {
    this.page = page;
    this.pageName = pageName;
    this.baseUrl = 'https://demo.applitools.com/'; // Default baseUrl, can be overridden by child classes
    this.helper = new BaseHelper(page, this.baseUrl);
    
    logger.debug(`${this.pageName} page initialized`);
  }
  
  /**
   * Navigate to the page
   * @param path - Additional path to append to baseUrl
   */
  public async navigate(path: string = ''): Promise<void> {
    const url = path ? `${this.baseUrl}${path}` : this.baseUrl;
    logger.info(`Navigating to ${this.pageName}: ${url}`);
    
    allureReporter.startStep(`Navigate to ${this.pageName}`);
    
    try {
      await this.helper.navigate(url);
      allureReporter.endStep('passed');
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Check if page is loaded by verifying key elements are present
   * Should be implemented by child classes
   */
  public async isLoaded(): Promise<boolean> {
    // Base implementation, should be overridden by child classes
    return true;
  }
  
  /**
   * Wait for page to be loaded
   * @param timeout - Timeout in milliseconds
   */
  public async waitForPageLoad(timeout: number = 30000): Promise<void> {
    logger.debug(`Waiting for ${this.pageName} page to load`);
    
    allureReporter.startStep(`Wait for ${this.pageName} page to load`);
    
    try {
      // Wait for navigation to complete
      await this.helper.waitForNavigation({ timeout, waitUntil: 'networkidle' });
      
      // Wait for page to be loaded
      await this.helper.waitForCondition(
        async () => this.isLoaded(),
        { timeout, pollingInterval: 500 }
      );
      
      logger.info(`${this.pageName} page loaded successfully`);
      allureReporter.endStep('passed');
    } catch (error) {
      logger.error(`Timeout waiting for ${this.pageName} page to load: ${error}`);
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Take screenshot of the page
   * @param name - Screenshot name
   * @returns Path to the screenshot
   */
  public async takeScreenshot(name: string = this.pageName): Promise<string> {
    logger.debug(`Taking screenshot of ${this.pageName} page`);
    
    const screenshotPath = await this.helper.takeScreenshot(name);
    
    // Add screenshot to Allure report
    allureReporter.attachmentFile(`${name} Screenshot`, screenshotPath, 'image/png');
    
    return screenshotPath;
  }
  
  /**
   * Get page title
   * @returns Page title
   */
  public async getTitle(): Promise<string> {
    return this.helper.getTitle();
  }
  
  /**
   * Get current URL
   * @returns Current URL
   */
  public async getCurrentUrl(): Promise<string> {
    return this.helper.getCurrentUrl();
  }
  
  /**
   * Verify page title
   * @param expectedTitle - Expected title
   * @param options - Verification options
   * @returns True if title matches, false otherwise
   */
  public async verifyTitle(expectedTitle: string, options?: { contains?: boolean }): Promise<boolean> {
    logger.debug(`Verifying ${this.pageName} page title: ${expectedTitle}`);
    
    allureReporter.startStep(`Verify ${this.pageName} page title`);
    
    try {
      const result = await this.helper.verifyTitle(expectedTitle, options);
      
      if (result) {
        logger.info(`${this.pageName} page title verification passed`);
        allureReporter.endStep('passed');
      } else {
        const actualTitle = await this.getTitle();
        logger.warn(`${this.pageName} page title verification failed. Expected: "${expectedTitle}", Actual: "${actualTitle}"`);
        allureReporter.endStep('failed');
      }
      
      return result;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Verify URL
   * @param expectedUrl - Expected URL
   * @param options - Verification options
   * @returns True if URL matches, false otherwise
   */
  public async verifyUrl(expectedUrl: string, options?: { contains?: boolean }): Promise<boolean> {
    logger.debug(`Verifying ${this.pageName} page URL: ${expectedUrl}`);
    
    allureReporter.startStep(`Verify ${this.pageName} page URL`);
    
    try {
      const result = await this.helper.verifyUrl(expectedUrl, options);
      
      if (result) {
        logger.info(`${this.pageName} page URL verification passed`);
        allureReporter.endStep('passed');
      } else {
        const actualUrl = await this.getCurrentUrl();
        logger.warn(`${this.pageName} page URL verification failed. Expected: "${expectedUrl}", Actual: "${actualUrl}"`);
        allureReporter.endStep('failed');
      }
      
      return result;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Click on element
   * @param selector - Element selector
   * @param options - Click options
   */
  protected async click(selector: string, options?: { force?: boolean; timeout?: number; noWaitAfter?: boolean }): Promise<void> {
    logger.debug(`Clicking on element: ${selector}`);
    
    allureReporter.startStep(`Click on ${selector}`);
    
    try {
      await this.helper.click(selector, options);
      allureReporter.endStep('passed');
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Fill text in input field
   * @param selector - Input selector
   * @param text - Text to fill
   * @param options - Fill options
   */
  protected async fill(selector: string, text: string, options?: { timeout?: number; noWaitAfter?: boolean; force?: boolean; clear?: boolean }): Promise<void> {
    logger.debug(`Filling text in element: ${selector}`);
    
    allureReporter.startStep(`Fill text in ${selector}`);
    
    try {
      await this.helper.fill(selector, text, options);
      allureReporter.endStep('passed');
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Type text character by character
   * @param selector - Input selector
   * @param text - Text to type
   * @param options - Type options
   */
  protected async type(selector: string, text: string, options?: { delay?: number; timeout?: number; noWaitAfter?: boolean; clear?: boolean }): Promise<void> {
    logger.debug(`Typing text in element: ${selector}`);
    
    allureReporter.startStep(`Type text in ${selector}`);
    
    try {
      await this.helper.type(selector, text, options);
      allureReporter.endStep('passed');
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Get text from element
   * @param selector - Element selector
   * @param options - Get text options
   * @returns Element text
   */
  protected async getText(selector: string, options?: { timeout?: number }): Promise<string> {
    logger.debug(`Getting text from element: ${selector}`);
    
    allureReporter.startStep(`Get text from ${selector}`);
    
    try {
      const text = await this.helper.getText(selector, options);
      allureReporter.endStep('passed');
      return text;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Check if element is visible
   * @param selector - Element selector
   * @param options - Visibility check options
   * @returns True if visible, false otherwise
   */
  protected async isVisible(selector: string, options?: { timeout?: number }): Promise<boolean> {
    logger.debug(`Checking if element is visible: ${selector}`);
    
    allureReporter.startStep(`Check if ${selector} is visible`);
    
    try {
      const isVisible = await this.helper.isVisible(selector, options);
      allureReporter.endStep('passed');
      return isVisible;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Wait for element to be visible
   * @param selector - Element selector
   * @param options - Wait options
   */
  protected async waitForVisible(selector: string, options?: { timeout?: number; state?: 'visible' | 'hidden' }): Promise<void> {
    logger.debug(`Waiting for element to be ${options?.state || 'visible'}: ${selector}`);
    
    allureReporter.startStep(`Wait for ${selector} to be ${options?.state || 'visible'}`);
    
    try {
      await this.helper.waitForVisible(selector, options);
      allureReporter.endStep('passed');
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Check if element exists
   * @param selector - Element selector
   * @returns True if exists, false otherwise
   */
  protected async exists(selector: string): Promise<boolean> {
    logger.debug(`Checking if element exists: ${selector}`);
    
    allureReporter.startStep(`Check if ${selector} exists`);
    
    try {
      const exists = await this.helper.exists(selector);
      allureReporter.endStep('passed');
      return exists;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Select option by value
   * @param selector - Select element selector
   * @param value - Option value
   * @param options - Selection options
   */
  protected async selectOptionByValue(selector: string, value: string, options?: { timeout?: number }): Promise<void> {
    logger.debug(`Selecting option by value in ${selector}: ${value}`);
    
    allureReporter.startStep(`Select option by value in ${selector}`);
    
    try {
      await this.helper.selectOptionByValue(selector, value, options);
      allureReporter.endStep('passed');
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Select option by label
   * @param selector - Select element selector
   * @param label - Option label
   * @param options - Selection options
   */
  protected async selectOptionByLabel(selector: string, label: string, options?: { timeout?: number }): Promise<void> {
    logger.debug(`Selecting option by label in ${selector}: ${label}`);
    
    allureReporter.startStep(`Select option by label in ${selector}`);
    
    try {
      await this.helper.selectOptionByLabel(selector, label, options);
      allureReporter.endStep('passed');
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Check checkbox or radio
   * @param selector - Checkbox or radio selector
   * @param check - Whether to check or uncheck
   * @param options - Check options
   */
  protected async check(selector: string, check: boolean = true, options?: { timeout?: number; force?: boolean }): Promise<void> {
    logger.debug(`${check ? 'Checking' : 'Unchecking'} checkbox or radio: ${selector}`);
    
    allureReporter.startStep(`${check ? 'Check' : 'Uncheck'} ${selector}`);
    
    try {
      await this.helper.check(selector, check, options);
      allureReporter.endStep('passed');
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Upload file
   * @param selector - File input selector
   * @param filePaths - Path(s) to file(s)
   * @param options - Upload options
   */
  protected async uploadFile(selector: string, filePaths: string | string[], options?: { timeout?: number }): Promise<void> {
    logger.debug(`Uploading file to ${selector}`);
    
    allureReporter.startStep(`Upload file to ${selector}`);
    
    try {
      await this.helper.setFileInput(selector, filePaths, options);
      allureReporter.endStep('passed');
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Hover over element
   * @param selector - Element selector
   * @param options - Hover options
   */
  protected async hover(selector: string, options?: { position?: { x: number; y: number }; timeout?: number; force?: boolean }): Promise<void> {
    logger.debug(`Hovering over element: ${selector}`);
    
    allureReporter.startStep(`Hover over ${selector}`);
    
    try {
      await this.helper.hover(selector, options);
      allureReporter.endStep('passed');
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Wait for specified time
   * @param ms - Time to wait in milliseconds
   */
  protected async wait(ms: number): Promise<void> {
    logger.debug(`Waiting for ${ms}ms`);
    
    await this.helper.wait(ms);
  }
  
  /**
   * Execute JavaScript
   * @param script - JavaScript to execute
   * @param args - Arguments to pass to the script
   * @returns Result of script execution
   */
  protected async executeScript<T>(script: string, ...args: any[]): Promise<T> {
    logger.debug(`Executing JavaScript`);
    
    allureReporter.startStep(`Execute JavaScript`);
    
    try {
      const result = await this.helper.executeScript<T>(script, ...args);
      allureReporter.endStep('passed');
      return result;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Refresh page
   */
  public async refreshPage(): Promise<void> {
    logger.debug(`Refreshing ${this.pageName} page`);
    
    allureReporter.startStep(`Refresh ${this.pageName} page`);
    
    try {
      await this.helper.refreshPage();
      await this.waitForPageLoad();
      allureReporter.endStep('passed');
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Verify element contains text
   * @param selector - Element selector
   * @param text - Text to verify
   * @param options - Verification options
   * @returns True if element contains text, false otherwise
   */
  protected async verifyElementContainsText(selector: string, text: string, options?: { timeout?: number }): Promise<boolean> {
    logger.debug(`Verifying element contains text: ${selector} => ${text}`);
    
    allureReporter.startStep(`Verify ${selector} contains text: ${text}`);
    
    try {
      const result = await this.helper.verifyElementContainsText(selector, text, options);
      
      if (result) {
        logger.info(`Element ${selector} contains text: ${text}`);
        allureReporter.endStep('passed');
      } else {
        const actualText = await this.helper.getText(selector);
        logger.warn(`Element ${selector} does not contain text: ${text}. Actual text: ${actualText}`);
        allureReporter.endStep('failed');
      }
      
      return result;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Verify element exists
   * @param selector - Element selector
   * @param options - Verification options
   * @returns True if element exists, false otherwise
   */
  protected async verifyElementExists(selector: string, options?: { timeout?: number }): Promise<boolean> {
    logger.debug(`Verifying element exists: ${selector}`);
    
    allureReporter.startStep(`Verify ${selector} exists`);
    
    try {
      const result = await this.helper.verifyElementExists(selector, options);
      
      if (result) {
        logger.info(`Element ${selector} exists`);
        allureReporter.endStep('passed');
      } else {
        logger.warn(`Element ${selector} does not exist`);
        allureReporter.endStep('failed');
      }
      
      return result;
    } catch (error) {
      allureReporter.endStep('failed');
      throw error;
    }
  }
}

// Export the BasePage class
export default BasePage;