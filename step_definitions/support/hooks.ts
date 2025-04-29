/**
 * Cucumber Hooks
 * Setup and teardown for BDD tests
 */

import { BeforeAll, Before, After, AfterAll, setWorldConstructor, setDefaultTimeout, Status } from '@cucumber/cucumber';
import { chromium, firefox, webkit, Browser, BrowserContext, Page } from '@playwright/test';
import { logger } from '../../utils/logger/logger';
import { configReader } from '../../utils/config/config-reader';
import { TestContext } from './TestContext';

// Set the world constructor to our custom TestContext
setWorldConstructor(TestContext);

// Set default timeout for steps
setDefaultTimeout(60 * 1000); // 60 seconds

// Store browser, context, and page to be shared between tests
let browser: Browser;
let context: BrowserContext;
let page: Page;

/**
 * Before all tests
 */
BeforeAll(async () => {
  logger.info('Starting BDD test execution');
  
  // Read configuration
  const browserName = configReader.getEnv('BROWSER', 'chromium');
  const headless = configReader.getEnvBool('HEADLESS', true);
  const slowMo = configReader.getEnvNumber('SLOW_MO', 0);
  
  logger.info(`Launching browser: ${browserName}, headless: ${headless}, slowMo: ${slowMo}`);
  
  // Launch browser based on config
  if (browserName === 'firefox') {
    browser = await firefox.launch({ headless, slowMo });
  } else if (browserName === 'webkit') {
    browser = await webkit.launch({ headless, slowMo });
  } else {
    // Default to chromium
    browser = await chromium.launch({ headless, slowMo });
  }
});

/**
 * Before each scenario
 */
Before(async function(this: TestContext, { pickle }) {
  // Create a unique name for the scenario
  const scenarioName = pickle.name.replace(/\s+/g, '_').toLowerCase();
  logger.info(`Starting scenario: ${pickle.name}`);
  
  // Check if scenario should be skipped
  const shouldSkip = pickle.tags.some(tag => tag.name === '@skip');
  if (shouldSkip) {
    logger.info(`Skipping scenario: ${pickle.name}`);
    return 'skipped';
  }
  
  try {
    // Create a new browser context with optional device emulation
    const deviceName = configReader.getEnv('DEVICE');
    
    if (deviceName) {
      logger.info(`Emulating device: ${deviceName}`);
      // For actual implementation, import devices from playwright
      // const device = devices[deviceName];
      // context = await browser.newContext({ ...device });
      context = await browser.newContext();
    } else {
      context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        recordVideo: { dir: './playraft/hybdpytest/reports/videos/' }
      });
    }
    
    // Create a new page in the context
    page = await context.newPage();
    
    // Set Playwright objects in the world
    this.setPlaywright(page, context);
    
    // Clear any previous test data
    this.clearTestData();
    
    // Listen for console logs
    page.on('console', message => {
      const type = message.type();
      const text = message.text();
      
      if (type === 'error') {
        logger.error(`Browser console error: ${text}`);
      } else if (type === 'warning') {
        logger.warn(`Browser console warning: ${text}`);
      } else {
        logger.debug(`Browser console ${type}: ${text}`);
      }
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
      logger.error(`Page error: ${error.message}`);
    });
    
    // Listen for request failures
    page.on('requestfailed', request => {
      logger.warn(`Request failed: ${request.url()}`);
    });
    
    logger.info('Scenario setup completed');
  } catch (error) {
    logger.error(`Error in Before hook: ${error.message}`, { stack: error.stack });
    throw error;
  }
});

/**
 * After each scenario
 */
After(async function(this: TestContext, { pickle, result }) {
  const scenarioName = pickle.name.replace(/\s+/g, '_').toLowerCase();
  
  logger.info(`Scenario finished: ${pickle.name} with status: ${result.status}`);
  
  try {
    // Take screenshot on failure
    if (result.status === Status.FAILED) {
      logger.info('Taking screenshot for failed scenario');
      
      try {
        if (page) {
          const timestamp = new Date().toISOString().replace(/:/g, '-');
          const screenshotPath = `./playraft/hybdpytest/reports/screenshots/failure_${scenarioName}_${timestamp}.png`;
          await page.screenshot({ path: screenshotPath, fullPage: true });
          
          // Attach screenshot to report
          this.attach(screenshotPath, 'image/png');
          
          logger.info(`Failure screenshot saved to: ${screenshotPath}`);
        }
      } catch (screenshotError) {
        logger.error(`Failed to take failure screenshot: ${screenshotError.message}`);
      }
    }
    
    // Get and save page logs
    if (page) {
      // Get page logs if available
      const logs = await page.evaluate(() => {
        // This will only work if the page has logs stored in a global variable
        return (window as any).logs || [];
      }).catch(() => []);
      
      if (logs && logs.length > 0) {
        logger.debug('Page logs:', { logs });
        
        // Save logs to file
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const logPath = `./playraft/hybdpytest/reports/logs/${scenarioName}_${timestamp}.log`;
        
        // We would normally write these logs to a file
        logger.info(`Page logs would be saved to: ${logPath}`);
      }
    }
    
    // Close context for this scenario
    if (context) {
      await context.close();
    }
    
    logger.info('Scenario teardown completed');
  } catch (error) {
    logger.error(`Error in After hook: ${error.message}`, { stack: error.stack });
  }
});

/**
 * After all tests
 */
AfterAll(async () => {
  logger.info('Finishing BDD test execution');
  
  try {
    // Close browser if it exists
    if (browser) {
      await browser.close();
    }
    
    logger.info('Browser closed, test execution completed');
  } catch (error) {
    logger.error(`Error in AfterAll hook: ${error.message}`, { stack: error.stack });
  }
});