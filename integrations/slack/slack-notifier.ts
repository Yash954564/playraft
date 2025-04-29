/**
 * Slack Notifier
 * Sends test results and notifications to Slack channels
 */

import { WebClient, type ChatPostMessageArguments } from '@slack/web-api';
import { logger } from '../../utils/logger/logger';

/**
 * SlackNotifier class
 * Provides methods for sending test results and notifications to Slack
 */
export class SlackNotifier {
  private slack: WebClient;
  private readonly botToken: string;
  private readonly channelId: string;
  
  /**
   * Constructor
   * @param botToken Optional Slack bot token (defaults to environment variable)
   * @param channelId Optional Slack channel ID (defaults to environment variable)
   */
  constructor(botToken?: string, channelId?: string) {
    this.botToken = botToken || process.env.SLACK_BOT_TOKEN || '';
    this.channelId = channelId || process.env.SLACK_CHANNEL_ID || '';
    
    if (!this.botToken) {
      throw new Error('Slack bot token not found. Please set the SLACK_BOT_TOKEN environment variable.');
    }
    
    if (!this.channelId) {
      throw new Error('Slack channel ID not found. Please set the SLACK_CHANNEL_ID environment variable.');
    }
    
    try {
      this.slack = new WebClient(this.botToken);
      logger.info('Slack client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Slack client', { error: String(error) });
      throw new Error(`Failed to initialize Slack client: ${error}`);
    }
  }
  
  /**
   * Send message to Slack channel
   * @param message Message to send
   * @returns Promise resolving to message timestamp
   */
  public async sendMessage(message: ChatPostMessageArguments): Promise<string | undefined> {
    try {
      // If no channel is specified in the message, use the default channel
      if (!message.channel) {
        message.channel = this.channelId;
      }
      
      // Send the message
      const response = await this.slack.chat.postMessage(message);
      
      // Log the success
      logger.info('Message sent to Slack successfully', {
        channel: message.channel,
        ts: response.ts
      });
      
      // Return the timestamp of the sent message
      return response.ts;
    } catch (error) {
      logger.error('Failed to send message to Slack', { error: String(error) });
      throw error;
    }
  }
  
  /**
   * Send test summary to Slack
   * @param summary Test summary object
   * @returns Promise resolving to message timestamp
   */
  public async sendTestSummary(summary: {
    project: string;
    environment: string;
    testSuite: string;
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
    startTime: string;
    endTime: string;
  }): Promise<string | undefined> {
    // Calculate pass percentage
    const passPercentage = summary.total > 0 
      ? Math.round((summary.passed / summary.total) * 100) 
      : 0;
    
    // Determine color based on pass percentage
    let color = '#36a64f'; // Green for high pass rate
    if (passPercentage < 80) {
      color = '#f2c744'; // Yellow for moderate pass rate
    }
    if (passPercentage < 60) {
      color = '#d00000'; // Red for low pass rate
    }
    
    // Create message blocks
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${summary.project} Test Results: ${summary.testSuite}`,
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Environment:*\n${summary.environment}`
          },
          {
            type: 'mrkdwn',
            text: `*Results:*\n${summary.passed} passed, ${summary.failed} failed, ${summary.skipped} skipped`
          }
        ]
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Pass Rate:*\n${passPercentage}%`
          },
          {
            type: 'mrkdwn',
            text: `*Duration:*\n${(summary.duration / 1000).toFixed(2)}s`
          }
        ]
      },
      {
        type: 'divider'
      }
    ];
    
    // Add test status emoji
    let statusEmoji = ':large_green_circle:';
    if (summary.failed > 0) {
      statusEmoji = ':red_circle:';
    } else if (summary.skipped > 0) {
      statusEmoji = ':large_yellow_circle:';
    }
    
    // Send the message
    return this.sendMessage({
      channel: this.channelId,
      text: `${statusEmoji} Test Summary: ${summary.passed}/${summary.total} tests passed (${passPercentage}%)`,
      blocks
    });
  }
  
  /**
   * Send test failure details to Slack
   * @param failures Test failure details
   * @returns Promise resolving to message timestamp
   */
  public async sendTestFailures(failures: Array<{
    testName: string;
    specFile: string;
    errorMessage: string;
    duration: number;
  }>): Promise<string | undefined> {
    if (failures.length === 0) {
      return undefined;
    }
    
    // Create message blocks
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `Failed Tests (${failures.length})`,
          emoji: true
        }
      }
    ];
    
    // Add each failure as a section
    failures.forEach((failure, index) => {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${index + 1}. ${failure.testName}*\nFile: \`${failure.specFile}\`\nDuration: ${(failure.duration / 1000).toFixed(2)}s`
        }
      });
      
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`${failure.errorMessage.substring(0, 500)}${failure.errorMessage.length > 500 ? '...' : ''}\`\`\``
        }
      });
      
      if (index < failures.length - 1) {
        blocks.push({
          type: 'divider'
        });
      }
    });
    
    // Send the message
    return this.sendMessage({
      channel: this.channelId,
      text: `Failed Tests: ${failures.length}`,
      blocks
    });
  }
  
  /**
   * Send AI analysis results to Slack
   * @param analysis AI analysis results
   * @returns Promise resolving to message timestamp
   */
  public async sendAIAnalysis(analysis: {
    patterns: string[];
    anomalies: string[];
    recommendations: string[];
    performanceInsights: string[];
  }): Promise<string | undefined> {
    // Create message blocks
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'AI Test Analysis Results',
          emoji: true
        }
      }
    ];
    
    // Add patterns section if available
    if (analysis.patterns && analysis.patterns.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Patterns Identified*'
        }
      });
      
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: analysis.patterns.map(pattern => `• ${pattern}`).join('\n')
        }
      });
      
      blocks.push({
        type: 'divider'
      });
    }
    
    // Add anomalies section if available
    if (analysis.anomalies && analysis.anomalies.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Anomalies Detected*'
        }
      });
      
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: analysis.anomalies.map(anomaly => `• ${anomaly}`).join('\n')
        }
      });
      
      blocks.push({
        type: 'divider'
      });
    }
    
    // Add recommendations section if available
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Recommendations*'
        }
      });
      
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: analysis.recommendations.map(recommendation => `• ${recommendation}`).join('\n')
        }
      });
      
      blocks.push({
        type: 'divider'
      });
    }
    
    // Add performance insights section if available
    if (analysis.performanceInsights && analysis.performanceInsights.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Performance Insights*'
        }
      });
      
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: analysis.performanceInsights.map(insight => `• ${insight}`).join('\n')
        }
      });
    }
    
    // Send the message
    return this.sendMessage({
      channel: this.channelId,
      text: 'AI Test Analysis Results',
      blocks
    });
  }
}

// Export singleton instance (commented out until environment variables are configured)
// export const slackNotifier = new SlackNotifier();