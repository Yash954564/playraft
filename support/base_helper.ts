import { Page } from '@playwright/test';
import { UIHelpers } from './ui_helpers';
import { logger } from '../utils/logger';
import { configReader } from '../utils/configReader';
import fs from 'fs';
import path from 'path';

/**
 * Base Helper class that provides common helper methods
 * Equivalent to the RAFT_UI_TDD/SupportLibraries/base_helper.py
 */
export class BaseHelper extends UIHelpers {
  /**
   * Initialize the BaseHelper class
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    super(page);
  }
  
  /**
   * Load properties file
   * @param filePath - Properties file path (default: config/config.json)
   * @returns Config object
   */
  loadPropertiesFile(filePath?: string): any {
    try {
      const configPath = filePath || path.join(process.cwd(), 'config', 'config.json');
      logger.debug(`Loading properties file: ${configPath}`);
      
      if (!fs.existsSync(configPath)) {
        logger.error(`Properties file not found: ${configPath}`);
        return null;
      }
      
      const configData = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configData);
      
      logger.debug('Properties file loaded successfully');
      return config;
    } catch (error) {
      logger.error(`Error loading properties file: ${error}`);
      return null;
    }
  }
  
  /**
   * Get base URL
   * @returns Base URL
   */
  getBaseUrl(): string {
    return configReader.getValue<string>('baseUrl', 'https://opensource-demo.orangehrmlive.com/');
  }
  
  /**
   * Get credentials
   * @param type - Credential type ('validUser' or 'invalidUser')
   * @returns Credentials object
   */
  getCredentials(type: string = 'validUser'): { username: string, password: string } {
    return configReader.getValue<{ username: string, password: string }>(`credentials.${type}`);
  }
  
  /**
   * Generate random string
   * @param length - String length
   * @returns Random string
   */
  generateRandomString(length: number = 10): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  }
  
  /**
   * Create directory if it doesn't exist
   * @param dirPath - Directory path
   */
  createDirectoryIfNotExists(dirPath: string): void {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        logger.debug(`Directory created: ${dirPath}`);
      }
    } catch (error) {
      logger.error(`Error creating directory: ${dirPath} - ${error}`);
    }
  }
  
  /**
   * Wait for page to load
   * @param timeout - Timeout in milliseconds
   */
  async waitForPageLoad(timeout?: number): Promise<void> {
    const timeoutValue = timeout || this.defaultTimeout;
    
    try {
      logger.debug('Waiting for page to load...');
      
      // Wait for network to be idle
      await this.page.waitForLoadState('networkidle', { timeout: timeoutValue });
      
      // Wait for DOM content to be loaded
      await this.page.waitForLoadState('domcontentloaded', { timeout: timeoutValue });
      
      logger.debug('Page loaded successfully');
    } catch (error) {
      logger.error(`Error waiting for page to load: ${error}`);
      throw error;
    }
  }
  
  /**
   * Navigate to URL
   * @param url - URL to navigate to
   */
  async navigateTo(url: string): Promise<void> {
    try {
      logger.info(`Navigating to URL: ${url}`);
      await this.page.goto(url);
      await this.waitForPageLoad();
      logger.info(`Navigated to URL: ${url}`);
    } catch (error) {
      logger.error(`Error navigating to URL: ${url} - ${error}`);
      throw error;
    }
  }
  
  /**
   * Refresh page
   */
  async refreshPage(): Promise<void> {
    try {
      logger.info('Refreshing page');
      await this.page.reload();
      await this.waitForPageLoad();
      logger.info('Page refreshed');
    } catch (error) {
      logger.error(`Error refreshing page: ${error}`);
      throw error;
    }
  }
  
  /**
   * Get current URL
   * @returns Current URL
   */
  async getCurrentUrl(): Promise<string> {
    try {
      const url = this.page.url();
      logger.debug(`Current URL: ${url}`);
      return url;
    } catch (error) {
      logger.error(`Error getting current URL: ${error}`);
      return '';
    }
  }
  
  /**
   * Wait for specified time
   * @param milliseconds - Time to wait in milliseconds
   */
  async wait(milliseconds: number): Promise<void> {
    try {
      logger.debug(`Waiting for ${milliseconds} milliseconds`);
      await this.page.waitForTimeout(milliseconds);
    } catch (error) {
      logger.error(`Error waiting for ${milliseconds} milliseconds: ${error}`);
    }
  }
  
  /**
   * Execute JavaScript
   * @param script - JavaScript to execute
   * @param args - Arguments to pass to script
   * @returns Result of script execution
   */
  async executeScript<T>(script: string, ...args: any[]): Promise<T> {
    try {
      logger.debug(`Executing script: ${script}`);
      return await this.page.evaluate(script, ...args);
    } catch (error) {
      logger.error(`Error executing script: ${error}`);
      throw error;
    }
  }
  
  /**
   * Check if checkbox is checked
   * @param selector - Checkbox selector
   * @param timeout - Timeout in milliseconds
   * @returns True if checkbox is checked, false otherwise
   */
  async isCheckboxChecked(selector: string, timeout?: number): Promise<boolean> {
    try {
      const element = await this.getElement(selector, timeout);
      const isChecked = await element.isChecked();
      logger.debug(`Checkbox ${selector} is ${isChecked ? 'checked' : 'unchecked'}`);
      return isChecked;
    } catch (error) {
      logger.error(`Error checking if checkbox is checked: ${error}`);
      return false;
    }
  }
  
  /**
   * Check or uncheck checkbox
   * @param selector - Checkbox selector
   * @param check - Whether to check or uncheck
   * @param timeout - Timeout in milliseconds
   */
  async setCheckbox(selector: string, check: boolean = true, timeout?: number): Promise<void> {
    try {
      const element = await this.getElement(selector, timeout);
      const isChecked = await element.isChecked();
      
      if ((check && !isChecked) || (!check && isChecked)) {
        await element.click();
        logger.debug(`Checkbox ${selector} ${check ? 'checked' : 'unchecked'}`);
      } else {
        logger.debug(`Checkbox ${selector} already ${check ? 'checked' : 'unchecked'}`);
      }
    } catch (error) {
      logger.error(`Error setting checkbox: ${error}`);
      throw error;
    }
  }
  
  /**
   * Select option by value
   * @param selector - Select element selector
   * @param value - Option value
   * @param timeout - Timeout in milliseconds
   */
  async selectOptionByValue(selector: string, value: string, timeout?: number): Promise<void> {
    try {
      const element = await this.getElement(selector, timeout);
      await element.selectOption({ value });
      logger.debug(`Selected option with value "${value}" in select ${selector}`);
    } catch (error) {
      logger.error(`Error selecting option by value: ${error}`);
      throw error;
    }
  }
  
  /**
   * Select option by text
   * @param selector - Select element selector
   * @param text - Option text
   * @param timeout - Timeout in milliseconds
   */
  async selectOptionByText(selector: string, text: string, timeout?: number): Promise<void> {
    try {
      const element = await this.getElement(selector, timeout);
      await element.selectOption({ label: text });
      logger.debug(`Selected option with text "${text}" in select ${selector}`);
    } catch (error) {
      logger.error(`Error selecting option by text: ${error}`);
      throw error;
    }
  }
  
  /**
   * Select option by index
   * @param selector - Select element selector
   * @param index - Option index
   * @param timeout - Timeout in milliseconds
   */
  async selectOptionByIndex(selector: string, index: number, timeout?: number): Promise<void> {
    try {
      const element = await this.getElement(selector, timeout);
      await element.selectOption({ index });
      logger.debug(`Selected option with index ${index} in select ${selector}`);
    } catch (error) {
      logger.error(`Error selecting option by index: ${error}`);
      throw error;
    }
  }
  
  /**
   * Upload file
   * @param selector - File input selector
   * @param filePath - Path to file
   * @param timeout - Timeout in milliseconds
   */
  async uploadFile(selector: string, filePath: string, timeout?: number): Promise<void> {
    try {
      const element = await this.getElement(selector, timeout);
      await element.setInputFiles(filePath);
      logger.debug(`Uploaded file: ${filePath} to input ${selector}`);
    } catch (error) {
      logger.error(`Error uploading file: ${error}`);
      throw error;
    }
  }
  
  /**
   * Press key
   * @param selector - Element selector
   * @param key - Key to press
   * @param timeout - Timeout in milliseconds
   */
  async pressKey(selector: string, key: string, timeout?: number): Promise<void> {
    try {
      const element = await this.getElement(selector, timeout);
      await element.press(key);
      logger.debug(`Pressed key ${key} on element ${selector}`);
    } catch (error) {
      logger.error(`Error pressing key: ${error}`);
      throw error;
    }
  }
}