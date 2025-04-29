import { Page, Locator, Browser, BrowserContext, Frame, ElementHandle } from '@playwright/test';
import { logger } from '../logger';
import path from 'path';
import fs from 'fs';

/**
 * Base helper class that provides common methods for all tests
 * This is the core helper that replaces the functionality from BasePage
 */
export class BaseHelper {
  protected page: Page;
  protected defaultTimeout: number = 10000;
  protected baseUrl: string;
  protected screenshots: { name: string; path: string }[] = [];

  /**
   * Initialize the BaseHelper class
   * @param page - Playwright Page object
   */
  constructor(page: Page, baseUrl?: string) {
    this.page = page;
    this.baseUrl = baseUrl || 'https://demo.applitools.com/';
    
    logger.info(`BaseHelper initialized with base URL: ${this.baseUrl}`);
  }

  /**
   * Navigate to a URL
   * @param url - URL to navigate to (optional, uses baseURL if not provided)
   */
  async navigate(url?: string): Promise<void> {
    const targetUrl = url || this.baseUrl;
    logger.info(`Navigating to: ${targetUrl}`);
    
    try {
      await this.page.goto(targetUrl, {
        waitUntil: 'networkidle',
        timeout: this.defaultTimeout
      });
      logger.info('Navigation completed');
    } catch (error) {
      logger.error(`Navigation failed: ${error}`);
      throw error;
    }
  }

  /**
   * Find a locator with the given selector
   * @param selector - CSS or XPath selector
   * @returns Playwright Locator
   */
  getLocator(selector: string): Locator {
    // Check if selector is XPath
    if (selector.startsWith('//') || selector.startsWith('(//')) {
      return this.page.locator(`xpath=${selector}`);
    }
    
    // Otherwise use CSS selector
    return this.page.locator(selector);
  }

  /**
   * Click on an element
   * @param selector - CSS or XPath selector
   * @param options - Click options
   */
  async click(selector: string, options?: { force?: boolean; timeout?: number; noWaitAfter?: boolean }): Promise<void> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    logger.debug(`Clicking on element: ${selector}`);
    
