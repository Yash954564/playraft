import { Before, After, BeforeAll, AfterAll, setDefaultTimeout, Status } from '@cucumber/cucumber';
import { chromium, firefox, webkit, Browser, BrowserContext, Page } from '@playwright/test';
import { configReader } from '../utils/configReader';
import { logger } from '../utils/logger';
import { allureReporter } from '../utils/allureReporter';
import { jiraService, JiraPriority } from '../integrations/jira/jira-service';
import { slackService } from '../integrations/slack/slack-service';
import { s3Service } from '../integrations/aws/s3-service';
import * as fs from 'fs';
import * as path from 'path';

// Set default timeout for steps
const stepTimeout = configReader.getValue<number>('bdd.timeout', 60000);
setDefaultTimeout(stepTimeout);

// Global variables
let browser: Browser;
let context: BrowserContext;
let page: Page;

// Test run statistics
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let skippedTests = 0;
const startTime = Date.now();

// Environment information
const environment = process.env.TEST_ENV || configReader.getValue<string>('environment', 'dev');

/**
 * Before all tests
 */
BeforeAll(async () => {
  // Create screenshot and video directories if they don't exist
  const screenshotsDir = path.resolve('./screenshots');
  const videosDir = path.resolve('./videos');
  const logsDir = path.resolve('./logs');
  
  for (const dir of [screenshotsDir, videosDir, logsDir]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  // Get browser configuration
  const browserName = configReader.getValue<string>('browser.name', 'chromium');
  const headless = configReader.getValue<boolean>('browser.headless', true);
  const slowMo = configReader.getValue<number>('browser.slowMo', 0);
  
  logger.info(`Starting ${browserName} browser in ${headless ? 'headless' : 'headed'} mode`);
  
  try {
    // Launch browser
    switch (browserName.toLowerCase()) {
      case 'firefox':
        browser = await firefox.launch({ headless, slowMo });
        break;
      case 'webkit':
        browser = await webkit.launch({ headless, slowMo });
        break;
      case 'chromium':
      default:
        browser = await chromium.launch({ headless, slowMo });
        break;
    }
    
    logger.info('Browser launched successfully');
  } catch (error) {
    logger.error(`Failed to launch browser: ${error}`);
    throw error;
  }
});

/**
 * Before each scenario
 */
Before(async function({ pickle }) {
  // Increment total tests counter
  totalTests++;
  
  const scenarioName = pickle.name;
  const scenarioTags = pickle.tags.map(tag => tag.name);
  
  logger.info(`Starting scenario: ${scenarioName}`);
  logger.info(`Tags: ${scenarioTags.join(', ')}`);
  
  try {
    // Create new browser context
    const contextOptions: any = {
      viewport: configReader.getValue<{ width: number; height: number }>('browser.viewport', { width: 1920, height: 1080 }),
      ignoreHTTPSErrors: configReader.getValue<boolean>('browser.ignoreHTTPSErrors', true),
      acceptDownloads: configReader.getValue<boolean>('browser.acceptDownloads', true)
    };
    
    // Add recording if enabled
    if (configReader.getValue<boolean>('browser.recordVideo.enabled', false)) {
      const videoDir = configReader.getValue<string>('browser.recordVideo.dir', './videos');
      const videoSize = configReader.getValue<{ width: number; height: number }>('browser.recordVideo.size', { width: 1280, height: 720 });
      
      contextOptions.recordVideo = {
        dir: videoDir,
        size: videoSize
      };
    }
    
    context = await browser.newContext(contextOptions);
    
    // Start tracing if enabled
    if (configReader.getValue<boolean>('browser.trace.enabled', false)) {
      await context.tracing.start({
        screenshots: configReader.getValue<boolean>('browser.trace.screenshots', true),
        snapshots: configReader.getValue<boolean>('browser.trace.snapshots', true)
      });
    }
    
    // Create new page
    page = await context.newPage();
    
    // Set timeout for navigation
    page.setDefaultTimeout(configReader.getValue<number>('browser.timeout', 30000));
    
    // Store page in world object for step definitions
    this.page = page;
    
    // Start Allure test case
    allureReporter.startTestCase(scenarioName);
    
    // Add feature tag to Allure if present
    const featureTag = scenarioTags.find(tag => tag.startsWith('@feature:'));
    if (featureTag) {
      allureReporter.feature(featureTag.replace('@feature:', ''));
    }
    
    // Add severity tag to Allure if present
    const severityTag = scenarioTags.find(tag => tag.startsWith('@severity:'));
    if (severityTag) {
      allureReporter.severity(severityTag.replace('@severity:', '') as any);
    }
    
    logger.info('Scenario setup completed');
  } catch (error) {
    logger.error(`Failed to set up scenario: ${error}`);
    throw error;
  }
});

/**
 * After each scenario
 */
After(async function({ pickle, result }) {
  const scenarioName = pickle.name;
  const status = result?.status;
  
  logger.info(`Ending scenario: ${scenarioName} with status: ${status}`);
  
  try {
    // Update test statistics
    switch (status) {
      case Status.PASSED:
        passedTests++;
        break;
      case Status.FAILED:
        failedTests++;
        break;
      case Status.SKIPPED:
      case Status.UNDEFINED:
      case Status.AMBIGUOUS:
      case Status.PENDING:
        skippedTests++;
        break;
    }
    
    // Take screenshot on failure
    if (status === Status.FAILED && page) {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const screenshotPath = path.join('./screenshots', `${scenarioName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.png`);
      
      try {
        await page.screenshot({ path: screenshotPath, fullPage: true });
        logger.info(`Screenshot captured: ${screenshotPath}`);
        
        // Add screenshot to Allure report
        const screenshot = fs.readFileSync(screenshotPath);
        allureReporter.attachment('Failure Screenshot', screenshot, 'image/png');
        
        // Upload screenshot to S3 if configured
        if (configReader.getValue<boolean>('integrations.aws.s3.uploadArtifacts', false)) {
          await s3Service.uploadTestEvidence(scenarioName, 'screenshots', screenshotPath);
        }
        
        // Create JIRA ticket if configured and test failed
        if (configReader.getValue<boolean>('integrations.jira.createTickets', false) && status === Status.FAILED) {
          const jiraProjectKey = configReader.getValue<string>('integrations.jira.projectKey', '');
          
          if (jiraProjectKey) {
            const error = result?.exception || new Error('Test failed without exception');
            
            await jiraService.createBugFromTestFailure(
              scenarioName,
              error,
              jiraProjectKey,
              JiraPriority.MAJOR,
              {
                screenshots: [screenshotPath],
                videos: [],
                logs: [logger.getLogFilePath()]
              }
            );
          }
        }
        
        // Send Slack notification if configured and test failed
        if (configReader.getValue<boolean>('integrations.slack.enabled', false)) {
          const errorMessage = result?.exception?.message || 'Test failed without exception message';
          
          await slackService.sendTestResultNotification(
            scenarioName,
            'failed',
            (result?.duration || 0) / 1000, // Convert to seconds
            errorMessage,
            [screenshotPath],
            environment
          );
        }
      } catch (screenshotError) {
        logger.error(`Failed to capture screenshot: ${screenshotError}`);
      }
    }
    
    // Stop tracing if enabled
    if (configReader.getValue<boolean>('browser.trace.enabled', false) && context) {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const tracePath = path.join('./traces', `${scenarioName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.zip`);
      
      try {
        // Create traces directory if it doesn't exist
        const tracesDir = path.dirname(tracePath);
        if (!fs.existsSync(tracesDir)) {
          fs.mkdirSync(tracesDir, { recursive: true });
        }
        
        await context.tracing.stop({ path: tracePath });
        logger.info(`Trace captured: ${tracePath}`);
      } catch (traceError) {
        logger.error(`Failed to capture trace: ${traceError}`);
      }
    }
    
    // End Allure test case
    allureReporter.endTestCase(
      status === Status.PASSED ? 'passed' as any : 
      status === Status.FAILED ? 'failed' as any : 
      'skipped' as any,
      result?.exception
    );
    
    // Close page and context
    if (page) {
      await page.close();
      logger.debug('Page closed');
    }
    
    if (context) {
      await context.close();
      logger.debug('Context closed');
    }
    
    logger.info('Scenario teardown completed');
  } catch (error) {
    logger.error(`Failed to tear down scenario: ${error}`);
  }
});

/**
 * After all tests
 */
AfterAll(async () => {
  // Close browser
  if (browser) {
    await browser.close();
    logger.info('Browser closed');
  }
  
  // Calculate test run duration
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000; // Convert to seconds
  
  // Log test run summary
  logger.info('----------------------------------------');
  logger.info('Test Run Summary:');
  logger.info(`Total: ${totalTests}`);
  logger.info(`Passed: ${passedTests}`);
  logger.info(`Failed: ${failedTests}`);
  logger.info(`Skipped: ${skippedTests}`);
  logger.info(`Duration: ${duration.toFixed(2)}s`);
  logger.info('----------------------------------------');
  
  // Send Slack notification with test run summary if configured
  if (configReader.getValue<boolean>('integrations.slack.enabled', false)) {
    await slackService.sendTestRunSummaryNotification(
      {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        skipped: skippedTests,
        duration
      },
      environment
    );
  }
});