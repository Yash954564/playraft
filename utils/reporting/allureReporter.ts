import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../logger/logger';

/**
 * Attachment type enum
 */
export enum AttachmentType {
  TEXT = 'text/plain',
  HTML = 'text/html',
  XML = 'application/xml',
  JSON = 'application/json',
  PNG = 'image/png',
  JPEG = 'image/jpeg',
  CSV = 'text/csv',
  TSV = 'text/tab-separated-values',
  VIDEO = 'video/mp4'
}

/**
 * Test status enum
 */
export enum TestStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  BROKEN = 'broken',
  UNKNOWN = 'unknown'
}

/**
 * Label type enum
 */
export enum LabelType {
  FEATURE = 'feature',
  STORY = 'story',
  SEVERITY = 'severity',
  TAG = 'tag',
  OWNER = 'owner',
  EPIC = 'epic',
  SUITE = 'suite',
  PARENT_SUITE = 'parentSuite',
  SUB_SUITE = 'subSuite',
  PACKAGE = 'package',
  ISSUE = 'issue',
  TEST_TYPE = 'testType',
  FRAMEWORK = 'framework',
  HOST = 'host',
  THREAD = 'thread'
}

/**
 * Severity enum
 */
export enum Severity {
  BLOCKER = 'blocker',
  CRITICAL = 'critical',
  NORMAL = 'normal',
  MINOR = 'minor',
  TRIVIAL = 'trivial'
}

/**
 * Allure Reporter class
 * This class provides Allure reporting capabilities for the framework
 */
export class AllureReporter {
  private static instance: AllureReporter;
  private readonly reportDir: string;
  private readonly screenshotsDir: string;
  private readonly videosDir: string;
  private readonly logsDir: string;
  private readonly createJiraTickets: boolean;
  private readonly uploadArtifactsToS3: boolean;
  private currentTest: string = '';
  private currentSuite: string = '';
  
  /**
   * Initialize Allure reporter
   */
  private constructor() {
    this.reportDir = path.join('reports', 'allure-results');
    this.screenshotsDir = path.join('reports', 'screenshots');
    this.videosDir = path.join('reports', 'videos');
    this.logsDir = path.join('reports', 'logs');
    this.createJiraTickets = process.env.CREATE_JIRA_TICKETS === 'true';
    this.uploadArtifactsToS3 = process.env.UPLOAD_ARTIFACTS_TO_S3 === 'true';
    
    // Create directories if they don't exist
    this.createDirectories();
    
    logger.info('Allure reporter initialized');
  }
  
