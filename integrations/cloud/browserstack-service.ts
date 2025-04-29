import axios from 'axios';
import { logger } from '../../utils/logger';
import { configReader } from '../../utils/configReader';

/**
 * BrowserStack platform configuration
 */
export interface BrowserStackPlatform {
  os: string;
  osVersion: string;
  browser: string;
  browserVersion?: string;
  device?: string;
  deviceOrientation?: 'portrait' | 'landscape';
  local?: boolean;
  localIdentifier?: string;
  resolution?: string;
  network?: boolean;
  console?: boolean;
  video?: boolean;
  visual?: boolean;
  timezone?: string;
}

/**
 * BrowserStack capability options
 */
export interface BrowserStackOptions {
  buildName?: string;
  projectName?: string;
  sessionName?: string;
  debug?: boolean;
  networkLogs?: boolean;
  consoleLogs?: 'disable' | 'errors' | 'warnings' | 'info' | 'verbose';
  seleniumLogs?: boolean;
  telemetryLogs?: boolean;
  video?: boolean;
  videoScale?: string;
  seleniumVersion?: string;
  appiumVersion?: string;
  maskCommands?: string[];
  maskBasicAuth?: boolean;
  autoWait?: number;
  idleTimeout?: number;
  wsLocalSupport?: boolean;
}

/**
 * BrowserStack test status
 */
export enum BrowserStackTestStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  ERROR = 'error',
  SKIPPED = 'skipped',
  UNKNOWN = 'unknown'
}

/**
 * BrowserStack build details
 */
export interface BrowserStackBuild {
  automation_build: {
    name: string;
    duration: number;
    status: string;
    hashed_id: string;
    build_tag: string;
  };
  sessions: {
    id: string;
    status: string;
    name: string;
    duration: number;
    os: string;
    os_version: string;
    browser_version: string;
    browser: string;
    device: string;
    hashed_id: string;
  }[];
}

/**
 * BrowserStack session details
 */
export interface BrowserStackSession {
  automation_session: {
    name: string;
    duration: number;
    os: string;
    os_version: string;
    browser_version: string;
    browser: string;
    device: string;
    status: string;
    hashed_id: string;
    reason: string;
    build_name: string;
    project_name: string;
    logs: string;
    video_url: string;
    browser_url: string;
    public_url: string;
    browser_console_logs_url: string;
    har_logs_url: string;
    selenium_logs_url: string;
  };
}

/**
 * BrowserStack Service for cloud-based testing
 */
export class BrowserStackService {
  private username: string;
  private accessKey: string;
  private isConfigured: boolean = false;
  private baseUrl: string = 'https://api.browserstack.com/automate';

  /**
   * Constructor
   */
  constructor() {
    // Get BrowserStack configuration from environment variables or config
    this.username = process.env.BROWSERSTACK_USERNAME || configReader.getValue<string>('integrations.browserstack.username', '');
    this.accessKey = process.env.BROWSERSTACK_ACCESS_KEY || configReader.getValue<string>('integrations.browserstack.accessKey', '');
    
    // Check if BrowserStack is configured
    this.isConfigured = !!(this.username && this.accessKey);
    
    if (this.isConfigured) {
      logger.info('BrowserStack integration initialized successfully');
    } else {
      logger.warn('BrowserStack integration not configured. Some features may not work.');
    }
  }

