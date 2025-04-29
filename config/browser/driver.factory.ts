import { Browser, BrowserContext, BrowserType, chromium, firefox, webkit, LaunchOptions, devices, Page } from '@playwright/test';
import { logger } from '../logger';
import { configReader } from '../utils/config.reader';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Browser type options
 */
export type BrowserTypeOption = 'chromium' | 'firefox' | 'webkit';

/**
 * Device preset options 
 */
export type DevicePreset = 
  | 'Desktop Chrome'
  | 'Desktop Firefox'
  | 'Desktop Safari'
  | 'Desktop Edge'
  | 'iPhone 13'
  | 'iPhone 12'
  | 'iPhone 11'
  | 'iPad Pro 11'
  | 'Pixel 5'
  | 'Samsung Galaxy S22'
  | 'Galaxy Tab S4'
  | 'custom';

/**
 * Browser launch options with additional fields
 */
export interface EnhancedLaunchOptions extends LaunchOptions {
  headless?: boolean;
  slowMo?: number;
  devtools?: boolean;
  channel?: 'chrome' | 'msedge' | 'chrome-beta' | 'msedge-beta' | 'chrome-dev' | 'msedge-dev';
  downloadsPath?: string;
  proxy?: {
    server: string;
    bypass?: string;
    username?: string;
    password?: string;
  };
  tracesDir?: string;
  recordHar?: {
    path: string;
    content?: 'omit' | 'embed';
    mode?: 'minimal' | 'full';
  };
}

/**
 * Browser context options with additional fields
 */
export interface EnhancedContextOptions {
  viewport?: { width: number; height: number } | null;
  ignoreHTTPSErrors?: boolean;
  javaScriptEnabled?: boolean;
  userAgent?: string;
  locale?: string;
  timezoneId?: string;
  geolocation?: { longitude: number; latitude: number; accuracy?: number };
  permissions?: string[];
  extraHTTPHeaders?: { [key: string]: string };
  offline?: boolean;
  httpCredentials?: { username: string; password: string };
  deviceScaleFactor?: number;
  isMobile?: boolean;
  hasTouch?: boolean;
  acceptDownloads?: boolean;
  defaultTimeout?: number;
  bypassCSP?: boolean;
  colorScheme?: 'light' | 'dark' | 'no-preference';
  reducedMotion?: 'reduce' | 'no-preference';
  forcedColors?: 'active' | 'none';
  recordVideo?: {
    dir: string;
    size?: { width: number; height: number };
  };
  storageState?: string | {
    cookies: Array<{
      name: string;
      value: string;
      domain: string;
      path: string;
      expires: number;
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: 'Strict' | 'Lax' | 'None';
    }>;
    origins: Array<{
      origin: string;
      localStorage: Array<{
        name: string;
        value: string;
      }>;
    }>;
  };
}

/**
 * Browser configuration options
 */
export interface BrowserConfig {
  browserType: BrowserTypeOption;
  launchOptions?: EnhancedLaunchOptions;
  contextOptions?: EnhancedContextOptions;
  devicePreset?: DevicePreset;
  customDevice?: {
    name: string;
    userAgent: string;
    viewport: { width: number; height: number };
    deviceScaleFactor: number;
    isMobile: boolean;
    hasTouch: boolean;
  };
}

/**
 * Driver Factory class for creating and managing browser instances
 */
export class DriverFactory {
  private static instance: DriverFactory;
  private browsers: Map<string, Browser> = new Map();
  private contexts: Map<string, BrowserContext> = new Map();
  private pages: Map<string, Page> = new Map();
  
  /**
   * Get singleton instance
   * @returns DriverFactory instance
   */
  public static getInstance(): DriverFactory {
    if (!DriverFactory.instance) {
      DriverFactory.instance = new DriverFactory();
    }
    return DriverFactory.instance;
  }
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Initialize factory
    logger.info('DriverFactory initialized');
    
