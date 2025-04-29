import axios from 'axios';
import { logger } from '../../utils/logger';
import { configReader } from '../../utils/configReader';

/**
 * LambdaTest platform configuration
 */
export interface LambdaTestPlatform {
  browserName: string;
  browserVersion?: string;
  platform: string;
  platformVersion?: string;
  resolution?: string;
  build?: string;
  name?: string;
  projectName?: string;
  tags?: string[];
  visual?: boolean;
  video?: boolean;
  network?: boolean;
  console?: boolean;
  tunnel?: boolean;
  tunnelName?: string;
}

/**
 * LambdaTest status
 */
export enum LambdaTestStatus {
  PASSED = 'passed',
  FAILED = 'failed'
}

/**
 * LambdaTest build information
 */
export interface LambdaTestBuild {
  id: string;
  name: string;
  status: string;
  start_time: string;
  end_time: string;
  test_count: number;
  passed_count: number;
  failed_count: number;
  error_count: number;
  skip_count: number;
  total_time: number;
  tags: string[];
  user_id: string;
  project_id: string;
  organization_id: string;
  invite_count: number;
  platform_count: object;
}

/**
 * LambdaTest test information
 */
export interface LambdaTestTest {
  id: string;
  name: string;
  status: string;
  browser: string;
  browser_version: string;
  platform: string;
  platform_version: string;
  build_id: string;
  build_name: string;
  start_time: string;
  end_time: string;
  total_time: number;
  tags: string[];
  project_id: string;
  user_id: string;
  organization_id: string;
  git_provider: string;
  git_url: string;
  git_branch: string;
  git_commit: string;
  is_step_executed: boolean;
  exec_mode: string;
  web_url: string;
  video_url: string;
  screenshot_url: string;
  console_logs_url: string;
  network_logs_url: string;
}

/**
 * LambdaTest Service for cloud-based testing
 */
export class LambdaTestService {
  private username: string;
  private accessKey: string;
  private isConfigured: boolean = false;
  private baseUrl: string = 'https://api.lambdatest.com/automation';

  /**
   * Constructor
   */
  constructor() {
    // Get LambdaTest configuration from environment variables or config
    this.username = process.env.LAMBDATEST_USERNAME || configReader.getValue<string>('integrations.lambdatest.username', '');
    this.accessKey = process.env.LAMBDATEST_ACCESS_KEY || configReader.getValue<string>('integrations.lambdatest.accessKey', '');
    
    // Check if LambdaTest is configured
    this.isConfigured = !!(this.username && this.accessKey);
    
    if (this.isConfigured) {
      logger.info('LambdaTest integration initialized successfully');
    } else {
      logger.warn('LambdaTest integration not configured. Some features may not work.');
    }
  }

  /**
   * Generate LambdaTest capabilities for Playwright
   * @param platform Platform configuration
   * @returns LambdaTest capabilities
   */
  generateCapabilities(platform: LambdaTestPlatform): Record<string, any> {
    // Base capabilities
    const capabilities: Record<string, any> = {
      'browserName': platform.browserName,
      'platform': platform.platform,
      'lambdatest.user': this.username,
      'lambdatest.key': this.accessKey
    };
    
    // Add browser version if provided
    if (platform.browserVersion) {
      capabilities['browserVersion'] = platform.browserVersion;
    }
    
    // Add platform version if provided
    if (platform.platformVersion) {
      capabilities['platformVersion'] = platform.platformVersion;
    }
    
    // Add resolution if provided
    if (platform.resolution) {
      capabilities['resolution'] = platform.resolution;
    }
    
    // Add build name if provided
    if (platform.build) {
      capabilities['build'] = platform.build;
    }
    
    // Add test name if provided
    if (platform.name) {
      capabilities['name'] = platform.name;
    }
    
    // Add project name if provided
    if (platform.projectName) {
      capabilities['project'] = platform.projectName;
    }
    
    // Add tags if provided
    if (platform.tags && platform.tags.length > 0) {
      capabilities['tags'] = platform.tags;
    }
    
    // Add visual logging if enabled
    if (platform.visual) {
      capabilities['visual'] = platform.visual;
    }
    
    // Add video recording if enabled
    if (platform.video !== undefined) {
      capabilities['video'] = platform.video;
    }
    
    // Add network logging if enabled
    if (platform.network) {
      capabilities['network'] = platform.network;
    }
    
    // Add console logging if enabled
    if (platform.console) {
      capabilities['console'] = platform.console;
    }
    
    // Add tunnel if enabled
    if (platform.tunnel) {
      capabilities['tunnel'] = platform.tunnel;
      
      if (platform.tunnelName) {
        capabilities['tunnelName'] = platform.tunnelName;
      }
    }
    
    return capabilities;
  }

  /**
   * Get list of builds
   * @param limit Number of builds to retrieve (default: 10)
   * @param offset Offset for pagination (default: 0)
   * @returns Array of builds or null if retrieval failed
   */
  async getBuilds(limit: number = 10, offset: number = 0): Promise<LambdaTestBuild[] | null> {
    if (!this.isConfigured) {
      logger.error('LambdaTest integration not configured. Cannot get builds.');
      return null;
    }
    
    try {
      // Make API request
      const response = await axios.get(`${this.baseUrl}/builds?limit=${limit}&offset=${offset}`, {
        auth: {
          username: this.username,
          password: this.accessKey
        }
      });
      
      logger.info(`Retrieved ${response.data.data.length} LambdaTest builds`);
      return response.data.data;
    } catch (error) {
      logger.error(`Error getting LambdaTest builds: ${error}`);
      return null;
    }
  }