    try {
      await locator.click({
        force: options?.force,
        timeout,
        noWaitAfter: options?.noWaitAfter
      });
    } catch (error) {
      logger.error(`Failed to click on element: ${selector}. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Double click on an element
   * @param selector - CSS or XPath selector
   * @param options - Double click options
   */
  async doubleClick(selector: string, options?: { force?: boolean; timeout?: number }): Promise<void> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    logger.debug(`Double clicking on element: ${selector}`);
    
    try {
      await locator.dblclick({
        force: options?.force,
        timeout
      });
    } catch (error) {
      logger.error(`Failed to double click on element: ${selector}. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Right click on an element
   * @param selector - CSS or XPath selector
   * @param options - Right click options
   */
  async rightClick(selector: string, options?: { force?: boolean; timeout?: number }): Promise<void> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    logger.debug(`Right clicking on element: ${selector}`);
    
    try {
      await locator.click({
        button: 'right',
        force: options?.force,
        timeout
      });
    } catch (error) {
      logger.error(`Failed to right click on element: ${selector}. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Fill text in an input field
   * @param selector - CSS or XPath selector
   * @param text - Text to input
   * @param options - Fill options
   */
  async fill(selector: string, text: string, options?: { timeout?: number; noWaitAfter?: boolean; force?: boolean; clear?: boolean }): Promise<void> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    logger.debug(`Filling text in element: ${selector}`);
    
    try {
      // Clear field first if specified
      if (options?.clear) {
        await locator.clear();
      }
      
      await locator.fill(text, {
        timeout,
        noWaitAfter: options?.noWaitAfter,
        force: options?.force
      });
    } catch (error) {
      logger.error(`Failed to fill text in element: ${selector}. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Type text character by character
   * @param selector - CSS or XPath selector
   * @param text - Text to type
   * @param options - Type options
   */
  async type(selector: string, text: string, options?: { delay?: number; timeout?: number; noWaitAfter?: boolean; clear?: boolean }): Promise<void> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    logger.debug(`Typing text in element: ${selector}`);
    
    try {
      // Clear field first if specified
      if (options?.clear) {
        await locator.clear();
      }
      
      await locator.type(text, {
        delay: options?.delay,
        timeout,
        noWaitAfter: options?.noWaitAfter
      });
    } catch (error) {
      logger.error(`Failed to type text in element: ${selector}. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Clear text from an input field
   * @param selector - CSS or XPath selector
   * @param options - Clear options
   */
  async clear(selector: string, options?: { timeout?: number; force?: boolean }): Promise<void> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    logger.debug(`Clearing text from element: ${selector}`);
    
    try {
      await locator.clear({
        timeout,
        force: options?.force
      });
    } catch (error) {
      logger.error(`Failed to clear text from element: ${selector}. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Get text from an element
   * @param selector - CSS or XPath selector
   * @param options - Get text options
   * @returns Text content of the element
   */
  async getText(selector: string, options?: { timeout?: number }): Promise<string> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    logger.debug(`Getting text from element: ${selector}`);
    
    try {
      const text = await locator.textContent({ timeout });
      return text ? text.trim() : '';
    } catch (error) {
      logger.error(`Failed to get text from element: ${selector}. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Get inner text from an element
   * @param selector - CSS or XPath selector
   * @param options - Get inner text options
   * @returns Inner text content of the element
   */
  async getInnerText(selector: string, options?: { timeout?: number }): Promise<string> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    logger.debug(`Getting inner text from element: ${selector}`);
    
    try {
      const text = await locator.innerText({ timeout });
      return text.trim();
    } catch (error) {
      logger.error(`Failed to get inner text from element: ${selector}. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Get value from an input element
   * @param selector - CSS or XPath selector
   * @param options - Get input value options
   * @returns Input value
   */
  async getValue(selector: string, options?: { timeout?: number }): Promise<string> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    logger.debug(`Getting value from input element: ${selector}`);
    
    try {
      const value = await locator.inputValue({ timeout });
      return value;
    } catch (error) {
      logger.error(`Failed to get value from input element: ${selector}. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Get attribute from an element
   * @param selector - CSS or XPath selector
   * @param attributeName - Attribute name
   * @param options - Get attribute options
   * @returns Attribute value
   */
  async getAttribute(selector: string, attributeName: string, options?: { timeout?: number }): Promise<string | null> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    logger.debug(`Getting attribute "${attributeName}" from element: ${selector}`);
    
    try {
      const attribute = await locator.getAttribute(attributeName, { timeout });
      return attribute;
    } catch (error) {
      logger.error(`Failed to get attribute "${attributeName}" from element: ${selector}. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Check if an element is visible
   * @param selector - CSS or XPath selector
   * @param options - Visibility check options
   * @returns True if visible, false otherwise
   */
  async isVisible(selector: string, options?: { timeout?: number }): Promise<boolean> {
    const locator = this.getLocator(selector);
    
    try {
      const timeout = options?.timeout || 5000; // Use shorter timeout for visibility check
      
      return await locator.isVisible({ timeout });
    } catch (error) {
      logger.debug(`Element not visible: ${selector}`);
      return false;
    }
  }

  /**
   * Check if an element is enabled
   * @param selector - CSS or XPath selector
   * @param options - Enabled check options
   * @returns True if enabled, false otherwise
   */
  async isEnabled(selector: string, options?: { timeout?: number }): Promise<boolean> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    try {
      return await locator.isEnabled({ timeout });
    } catch (error) {
      logger.debug(`Element not enabled: ${selector}`);
      return false;
    }
  }

  /**
   * Check if an element is disabled
   * @param selector - CSS or XPath selector
   * @param options - Disabled check options
   * @returns True if disabled, false otherwise
   */
  async isDisabled(selector: string, options?: { timeout?: number }): Promise<boolean> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    try {
      return await locator.isDisabled({ timeout });
    } catch (error) {
      logger.debug(`Element not found or error checking disabled state: ${selector}`);
      return false;
    }
  }

  /**
   * Check if checkbox or radio is checked
   * @param selector - CSS or XPath selector
   * @param options - Checked check options
   * @returns True if checked, false otherwise
   */
  async isChecked(selector: string, options?: { timeout?: number }): Promise<boolean> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    try {
      return await locator.isChecked({ timeout });
    } catch (error) {
      logger.debug(`Element not checked or error checking state: ${selector}`);
      return false;
    }
  }

  /**
   * Wait for an element to be visible
   * @param selector - CSS or XPath selector
   * @param options - Wait options
   */
  async waitForVisible(selector: string, options?: { timeout?: number; state?: 'visible' | 'hidden' }): Promise<void> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    const state = options?.state || 'visible';
    
    logger.debug(`Waiting for element to be ${state}: ${selector}`);
    
    try {
      await locator.waitFor({
        state,
        timeout
      });
    } catch (error) {
      logger.error(`Timeout waiting for element to be ${state}: ${selector}`);
      throw error;
    }
  }

  /**
   * Wait for element to be enabled
   * @param selector - CSS or XPath selector
   * @param options - Wait options
   */
  async waitForEnabled(selector: string, options?: { timeout?: number }): Promise<void> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    logger.debug(`Waiting for element to be enabled: ${selector}`);
    
    try {
      await locator.waitFor({
        state: 'visible',
        timeout
      });
      
      // Wait until element is enabled
      await this.page.waitForFunction(
        (selector) => {
          const element = document.querySelector(selector);
          return element && !element.hasAttribute('disabled');
        },
        selector,
        { timeout }
      );
    } catch (error) {
      logger.error(`Timeout waiting for element to be enabled: ${selector}`);
      throw error;
    }
  }

  /**
   * Wait for navigation to complete
   * @param options - Wait options
   */
  async waitForNavigation(options?: { timeout?: number; waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }): Promise<void> {
    const timeout = options?.timeout || this.defaultTimeout;
    const waitUntil = options?.waitUntil || 'networkidle';
    
    logger.debug(`Waiting for navigation to complete (${waitUntil})`);
    
    try {
      await this.page.waitForNavigation({
        timeout,
        waitUntil
      });
    } catch (error) {
      logger.error(`Timeout waiting for navigation: ${error}`);
      throw error;
    }
  }

  /**
   * Wait for selector to be in the DOM
   * @param selector - CSS or XPath selector
   * @param options - Wait options
   */
  async waitForSelector(selector: string, options?: { timeout?: number; state?: 'attached' | 'detached' | 'visible' | 'hidden' }): Promise<void> {
    const timeout = options?.timeout || this.defaultTimeout;
    const state = options?.state || 'attached';
    
    logger.debug(`Waiting for selector to be ${state}: ${selector}`);
    
    try {
      await this.page.waitForSelector(selector, {
        timeout,
        state
      });
    } catch (error) {
      logger.error(`Timeout waiting for selector to be ${state}: ${selector}`);
      throw error;
    }
  }

  /**
   * Hover over an element
   * @param selector - CSS or XPath selector
   * @param options - Hover options
   */
  async hover(selector: string, options?: { position?: { x: number; y: number }; timeout?: number; force?: boolean }): Promise<void> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    logger.debug(`Hovering over element: ${selector}`);
    
    try {
      await locator.hover({
        position: options?.position,
        timeout,
        force: options?.force
      });
    } catch (error) {
      logger.error(`Failed to hover over element: ${selector}. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Drag and drop element
   * @param sourceSelector - Source element selector
   * @param targetSelector - Target element selector
   * @param options - Drag and drop options
   */
  async dragAndDrop(sourceSelector: string, targetSelector: string, options?: { timeout?: number; force?: boolean }): Promise<void> {
    const sourceLocator = this.getLocator(sourceSelector);
    const targetLocator = this.getLocator(targetSelector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    logger.debug(`Dragging from ${sourceSelector} to ${targetSelector}`);
    
    try {
      // Drag and drop
      await sourceLocator.dragTo(targetLocator, {
        timeout,
        force: options?.force
      });
    } catch (error) {
      logger.error(`Failed to drag and drop from ${sourceSelector} to ${targetSelector}. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Take a screenshot
   * @param name - Name of the screenshot
   * @returns Path to the screenshot
   */
  async takeScreenshot(name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const screenshotName = `${name}_${timestamp}.png`;
    const screenshotPath = path.join('reports/screenshots', screenshotName);
    
    logger.debug(`Taking screenshot: ${screenshotName}`);
    
    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(screenshotPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Take screenshot
      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      
      // Add to screenshots array for reporting
      this.screenshots.push({
        name,
        path: screenshotPath
      });
      
      logger.info(`Screenshot saved: ${screenshotPath}`);
      
      return screenshotPath;
    } catch (error) {
      logger.error(`Failed to take screenshot: ${error}`);
      throw error;
    }
  }

  /**
   * Take screenshot of a specific element
   * @param selector - CSS or XPath selector
   * @param name - Name of the screenshot
   * @returns Path to the screenshot
   */
  async takeElementScreenshot(selector: string, name: string): Promise<string> {
    const locator = this.getLocator(selector);
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const screenshotName = `${name}_${timestamp}.png`;
    const screenshotPath = path.join('reports/screenshots', screenshotName);
    
    logger.debug(`Taking screenshot of element: ${selector}`);
    
    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(screenshotPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Take element screenshot
      await locator.screenshot({
        path: screenshotPath
      });
      
      // Add to screenshots array for reporting
      this.screenshots.push({
        name,
        path: screenshotPath
      });
      
      logger.info(`Element screenshot saved: ${screenshotPath}`);
      
      return screenshotPath;
    } catch (error) {
      logger.error(`Failed to take element screenshot: ${error}`);
      throw error;
    }
  }

  /**
   * Get the current URL
   * @returns Current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Get the page title
   * @returns Page title
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Execute JavaScript
   * @param script - JavaScript to execute
   * @param args - Arguments to pass to the script
   * @returns Result of the script execution
   */
  async executeScript<T>(script: string, ...args: any[]): Promise<T> {
    logger.debug('Executing JavaScript');
    
    try {
      return await this.page.evaluate(script, ...args);
    } catch (error) {
      logger.error(`Failed to execute JavaScript: ${error}`);
      throw error;
    }
  }

  /**
   * Verify element exists
   * @param selector - CSS or XPath selector
   * @param options - Verification options
   * @returns True if element exists, false otherwise
   */
  async verifyElementExists(selector: string, options?: { timeout?: number }): Promise<boolean> {
    const timeout = options?.timeout || 5000; // Use shorter timeout for existence check
    
    try {
      const locator = this.getLocator(selector);
      return await locator.count() > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Count elements matching selector
   * @param selector - CSS or XPath selector
   * @returns Number of matching elements
   */
  async countElements(selector: string): Promise<number> {
    const locator = this.getLocator(selector);
    
    try {
      return await locator.count();
    } catch (error) {
      logger.error(`Failed to count elements: ${selector}. Error: ${error}`);
      return 0;
    }
  }

  /**
   * Verify element contains text
   * @param selector - CSS or XPath selector
   * @param text - Text to check
   * @param options - Verification options
   * @returns True if element contains text, false otherwise
   */
  async verifyElementContainsText(selector: string, text: string, options?: { timeout?: number }): Promise<boolean> {
    const timeout = options?.timeout || this.defaultTimeout;
    
    try {
      const locator = this.getLocator(selector);
      const elementText = await locator.textContent({ timeout });
      
      return elementText !== null && elementText.includes(text);
    } catch (error) {
      logger.error(`Failed to verify element contains text: ${selector}. Error: ${error}`);
      return false;
    }
  }

  /**
   * Verify page title
   * @param expectedTitle - Expected title
   * @param options - Verification options
   * @returns True if title matches, false otherwise
   */
  async verifyTitle(expectedTitle: string, options?: { contains?: boolean }): Promise<boolean> {
    try {
      const actualTitle = await this.getTitle();
      
      if (options?.contains) {
        return actualTitle.includes(expectedTitle);
      }
      
      return actualTitle === expectedTitle;
    } catch (error) {
      logger.error(`Failed to verify page title. Error: ${error}`);
      return false;
    }
  }

  /**
   * Verify URL
   * @param expectedUrl - Expected URL
   * @param options - Verification options
   * @returns True if URL matches, false otherwise
   */
  async verifyUrl(expectedUrl: string, options?: { contains?: boolean }): Promise<boolean> {
    try {
      const actualUrl = await this.getCurrentUrl();
      
      if (options?.contains) {
        return actualUrl.includes(expectedUrl);
      }
      
      return actualUrl === expectedUrl;
    } catch (error) {
      logger.error(`Failed to verify URL. Error: ${error}`);
      return false;
    }
  }

  /**
   * Get all cookies
   * @returns Cookies array
   */
  async getCookies(): Promise<any[]> {
    try {
      return await this.page.context().cookies();
    } catch (error) {
      logger.error(`Failed to get cookies. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Set cookie
   * @param name - Cookie name
   * @param value - Cookie value
   * @param options - Cookie options
   */
  async setCookie(name: string, value: string, options?: { domain?: string; path?: string; expires?: number; httpOnly?: boolean; secure?: boolean; sameSite?: 'Strict' | 'Lax' | 'None' }): Promise<void> {
    try {
      const currentUrl = await this.getCurrentUrl();
      const urlObj = new URL(currentUrl);
      
      await this.page.context().addCookies([{
        name,
        value,
        domain: options?.domain || urlObj.hostname,
        path: options?.path || '/',
        expires: options?.expires,
        httpOnly: options?.httpOnly,
        secure: options?.secure,
        sameSite: options?.sameSite
      }]);
    } catch (error) {
      logger.error(`Failed to set cookie. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Clear all cookies
   */
  async clearCookies(): Promise<void> {
    try {
      await this.page.context().clearCookies();
    } catch (error) {
      logger.error(`Failed to clear cookies. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Refresh page
   */
  async refreshPage(): Promise<void> {
    try {
      await this.page.reload();
    } catch (error) {
      logger.error(`Failed to refresh page. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Press key on element
   * @param selector - CSS or XPath selector
   * @param key - Key to press
   * @param options - Press options
   */
  async pressKey(selector: string, key: string, options?: { timeout?: number; delay?: number }): Promise<void> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    try {
      await locator.press(key, {
        timeout,
        delay: options?.delay
      });
    } catch (error) {
      logger.error(`Failed to press key on element. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Press keyboard combination
   * @param keys - Keys to press
   */
  async pressKeyboard(keys: string): Promise<void> {
    try {
      await this.page.keyboard.press(keys);
    } catch (error) {
      logger.error(`Failed to press keyboard keys. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Set local storage item
   * @param key - Local storage key
   * @param value - Local storage value
   */
  async setLocalStorage(key: string, value: string): Promise<void> {
    try {
      await this.page.evaluate(
        ([k, v]) => { localStorage.setItem(k, v); },
        [key, value]
      );
    } catch (error) {
      logger.error(`Failed to set local storage item. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Get local storage item
   * @param key - Local storage key
   * @returns Local storage value
   */
  async getLocalStorage(key: string): Promise<string | null> {
    try {
      return await this.page.evaluate(
        (k) => localStorage.getItem(k),
        key
      );
    } catch (error) {
      logger.error(`Failed to get local storage item. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Clear local storage
   */
  async clearLocalStorage(): Promise<void> {
    try {
      await this.page.evaluate(() => localStorage.clear());
    } catch (error) {
      logger.error(`Failed to clear local storage. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Select option by value
   * @param selector - CSS or XPath selector
   * @param value - Option value
   * @param options - Selection options
   */
  async selectOptionByValue(selector: string, value: string, options?: { timeout?: number }): Promise<void> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    try {
      await locator.selectOption({ value }, { timeout });
    } catch (error) {
      logger.error(`Failed to select option by value. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Select option by label
   * @param selector - CSS or XPath selector
   * @param label - Option label
   * @param options - Selection options
   */
  async selectOptionByLabel(selector: string, label: string, options?: { timeout?: number }): Promise<void> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    try {
      await locator.selectOption({ label }, { timeout });
    } catch (error) {
      logger.error(`Failed to select option by label. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Select option by index
   * @param selector - CSS or XPath selector
   * @param index - Option index
   * @param options - Selection options
   */
  async selectOptionByIndex(selector: string, index: number, options?: { timeout?: number }): Promise<void> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    try {
      await locator.selectOption({ index }, { timeout });
    } catch (error) {
      logger.error(`Failed to select option by index. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Get selected option text
   * @param selector - CSS or XPath selector
   * @returns Selected option text
   */
  async getSelectedOptionText(selector: string): Promise<string> {
    try {
      return await this.page.evaluate((sel) => {
        const element = document.querySelector(sel) as HTMLSelectElement;
        if (element && element.selectedIndex >= 0) {
          return element.options[element.selectedIndex].text;
        }
        return '';
      }, selector);
    } catch (error) {
      logger.error(`Failed to get selected option text. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Check checkbox or radio
   * @param selector - CSS or XPath selector
   * @param check - Whether to check or uncheck (default: true)
   * @param options - Check options
   */
  async check(selector: string, check: boolean = true, options?: { timeout?: number; force?: boolean }): Promise<void> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    try {
      if (check) {
        await locator.check({ timeout, force: options?.force });
      } else {
        await locator.uncheck({ timeout, force: options?.force });
      }
    } catch (error) {
      logger.error(`Failed to ${check ? 'check' : 'uncheck'} checkbox. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Set file input
   * @param selector - CSS or XPath selector
   * @param filePaths - Path(s) to file(s)
   * @param options - File input options
   */
  async setFileInput(selector: string, filePaths: string | string[], options?: { timeout?: number }): Promise<void> {
    const locator = this.getLocator(selector);
    const timeout = options?.timeout || this.defaultTimeout;
    
    try {
      await locator.setInputFiles(filePaths, { timeout });
    } catch (error) {
      logger.error(`Failed to set file input. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Wait for specified time
   * @param ms - Time to wait in milliseconds
   */
  async wait(ms: number): Promise<void> {
    try {
      await this.page.waitForTimeout(ms);
    } catch (error) {
      logger.error(`Failed to wait. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Wait for specified condition to be true
   * @param conditionFn - Condition function
   * @param options - Wait options
   */
  async waitForCondition(conditionFn: () => Promise<boolean>, options?: { timeout?: number; pollingInterval?: number }): Promise<void> {
    const timeout = options?.timeout || this.defaultTimeout;
    const pollingInterval = options?.pollingInterval || 100;
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const result = await conditionFn();
        if (result) {
          return;
        }
      } catch (error) {
        // Ignore errors and continue polling
      }
      
      await this.wait(pollingInterval);
    }
    
    throw new Error(`Timeout waiting for condition after ${timeout}ms`);
  }

  /**
   * Check if an element exists
   * @param selector - CSS or XPath selector
   * @returns True if element exists, false otherwise
   */
  async exists(selector: string): Promise<boolean> {
    try {
      const locator = this.getLocator(selector);
      return await locator.count() > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all window handles
   * @returns Array of page objects
   */
  async getAllPages(): Promise<Page[]> {
    return this.page.context().pages();
  }

  /**
   * Switch to a window by index or title
   * @param identifier - Window index or title
   * @returns True if switched successfully, false otherwise
   */
  async switchToWindow(identifier: number | string): Promise<boolean> {
    try {
      const pages = await this.getAllPages();
      
      if (typeof identifier === 'number') {
        if (identifier >= 0 && identifier < pages.length) {
          this.page = pages[identifier];
          return true;
        }
      } else {
        for (const page of pages) {
          const title = await page.title();
          if (title === identifier) {
            this.page = page;
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      logger.error(`Failed to switch to window. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Switch to a frame
   * @param selector - Frame selector
   */
  async switchToFrame(selector: string): Promise<void> {
    try {
      const frame = await this.page.frameLocator(selector).first();
      
      if (!frame) {
        throw new Error(`Frame not found with selector: ${selector}`);
      }
      
      // Store the frame for further interactions
      this['currentFrame'] = frame;
    } catch (error) {
      logger.error(`Failed to switch to frame. Error: ${error}`);
      throw error;
    }
  }

  /**
   * Switch back to main frame
   */
  async switchToMainFrame(): Promise<void> {
    try {
      this['currentFrame'] = null;
    } catch (error) {
      logger.error(`Failed to switch to main frame. Error: ${error}`);
      throw error;
    }
  }
}

// Export the BaseHelper class
export default BaseHelper;