  /**
   * Generate BrowserStack capabilities for Playwright
   * @param platform Platform configuration
   * @param options Additional capability options
   * @returns BrowserStack capabilities
   */
  generateCapabilities(platform: BrowserStackPlatform, options?: BrowserStackOptions): Record<string, any> {
    // Base capabilities
    const capabilities: Record<string, any> = {
      'browserstack.username': this.username,
      'browserstack.accessKey': this.accessKey,
      'browser': platform.browser,
      'os': platform.os,
      'os_version': platform.osVersion,
    };
    
    // Add browser version if provided
    if (platform.browserVersion) {
      capabilities['browser_version'] = platform.browserVersion;
    }
    
    // Add device if provided (for mobile testing)
    if (platform.device) {
      capabilities['device'] = platform.device;
      capabilities['real_mobile'] = true;
    }
    
    // Add device orientation if provided
    if (platform.deviceOrientation) {
      capabilities['deviceOrientation'] = platform.deviceOrientation;
    }
    
    // Add local testing options if enabled
    if (platform.local) {
      capabilities['browserstack.local'] = true;
      
      if (platform.localIdentifier) {
        capabilities['browserstack.localIdentifier'] = platform.localIdentifier;
      }
    }
    
    // Add resolution if provided
    if (platform.resolution) {
      capabilities['resolution'] = platform.resolution;
    }
    
    // Add network logs if enabled
    if (platform.network) {
      capabilities['browserstack.networkLogs'] = true;
    }
    
    // Add console logs if enabled
    if (platform.console) {
      capabilities['browserstack.console'] = 'verbose';
    }
    
    // Add video recording if enabled
    if (platform.video !== undefined) {
      capabilities['browserstack.video'] = platform.video;
    }
    
    // Add visual logs if enabled
    if (platform.visual) {
      capabilities['browserstack.debug'] = true;
    }
    
    // Add timezone if provided
    if (platform.timezone) {
      capabilities['browserstack.timezone'] = platform.timezone;
    }
    
    // Add additional options if provided
    if (options) {
      if (options.buildName) {
        capabilities['build'] = options.buildName;
      }
      
      if (options.projectName) {
        capabilities['project'] = options.projectName;
      }
      
      if (options.sessionName) {
        capabilities['name'] = options.sessionName;
      }
      
      if (options.debug) {
        capabilities['browserstack.debug'] = true;
      }
      
      if (options.networkLogs) {
        capabilities['browserstack.networkLogs'] = true;
      }
      
      if (options.consoleLogs) {
        capabilities['browserstack.console'] = options.consoleLogs;
      }
      
      if (options.seleniumLogs) {
        capabilities['browserstack.seleniumLogs'] = true;
      }
      
      if (options.telemetryLogs) {
        capabilities['browserstack.telemetryLogs'] = true;
      }
      
      if (options.video !== undefined) {
        capabilities['browserstack.video'] = options.video;
      }
      
      if (options.videoScale) {
        capabilities['browserstack.videoScale'] = options.videoScale;
      }
      
      if (options.seleniumVersion) {
        capabilities['browserstack.selenium_version'] = options.seleniumVersion;
      }
      
      if (options.appiumVersion) {
        capabilities['browserstack.appium_version'] = options.appiumVersion;
      }
      
      if (options.maskCommands && options.maskCommands.length > 0) {
        capabilities['browserstack.maskCommands'] = options.maskCommands.join(',');
      }
      
      if (options.maskBasicAuth) {
        capabilities['browserstack.maskBasicAuth'] = true;
      }
      
      if (options.autoWait) {
        capabilities['browserstack.autoWait'] = options.autoWait;
      }
      
      if (options.idleTimeout) {
        capabilities['browserstack.idleTimeout'] = options.idleTimeout;
      }
      
      if (options.wsLocalSupport) {
        capabilities['browserstack.wsLocalSupport'] = true;
      }
    }
    
    return capabilities;
  }

  /**
   * Get latest builds
   * @param limit Number of builds to retrieve (default: 10)
   * @returns Array of builds or null if retrieval failed
   */
  async getBuilds(limit: number = 10): Promise<BrowserStackBuild[] | null> {
    if (!this.isConfigured) {
      logger.error('BrowserStack integration not configured. Cannot get builds.');
      return null;
    }
    
    try {
      // Make API request
      const response = await axios.get(`${this.baseUrl}/builds.json?limit=${limit}`, {
        auth: {
          username: this.username,
          password: this.accessKey
        }
      });
      
      logger.info(`Retrieved ${response.data.length} BrowserStack builds`);
      return response.data;
    } catch (error) {
      logger.error(`Error getting BrowserStack builds: ${error}`);
      return null;
    }
  }

