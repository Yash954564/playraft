import { Page, Locator, expect, ElementHandle } from '@playwright/test';
import { logger } from '../utils/logger';
import { allureReporter } from '../utils/allureReporter';
import path from 'path';
import fs from 'fs';

/**
 * UI Helper class that provides common UI interaction methods
 * Equivalent to the RAFT_UI_TDD/SupportLibraries/ui_helpers.py
 */
export class UIHelpers {
  protected page: Page;
  protected defaultTimeout: number = 10000;
  
  /**
   * Initialize the UIHelpers class
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;
  }
  
  /**
   * Get page title
   * @returns Page title
   */
  async getTitle(): Promise<string> {
    return await allureReporter.step('Get page title', async () => {
      try {
        const title = await this.page.title();
        logger.info(`Page title: ${title}`);
        return title;
      } catch (error) {
        logger.error(`Error getting page title: ${error}`);
        return '';
      }
    });
  }
  
  /**
   * Wait for element to be present in DOM
   * @param selector - Element selector
   * @param timeout - Timeout in milliseconds
   * @returns True if element is present, false otherwise
   */
  async waitForElementPresent(selector: string, timeout?: number): Promise<boolean> {
    return await allureReporter.step(`Wait for element present: ${selector}`, async () => {
      try {
        const timeoutValue = timeout || this.defaultTimeout;
        await this.page.waitForSelector(selector, { 
          state: 'attached',
          timeout: timeoutValue 
        });
        logger.debug(`Element present: ${selector}`);
        return true;
      } catch (error) {
        logger.error(`Element not present: ${selector} - ${error}`);
        return false;
      }
    });
  }
  
  /**
   * Wait for element to be visible
   * @param selector - Element selector
   * @param timeout - Timeout in milliseconds
   * @returns True if element is visible, false otherwise
   */
  async waitForElementVisible(selector: string, timeout?: number): Promise<boolean> {
    return await allureReporter.step(`Wait for element visible: ${selector}`, async () => {
      try {
        const timeoutValue = timeout || this.defaultTimeout;
        await this.page.waitForSelector(selector, { 
          state: 'visible',
          timeout: timeoutValue 
        });
        logger.debug(`Element visible: ${selector}`);
        return true;
      } catch (error) {
        logger.error(`Element not visible: ${selector} - ${error}`);
        return false;
      }
    });
  }
  
  /**
   * Wait for element to be clickable
   * @param selector - Element selector
   * @param timeout - Timeout in milliseconds
   * @returns True if element is clickable, false otherwise
   */
  async waitForElementClickable(selector: string, timeout?: number): Promise<boolean> {
    return await allureReporter.step(`Wait for element clickable: ${selector}`, async () => {
      try {
        const timeoutValue = timeout || this.defaultTimeout;
        
        // First check if element is visible
        await this.page.waitForSelector(selector, { 
          state: 'visible',
          timeout: timeoutValue 
        });
        
        // Then check if element is enabled
        const isEnabled = await this.page.locator(selector).isEnabled();
        if (!isEnabled) {
          logger.error(`Element not enabled: ${selector}`);
          return false;
        }
        
        logger.debug(`Element clickable: ${selector}`);
        return true;
      } catch (error) {
        logger.error(`Element not clickable: ${selector} - ${error}`);
        return false;
      }
    });
  }
  
  /**
   * Wait for element to be invisible
   * @param selector - Element selector
   * @param timeout - Timeout in milliseconds
   * @returns True if element is invisible, false otherwise
   */
  async waitForElementInvisible(selector: string, timeout?: number): Promise<boolean> {
    return await allureReporter.step(`Wait for element invisible: ${selector}`, async () => {
      try {
        const timeoutValue = timeout || this.defaultTimeout;
        await this.page.waitForSelector(selector, { 
          state: 'hidden',
          timeout: timeoutValue 
        });
        logger.debug(`Element invisible: ${selector}`);
        return true;
      } catch (error) {
        logger.error(`Element still visible: ${selector} - ${error}`);
        return false;
      }
    });
  }
  
  /**
   * Check if element is present
   * @param selector - Element selector
   * @param timeout - Timeout in milliseconds
   * @returns True if element is present, false otherwise
   */
  async isElementPresent(selector: string, timeout?: number): Promise<boolean> {
    return await allureReporter.step(`Check if element present: ${selector}`, async () => {
      return await this.waitForElementPresent(selector, timeout);
    });
  }
  
