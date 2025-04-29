import axios from 'axios';
import { logger } from '../../utils/logger';
import { configReader } from '../../utils/configReader';

/**
 * JIRA Issue Priority
 */
export enum JiraPriority {
  BLOCKER = 'Blocker',
  CRITICAL = 'Critical',
  MAJOR = 'Major',
  MINOR = 'Minor',
  TRIVIAL = 'Trivial'
}

/**
 * JIRA Issue Type
 */
export enum JiraIssueType {
  BUG = 'Bug',
  TASK = 'Task',
  STORY = 'Story',
  EPIC = 'Epic',
  SUBTASK = 'Sub-task'
}

/**
 * JIRA Issue interface
 */
export interface JiraIssue {
  key?: string;
  summary: string;
  description: string;
  projectKey: string;
  issueType: JiraIssueType;
  priority: JiraPriority;
  assignee?: string;
  reporter?: string;
  labels?: string[];
  components?: string[];
  environment?: string;
  attachments?: string[];
  testEvidence?: {
    screenshots?: string[];
    videos?: string[];
    logs?: string[];
  };
}

/**
 * JIRA Service for integration with JIRA API
 */
export class JiraService {
  private baseUrl: string;
  private apiToken: string;
  private email: string;
  private isConfigured: boolean = false;

  /**
   * Constructor
   */
  constructor() {
    // Get JIRA configuration from environment variables or config
    this.baseUrl = process.env.JIRA_BASE_URL || configReader.getValue<string>('integrations.jira.baseUrl', '');
    this.apiToken = process.env.JIRA_API_TOKEN || configReader.getValue<string>('integrations.jira.apiToken', '');
    this.email = process.env.JIRA_EMAIL || configReader.getValue<string>('integrations.jira.email', '');
    
    // Check if JIRA is configured
    this.isConfigured = !!(this.baseUrl && this.apiToken && this.email);
    
    if (this.isConfigured) {
      logger.info('JIRA integration initialized successfully');
    } else {
      logger.warn('JIRA integration not configured. Some features may not work.');
    }
  }

  /**
   * Create a new JIRA issue
   * @param issue Issue details
   * @returns Issue key or null if creation failed
   */
  async createIssue(issue: JiraIssue): Promise<string | null> {
    if (!this.isConfigured) {
      logger.error('JIRA integration not configured. Cannot create issue.');
      return null;
    }
    
    try {
      // Build issue data
      const issueData = {
        fields: {
          project: {
            key: issue.projectKey
          },
          summary: issue.summary,
          description: this.formatDescription(issue),
          issuetype: {
            name: issue.issueType
          },
          priority: {
            name: issue.priority
          },
          labels: issue.labels || [],
          environment: issue.environment || 'Test Environment'
        }
      };
      
      // Add assignee if provided
      if (issue.assignee) {
        issueData.fields.assignee = {
          name: issue.assignee
        };
      }
      
      // Add components if provided
      if (issue.components && issue.components.length > 0) {
        issueData.fields.components = issue.components.map(name => ({ name }));
      }
      
      // Make API request
      const response = await axios.post(
        `${this.baseUrl}/rest/api/2/issue`,
        issueData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${this.email}:${this.apiToken}`).toString('base64')}`
          }
        }
      );
      
      // Get issue key
      const issueKey = response.data.key;
      logger.info(`JIRA issue created successfully: ${issueKey}`);
      
      // Add attachments if provided
      if (issue.attachments && issue.attachments.length > 0) {
        await this.addAttachments(issueKey, issue.attachments);
      }
      
      // Add test evidence if provided
      if (issue.testEvidence) {
        // Add screenshots
        if (issue.testEvidence.screenshots && issue.testEvidence.screenshots.length > 0) {
          await this.addAttachments(issueKey, issue.testEvidence.screenshots);
        }
        
        // Add videos
        if (issue.testEvidence.videos && issue.testEvidence.videos.length > 0) {
          await this.addAttachments(issueKey, issue.testEvidence.videos);
        }
        
        // Add logs
        if (issue.testEvidence.logs && issue.testEvidence.logs.length > 0) {
          await this.addAttachments(issueKey, issue.testEvidence.logs);
        }
      }
      