  /**
   * Get build by ID
   * @param buildId Build ID
   * @returns Build details or null if retrieval failed
   */
  async getBuild(buildId: string): Promise<BrowserStackBuild | null> {
    if (!this.isConfigured) {
      logger.error('BrowserStack integration not configured. Cannot get build.');
      return null;
    }
    
    try {
      // Make API request
      const response = await axios.get(`${this.baseUrl}/builds/${buildId}.json`, {
        auth: {
          username: this.username,
          password: this.accessKey
        }
      });
      
      logger.info(`Retrieved BrowserStack build: ${buildId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error getting BrowserStack build ${buildId}: ${error}`);
      return null;
    }
  }

  /**
   * Get session by ID
   * @param sessionId Session ID
   * @returns Session details or null if retrieval failed
   */
  async getSession(sessionId: string): Promise<BrowserStackSession | null> {
    if (!this.isConfigured) {
      logger.error('BrowserStack integration not configured. Cannot get session.');
      return null;
    }
    
    try {
      // Make API request
      const response = await axios.get(`${this.baseUrl}/sessions/${sessionId}.json`, {
        auth: {
          username: this.username,
          password: this.accessKey
        }
      });
      
      logger.info(`Retrieved BrowserStack session: ${sessionId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error getting BrowserStack session ${sessionId}: ${error}`);
      return null;
    }
  }

  /**
   * Update session status
   * @param sessionId Session ID
   * @param status Test status
   * @param reason Reason for status (e.g., failure reason)
   * @returns True if update succeeded, false otherwise
   */
  async updateSessionStatus(
    sessionId: string,
    status: BrowserStackTestStatus,
    reason?: string
  ): Promise<boolean> {
    if (!this.isConfigured) {
      logger.error('BrowserStack integration not configured. Cannot update session status.');
      return false;
    }
    
    try {
      // Build request data
      const data: any = {
        status: status.toString()
      };
      
      if (reason) {
        data.reason = reason;
      }
      
      // Make API request
      await axios.put(`${this.baseUrl}/sessions/${sessionId}.json`, data, {
        auth: {
          username: this.username,
          password: this.accessKey
        }
      });
      
      logger.info(`Updated BrowserStack session ${sessionId} status to ${status}`);
      return true;
    } catch (error) {
      logger.error(`Error updating BrowserStack session ${sessionId} status: ${error}`);
      return false;
    }
  }

  /**
   * Delete build by ID
   * @param buildId Build ID
   * @returns True if deletion succeeded, false otherwise
   */
  async deleteBuild(buildId: string): Promise<boolean> {
    if (!this.isConfigured) {
      logger.error('BrowserStack integration not configured. Cannot delete build.');
      return false;
    }
    
    try {
      // Make API request
      await axios.delete(`${this.baseUrl}/builds/${buildId}.json`, {
        auth: {
          username: this.username,
          password: this.accessKey
        }
      });
      
      logger.info(`Deleted BrowserStack build: ${buildId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting BrowserStack build ${buildId}: ${error}`);
      return false;
    }
  }

  /**
   * Get browsers available on BrowserStack
   * @returns Array of available browsers or null if retrieval failed
   */
  async getBrowsers(): Promise<any[] | null> {
    if (!this.isConfigured) {
      logger.error('BrowserStack integration not configured. Cannot get browsers.');
      return null;
    }
    
    try {
      // Make API request
      const response = await axios.get(`${this.baseUrl}/browsers.json`, {
        auth: {
          username: this.username,
          password: this.accessKey
        }
      });
      
      logger.info(`Retrieved ${response.data.length} available browsers on BrowserStack`);
      return response.data;
    } catch (error) {
      logger.error(`Error getting BrowserStack browsers: ${error}`);
      return null;
    }
  }
}

// Export singleton instance
export const browserStackService = new BrowserStackService();