import { AllureRuntime, AllureStep, AllureTest, ContentType, Status } from 'allure-js-commons';
import { AllureInterface } from 'allure-js-commons';
import * as fs from 'fs';
import * as path from 'path';
import { configReader } from '../utils/config.reader';
import { logger } from '../logger';

/**
 * Extended AllureReporter with enhanced capabilities for API and UI testing
 */
class AllureReporter {
  private allure: AllureInterface;
  private currentTest: AllureTest | null = null;
  private currentStep: AllureStep | null = null;
  private lastScreenshotPath: string | null = null;
  private screenshotsDir: string;
  private videosDir: string;
  private logsDir: string;
  private reportDir: string;
  private createJiraTickets: boolean;
  private uploadArtifactsToS3: boolean;

  constructor() {
    // Create directories if they don't exist
    this.screenshotsDir = path.resolve(process.cwd(), 'reports', 'screenshots');
    this.videosDir = path.resolve(process.cwd(), 'reports', 'videos');
    this.logsDir = path.resolve(process.cwd(), 'reports', 'logs');
    this.reportDir = path.resolve(process.cwd(), 'reports', 'allure-results');

    // Create directories if they don't exist
    this.createDirectoryIfNotExists(this.screenshotsDir);
    this.createDirectoryIfNotExists(this.videosDir);
    this.createDirectoryIfNotExists(this.logsDir);
    this.createDirectoryIfNotExists(this.reportDir);

    // Get configuration options
    this.createJiraTickets = configReader.getBooleanConfig('reporting.createJiraTickets', false);
    this.uploadArtifactsToS3 = configReader.getBooleanConfig('reporting.uploadArtifactsToS3', false);

    // Initialize Allure runtime
    const allureRuntime = new AllureRuntime({ resultsDir: this.reportDir });
    this.allure = new AllureInterface(allureRuntime);

    logger.info(`AllureReporter initialized. Results directory: ${this.reportDir}`);
  }

  /**
   * Start a test case
   * @param name Test name
   * @param fullName Full test name
   * @returns This instance for chaining
   */
  public startTest(name: string, fullName?: string): AllureReporter {
    if (this.currentTest) {
      this.endTest();
    }

    logger.info(`Starting test: ${name}`);
    this.currentTest = this.allure.startTest(name, fullName);
    return this;
  }

  /**
   * End the current test
   * @param status Test status
   * @returns This instance for chaining
   */
  public endTest(status?: Status): AllureReporter {
    if (this.currentTest) {
      if (this.currentStep) {
        this.endStep();
      }

      if (status) {
        this.currentTest.status = status;
      }

      // Attach final screenshot if available
      if (this.lastScreenshotPath) {
        this.attachScreenshotFromPath(this.lastScreenshotPath);
      }

      // Attach logs
      this.attachLogs();

      logger.info(`Ending test with status: ${status || this.currentTest.status}`);
      this.allure.endTest(this.currentTest);
      this.currentTest = null;
    }
    return this;
  }

  /**
   * Start a test step
   * @param name Step name
   * @returns This instance for chaining
   */
  public startStep(name: string): AllureReporter {
    if (this.currentStep) {
      this.endStep();
    }

    if (this.currentTest) {
      logger.debug(`Starting step: ${name}`);
      this.currentStep = this.allure.startStep(name);
    } else {
      logger.warn('Cannot start step; no test is currently running');
    }
    return this;
  }

  /**
   * End the current step
   * @param status Step status
   * @returns This instance for chaining
   */
  public endStep(status?: Status): AllureReporter {
    if (this.currentStep) {
      if (status) {
        this.currentStep.status = status;
      }
      logger.debug(`Ending step with status: ${status || this.currentStep.status}`);
      this.allure.endStep(this.currentStep);
      this.currentStep = null;
    }
    return this;
  }

  /**
   * Add a label to the current test
   * @param name Label name
   * @param value Label value
   * @returns This instance for chaining
   */
  public addLabel(name: string, value: string): AllureReporter {
    if (this.currentTest) {
      this.currentTest.addLabel(name, value);
    }
    return this;
  }

