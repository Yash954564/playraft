import { logger } from './logger';
import { jiraService, JiraPriority, JiraIssueType } from '../integrations/jira/jira-service';
import { s3Service } from '../integrations/aws/s3-service';
import { configReader } from './configReader';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Allure severity level
 */
export enum AllureSeverity {
  BLOCKER = 'blocker',
  CRITICAL = 'critical',
  NORMAL = 'normal',
  MINOR = 'minor',
  TRIVIAL = 'trivial'
}

/**
 * Test status
 */
export enum TestStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  BROKEN = 'broken',
  SKIPPED = 'skipped',
  UNKNOWN = 'unknown'
}

/**
 * Screenshot highlight options
 */
export interface ScreenshotHighlight {
  element: string; // Selector
  borderColor?: string;
  borderWidth?: number;
  fillColor?: string;
  opacity?: number;
}

/**
 * Enhanced Allure Reporter class
 */
class AllureReporter {
  private isInitialized: boolean = false;
  private allure: any;
  private currentTest: string | null = null;
  private screenshotsDir: string;
  private videosDir: string;
  private logsDir: string;
  private reportDir: string;
  private createJiraTickets: boolean;
  private uploadArtifactsToS3: boolean;

  /**
   * Constructor
   */
  constructor() {
    try {
      // Try to import allure-js-commons
      this.allure = require('allure-js-commons');
      this.isInitialized = true;
      
      // Create directories
      this.screenshotsDir = path.resolve('./screenshots');
      this.videosDir = path.resolve('./videos');
      this.logsDir = path.resolve('./logs');
      this.reportDir = path.resolve('./allure-results');
      
      this.createDirectories();
      
      // Get config options
      this.createJiraTickets = process.env.CREATE_JIRA_TICKETS === 'true' 
        || configReader.getValue<boolean>('integrations.jira.createTickets', false);
      this.uploadArtifactsToS3 = process.env.UPLOAD_ARTIFACTS_TO_S3 === 'true'
        || configReader.getValue<boolean>('integrations.aws.s3.uploadArtifacts', false);
      
      logger.info('Allure reporter initialized');
    } catch (error) {
      logger.error(`Failed to initialize Allure reporter: ${error}`);
      this.isInitialized = false;
    }
  }

