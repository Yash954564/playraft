import { WebClient, ChatPostMessageArguments } from '@slack/web-api';
import { logger } from '../../utils/logger/logger';

/**
 * Slack Notifier class
 * Provides Slack integration for sending test results and notifications
 */
export class SlackNotifier {
  private static instance: SlackNotifier;
  private slackClient: WebClient | null = null;
  private readonly defaultChannel: string;
  private readonly enabled: boolean;
  
  /**
   * Initialize Slack notifier
   */
  private constructor() {
    const slackToken = process.env.SLACK_BOT_TOKEN;
    this.defaultChannel = process.env.SLACK_CHANNEL_ID || '';
    this.enabled = !!slackToken && !!this.defaultChannel;
    
    if (this.enabled) {
      this.slackClient = new WebClient(slackToken);
      logger.info('Slack notifier initialized');
    } else {
      logger.warn('Slack integration disabled - SLACK_BOT_TOKEN or SLACK_CHANNEL_ID not set');
    }
  }
  
  /**
   * Get Slack notifier instance
   * @returns SlackNotifier instance
   */
  public static getInstance(): SlackNotifier {
    if (!SlackNotifier.instance) {
      SlackNotifier.instance = new SlackNotifier();
    }
    return SlackNotifier.instance;
  }
  
  /**
   * Send message to Slack
   * @param text Message text
   * @param channel Channel to send message to (optional, uses default if not specified)
   * @returns Promise resolving to message timestamp
   */
  public async sendMessage(text: string, channel?: string): Promise<string | undefined> {
    if (!this.enabled || !this.slackClient) {
      logger.warn('Cannot send message - Slack integration is disabled');
      return undefined;
    }
    
    try {
      const targetChannel = channel || this.defaultChannel;
      
      logger.info(`Sending message to Slack channel: ${targetChannel}`);
      
      const result = await this.slackClient.chat.postMessage({
        channel: targetChannel,
        text: text
      });
      
      logger.info('Message sent successfully', { ts: result.ts });
      
      return result.ts;
    } catch (error) {
      logger.error(`Error sending message to Slack: ${error.message}`);
      return undefined;
    }
  }
  
  /**
   * Send structured message to Slack
   * @param message Structured message
   * @returns Promise resolving to message timestamp
   */
  public async sendStructuredMessage(message: ChatPostMessageArguments): Promise<string | undefined> {
    if (!this.enabled || !this.slackClient) {
      logger.warn('Cannot send structured message - Slack integration is disabled');
      return undefined;
    }
    
    try {
      // Set default channel if not specified
      if (!message.channel) {
        message.channel = this.defaultChannel;
      }
      
      logger.info(`Sending structured message to Slack channel: ${message.channel}`);
      
      const result = await this.slackClient.chat.postMessage(message);
      
      logger.info('Structured message sent successfully', { ts: result.ts });
      
      return result.ts;
    } catch (error) {
      logger.error(`Error sending structured message to Slack: ${error.message}`);
      return undefined;
    }
  }
  
  /**
   * Send test summary to Slack
   * @param testResults Test results
   * @param reportUrl URL to test report
   * @param channel Channel to send message to (optional, uses default if not specified)
   * @returns Promise resolving to message timestamp
   */
  public async sendTestSummary(
    testResults: {
      total: number;
      passed: number;
      failed: number;
      skipped: number;
      duration: number;
      failures?: { name: string; message: string }[];
    },
    reportUrl?: string,
    channel?: string
  ): Promise<string | undefined> {
    if (!this.enabled || !this.slackClient) {
      logger.warn('Cannot send test summary - Slack integration is disabled');
      return undefined;
    }
    
    try {
      const targetChannel = channel || this.defaultChannel;
      
      // Calculate success rate
      const successRate = testResults.total > 0 
        ? Math.round((testResults.passed / testResults.total) * 100)
        : 0;
      
      // Format duration as minutes and seconds
      const minutes = Math.floor(testResults.duration / 60000);
      const seconds = Math.floor((testResults.duration % 60000) / 1000);
      const formattedDuration = `${minutes}m ${seconds}s`;
      
      // Determine emoji based on success rate
      let statusEmoji = ':white_check_mark:';
      if (testResults.failed > 0) {
        statusEmoji = successRate >= 90 ? ':warning:' : ':x:';
      }
      
      // Create message blocks
      const blocks: any[] = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `Test Results ${statusEmoji}`,
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Total Tests:*\n${testResults.total}`
            },
            {
              type: 'mrkdwn',
              text: `*Pass Rate:*\n${successRate}%`
            },
            {
              type: 'mrkdwn',
              text: `*Passed:*\n${testResults.passed}`
            },
            {
              type: 'mrkdwn',
              text: `*Failed:*\n${testResults.failed}`
            },
            {
              type: 'mrkdwn',
              text: `*Skipped:*\n${testResults.skipped}`
            },
            {
              type: 'mrkdwn',
              text: `*Duration:*\n${formattedDuration}`
            }
          ]
        }
      ];
      
      // Add failure details if any
      if (testResults.failures && testResults.failures.length > 0) {
        blocks.push({
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Failures',
            emoji: true
          }
        });
        
        // Add up to 5 failures
        const failuresToShow = testResults.failures.slice(0, 5);
        
        for (const failure of failuresToShow) {
          blocks.push({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${failure.name}*\n${failure.message}`
            }
          });
        }
        
        // Add message if there are more failures
        if (testResults.failures.length > 5) {
          blocks.push({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `_...and ${testResults.failures.length - 5} more failures_`
            }
          });
        }
      }
      
      // Add report link if provided
      if (reportUrl) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `<${reportUrl}|View Full Report>`
          }
        });
      }
      
      // Create message text (fallback for clients that don't support blocks)
      const text = `Test Results: ${testResults.passed}/${testResults.total} passed (${successRate}%)`;
      
      // Send message
      return await this.sendStructuredMessage({
        channel: targetChannel,
        text: text,
        blocks: blocks
      });
    } catch (error) {
      logger.error(`Error sending test summary to Slack: ${error.message}`);
      return undefined;
    }
  }
}

/**
 * Export singleton instance for easy import
 */
export const slackNotifier = SlackNotifier.getInstance();