  /**
   * Add an epic label to the current test
   * @param epic Epic name
   * @returns This instance for chaining
   */
  public epic(epic: string): AllureReporter {
    return this.addLabel('epic', epic);
  }

  /**
   * Add a feature label to the current test
   * @param feature Feature name
   * @returns This instance for chaining
   */
  public feature(feature: string): AllureReporter {
    return this.addLabel('feature', feature);
  }

  /**
   * Add a story label to the current test
   * @param story Story name
   * @returns This instance for chaining
   */
  public story(story: string): AllureReporter {
    return this.addLabel('story', story);
  }

  /**
   * Add a severity label to the current test
   * @param severity Severity level
   * @returns This instance for chaining
   */
  public severity(severity: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial'): AllureReporter {
    return this.addLabel('severity', severity);
  }

  /**
   * Add an owner label to the current test
   * @param owner Owner name
   * @returns This instance for chaining
   */
  public owner(owner: string): AllureReporter {
    return this.addLabel('owner', owner);
  }

  /**
   * Add a tag to the current test
   * @param tag Tag name
   * @returns This instance for chaining
   */
  public tag(tag: string): AllureReporter {
    return this.addLabel('tag', tag);
  }

  /**
   * Add multiple tags to the current test
   * @param tags Tags array
   * @returns This instance for chaining
   */
  public tags(tags: string[]): AllureReporter {
    tags.forEach(tag => this.tag(tag));
    return this;
  }

  /**
   * Add a link to the current test
   * @param url Link URL
   * @param name Link name
   * @param type Link type
   * @returns This instance for chaining
   */
  public addLink(url: string, name?: string, type?: string): AllureReporter {
    if (this.currentTest) {
      this.currentTest.addLink(url, name, type);
    }
    return this;
  }

  /**
   * Add an issue link to the current test
   * @param url Issue URL
   * @param name Issue name
   * @returns This instance for chaining
   */
  public issue(url: string, name: string): AllureReporter {
    return this.addLink(url, name, 'issue');
  }

  /**
   * Add a test case link to the current test
   * @param url Test case URL
   * @param name Test case name
   * @returns This instance for chaining
   */
  public testCase(url: string, name: string): AllureReporter {
    return this.addLink(url, name, 'test_case');
  }

  /**
   * Attach data to the current test or step
   * @param name Attachment name
   * @param content Attachment content
   * @param type Content type
   * @returns This instance for chaining
   */
  public addAttachment(name: string, content: string | Buffer, type: ContentType): AllureReporter {
    if (this.currentStep) {
      this.allure.attachment(name, content, type);
    } else if (this.currentTest) {
      this.allure.attachment(name, content, type);
    }
    return this;
  }

  /**
   * Add description to the current test
   * @param description Test description
   * @param type Description type
   * @returns This instance for chaining
   */
  public description(description: string, type?: 'text' | 'html' | 'markdown'): AllureReporter {
    if (this.currentTest) {
      this.currentTest.description = description;
      if (type) {
        this.currentTest.descriptionType = type;
      }
    }
    return this;
  }

  /**
   * Add a parameter to the current test
   * @param name Parameter name
   * @param value Parameter value
   * @returns This instance for chaining
   */
  public parameter(name: string, value: string): AllureReporter {
    if (this.currentTest) {
      this.currentTest.parameter(name, value);
    }
    return this;
  }

  /**
   * Add multiple parameters to the current test
   * @param params Parameters object
   * @returns This instance for chaining
   */
  public parameters(params: Record<string, string>): AllureReporter {
    Object.entries(params).forEach(([name, value]) => this.parameter(name, value));
    return this;
  }

  /**
   * Add test fixtures to the current test
   * @param fixtures Fixtures object
   * @returns This instance for chaining
   */
  public addFixtures(fixtures: Record<string, any>): AllureReporter {
    Object.entries(fixtures).forEach(([name, value]) => {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      this.parameter(`fixture.${name}`, stringValue);
    });
    return this;
  }