  /**
   * Check if element is visible
   * @param selector - Element selector
   * @param timeout - Timeout in milliseconds
   * @returns True if element is visible, false otherwise
   */
  async isElementVisible(selector: string, timeout?: number): Promise<boolean> {
    return await allureReporter.step(`Check if element visible: ${selector}`, async () => {
      return await this.waitForElementVisible(selector, timeout);
    });
  }
  
  /**
   * Check if element is clickable
   * @param selector - Element selector
   * @param timeout - Timeout in milliseconds
   * @returns True if element is clickable, false otherwise
   */
  async isElementClickable(selector: string, timeout?: number): Promise<boolean> {
    return await allureReporter.step(`Check if element clickable: ${selector}`, async () => {
      return await this.waitForElementClickable(selector, timeout);
    });
  }
  
  /**
   * Get element
   * @param selector - Element selector
   * @param timeout - Timeout in milliseconds
   * @returns Locator object
   */
  async getElement(selector: string, timeout?: number): Promise<Locator> {
    return await allureReporter.step(`Get element: ${selector}`, async () => {
      try {
        const timeoutValue = timeout || this.defaultTimeout;
        await this.page.waitForSelector(selector, { 
          state: 'attached',
          timeout: timeoutValue 
        });
        
        const element = this.page.locator(selector);
        logger.debug(`Got element: ${selector}`);
        return element;
      } catch (error) {
        logger.error(`Error getting element: ${selector} - ${error}`);
        throw error;
      }
    });
  }
  
  /**
   * Get elements
   * @param selector - Element selector
   * @param timeout - Timeout in milliseconds
   * @returns Array of Locator objects
   */
  async getElements(selector: string, timeout?: number): Promise<Locator> {
    return await allureReporter.step(`Get elements: ${selector}`, async () => {
      try {
        const timeoutValue = timeout || this.defaultTimeout;
        await this.page.waitForSelector(selector, { 
          state: 'attached',
          timeout: timeoutValue 
        });
        
        const elements = this.page.locator(selector);
        const count = await elements.count();
        logger.debug(`Got ${count} elements: ${selector}`);
        return elements;
      } catch (error) {
        logger.error(`Error getting elements: ${selector} - ${error}`);
        throw error;
      }
    });
  }
  
  /**
   * Get text from element
   * @param selector - Element selector
   * @param timeout - Timeout in milliseconds
   * @returns Text content
   */
  async getTextFromElement(selector: string, timeout?: number): Promise<string> {
    return await allureReporter.step(`Get text from element: ${selector}`, async () => {
      try {
        const element = await this.getElement(selector, timeout);
        const text = await element.textContent() || '';
        logger.debug(`Got text: "${text}" from element: ${selector}`);
        return text.trim();
      } catch (error) {
        logger.error(`Error getting text from element: ${selector} - ${error}`);
        return '';
      }
    });
  }
  
  /**
   * Get attribute value from element
   * @param selector - Element selector
   * @param attributeName - Attribute name
   * @param timeout - Timeout in milliseconds
   * @returns Attribute value
   */
  async getAttributeFromElement(selector: string, attributeName: string, timeout?: number): Promise<string> {
    return await allureReporter.step(`Get attribute ${attributeName} from element: ${selector}`, async () => {
      try {
        const element = await this.getElement(selector, timeout);
        const value = await element.getAttribute(attributeName) || '';
        logger.debug(`Got attribute ${attributeName}: "${value}" from element: ${selector}`);
        return value;
      } catch (error) {
        logger.error(`Error getting attribute ${attributeName} from element: ${selector} - ${error}`);
        return '';
      }
    });
  }
  
  /**
   * Click on element
   * @param selector - Element selector
   * @param timeout - Timeout in milliseconds
   */
  async mouseClickAction(selector: string, timeout?: number): Promise<void> {
    await allureReporter.step(`Click on element: ${selector}`, async () => {
      try {
        if (await this.isElementClickable(selector, timeout)) {
          const element = await this.getElement(selector, timeout);
          await element.click();
          logger.info(`Clicked on element: ${selector}`);
        } else {
          logger.error(`Element not clickable: ${selector}`);
          throw new Error(`Element not clickable: ${selector}`);
        }
      } catch (error) {
        logger.error(`Error clicking on element: ${selector} - ${error}`);
        throw error;
      }
    });
  }
  