  /**
   * Create necessary directories
   */
  private createDirectories(): void {
    // Create screenshots directory if it doesn't exist
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
    
    // Create videos directory if it doesn't exist
    if (!fs.existsSync(this.videosDir)) {
      fs.mkdirSync(this.videosDir, { recursive: true });
    }
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
    
    // Create allure results directory if it doesn't exist
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  /**
   * Start test case
   * @param name Test name
   * @param params Test parameters
   */
  startTestCase(name: string, params?: Record<string, any>): void {
    if (!this.isInitialized) {
      logger.warn('Allure reporter not initialized. Cannot start test case.');
      return;
    }
    
    try {
      this.currentTest = name;
      this.allure.startTest(name, params);
      logger.info(`Started test case: ${name}`);
    } catch (error) {
      logger.error(`Failed to start test case ${name}: ${error}`);
    }
  }

  /**
   * End test case
   * @param status Test status
   * @param error Error if test failed
   */
  endTestCase(status: TestStatus, error?: Error): void {
    if (!this.isInitialized || !this.currentTest) {
      logger.warn('Allure reporter not initialized or no current test. Cannot end test case.');
      return;
    }
    
    try {
      this.allure.endTest(status, error);
      
      // Handle failed tests
      if ((status === TestStatus.FAILED || status === TestStatus.BROKEN) && error) {
        this.handleTestFailure(this.currentTest, error);
      }
      
      logger.info(`Ended test case: ${this.currentTest} with status ${status}`);
      this.currentTest = null;
    } catch (error) {
      logger.error(`Failed to end test case: ${error}`);
    }
  }

  /**
   * Add description to test case
   * @param description Test description
   * @param type Description type (text or html)
   */
  description(description: string, type: 'text' | 'html' = 'text'): void {
    if (!this.isInitialized) {
      logger.warn('Allure reporter not initialized. Cannot add description.');
      return;
    }
    
    try {
      this.allure.description(description, type);
      logger.debug(`Added description to test case`);
    } catch (error) {
      logger.error(`Failed to add description to test case: ${error}`);
    }
  }

  /**
   * Add epic label to test case
   * @param epic Epic name
   */
  epic(epic: string): void {
    if (!this.isInitialized) {
      logger.warn('Allure reporter not initialized. Cannot add epic.');
      return;
    }
    
    try {
      this.allure.epic(epic);
      logger.debug(`Added epic to test case: ${epic}`);
    } catch (error) {
      logger.error(`Failed to add epic to test case: ${error}`);
    }
  }

  /**
   * Add feature label to test case
   * @param feature Feature name
   */
  feature(feature: string): void {
    if (!this.isInitialized) {
      logger.warn('Allure reporter not initialized. Cannot add feature.');
      return;
    }
    
    try {
      this.allure.feature(feature);
      logger.debug(`Added feature to test case: ${feature}`);
    } catch (error) {
      logger.error(`Failed to add feature to test case: ${error}`);
    }
  }

  /**
   * Add story label to test case
   * @param story Story name
   */
  story(story: string): void {
    if (!this.isInitialized) {
      logger.warn('Allure reporter not initialized. Cannot add story.');
      return;
    }
    
    try {
      this.allure.story(story);
      logger.debug(`Added story to test case: ${story}`);
    } catch (error) {
      logger.error(`Failed to add story to test case: ${error}`);
    }
  }

  /**
   * Add severity label to test case
   * @param severity Severity level
   */
  severity(severity: AllureSeverity): void {
    if (!this.isInitialized) {
      logger.warn('Allure reporter not initialized. Cannot add severity.');
      return;
    }
    
    try {
      this.allure.severity(severity);
      logger.debug(`Added severity to test case: ${severity}`);
    } catch (error) {
      logger.error(`Failed to add severity to test case: ${error}`);
    }
  }

  /**
   * Add issue link to test case
   * @param issueId Issue ID
   */
  issue(issueId: string): void {
    if (!this.isInitialized) {
      logger.warn('Allure reporter not initialized. Cannot add issue.');
      return;
    }
    
    try {
      this.allure.issue(issueId);
      logger.debug(`Added issue to test case: ${issueId}`);
    } catch (error) {
      logger.error(`Failed to add issue to test case: ${error}`);
    }
  }

  /**
   * Add test case ID link to test case
   * @param testCaseId Test case ID
   */
  testCaseId(testCaseId: string): void {
    if (!this.isInitialized) {
      logger.warn('Allure reporter not initialized. Cannot add test case ID.');
      return;
    }
    
    try {
      this.allure.testCaseId(testCaseId);
      logger.debug(`Added test case ID to test case: ${testCaseId}`);
    } catch (error) {
      logger.error(`Failed to add test case ID to test case: ${error}`);
    }
  }

  /**
   * Add tag to test case
   * @param tag Tag name
   */
  tag(tag: string): void {
    if (!this.isInitialized) {
      logger.warn('Allure reporter not initialized. Cannot add tag.');
      return;
    }
    
    try {
      this.allure.tag(tag);
      logger.debug(`Added tag to test case: ${tag}`);
    } catch (error) {
      logger.error(`Failed to add tag to test case: ${error}`);
    }
  }

  /**
   * Add parameter to test case
   * @param name Parameter name
   * @param value Parameter value
   */
  parameter(name: string, value: any): void {
    if (!this.isInitialized) {
      logger.warn('Allure reporter not initialized. Cannot add parameter.');
      return;
    }
    
    try {
      this.allure.parameter(name, value);
      logger.debug(`Added parameter to test case: ${name}=${value}`);
    } catch (error) {
      logger.error(`Failed to add parameter to test case: ${error}`);
    }
  }

  /**
   * Add attachment to test case
   * @param name Attachment name
   * @param content Attachment content
   * @param type Attachment type
   */
  attachment(name: string, content: Buffer | string, type: string): void {
    if (!this.isInitialized) {
      logger.warn('Allure reporter not initialized. Cannot add attachment.');
      return;
    }
    
    try {
      this.allure.attachment(name, content, type);
      logger.debug(`Added attachment to test case: ${name}`);
    } catch (error) {
      logger.error(`Failed to add attachment to test case: ${error}`);
    }
  }

  /**
   * Execute a test step and report it
   * @param name Step name
   * @param fn Step function
   * @returns Step result
   */
  async step<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.isInitialized) {
      logger.warn('Allure reporter not initialized. Cannot report step.');
      return await fn();
    }
    