  /**
   * Add environment info to the report
   * @param info Environment info object
   * @returns This instance for chaining
   */
  public addEnvironmentInfo(info: Record<string, string>): AllureReporter {
    const envPath = path.join(this.reportDir, 'environment.properties');
    const lines = Object.entries(info).map(([key, value]) => `${key}=${value}`);
    
    try {
      fs.writeFileSync(envPath, lines.join('\n'));
      logger.info(`Environment info added to ${envPath}`);
    } catch (error) {
      logger.error(`Failed to add environment info: ${error.message}`);
    }
    
    return this;
  }

  /**
   * Add test categories (for grouping failures)
   * @param categories Categories array
   * @returns This instance for chaining
   */
  public addCategories(categories: any[]): AllureReporter {
    const categoriesPath = path.join(this.reportDir, 'categories.json');
    
    try {
      fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));
      logger.info(`Categories added to ${categoriesPath}`);
    } catch (error) {
      logger.error(`Failed to add categories: ${error.message}`);
    }
    
    return this;
  }

  /**
   * Add screenshot to the current test
   * @param name Screenshot name
   * @param screenshot Screenshot buffer
   * @returns This instance for chaining
   */
  public addScreenshot(name: string, screenshot: Buffer): AllureReporter {
    // Save screenshot to file
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const fileName = `${name.replace(/\s+/g, '_')}_${timestamp}.png`;
    const filePath = path.join(this.screenshotsDir, fileName);
    
    try {
      fs.writeFileSync(filePath, screenshot);
      this.lastScreenshotPath = filePath;
      logger.info(`Screenshot saved to ${filePath}`);
      
      // Attach screenshot to report
      this.addAttachment(name, screenshot, 'image/png');
    } catch (error) {
      logger.error(`Failed to save screenshot: ${error.message}`);
    }
    
    return this;
  }

  /**
   * Add video to the current test
   * @param name Video name
   * @param videoPath Path to video file
   * @returns This instance for chaining
   */
  public addVideo(name: string, videoPath: string): AllureReporter {
    if (fs.existsSync(videoPath)) {
      try {
        const video = fs.readFileSync(videoPath);
        this.addAttachment(name, video, 'video/mp4');
        logger.info(`Video attached: ${videoPath}`);
      } catch (error) {
        logger.error(`Failed to attach video: ${error.message}`);
      }
    } else {
      logger.warn(`Video file not found: ${videoPath}`);
    }
    
    return this;
  }

  /**
   * Attach logs to the current test
   * @returns This instance for chaining
   */
  private attachLogs(): AllureReporter {
    // Attach test logs if available
    try {
      const logFilePath = logger.getLogFilePath();
      if (fs.existsSync(logFilePath)) {
        const logs = fs.readFileSync(logFilePath, 'utf8');
        this.addAttachment('Test Logs', logs, 'text/plain');
        logger.info(`Logs attached from ${logFilePath}`);
      }
    } catch (error) {
      logger.error(`Failed to attach logs: ${error.message}`);
    }
    
    return this;
  }

  /**
   * Attach screenshot from file path
   * @param screenshotPath Path to screenshot file
   * @returns This instance for chaining
   */
  private attachScreenshotFromPath(screenshotPath: string): AllureReporter {
    if (fs.existsSync(screenshotPath)) {
      try {
        const screenshot = fs.readFileSync(screenshotPath);
        const name = path.basename(screenshotPath);
        this.addAttachment(`Screenshot: ${name}`, screenshot, 'image/png');
        logger.info(`Screenshot attached: ${screenshotPath}`);
      } catch (error) {
        logger.error(`Failed to attach screenshot: ${error.message}`);
      }
    }
    
    return this;
  }

  /**
   * Create directory if it doesn't exist
   * @param dir Directory path
   */
  private createDirectoryIfNotExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// Create singleton instance
export const allureReporter = new AllureReporter();