      return issueKey;
    } catch (error) {
      logger.error(`Error creating JIRA issue: ${error}`);
      return null;
    }
  }

  /**
   * Add attachments to JIRA issue
   * @param issueKey Issue key
   * @param filePaths File paths to attach
   * @returns True if attachments added successfully, false otherwise
   */
  async addAttachments(issueKey: string, filePaths: string[]): Promise<boolean> {
    if (!this.isConfigured) {
      logger.error('JIRA integration not configured. Cannot add attachments.');
      return false;
    }
    
    try {
      // Create form data for attachments
      const FormData = require('form-data');
      const fs = require('fs');
      const formData = new FormData();
      
      // Add files to form data
      for (const filePath of filePaths) {
        formData.append('file', fs.createReadStream(filePath));
      }
      
      // Make API request
      await axios.post(
        `${this.baseUrl}/rest/api/2/issue/${issueKey}/attachments`,
        formData,
        {
          headers: {
            'X-Atlassian-Token': 'no-check',
            'Authorization': `Basic ${Buffer.from(`${this.email}:${this.apiToken}`).toString('base64')}`,
            ...formData.getHeaders()
          }
        }
      );
      
      logger.info(`Attachments added to JIRA issue ${issueKey}`);
      return true;
    } catch (error) {
      logger.error(`Error adding attachments to JIRA issue ${issueKey}: ${error}`);
      return false;
    }
  }

  /**
   * Get JIRA issue by key
   * @param issueKey Issue key
   * @returns Issue details or null if not found
   */
  async getIssue(issueKey: string): Promise<any | null> {
    if (!this.isConfigured) {
      logger.error('JIRA integration not configured. Cannot get issue.');
      return null;
    }
    
    try {
      // Make API request
      const response = await axios.get(
        `${this.baseUrl}/rest/api/2/issue/${issueKey}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${this.email}:${this.apiToken}`).toString('base64')}`
          }
        }
      );
      
      logger.info(`JIRA issue ${issueKey} retrieved successfully`);
      return response.data;
    } catch (error) {
      logger.error(`Error getting JIRA issue ${issueKey}: ${error}`);
      return null;
    }
  }

  /**
   * Update JIRA issue
   * @param issueKey Issue key
   * @param updateData Update data
   * @returns True if updated successfully, false otherwise
   */
  async updateIssue(issueKey: string, updateData: any): Promise<boolean> {
    if (!this.isConfigured) {
      logger.error('JIRA integration not configured. Cannot update issue.');
      return false;
    }
    
    try {
      // Make API request
      await axios.put(
        `${this.baseUrl}/rest/api/2/issue/${issueKey}`,
        { fields: updateData },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${this.email}:${this.apiToken}`).toString('base64')}`
          }
        }
      );
      
      logger.info(`JIRA issue ${issueKey} updated successfully`);
      return true;
    } catch (error) {
      logger.error(`Error updating JIRA issue ${issueKey}: ${error}`);
      return false;
    }
  }

  /**
   * Add comment to JIRA issue
   * @param issueKey Issue key
   * @param comment Comment text
   * @returns True if comment added successfully, false otherwise
   */
  async addComment(issueKey: string, comment: string): Promise<boolean> {
    if (!this.isConfigured) {
      logger.error('JIRA integration not configured. Cannot add comment.');
      return false;
    }
    
    try {
      // Make API request
      await axios.post(
        `${this.baseUrl}/rest/api/2/issue/${issueKey}/comment`,
        { body: comment },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${this.email}:${this.apiToken}`).toString('base64')}`
          }
        }
      );
      
      logger.info(`Comment added to JIRA issue ${issueKey}`);
      return true;
    } catch (error) {
      logger.error(`Error adding comment to JIRA issue ${issueKey}: ${error}`);
      return false;
    }
  }

  /**
   * Create a bug from test failure
   * @param testName Test name
   * @param error Error details
   * @param projectKey JIRA project key
   * @param priority Issue priority
   * @param attachments Attachments
   * @returns Issue key or null if creation failed
   */
  async createBugFromTestFailure(
    testName: string,
    error: Error,
    projectKey: string,
    priority: JiraPriority = JiraPriority.MAJOR,
    attachments?: {
      screenshots?: string[];
      videos?: string[];
      logs?: string[];
    }
  ): Promise<string | null> {
    // Create issue data
    const issue: JiraIssue = {
      summary: `[Automated] Test Failure: ${testName}`,
      description: error.message,
      projectKey,
      issueType: JiraIssueType.BUG,
      priority,
      labels: ['automated-test', 'test-failure'],
      environment: `Test Environment: ${process.env.TEST_ENV || 'Unknown'}`,
      testEvidence: attachments
    };
    
    // Create issue
    return await this.createIssue(issue);
  }

  /**
   * Format JIRA issue description with markdown
   * @param issue Issue details
   * @returns Formatted description
   */
  private formatDescription(issue: JiraIssue): string {
    return `${issue.description}

h2. Test Evidence
${issue.testEvidence ? `
* Screenshots: ${issue.testEvidence.screenshots ? issue.testEvidence.screenshots.length : 0}
* Videos: ${issue.testEvidence.videos ? issue.testEvidence.videos.length : 0}
* Logs: ${issue.testEvidence.logs ? issue.testEvidence.logs.length : 0}
` : 'No test evidence provided.'}

h2. Environment
${issue.environment || 'Test Environment'}

h2. Steps to Reproduce
1. Run the automated test: ${issue.summary.replace('[Automated] Test Failure: ', '')}
2. Review the attached evidence

h2. Additional Information
This issue was automatically created by the test automation framework.`;
  }
}

// Export singleton instance
export const jiraService = new JiraService();