    try {
      logger.info(`Step: ${name}`);
      
      // Start step
      this.allure.startStep(name);
      
      try {
        // Execute step function
        const result = await fn();
        
        // End step with passed status
        this.allure.endStep('passed');
        
        return result;
      } catch (error) {
        // End step with failed status
        this.allure.endStep('failed');
        
        // Re-throw error
        throw error;
      }
    } catch (error) {
      logger.error(`Step failed: ${name}`, error);
      throw error;
    }
  }

  /**
   * Add screenshot to test case
   * @param name Screenshot name
   * @param screenshot Screenshot buffer or path
   * @param highlight Elements to highlight in screenshot
   * @returns Screenshot path or null if failed
   */
  async addScreenshot(
    name: string,
    screenshot: Buffer | string,
    highlight?: ScreenshotHighlight | ScreenshotHighlight[]
  ): Promise<string | null> {
    if (!this.isInitialized) {
      logger.warn('Allure reporter not initialized. Cannot add screenshot.');
      return null;
    }
    
    try {
      // Generate screenshot file name
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const screenshotName = `${name}_${timestamp}.png`;
      const screenshotPath = path.join(this.screenshotsDir, screenshotName);
      
      // Save screenshot
      if (typeof screenshot === 'string') {
        // Copy file if screenshot is a path
        if (fs.existsSync(screenshot)) {
          fs.copyFileSync(screenshot, screenshotPath);
        } else {
          logger.error(`Screenshot file not found: ${screenshot}`);
          return null;
        }
      } else {
        // Write buffer to file
        fs.writeFileSync(screenshotPath, screenshot);
      }
      
      // TODO: Implement highlighting if needed
      
      // Add screenshot to Allure report
      this.attachScreenshot(name, screenshotPath);
      
      // Upload to S3 if configured
      if (this.uploadArtifactsToS3) {
        await this.uploadArtifactToS3('screenshot', screenshotPath);
      }
      
      logger.info(`Added screenshot to test case: ${name}`);
      
      return screenshotPath;
    } catch (error) {
      logger.error(`Failed to add screenshot to test case: ${error}`);
      return null;
    }
  }

  /**
   * Add video to test case
   * @param name Video name
   * @param videoPath Video path
   * @returns Video path or null if failed
   */
  async addVideo(name: string, videoPath: string): Promise<string | null> {
    if (!this.isInitialized) {
      logger.warn('Allure reporter not initialized. Cannot add video.');
      return null;
    }
    
    try {
      // Check if video file exists
      if (!fs.existsSync(videoPath)) {
        logger.error(`Video file not found: ${videoPath}`);
        return null;
      }
      
      // Generate video file name
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const videoName = `${name}_${timestamp}${path.extname(videoPath)}`;
      const newVideoPath = path.join(this.videosDir, videoName);
      
      // Copy video file
      fs.copyFileSync(videoPath, newVideoPath);
      
      // Add video to Allure report
      this.attachVideo(name, newVideoPath);
      
      // Upload to S3 if configured
      if (this.uploadArtifactsToS3) {
        await this.uploadArtifactToS3('video', newVideoPath);
      }
      
      logger.info(`Added video to test case: ${name}`);
      
      return newVideoPath;
    } catch (error) {
      logger.error(`Failed to add video to test case: ${error}`);
      return null;
    }
  }

  /**
   * Attach screenshot to Allure report
   * @param name Screenshot name
   * @param screenshotPath Screenshot path
   */
  private attachScreenshot(name: string, screenshotPath: string): void {
    try {
      // Read screenshot file
      const screenshot = fs.readFileSync(screenshotPath);
      
      // Add screenshot to Allure report
      this.attachment(name, screenshot, 'image/png');
    } catch (error) {
      logger.error(`Failed to attach screenshot to Allure report: ${error}`);
    }
  }

  /**
   * Attach video to Allure report
   * @param name Video name
   * @param videoPath Video path
   */
  private attachVideo(name: string, videoPath: string): void {
    try {
      // Read video file
      const video = fs.readFileSync(videoPath);
      
      // Determine MIME type based on file extension
      const extension = path.extname(videoPath).toLowerCase();
      let mimeType = 'video/mp4';
      
      if (extension === '.webm') {
        mimeType = 'video/webm';
      } else if (extension === '.ogg') {
        mimeType = 'video/ogg';
      }
      
      // Add video to Allure report
      this.attachment(name, video, mimeType);
    } catch (error) {
      logger.error(`Failed to attach video to Allure report: ${error}`);
    }
  }

  /**
   * Handle test failure
   * @param testName Test name
   * @param error Error
   */
  private async handleTestFailure(testName: string, error: Error): Promise<void> {
    logger.error(`Test failed: ${testName}`, error);
    
    // Create JIRA ticket if configured
    if (this.createJiraTickets) {
      try {
        // Get artifacts
        const artifacts = {
          screenshots: this.getArtifacts(this.screenshotsDir, testName),
          videos: this.getArtifacts(this.videosDir, testName),
          logs: [logger.getLogFilePath()]
        };
        
        // Create JIRA ticket
        const jiraProjectKey = process.env.JIRA_PROJECT_KEY || configReader.getValue<string>('integrations.jira.projectKey', '');
        
        if (jiraProjectKey) {
          const issueKey = await jiraService.createBugFromTestFailure(
            testName,
            error,
            jiraProjectKey,
            JiraPriority.MAJOR,
            artifacts
          );
          
          if (issueKey) {
            // Add issue link to Allure report
            this.issue(issueKey);
            
            logger.info(`Created JIRA ticket for failed test: ${issueKey}`);
          }
        } else {
          logger.error('JIRA project key not configured. Cannot create ticket.');
        }
      } catch (jiraError) {
        logger.error(`Failed to create JIRA ticket for failed test: ${jiraError}`);
      }
    }
  }

  /**
   * Get artifacts matching test name
   * @param directory Artifacts directory
   * @param testName Test name
   * @returns Array of artifact paths
   */
  private getArtifacts(directory: string, testName: string): string[] {
    try {
      // Check if directory exists
      if (!fs.existsSync(directory)) {
        return [];
      }
      
      // Get sanitized test name for matching
      const sanitizedTestName = testName.replace(/[^a-zA-Z0-9]/g, '_');
      
      // Get files in directory
      const files = fs.readdirSync(directory);
      
      // Filter files by test name
      return files
        .filter(file => file.includes(sanitizedTestName))
        .map(file => path.join(directory, file));
    } catch (error) {
      logger.error(`Failed to get artifacts: ${error}`);
      return [];
    }
  }

  /**
   * Upload artifact to S3
   * @param type Artifact type
   * @param filePath Artifact path
   * @returns S3 URL or null if upload failed
   */
  private async uploadArtifactToS3(
    type: 'screenshot' | 'video' | 'log',
    filePath: string
  ): Promise<string | null> {
    try {
      // Get test name
      const testName = this.currentTest || 'unknown';
      
      // Upload artifact to S3
      const s3Url = await s3Service.uploadTestEvidence(
        testName,
        type === 'screenshot' ? 'screenshots' : type === 'video' ? 'videos' : 'logs',
        filePath
      );
      
      if (s3Url) {
        logger.info(`Uploaded ${type} to S3: ${s3Url}`);
      }
      
      return s3Url;
    } catch (error) {
      logger.error(`Failed to upload ${type} to S3: ${error}`);
      return null;
    }
  }
}

// Export singleton instance
export const allureReporter = new AllureReporter();