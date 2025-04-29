/**
 * Test Context
 * Provides a way to share data between steps in Cucumber scenarios
 */

import { BrowserContext, Page } from '@playwright/test';
import { logger } from '../../utils/logger/logger';

/**
 * Test Context class
 * Facilitates sharing state between step definitions
 */
export class TestContext {
  // Storage for variables
  private worldParameters: Record<string, any> = {};
  private scenarioContext: Map<string, any> = new Map();
  
  // Playwright specific
  private browser: BrowserContext | null = null;
  private currentPage: Page | null = null;
  
  // Scenario information
  private scenarioName: string = '';
  private scenarioTags: string[] = [];
  private featureName: string = '';
  
  // API testing specific
  private apiResponses: Map<string, any> = new Map();
  private apiRequests: Map<string, any> = new Map();
  private apiHeaders: Map<string, Record<string, string>> = new Map();
  
  // Test data
  private testData: Map<string, any> = new Map();

  /**
   * Constructor
   * @param parameters World parameters
   */
  constructor(parameters: Record<string, any> = {}) {
    this.worldParameters = parameters;
    logger.debug('TestContext initialized', { parameters });
  }

  /**
   * Get world parameter
   * @param key Parameter key
   * @returns Parameter value
   */
  public getParameter(key: string): any {
    return this.worldParameters[key];
  }

  /**
   * Set context value
   * @param key Context key
   * @param value Value to store
   */
  public set(key: string, value: any): void {
    logger.debug(`Setting context value: ${key}`, { value });
    this.scenarioContext.set(key, value);
  }

  /**
   * Get context value
   * @param key Context key
   * @returns Stored value or undefined
   */
  public get<T>(key: string): T | undefined {
    return this.scenarioContext.get(key) as T | undefined;
  }

  /**
   * Check if context has a key
   * @param key Context key
   * @returns True if key exists
   */
  public has(key: string): boolean {
    return this.scenarioContext.has(key);
  }

  /**
   * Delete context value
   * @param key Context key
   * @returns True if deleted
   */
  public delete(key: string): boolean {
    logger.debug(`Deleting context value: ${key}`);
    return this.scenarioContext.delete(key);
  }

  /**
   * Clear all context values
   */
  public clear(): void {
    logger.debug('Clearing all context values');
    this.scenarioContext.clear();
  }

  /**
   * Set browser context
   * @param browserContext Playwright browser context
   */
  public setBrowser(browserContext: BrowserContext): void {
    logger.debug('Setting browser context');
    this.browser = browserContext;
  }

  /**
   * Get browser context
   * @returns Browser context
   */
  public getBrowser(): BrowserContext | null {
    return this.browser;
  }

  /**
   * Set current page
   * @param page Playwright page
   */
  public setCurrentPage(page: Page): void {
    logger.debug('Setting current page');
    this.currentPage = page;
  }

  /**
   * Get current page
   * @returns Current page
   */
  public getCurrentPage(): Page | null {
    return this.currentPage;
  }

  /**
   * Set scenario info
   * @param name Scenario name
   * @param tags Scenario tags
   * @param feature Feature name
   */
  public setScenarioInfo(name: string, tags: string[] = [], feature: string = ''): void {
    logger.debug(`Setting scenario info: ${name}`, { tags, feature });
    this.scenarioName = name;
    this.scenarioTags = tags;
    this.featureName = feature;
  }

  /**
   * Get scenario name
   * @returns Scenario name
   */
  public getScenarioName(): string {
    return this.scenarioName;
  }

  /**
   * Get scenario tags
   * @returns Array of tags
   */
  public getScenarioTags(): string[] {
    return this.scenarioTags;
  }

  /**
   * Get feature name
   * @returns Feature name
   */
  public getFeatureName(): string {
    return this.featureName;
  }

  /**
   * Store API response
   * @param endpoint API endpoint
   * @param response API response
   */
  public storeApiResponse(endpoint: string, response: any): void {
    logger.debug(`Storing API response for endpoint: ${endpoint}`);
    this.apiResponses.set(endpoint, response);
  }

  /**
   * Get API response
   * @param endpoint API endpoint
   * @returns API response
   */
  public getApiResponse(endpoint: string): any {
    return this.apiResponses.get(endpoint);
  }

  /**
   * Store API request
   * @param endpoint API endpoint
   * @param request API request
   */
  public storeApiRequest(endpoint: string, request: any): void {
    logger.debug(`Storing API request for endpoint: ${endpoint}`);
    this.apiRequests.set(endpoint, request);
  }

  /**
   * Get API request
   * @param endpoint API endpoint
   * @returns API request
   */
  public getApiRequest(endpoint: string): any {
    return this.apiRequests.get(endpoint);
  }

  /**
   * Store API headers
   * @param endpoint API endpoint
   * @param headers API headers
   */
  public storeApiHeaders(endpoint: string, headers: Record<string, string>): void {
    logger.debug(`Storing API headers for endpoint: ${endpoint}`);
    this.apiHeaders.set(endpoint, headers);
  }

  /**
   * Get API headers
   * @param endpoint API endpoint
   * @returns API headers
   */
  public getApiHeaders(endpoint: string): Record<string, string> | undefined {
    return this.apiHeaders.get(endpoint);
  }

  /**
   * Store test data
   * @param key Data key
   * @param data Test data
   */
  public storeTestData(key: string, data: any): void {
    logger.debug(`Storing test data: ${key}`);
    this.testData.set(key, data);
  }

  /**
   * Get test data
   * @param key Data key
   * @returns Test data
   */
  public getTestData<T>(key: string): T | undefined {
    return this.testData.get(key) as T | undefined;
  }

  /**
   * Reset context for new scenario
   */
  public reset(): void {
    logger.debug('Resetting test context');
    this.scenarioContext.clear();
    this.apiResponses.clear();
    this.apiRequests.clear();
    this.apiHeaders.clear();
    this.testData.clear();
    this.scenarioName = '';
    this.scenarioTags = [];
    this.featureName = '';
    // Note: We don't clear the browser or page as they might be reused
  }
}

// Create a singleton instance
export const testContext = new TestContext();

// Export default instance
export default testContext;