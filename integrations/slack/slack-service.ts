import axios from 'axios';
import { logger } from '../../utils/logger';
import { configReader } from '../../utils/configReader';

/**
 * Slack message attachment
 */
export interface SlackAttachment {
  fallback?: string;
  color?: string;
  pretext?: string;
  author_name?: string;
  author_link?: string;
  author_icon?: string;
  title?: string;
  title_link?: string;
  text?: string;
  fields?: {
    title: string;
    value: string;
    short?: boolean;
  }[];
  image_url?: string;
  thumb_url?: string;
  footer?: string;
  footer_icon?: string;
  ts?: number;
}

/**
 * Slack message block
 */
export interface SlackBlock {
  type: 'section' | 'divider' | 'header' | 'image' | 'context' | 'actions';
  text?: {
    type: 'plain_text' | 'mrkdwn';
    text: string;
    emoji?: boolean;
  };
  elements?: any[];
  block_id?: string;
  fields?: {
    type: 'plain_text' | 'mrkdwn';
    text: string;
  }[];
  accessory?: any;
}

/**
 * Slack notification service
 * Sends notifications to Slack channels
 */
export class SlackService {
  private webhookUrl: string;
  private isConfigured: boolean = false;
  private defaultChannel: string;
  private defaultUsername: string;
  private notifyOnFailure: boolean;
  private notifyOnSuccess: boolean;

  /**
   * Constructor
   */
  constructor() {
    // Get Slack configuration from environment variables or config
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || configReader.getValue<string>('integrations.slack.webhookUrl', '');
    this.defaultChannel = process.env.SLACK_CHANNEL || configReader.getValue<string>('integrations.slack.channel', '#test-automation');
    this.defaultUsername = process.env.SLACK_USERNAME || configReader.getValue<string>('integrations.slack.username', 'Automation Bot');
    
    // Get notification settings
    this.notifyOnFailure = process.env.SLACK_NOTIFY_ON_FAILURE === 'true' 
      || configReader.getValue<boolean>('integrations.slack.notifyOnFailure', true);
    this.notifyOnSuccess = process.env.SLACK_NOTIFY_ON_SUCCESS === 'true'
      || configReader.getValue<boolean>('integrations.slack.notifyOnSuccess', false);
    
    // Check if Slack is configured
    this.isConfigured = !!this.webhookUrl;
    
    if (this.isConfigured) {
      logger.info('Slack integration initialized successfully');
    } else {
      logger.warn('Slack integration not configured. Some features may not work.');
    }
  }

  /**
   * Send message to Slack
   * @param message Message text
   * @param options Message options
   * @returns True if sent successfully, false otherwise
   */
  async sendMessage(
    message: string,
    options?: {
      channel?: string;
      username?: string;
      icon_emoji?: string;
      icon_url?: string;
      attachments?: SlackAttachment[];
      blocks?: SlackBlock[];
    }
  ): Promise<boolean> {
    if (!this.isConfigured) {
      logger.error('Slack integration not configured. Cannot send message.');
      return false;
    }
    
    try {
      // Build message data
      const data: any = {
        text: message,
        channel: options?.channel || this.defaultChannel,
        username: options?.username || this.defaultUsername
      };
      
      // Add icon if provided
      if (options?.icon_emoji) {
        data.icon_emoji = options.icon_emoji;
      }
      
      if (options?.icon_url) {
        data.icon_url = options.icon_url;
      }
      
      // Add attachments if provided
      if (options?.attachments && options.attachments.length > 0) {
        data.attachments = options.attachments;
      }
      
      // Add blocks if provided
      if (options?.blocks && options.blocks.length > 0) {
        data.blocks = options.blocks;
      }
      
      // Send message to Slack
      await axios.post(this.webhookUrl, data);
      
      logger.info(`Slack message sent to ${data.channel}`);
      return true;
    } catch (error) {
      logger.error(`Error sending Slack message: ${error}`);
      return false;
    }
  }