  /**
   * Scroll element into view
   * @param selector - Element selector
   * @param timeout - Timeout in milliseconds
   */
  async scrollIntoElement(selector: string, timeout?: number): Promise<void> {
    await allureReporter.step(`Scroll element into view: ${selector}`, async () => {
      try {
        const element = await this.getElement(selector, timeout);
        await element.scrollIntoViewIfNeeded();
        logger.debug(`Scrolled element into view: ${selector}`);
      } catch (error) {
        logger.error(`Error scrolling element into view: ${selector} - ${error}`);
        throw error;
      }
    });
  }
  
  /**
   * Move to element and click
   * @param selector - Element selector
   * @param timeout - Timeout in milliseconds
   */
  async moveToElementAndClick(selector: string, timeout?: number): Promise<void> {
    await allureReporter.step(`Move to element and click: ${selector}`, async () => {
      try {
        const element = await this.getElement(selector, timeout);
        await element.hover();
        await element.click();
        logger.info(`Moved to element and clicked: ${selector}`);
      } catch (error) {
        logger.error(`Error moving to element and clicking: ${selector} - ${error}`);
        throw error;
      }
    });
  }
  
  /**
   * Enter text into element
   * @param selector - Element selector
   * @param text - Text to enter
   * @param timeout - Timeout in milliseconds
   */
  async enterTextAction(text: string, selector: string, timeout?: number): Promise<void> {
    await allureReporter.step(`Enter text "${text}" into element: ${selector}`, async () => {
      try {
        const element = await this.getElement(selector, timeout);
        await element.clear();
        await element.fill(text);
        logger.info(`Entered text "${text}" into element: ${selector}`);
      } catch (error) {
        logger.error(`Error entering text into element: ${selector} - ${error}`);
        throw error;
      }
    });
  }
  
  /**
   * Verify text contains
   * @param actualText - Actual text
   * @param expectedText - Expected text
   * @returns True if actual text contains expected text, false otherwise
   */
  async verifyTextContains(actualText: string, expectedText: string): Promise<boolean> {
    return await allureReporter.step(`Verify text contains: "${expectedText}"`, async () => {
      const result = actualText.toLowerCase().includes(expectedText.toLowerCase());
      if (result) {
        logger.info(`Text verification PASSED! Actual text contains expected text: "${expectedText}"`);
      } else {
        logger.error(`Text verification FAILED! Actual text: "${actualText}" does not contain expected text: "${expectedText}"`);
      }
      return result;
    });
  }
  
  /**
   * Verify text match
   * @param actualText - Actual text
   * @param expectedText - Expected text
   * @returns True if actual text matches expected text, false otherwise
   */
  async verifyTextMatch(actualText: string, expectedText: string): Promise<boolean> {
    return await allureReporter.step(`Verify text match: "${expectedText}"`, async () => {
      const result = actualText.toLowerCase() === expectedText.toLowerCase();
      if (result) {
        logger.info(`Text verification PASSED! Actual text matches expected text: "${expectedText}"`);
      } else {
        logger.error(`Text verification FAILED! Actual text: "${actualText}" does not match expected text: "${expectedText}"`);
      }
      return result;
    });
  }
  
  /**
   * Take screenshot
   * @param fileName - Screenshot file name
   * @returns Screenshot file path
   */
  async takeScreenshot(fileName: string): Promise<string> {
    return await allureReporter.step(`Take screenshot: ${fileName}`, async () => {
      try {
        // Create screenshots directory if it doesn't exist
        const screenshotDir = path.join(process.cwd(), 'screenshots');
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        // Generate file name with timestamp
        const timestamp = new Date().getTime();
        const filePath = path.join(screenshotDir, `${fileName}_${timestamp}.png`);
        
        // Take screenshot
        await this.page.screenshot({ path: filePath });
        
        logger.info(`Screenshot saved: ${filePath}`);
        
        // Add screenshot to allure report
        const buffer = fs.readFileSync(filePath);
        allureReporter.screenshot(fileName, buffer);
        
        return filePath;
      } catch (error) {
        logger.error(`Error taking screenshot: ${error}`);
        return '';
      }
    });
  }
}