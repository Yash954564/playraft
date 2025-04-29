/**
 * Base Page
 * Base class for all page objects
 */

import { Page, BrowserContext, Locator, ElementHandle, expect } from '@playwright/test';
import { logger } from '../utils/logger/logger';
import { testConfig } from '../config/testConfig';
import { testRetryHandler } from '../utils/TestRetryHandler';

/**
 * Base Page class
 * Provides common methods for interacting with pages
 */
export class BasePage {
  protected page: Page;
  protected context: BrowserContext;
  protected path: string;
  protected name: string;
  protected baseUrl: string;
  protected timeout: number;

  /**
   * Constructor
   * @param page Page object
   * @param context Browser context
   * @param path Path to page
   * @param name Page name
   * @param baseUrl Base URL
   */
  constructor(
    page: Page,
    context: BrowserContext,
    path: string = '/',
    name: string = 'Base Page',
    baseUrl: string = testConfig.baseUrl
  ) {
    this.page = page;
    this.context = context;
    this.path = path;
    this.name = name;
    this.baseUrl = baseUrl;
    this.timeout = testConfig.timeout;
    
    logger.debug(`${this.name} page initialized`);
  }

  /**
   * Navigate to page
   * @param params Optional query parameters
   * @returns Promise resolving when navigation is complete
   */
  public async navigate(params?: Record<string, string>): Promise<void> {
    // Build URL
    let url = `${this.baseUrl}${this.path}`;
    
    // Add query parameters if provided
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      
      for (const [key, value] of Object.entries(params)) {
        queryParams.append(key, value);
      }
      
      url += `?${queryParams.toString()}`;
    }
    
    logger.info(`Navigating to: ${url}`);
    