  /**
   * Send test result notification
   * @param testName Test name
   * @param status Test status
   * @param duration Test duration in seconds
   * @param error Error message if test failed
   * @param screenshots Screenshot paths
   * @param environment Test environment
   * @returns True if sent successfully, false otherwise
   */
  async sendTestResultNotification(
    testName: string,
    status: 'passed' | 'failed' | 'skipped',
    duration: number,
    error?: string,
    screenshots?: string[],
    environment?: string
  ): Promise<boolean> {
    // Check if notification should be sent based on status
    if (status === 'passed' && !this.notifyOnSuccess) {
      logger.debug('Skipping Slack notification for passed test (notifyOnSuccess is false)');
      return true;
    }
    
    if (status === 'failed' && !this.notifyOnFailure) {
      logger.debug('Skipping Slack notification for failed test (notifyOnFailure is false)');
      return true;
    }
    
    // Get color based on status
    const color = status === 'passed' ? '#36a64f' : status === 'failed' ? '#ff0000' : '#808080';
    
    // Get icon based on status
    const icon_emoji = status === 'passed' ? ':white_check_mark:' : status === 'failed' ? ':x:' : ':grey_question:';
    
    // Get title based on status
    const title = `Test ${status.toUpperCase()}: ${testName}`;
    
    // Build fields
    const fields = [
      {
        title: 'Status',
        value: status.toUpperCase(),
        short: true
      },
      {
        title: 'Duration',
        value: `${duration.toFixed(2)}s`,
        short: true
      }
    ];
    
    // Add environment if provided
    if (environment) {
      fields.push({
        title: 'Environment',
        value: environment,
        short: true
      });
    }
    
    // Add error message if provided
    if (error) {
      fields.push({
        title: 'Error',
        value: `\`\`\`${error}\`\`\``,
        short: false
      });
    }
    
    // Build attachment
    const attachment: SlackAttachment = {
      fallback: title,
      color,
      title,
      fields,
      footer: `Test run at ${new Date().toISOString()}`,
      ts: Math.floor(Date.now() / 1000)
    };
    
    // Send notification
    return await this.sendMessage(
      '',
      {
        icon_emoji,
        attachments: [attachment]
      }
    );
  }

  /**
   * Send test run summary notification
   * @param results Test run results
   * @param environment Test environment
   * @returns True if sent successfully, false otherwise
   */
  async sendTestRunSummaryNotification(
    results: {
      total: number;
      passed: number;
      failed: number;
      skipped: number;
      duration: number;
    },
    environment?: string
  ): Promise<boolean> {
    // Calculate pass rate
    const passRate = results.total > 0 ? (results.passed / results.total) * 100 : 0;
    
    // Get overall status
    const status = results.failed > 0 ? 'failed' : 'passed';
    
    // Get color based on status
    const color = status === 'passed' ? '#36a64f' : '#ff0000';
    
    // Get icon based on status
    const icon_emoji = status === 'passed' ? ':white_check_mark:' : ':x:';
    
    // Build fields
    const fields = [
      {
        title: 'Total Tests',
        value: results.total.toString(),
        short: true
      },
      {
        title: 'Pass Rate',
        value: `${passRate.toFixed(2)}%`,
        short: true
      },
      {
        title: 'Passed',
        value: results.passed.toString(),
        short: true
      },
      {
        title: 'Failed',
        value: results.failed.toString(),
        short: true
      },
      {
        title: 'Skipped',
        value: results.skipped.toString(),
        short: true
      },
      {
        title: 'Duration',
        value: `${results.duration.toFixed(2)}s`,
        short: true
      }
    ];
    
    // Add environment if provided
    if (environment) {
      fields.push({
        title: 'Environment',
        value: environment,
        short: true
      });
    }
    
    // Build title
    let title: string;
    if (results.failed > 0) {
      title = `Test Run Failed (${results.failed} failed, ${results.passed} passed)`;
    } else if (results.skipped > 0 && results.passed === 0) {
      title = `Test Run Skipped (${results.skipped} skipped)`;
    } else {
      title = `Test Run Passed (${results.passed} passed)`;
    }
    
    // Build attachment
    const attachment: SlackAttachment = {
      fallback: title,
      color,
      title,
      fields,
      footer: `Test run completed at ${new Date().toISOString()}`,
      ts: Math.floor(Date.now() / 1000)
    };
    
    // Send notification
    return await this.sendMessage(
      '',
      {
        icon_emoji,
        attachments: [attachment]
      }
    );
  }
}

// Export singleton instance
export const slackService = new SlackService();