  /**
   * Create required directories
   */
  private createDirectories(): void {
    const directories = [
      this.reportDir,
      this.screenshotsDir,
      this.videosDir,
      this.logsDir
    ];
    
    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`Created directory: ${dir}`);
      }
    }
  }
  
  /**
   * Get reporter instance
   * @returns AllureReporter instance
   */
  public static getInstance(): AllureReporter {
    if (!AllureReporter.instance) {
      AllureReporter.instance = new AllureReporter();
    }
    return AllureReporter.instance;
  }
  
  /**
   * Generate unique ID
   * @returns Unique ID
   */
  private generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  
  /**
   * Start test suite
   * @param name Suite name
   * @param description Suite description
   */
  public startSuite(name: string, description?: string): void {
    this.currentSuite = name;
    logger.info(`Starting test suite: ${name}`, { description });
    
    // In a real implementation, this would create the suite JSON file for Allure
    // For demonstration purposes, we just log the action
  }
  
  /**
   * End test suite
   * @param name Suite name
   */
  public endSuite(name: string): void {
    logger.info(`Ending test suite: ${name}`);
    this.currentSuite = '';
    
    // In a real implementation, this would update the suite JSON file for Allure
    // For demonstration purposes, we just log the action
  }
  
  /**
   * Start test case
   * @param name Test name
   * @param description Test description
   * @param labels Test labels
   */
  public startTest(name: string, description?: string, labels?: { type: LabelType, value: string }[]): void {
    this.currentTest = name;
    logger.info(`Starting test: ${name}`, { description, labels });
    
    // In a real implementation, this would create the test JSON file for Allure
    // For demonstration purposes, we just log the action
  }
  
  /**
   * End test case
   * @param name Test name
   * @param status Test status
   * @param duration Test duration in milliseconds
   * @param error Optional error object if test failed
   */
  public endTest(name: string, status: TestStatus, duration: number, error?: Error): void {
    logger.info(`Ending test: ${name} - ${status} (Duration: ${duration}ms)`, { error });
    this.currentTest = '';
    
    // Create Jira ticket if test failed and flag is enabled
    if ((status === TestStatus.FAILED || status === TestStatus.BROKEN) && this.createJiraTickets) {
      this.createJiraTicket(name, error);
    }
    
    // In a real implementation, this would update the test JSON file for Allure
    // For demonstration purposes, we just log the action
  }
  
  /**
   * Add step to current test
   * @param name Step name
   * @param status Step status
   * @param details Optional step details
   */
  public addStep(name: string, status: TestStatus, details?: any): void {
    logger.info(`Test step: ${name} - ${status}`, details);
    
    // In a real implementation, this would update the test JSON file with the step
    // For demonstration purposes, we just log the action
  }
  
  /**
   * Add attachment to current test
   * @param name Attachment name
   * @param content Attachment content
   * @param type Attachment type
   */
  public addAttachment(name: string, content: string | Buffer, type: AttachmentType): void {
    logger.info(`Adding attachment: ${name} (${type})`);
    
    // Generate unique attachment ID
    const attachmentId = this.generateUniqueId();
    
    // In a real implementation, this would save the attachment file and update the test JSON file
    // For demonstration purposes, we just log the action
  }
  
  /**
   * Add screenshot to current test
   * @param name Screenshot name
   * @param screenshot Screenshot content (Base64 encoded string or Buffer)
   */
  public addScreenshot(name: string, screenshot: string | Buffer): void {
    logger.info(`Adding screenshot: ${name}`);
    
    // Generate filename for screenshot
    const filename = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.png`;
    const filePath = path.join(this.screenshotsDir, filename);
    
    // Save screenshot to file
    try {
      if (typeof screenshot === 'string') {
        // If it's a Base64 string, remove the prefix if present
        let base64Data = screenshot;
        if (base64Data.startsWith('data:image/png;base64,')) {
          base64Data = base64Data.split(',')[1];
        }
        fs.writeFileSync(filePath, base64Data, 'base64');
      } else {
        // If it's a Buffer
        fs.writeFileSync(filePath, screenshot);
      }
      
      logger.info(`Screenshot saved to: ${filePath}`);
      
      // Add screenshot as attachment to the test
      this.addAttachment(name, filePath, AttachmentType.PNG);
    } catch (error) {
      logger.error(`Error saving screenshot: ${error.message}`);
    }
  }
  
  /**
   * Add video to current test
   * @param name Video name
   * @param videoPath Path to video file
   */
  public addVideo(name: string, videoPath: string): void {
    logger.info(`Adding video: ${name} (${videoPath})`);
    
    // Validate that the video file exists
    if (!fs.existsSync(videoPath)) {
      logger.error(`Video file not found: ${videoPath}`);
      return;
    }
    
    // Generate filename for video in the videos directory
    const filename = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.mp4`;
    const filePath = path.join(this.videosDir, filename);
    
    // Copy video file to videos directory
    try {
      fs.copyFileSync(videoPath, filePath);
      logger.info(`Video saved to: ${filePath}`);
      
      // Add video as attachment to the test
      this.addAttachment(name, filePath, AttachmentType.VIDEO);
    } catch (error) {
      logger.error(`Error copying video file: ${error.message}`);
    }
  }
  
  /**
   * Add environment value to report
   * @param name Environment variable name
   * @param value Environment variable value
   */
  public addEnvironment(name: string, value: string): void {
    logger.info(`Adding environment variable: ${name}=${value}`);
    
    // In a real implementation, this would update the environment.properties file for Allure
    // For demonstration purposes, we just log the action
  }
  
  /**
   * Add category to report
   * @param name Category name
   * @param pattern Regex pattern to match message
   * @param matchedStatuses Test statuses to match
   */
  public addCategory(name: string, pattern: string, matchedStatuses: TestStatus[]): void {
    logger.info(`Adding category: ${name}`, { pattern, matchedStatuses });
    
    // In a real implementation, this would update the categories.json file for Allure
    // For demonstration purposes, we just log the action
  }
  
  /**
   * Create Jira ticket for failed test
   * @param testName Test name
   * @param error Optional error object
   */
  private createJiraTicket(testName: string, error?: Error): void {
    logger.info(`Creating Jira ticket for test: ${testName}`, { error });
    
    // In a real implementation, this would call the Jira API to create a ticket
    // For demonstration purposes, we just log the action
  }
  
  /**
   * Get test report URL
   * @returns Test report URL
   */
  public getReportUrl(): string {
    // In a real implementation, this would return the URL to the Allure report
    // For demonstration purposes, we just return a placeholder
    return 'https://example.com/allure-report';
  }
}

/**
 * Export singleton instance for easy import
 */
export const allureReporter = AllureReporter.getInstance();