  /**
   * Get build by ID
   * @param buildId Build ID
   * @returns Build details or null if retrieval failed
   */
  async getBuild(buildId: string): Promise<LambdaTestBuild | null> {
    if (!this.isConfigured) {
      logger.error('LambdaTest integration not configured. Cannot get build.');
      return null;
    }
    
    try {
      // Make API request
      const response = await axios.get(`${this.baseUrl}/builds/${buildId}`, {
        auth: {
          username: this.username,
          password: this.accessKey
        }
      });
      
      logger.info(`Retrieved LambdaTest build: ${buildId}`);
      return response.data.data;
    } catch (error) {
      logger.error(`Error getting LambdaTest build ${buildId}: ${error}`);
      return null;
    }
  }

  /**
   * Get tests for a build
   * @param buildId Build ID
   * @param limit Number of tests to retrieve (default: 50)
   * @param offset Offset for pagination (default: 0)
   * @returns Array of tests or null if retrieval failed
   */
  async getTestsForBuild(buildId: string, limit: number = 50, offset: number = 0): Promise<LambdaTestTest[] | null> {
    if (!this.isConfigured) {
      logger.error('LambdaTest integration not configured. Cannot get tests for build.');
      return null;
    }
    
    try {
      // Make API request
      const response = await axios.get(`${this.baseUrl}/builds/${buildId}/tests?limit=${limit}&offset=${offset}`, {
        auth: {
          username: this.username,
          password: this.accessKey
        }
      });
      
      logger.info(`Retrieved ${response.data.data.length} tests for LambdaTest build ${buildId}`);
      return response.data.data;
    } catch (error) {
      logger.error(`Error getting tests for LambdaTest build ${buildId}: ${error}`);
      return null;
    }
  }

  /**
   * Get test by ID
   * @param testId Test ID
   * @returns Test details or null if retrieval failed
   */
  async getTest(testId: string): Promise<LambdaTestTest | null> {
    if (!this.isConfigured) {
      logger.error('LambdaTest integration not configured. Cannot get test.');
      return null;
    }
    
    try {
      // Make API request
      const response = await axios.get(`${this.baseUrl}/tests/${testId}`, {
        auth: {
          username: this.username,
          password: this.accessKey
        }
      });
      
      logger.info(`Retrieved LambdaTest test: ${testId}`);
      return response.data.data;
    } catch (error) {
      logger.error(`Error getting LambdaTest test ${testId}: ${error}`);
      return null;
    }
  }

  /**
   * Update test status
   * @param sessionId Session ID
   * @param status Test status
   * @param reason Reason for status (e.g., failure reason)
   * @returns True if update succeeded, false otherwise
   */
  async updateTestStatus(
    sessionId: string,
    status: LambdaTestStatus,
    reason?: string
  ): Promise<boolean> {
    if (!this.isConfigured) {
      logger.error('LambdaTest integration not configured. Cannot update test status.');
      return false;
    }
    
    try {
      // Build request data
      const data: any = {
        status_ind: status.toString()
      };
      
      if (reason) {
        data.reason = reason;
      }
      
      // Make API request
      await axios.patch(`${this.baseUrl}/sessions/${sessionId}`, data, {
        auth: {
          username: this.username,
          password: this.accessKey
        }
      });
      
      logger.info(`Updated LambdaTest session ${sessionId} status to ${status}`);
      return true;
    } catch (error) {
      logger.error(`Error updating LambdaTest session ${sessionId} status: ${error}`);
      return false;
    }
  }

  /**
   * Stop a test
   * @param testId Test ID
   * @returns True if stop succeeded, false otherwise
   */
  async stopTest(testId: string): Promise<boolean> {
    if (!this.isConfigured) {
      logger.error('LambdaTest integration not configured. Cannot stop test.');
      return false;
    }
    
    try {
      // Make API request
      await axios.delete(`${this.baseUrl}/sessions/${testId}`, {
        auth: {
          username: this.username,
          password: this.accessKey
        }
      });
      
      logger.info(`Stopped LambdaTest test: ${testId}`);
      return true;
    } catch (error) {
      logger.error(`Error stopping LambdaTest test ${testId}: ${error}`);
      return false;
    }
  }

  /**
   * Delete a build
   * @param buildId Build ID
   * @returns True if deletion succeeded, false otherwise
   */
  async deleteBuild(buildId: string): Promise<boolean> {
    if (!this.isConfigured) {
      logger.error('LambdaTest integration not configured. Cannot delete build.');
      return false;
    }
    
    try {
      // Make API request
      await axios.delete(`${this.baseUrl}/builds/${buildId}`, {
        auth: {
          username: this.username,
          password: this.accessKey
        }
      });
      
      logger.info(`Deleted LambdaTest build: ${buildId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting LambdaTest build ${buildId}: ${error}`);
      return false;
    }
  }
}

// Export singleton instance
export const lambdaTestService = new LambdaTestService();