    // Create required directories
    this.createRequiredDirectories();
  }
  
  /**
   * Create required directories for browser artifacts
   */
  private createRequiredDirectories(): void {
    const dirs = [
      'reports/screenshots',
      'reports/videos',
      'reports/traces',
      'reports/downloads',
      'reports/har',
      'reports/logs'
    ];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.debug(`Created directory: ${dir}`);
      }
    }
  }
  
  /**
   * Get browser type instance based on configuration
   * @param browserType - Type of browser to launch
   * @returns BrowserType instance
   */
  private getBrowserType(browserType: BrowserTypeOption): BrowserType {
    switch (browserType.toLowerCase() as BrowserTypeOption) {
      case 'firefox':
        return firefox;
      case 'webkit':
        return webkit;
      case 'chromium':
      default:
        return chromium;
    }
  }
  
  /**
   * Launch browser based on configuration
   * @param config - Browser configuration
   * @param sessionId - Session ID for tracking (optional)
   * @returns Browser instance
   */
  public async launchBrowser(config: BrowserConfig, sessionId: string = 'default'): Promise<Browser> {
    logger.info(`Launching browser (${config.browserType}) with session ID: ${sessionId}`);
    
    try {
      const browserType = this.getBrowserType(config.browserType);
      
      // Default options
      const defaultOptions: EnhancedLaunchOptions = {
        headless: configReader.getValue<boolean>('browser.headless', true),
        slowMo: configReader.getValue<number>('browser.slowMo', 0),
        timeout: configReader.getValue<number>('browser.timeout', 30000),
        args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
      };
      
      // Merge with custom options
      const launchOptions: EnhancedLaunchOptions = {
        ...defaultOptions,
        ...config.launchOptions
      };
      
      // If traces enabled, add traces directory
      if (configReader.getValue<boolean>('browser.trace.enabled', false)) {
        launchOptions.tracesDir = config.launchOptions?.tracesDir || 'reports/traces';
      }
      
      logger.debug(`Browser launch options: ${JSON.stringify(launchOptions)}`);
      
      // Launch browser
      const browser = await browserType.launch(launchOptions);
      
      // Store browser instance
      this.browsers.set(sessionId, browser);
      
      logger.info(`Browser launched successfully`);
      
      return browser;
    } catch (error) {
      logger.error(`Failed to launch browser: ${error}`);
      throw error;
    }
  }
  
  /**
   * Create browser context based on configuration
   * @param browser - Browser instance
   * @param config - Browser configuration
   * @param sessionId - Session ID for tracking (optional)
   * @returns BrowserContext instance
   */
  public async createContext(browser: Browser, config: BrowserConfig, sessionId: string = 'default'): Promise<BrowserContext> {
    logger.info(`Creating browser context with session ID: ${sessionId}`);
    
    try {
      // Default context options
      const defaultContextOptions: EnhancedContextOptions = {
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
        acceptDownloads: true
      };
      
      // Device preset options
      let devicePresetOptions = {};
      
      if (config.devicePreset && config.devicePreset !== 'custom') {
        devicePresetOptions = devices[config.devicePreset];
        logger.debug(`Using device preset: ${config.devicePreset}`);
      } else if (config.customDevice) {
        devicePresetOptions = config.customDevice;
        logger.debug(`Using custom device: ${config.customDevice.name}`);
      }
      
      // Merge with custom options
      const contextOptions: EnhancedContextOptions = {
        ...defaultContextOptions,
        ...devicePresetOptions,
        ...config.contextOptions
      };
      
      // Add video recording if enabled
      if (configReader.getValue<boolean>('browser.recordVideo.enabled', false)) {
        contextOptions.recordVideo = {
          dir: 'reports/videos',
          size: {
            width: configReader.getValue<number>('browser.recordVideo.width', 1280),
            height: configReader.getValue<number>('browser.recordVideo.height', 720)
          }
        };
      }
      
      logger.debug(`Context options: ${JSON.stringify(contextOptions)}`);
      
      // Create context
      const context = await browser.newContext(contextOptions);
      
      // Store context instance
      this.contexts.set(sessionId, context);
      
      logger.info(`Browser context created successfully`);
      
      return context;
    } catch (error) {
      logger.error(`Failed to create browser context: ${error}`);
      throw error;
    }
  }
  
  /**
   * Create page in browser context
   * @param context - Browser context
   * @param sessionId - Session ID for tracking (optional)
   * @returns Page instance
   */
  public async createPage(context: BrowserContext, sessionId: string = 'default'): Promise<Page> {
    logger.info(`Creating page with session ID: ${sessionId}`);
    
    try {
      // Create page
      const page = await context.newPage();
      
      // Set default timeout
      const timeout = configReader.getValue<number>('browser.defaultTimeout', 30000);
      page.setDefaultTimeout(timeout);
      page.setDefaultNavigationTimeout(timeout);
      
      // Store page instance
      this.pages.set(sessionId, page);
      
      logger.info(`Page created successfully`);
      
      return page;
    } catch (error) {
      logger.error(`Failed to create page: ${error}`);
      throw error;
    }
  }
  
  /**
   * Setup complete browser session (browser, context, page)
   * @param config - Browser configuration
   * @param sessionId - Session ID for tracking (optional)
   * @returns Page instance
   */
  public async setupBrowser(config: BrowserConfig, sessionId: string = 'default'): Promise<Page> {
    logger.info(`Setting up browser session: ${sessionId}`);
    
    let browser: Browser | undefined;
    let context: BrowserContext | undefined;
    let page: Page | undefined;
    
    try {
      // Launch browser
      browser = await this.launchBrowser(config, sessionId);
      
      // Create context
      context = await this.createContext(browser, config, sessionId);
      
      // Create page
      page = await this.createPage(context, sessionId);
      
      logger.info(`Browser session setup complete: ${sessionId}`);
      
      return page;
    } catch (error) {
      // Clean up if an error occurs
      if (page) {
        await page.close().catch(() => {});
      }
      
      if (context) {
        await context.close().catch(() => {});
      }
      
      if (browser) {
        await browser.close().catch(() => {});
      }
      
      // Remove from maps
      this.pages.delete(sessionId);
      this.contexts.delete(sessionId);
      this.browsers.delete(sessionId);
      
      logger.error(`Failed to setup browser session: ${error}`);
      throw error;
    }
  }
  
  /**
   * Get existing page by session ID
   * @param sessionId - Session ID
   * @returns Page instance or undefined if not found
   */
  public getPage(sessionId: string = 'default'): Page | undefined {
    return this.pages.get(sessionId);
  }
  
  /**
   * Get existing context by session ID
   * @param sessionId - Session ID
   * @returns BrowserContext instance or undefined if not found
   */
  public getContext(sessionId: string = 'default'): BrowserContext | undefined {
    return this.contexts.get(sessionId);
  }
  
  /**
   * Get existing browser by session ID
   * @param sessionId - Session ID
   * @returns Browser instance or undefined if not found
   */
  public getBrowser(sessionId: string = 'default'): Browser | undefined {
    return this.browsers.get(sessionId);
  }
  
  /**
   * Close page by session ID
   * @param sessionId - Session ID
   */
  public async closePage(sessionId: string = 'default'): Promise<void> {
    const page = this.pages.get(sessionId);
    
    if (page) {
      logger.info(`Closing page: ${sessionId}`);
      await page.close().catch((error) => logger.error(`Error closing page: ${error}`));
      this.pages.delete(sessionId);
    }
  }
  
  /**
   * Close context by session ID
   * @param sessionId - Session ID
   */
  public async closeContext(sessionId: string = 'default'): Promise<void> {
    const context = this.contexts.get(sessionId);
    
    if (context) {
      logger.info(`Closing context: ${sessionId}`);
      await context.close().catch((error) => logger.error(`Error closing context: ${error}`));
      this.contexts.delete(sessionId);
    }
  }
  
  /**
   * Close browser by session ID
   * @param sessionId - Session ID
   */
  public async closeBrowser(sessionId: string = 'default'): Promise<void> {
    const browser = this.browsers.get(sessionId);
    
    if (browser) {
      logger.info(`Closing browser: ${sessionId}`);
      await browser.close().catch((error) => logger.error(`Error closing browser: ${error}`));
      this.browsers.delete(sessionId);
    }
  }
  
  /**
   * Close all browser sessions
   */
  public async closeAll(): Promise<void> {
    logger.info('Closing all browser sessions');
    
    // Close all pages
    for (const [sessionId, page] of this.pages.entries()) {
      try {
        await page.close();
        logger.debug(`Closed page: ${sessionId}`);
      } catch (error) {
        logger.error(`Error closing page ${sessionId}: ${error}`);
      }
    }
    this.pages.clear();
    
    // Close all contexts
    for (const [sessionId, context] of this.contexts.entries()) {
      try {
        await context.close();
        logger.debug(`Closed context: ${sessionId}`);
      } catch (error) {
        logger.error(`Error closing context ${sessionId}: ${error}`);
      }
    }
    this.contexts.clear();
    
    // Close all browsers
    for (const [sessionId, browser] of this.browsers.entries()) {
      try {
        await browser.close();
        logger.debug(`Closed browser: ${sessionId}`);
      } catch (error) {
        logger.error(`Error closing browser ${sessionId}: ${error}`);
      }
    }
    this.browsers.clear();
    
    logger.info('All browser sessions closed');
  }
  
  /**
   * Take screenshot of current page
   * @param page - Page instance
   * @param name - Screenshot name
   * @returns Path to screenshot
   */
  public async takeScreenshot(page: Page, name: string): Promise<string> {
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
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      
      logger.info(`Screenshot saved: ${screenshotPath}`);
      
      return screenshotPath;
    } catch (error) {
      logger.error(`Failed to take screenshot: ${error}`);
      throw error;
    }
  }
  
  /**
   * Start tracing for a context
   * @param context - Browser context
   * @param options - Trace options
   */
  public async startTracing(context: BrowserContext, options?: { screenshots?: boolean; snapshots?: boolean }): Promise<void> {
    logger.info('Starting tracing');
    
    try {
      await context.tracing.start({
        screenshots: options?.screenshots ?? true,
        snapshots: options?.snapshots ?? true
      });
    } catch (error) {
      logger.error(`Failed to start tracing: ${error}`);
      throw error;
    }
  }
  
  /**
   * Stop tracing and save trace
   * @param context - Browser context
   * @param name - Trace name
   * @returns Path to trace
   */
  public async stopTracing(context: BrowserContext, name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const traceName = `${name}_${timestamp}.zip`;
    const tracePath = path.join('reports/traces', traceName);
    
    logger.info(`Stopping tracing: ${traceName}`);
    
    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(tracePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Stop tracing
      await context.tracing.stop({ path: tracePath });
      
      logger.info(`Trace saved: ${tracePath}`);
      
      return tracePath;
    } catch (error) {
      logger.error(`Failed to stop tracing: ${error}`);
      throw error;
    }
  }
}

// Export singleton instance
export const driverFactory = DriverFactory.getInstance();