    try {
      // Navigate to URL with retry for flaky connections
      await testRetryHandler.retryWithBackoff(async () => {
        const response = await this.page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: this.timeout,
        });
        
        // Verify response
        if (!response) {
          throw new Error(`Navigation to ${url} did not return a response`);
        }
        
        // Check if response is OK (2xx)
        if (!response.ok()) {
          throw new Error(`Navigation to ${url} failed with status: ${response.status()}`);
        }
        
        return response;
      });
      
      logger.info(`Successfully navigated to: ${url}`);
      
      // Wait for page to be loaded
      await this.page.waitForLoadState('load', { timeout: this.timeout });
    } catch (error) {
      logger.error(`Failed to navigate to: ${url}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Wait for element to be visible
   * @param selector Element selector
   * @param timeout Timeout in milliseconds
   * @returns Promise resolving to element locator
   */
  public async waitForElement(
    selector: string,
    timeout: number = this.timeout
  ): Promise<Locator> {
    logger.debug(`Waiting for element: ${selector}`);
    
    try {
      const locator = this.page.locator(selector);
      await locator.waitFor({ state: 'visible', timeout });
      return locator;
    } catch (error) {
      logger.error(`Element not visible: ${selector}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Wait for element to be hidden
   * @param selector Element selector
   * @param timeout Timeout in milliseconds
   * @returns Promise resolving when element is hidden
   */
  public async waitForElementToBeHidden(
    selector: string,
    timeout: number = this.timeout
  ): Promise<void> {
    logger.debug(`Waiting for element to be hidden: ${selector}`);
    
    try {
      const locator = this.page.locator(selector);
      await locator.waitFor({ state: 'hidden', timeout });
    } catch (error) {
      logger.error(`Element still visible: ${selector}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Wait for navigation to complete
   * @param timeout Timeout in milliseconds
   * @returns Promise resolving when navigation is complete
   */
  public async waitForNavigation(timeout: number = this.timeout): Promise<void> {
    logger.debug('Waiting for navigation to complete');
    
    try {
      await this.page.waitForLoadState('load', { timeout });
      logger.debug('Navigation completed');
    } catch (error) {
      logger.error('Navigation not completed within timeout', { error: String(error) });
      throw error;
    }
  }

  /**
   * Click element
   * @param selector Element selector
   * @param options Click options
   * @returns Promise resolving when element is clicked
   */
  public async clickElement(
    selector: string,
    options?: { force?: boolean; timeout?: number; noWaitAfter?: boolean }
  ): Promise<void> {
    logger.debug(`Clicking element: ${selector}`);
    
    try {
      // Wait for element to be visible
      const locator = await this.waitForElement(selector, options?.timeout ?? this.timeout);
      
      // Click element
      await locator.click({
        force: options?.force,
        timeout: options?.timeout ?? this.timeout,
        noWaitAfter: options?.noWaitAfter,
      });
      
      logger.debug(`Clicked element: ${selector}`);
    } catch (error) {
      logger.error(`Failed to click element: ${selector}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Fill input
   * @param selector Input selector
   * @param value Value to fill
   * @param options Fill options
   * @returns Promise resolving when input is filled
   */
  public async fillInput(
    selector: string,
    value: string,
    options?: { force?: boolean; timeout?: number; noWaitAfter?: boolean }
  ): Promise<void> {
    logger.debug(`Filling input: ${selector}`);
    
    try {
      // Wait for element to be visible
      const locator = await this.waitForElement(selector, options?.timeout ?? this.timeout);
      
      // Clear input first
      await locator.clear();
      
      // Fill input
      await locator.fill(value, {
        force: options?.force,
        timeout: options?.timeout ?? this.timeout,
        noWaitAfter: options?.noWaitAfter,
      });
      
      logger.debug(`Filled input: ${selector}`);
    } catch (error) {
      logger.error(`Failed to fill input: ${selector}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Select option
   * @param selector Select selector
   * @param value Option value to select
   * @param options Select options
   * @returns Promise resolving when option is selected
   */
  public async selectOption(
    selector: string,
    value: string | string[] | { value?: string; label?: string; index?: number },
    options?: { force?: boolean; timeout?: number; noWaitAfter?: boolean }
  ): Promise<void> {
    logger.debug(`Selecting option: ${selector}`);
    
    try {
      // Wait for element to be visible
      const locator = await this.waitForElement(selector, options?.timeout ?? this.timeout);
      
      // Select option
      await locator.selectOption(value, {
        force: options?.force,
        timeout: options?.timeout ?? this.timeout,
        noWaitAfter: options?.noWaitAfter,
      });
      
      logger.debug(`Selected option: ${selector}`);
    } catch (error) {
      logger.error(`Failed to select option: ${selector}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Check checkbox
   * @param selector Checkbox selector
   * @param checked Whether to check or uncheck
   * @param options Check options
   * @returns Promise resolving when checkbox is checked
   */
  public async checkCheckbox(
    selector: string,
    checked: boolean = true,
    options?: { force?: boolean; timeout?: number; noWaitAfter?: boolean }
  ): Promise<void> {
    logger.debug(`${checked ? 'Checking' : 'Unchecking'} checkbox: ${selector}`);
    
    try {
      // Wait for element to be visible
      const locator = await this.waitForElement(selector, options?.timeout ?? this.timeout);
      
      // Check if checkbox is already in desired state
      const isChecked = await locator.isChecked();
      
      if (isChecked !== checked) {
        // Check or uncheck checkbox
        if (checked) {
          await locator.check({
            force: options?.force,
            timeout: options?.timeout ?? this.timeout,
            noWaitAfter: options?.noWaitAfter,
          });
        } else {
          await locator.uncheck({
            force: options?.force,
            timeout: options?.timeout ?? this.timeout,
            noWaitAfter: options?.noWaitAfter,
          });
        }
      }
      
      logger.debug(`${checked ? 'Checked' : 'Unchecked'} checkbox: ${selector}`);
    } catch (error) {
      logger.error(`Failed to ${checked ? 'check' : 'uncheck'} checkbox: ${selector}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Get text
   * @param selector Element selector
   * @returns Promise resolving to element text
   */
  public async getText(selector: string): Promise<string> {
    logger.debug(`Getting text from: ${selector}`);
    
    try {
      // Wait for element to be visible
      const locator = await this.waitForElement(selector);
      
      // Get text
      const text = await locator.textContent();
      
      logger.debug(`Got text from: ${selector}, text: ${text}`);
      
      return text || '';
    } catch (error) {
      logger.error(`Failed to get text from: ${selector}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Get value
   * @param selector Input selector
   * @returns Promise resolving to input value
   */
  public async getValue(selector: string): Promise<string> {
    logger.debug(`Getting value from: ${selector}`);
    
    try {
      // Wait for element to be visible
      const locator = await this.waitForElement(selector);
      
      // Get value
      const value = await locator.inputValue();
      
      logger.debug(`Got value from: ${selector}, value: ${value}`);
      
      return value;
    } catch (error) {
      logger.error(`Failed to get value from: ${selector}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Get element count
   * @param selector Element selector
   * @returns Promise resolving to element count
   */
  public async getElementCount(selector: string): Promise<number> {
    logger.debug(`Getting element count: ${selector}`);
    
    try {
      const locator = this.page.locator(selector);
      const count = await locator.count();
      
      logger.debug(`Got element count: ${selector}, count: ${count}`);
      
      return count;
    } catch (error) {
      logger.error(`Failed to get element count: ${selector}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Check if element exists
   * @param selector Element selector
   * @returns Promise resolving to boolean indicating if element exists
   */
  public async isElementExist(selector: string): Promise<boolean> {
    logger.debug(`Checking if element exists: ${selector}`);
    
    try {
      const count = await this.getElementCount(selector);
      return count > 0;
    } catch (error) {
      logger.debug(`Element does not exist: ${selector}`);
      return false;
    }
  }

  /**
   * Check if element is visible
   * @param selector Element selector
   * @returns Promise resolving to boolean indicating if element is visible
   */
  public async isElementVisible(selector: string): Promise<boolean> {
    logger.debug(`Checking if element is visible: ${selector}`);
    
    try {
      const locator = this.page.locator(selector);
      return await locator.isVisible();
    } catch (error) {
      logger.debug(`Element is not visible: ${selector}`);
      return false;
    }
  }

  /**
   * Check if element is enabled
   * @param selector Element selector
   * @returns Promise resolving to boolean indicating if element is enabled
   */
  public async isElementEnabled(selector: string): Promise<boolean> {
    logger.debug(`Checking if element is enabled: ${selector}`);
    
    try {
      const locator = this.page.locator(selector);
      return await locator.isEnabled();
    } catch (error) {
      logger.debug(`Element is not enabled: ${selector}`);
      return false;
    }
  }

  /**
   * Upload file
   * @param selector Input selector
   * @param filePath File path
   * @returns Promise resolving when file is uploaded
   */
  public async uploadFile(selector: string, filePath: string): Promise<void> {
    logger.debug(`Uploading file: ${selector}, file: ${filePath}`);
    
    try {
      // Wait for element to be visible
      const locator = await this.waitForElement(selector);
      
      // Upload file
      await locator.setInputFiles(filePath);
      
      logger.debug(`Uploaded file: ${selector}, file: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to upload file: ${selector}, file: ${filePath}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Press key
   * @param selector Element selector
   * @param key Key to press
   * @returns Promise resolving when key is pressed
   */
  public async pressKey(selector: string, key: string): Promise<void> {
    logger.debug(`Pressing key: ${key} on element: ${selector}`);
    
    try {
      // Wait for element to be visible
      const locator = await this.waitForElement(selector);
      
      // Press key
      await locator.press(key);
      
      logger.debug(`Pressed key: ${key} on element: ${selector}`);
    } catch (error) {
      logger.error(`Failed to press key: ${key} on element: ${selector}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Hover element
   * @param selector Element selector
   * @returns Promise resolving when element is hovered
   */
  public async hoverElement(selector: string): Promise<void> {
    logger.debug(`Hovering element: ${selector}`);
    
    try {
      // Wait for element to be visible
      const locator = await this.waitForElement(selector);
      
      // Hover element
      await locator.hover();
      
      logger.debug(`Hovered element: ${selector}`);
    } catch (error) {
      logger.error(`Failed to hover element: ${selector}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Drag and drop
   * @param sourceSelector Source element selector
   * @param targetSelector Target element selector
   * @returns Promise resolving when drag and drop is complete
   */
  public async dragAndDrop(sourceSelector: string, targetSelector: string): Promise<void> {
    logger.debug(`Dragging element: ${sourceSelector} to: ${targetSelector}`);
    
    try {
      // Wait for source element to be visible
      const sourceLocator = await this.waitForElement(sourceSelector);
      
      // Wait for target element to be visible
      const targetLocator = await this.waitForElement(targetSelector);
      
      // Get source and target element bounding boxes
      const sourceBox = await sourceLocator.boundingBox();
      const targetBox = await targetLocator.boundingBox();
      
      if (!sourceBox || !targetBox) {
        throw new Error('Could not get bounding boxes for source or target element');
      }
      
      // Drag and drop
      await this.page.mouse.move(
        sourceBox.x + sourceBox.width / 2,
        sourceBox.y + sourceBox.height / 2
      );
      await this.page.mouse.down();
      await this.page.mouse.move(
        targetBox.x + targetBox.width / 2,
        targetBox.y + targetBox.height / 2
      );
      await this.page.mouse.up();
      
      logger.debug(`Dragged element: ${sourceSelector} to: ${targetSelector}`);
    } catch (error) {
      logger.error(`Failed to drag element: ${sourceSelector} to: ${targetSelector}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Take screenshot
   * @param name Screenshot name
   * @returns Promise resolving to screenshot buffer
   */
  public async takeScreenshot(name?: string): Promise<Buffer> {
    const screenshotName = name || `${this.name}-${new Date().toISOString()}`;
    logger.debug(`Taking screenshot: ${screenshotName}`);
    
    try {
      const screenshot = await this.page.screenshot({
        path: `./reports/screenshots/${screenshotName}.png`,
        fullPage: true,
      });
      
      logger.debug(`Took screenshot: ${screenshotName}`);
      
      return screenshot;
    } catch (error) {
      logger.error(`Failed to take screenshot: ${screenshotName}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Get page title
   * @returns Promise resolving to page title
   */
  public async getPageTitle(): Promise<string> {
    logger.debug('Getting page title');
    
    try {
      const title = await this.page.title();
      
      logger.debug(`Got page title: ${title}`);
      
      return title;
    } catch (error) {
      logger.error('Failed to get page title', { error: String(error) });
      throw error;
    }
  }

  /**
   * Get current URL
   * @returns Promise resolving to current URL
   */
  public async getCurrentUrl(): Promise<string> {
    logger.debug('Getting current URL');
    
    try {
      const url = this.page.url();
      
      logger.debug(`Got current URL: ${url}`);
      
      return url;
    } catch (error) {
      logger.error('Failed to get current URL', { error: String(error) });
      throw error;
    }
  }

  /**
   * Get page HTML
   * @returns Promise resolving to page HTML
   */
  public async getPageHtml(): Promise<string> {
    logger.debug('Getting page HTML');
    
    try {
      const html = await this.page.content();
      
      logger.debug('Got page HTML');
      
      return html;
    } catch (error) {
      logger.error('Failed to get page HTML', { error: String(error) });
      throw error;
    }
  }

  /**
   * Execute JavaScript
   * @param script JavaScript to execute
   * @param args Arguments for script
   * @returns Promise resolving to script result
   */
  public async executeScript<T>(script: string, ...args: any[]): Promise<T> {
    logger.debug('Executing JavaScript');
    
    try {
      const result = await this.page.evaluate(script, ...args);
      
      logger.debug('Executed JavaScript');
      
      return result as T;
    } catch (error) {
      logger.error('Failed to execute JavaScript', { error: String(error) });
      throw error;
    }
  }

  /**
   * Wait for URL to include string
   * @param url URL to wait for
   * @param timeout Timeout in milliseconds
   * @returns Promise resolving when URL includes string
   */
  public async waitForUrlToInclude(url: string, timeout: number = this.timeout): Promise<void> {
    logger.debug(`Waiting for URL to include: ${url}`);
    
    try {
      await this.page.waitForURL(
        (currentUrl) => currentUrl.includes(url),
        { timeout }
      );
      
      logger.debug(`URL includes: ${url}`);
    } catch (error) {
      logger.error(`URL does not include: ${url} within timeout`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Wait for URL to be exact match
   * @param url URL to wait for
   * @param timeout Timeout in milliseconds
   * @returns Promise resolving when URL is exact match
   */
  public async waitForUrl(url: string, timeout: number = this.timeout): Promise<void> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    logger.debug(`Waiting for URL to be: ${fullUrl}`);
    
    try {
      await this.page.waitForURL(fullUrl, { timeout });
      
      logger.debug(`URL is: ${fullUrl}`);
    } catch (error) {
      logger.error(`URL is not: ${fullUrl} within timeout`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Wait for function to return true
   * @param fn Function to evaluate
   * @param options Wait options
   * @returns Promise resolving when function returns true
   */
  public async waitForFunction(
    fn: Function,
    options?: { timeout?: number; polling?: number }
  ): Promise<void> {
    logger.debug('Waiting for function to return true');
    
    try {
      await this.page.waitForFunction(fn, {
        timeout: options?.timeout ?? this.timeout,
        polling: options?.polling ?? 100,
      });
      
      logger.debug('Function returned true');
    } catch (error) {
      logger.error('Function did not return true within timeout', { error: String(error) });
      throw error;
    }
  }

  /**
   * Refresh page
   * @returns Promise resolving when page is refreshed
   */
  public async refreshPage(): Promise<void> {
    logger.debug('Refreshing page');
    
    try {
      await this.page.reload();
      
      // Wait for page to be loaded
      await this.page.waitForLoadState('load', { timeout: this.timeout });
      
      logger.debug('Page refreshed');
    } catch (error) {
      logger.error('Failed to refresh page', { error: String(error) });
      throw error;
    }
  }

  /**
   * Go back
   * @returns Promise resolving when navigation is complete
   */
  public async goBack(): Promise<void> {
    logger.debug('Going back');
    
    try {
      await this.page.goBack();
      
      // Wait for page to be loaded
      await this.page.waitForLoadState('load', { timeout: this.timeout });
      
      logger.debug('Went back');
    } catch (error) {
      logger.error('Failed to go back', { error: String(error) });
      throw error;
    }
  }

  /**
   * Go forward
   * @returns Promise resolving when navigation is complete
   */
  public async goForward(): Promise<void> {
    logger.debug('Going forward');
    
    try {
      await this.page.goForward();
      
      // Wait for page to be loaded
      await this.page.waitForLoadState('load', { timeout: this.timeout });
      
      logger.debug('Went forward');
    } catch (error) {
      logger.error('Failed to go forward', { error: String(error) });
      throw error;
    }
  }

  /**
   * Wait for network idle
   * @param timeout Timeout in milliseconds
   * @returns Promise resolving when network is idle
   */
  public async waitForNetworkIdle(timeout: number = this.timeout): Promise<void> {
    logger.debug('Waiting for network idle');
    
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
      
      logger.debug('Network is idle');
    } catch (error) {
      logger.error('Network not idle within timeout', { error: String(error) });
      throw error;
    }
  }

  /**
   * Verify element text
   * @param selector Element selector
   * @param expectedText Expected text
   * @param options Verify options
   * @returns Promise resolving when text is verified
   */
  public async verifyElementText(
    selector: string,
    expectedText: string,
    options?: { exact?: boolean }
  ): Promise<void> {
    logger.debug(`Verifying element text: ${selector}, expected: ${expectedText}`);
    
    try {
      // Wait for element to be visible
      const locator = await this.waitForElement(selector);
      
      // Get text
      const actualText = await locator.textContent() || '';
      
      // Verify text
      if (options?.exact) {
        expect(actualText).toBe(expectedText);
      } else {
        expect(actualText).toContain(expectedText);
      }
      
      logger.debug(`Verified element text: ${selector}, actual: ${actualText}`);
    } catch (error) {
      logger.error(`Failed to verify element text: ${selector}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Verify element is visible
   * @param selector Element selector
   * @returns Promise resolving when element is visible
   */
  public async verifyElementIsVisible(selector: string): Promise<void> {
    logger.debug(`Verifying element is visible: ${selector}`);
    
    try {
      // Wait for element to be visible
      const locator = await this.waitForElement(selector);
      
      // Verify element is visible
      await expect(locator).toBeVisible();
      
      logger.debug(`Verified element is visible: ${selector}`);
    } catch (error) {
      logger.error(`Failed to verify element is visible: ${selector}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Verify element is not visible
   * @param selector Element selector
   * @returns Promise resolving when element is not visible
   */
  public async verifyElementIsNotVisible(selector: string): Promise<void> {
    logger.debug(`Verifying element is not visible: ${selector}`);
    
    try {
      const locator = this.page.locator(selector);
      
      // Verify element is not visible
      await expect(locator).not.toBeVisible();
      
      logger.debug(`Verified element is not visible: ${selector}`);
    } catch (error) {
      logger.error(`Failed to verify element is not visible: ${selector}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Verify element is enabled
   * @param selector Element selector
   * @returns Promise resolving when element is enabled
   */
  public async verifyElementIsEnabled(selector: string): Promise<void> {
    logger.debug(`Verifying element is enabled: ${selector}`);
    
    try {
      // Wait for element to be visible
      const locator = await this.waitForElement(selector);
      
      // Verify element is enabled
      await expect(locator).toBeEnabled();
      
      logger.debug(`Verified element is enabled: ${selector}`);
    } catch (error) {
      logger.error(`Failed to verify element is enabled: ${selector}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Verify element is disabled
   * @param selector Element selector
   * @returns Promise resolving when element is disabled
   */
  public async verifyElementIsDisabled(selector: string): Promise<void> {
    logger.debug(`Verifying element is disabled: ${selector}`);
    
    try {
      // Wait for element to be visible
      const locator = await this.waitForElement(selector);
      
      // Verify element is disabled
      await expect(locator).toBeDisabled();
      
      logger.debug(`Verified element is disabled: ${selector}`);
    } catch (error) {
      logger.error(`Failed to verify element is disabled: ${selector}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Verify element count
   * @param selector Element selector
   * @param expectedCount Expected count
   * @returns Promise resolving when count is verified
   */
  public async verifyElementCount(selector: string, expectedCount: number): Promise<void> {
    logger.debug(`Verifying element count: ${selector}, expected: ${expectedCount}`);
    
    try {
      const locator = this.page.locator(selector);
      
      // Verify element count
      await expect(locator).toHaveCount(expectedCount);
      
      logger.debug(`Verified element count: ${selector}, count: ${expectedCount}`);
    } catch (error) {
      logger.error(`Failed to verify element count: ${selector}`, { error: String(error) });
      throw error;
    }
  }

  /**
   * Verify page title
   * @param expectedTitle Expected title
   * @param options Verify options
   * @returns Promise resolving when title is verified
   */
  public async verifyPageTitle(
    expectedTitle: string,
    options?: { exact?: boolean }
  ): Promise<void> {
    logger.debug(`Verifying page title, expected: ${expectedTitle}`);
    
    try {
      // Get page title
      const actualTitle = await this.getPageTitle();
      
      // Verify title
      if (options?.exact) {
        expect(actualTitle).toBe(expectedTitle);
      } else {
        expect(actualTitle).toContain(expectedTitle);
      }
      
      logger.debug(`Verified page title, actual: ${actualTitle}`);
    } catch (error) {
      logger.error('Failed to verify page title', { error: String(error) });
      throw error;
    }
  }

  /**
   * Verify URL
   * @param expectedUrl Expected URL
   * @param options Verify options
   * @returns Promise resolving when URL is verified
   */
  public async verifyUrl(
    expectedUrl: string,
    options?: { exact?: boolean }
  ): Promise<void> {
    logger.debug(`Verifying URL, expected: ${expectedUrl}`);
    
    try {
      // Get current URL
      const actualUrl = await this.getCurrentUrl();
      
      // Verify URL
      if (options?.exact) {
        expect(actualUrl).toBe(expectedUrl);
      } else {
        expect(actualUrl).toContain(expectedUrl);
      }
      
      logger.debug(`Verified URL, actual: ${actualUrl}`);
    } catch (error) {
      logger.error('Failed to verify URL', { error: String(error) });
      throw error;
    }
  }
}