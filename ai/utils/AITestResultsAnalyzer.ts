/**
 * AI Test Results Analyzer
 * Utility for analyzing test results using AI
 */

import { aiHelper } from './AIHelper';
import { logger } from '../../utils/logger/logger';

/**
 * AI Test Results Analyzer class
 * Provides methods for analyzing test results using AI
 */
export class AITestResultsAnalyzer {
  /**
   * Constructor
   */
  constructor() {
    logger.info('AITestResultsAnalyzer initialized');
  }

  /**
   * Analyze API test results
   * @param testSuite Test suite name
   * @param testResults Test results
   * @returns Promise resolving to analysis
   */
  public async analyzeApiTestResults(
    testSuite: string,
    testResults: Array<{
      name: string;
      status: 'passed' | 'failed' | 'skipped';
      duration: number;
      error?: string;
    }>
  ): Promise<string> {
    logger.info(`Analyzing API test results for ${testSuite}`);
    
    try {
      // Check if AI helper is initialized
      if (!aiHelper.isInitialized()) {
        logger.warn('AI helper not initialized, analysis will be limited');
        return this.generateBasicAnalysis(testSuite, testResults);
      }
      
      // Analyze test results with AI
      const response = await aiHelper.analyzeTestResults(testSuite, testResults);
      
      // Check if analysis was successful
      if (response.error) {
        logger.error('Failed to analyze test results with AI', { error: response.error });
        return this.generateBasicAnalysis(testSuite, testResults);
      }
      
      // Return analysis
      return response.analysis;
    } catch (error) {
      logger.error('Error analyzing API test results', { error: String(error) });
      return this.generateBasicAnalysis(testSuite, testResults);
    }
  }

  /**
   * Analyze API performance
   * @param testSuite Test suite name
   * @param testResults Test results
   * @returns Promise resolving to analysis
   */
  public async analyzeApiPerformance(
    testSuite: string,
    testResults: Array<{
      endpoint: string;
      status: number;
      responseTime: number;
    }>
  ): Promise<string> {
    logger.info(`Analyzing API performance for ${testSuite}`);
    
    try {
      // Check if AI helper is initialized
      if (!aiHelper.isInitialized()) {
        logger.warn('AI helper not initialized, analysis will be limited');
        return this.generateBasicPerformanceAnalysis(testSuite, testResults);
      }
      
      // Analyze API performance with AI
      const response = await aiHelper.analyzeApiPerformance(testSuite, testResults);
      
      // Check if analysis was successful
      if (response.error) {
        logger.error('Failed to analyze API performance with AI', { error: response.error });
        return this.generateBasicPerformanceAnalysis(testSuite, testResults);
      }
      
      // Return analysis
      return response.analysis;
    } catch (error) {
      logger.error('Error analyzing API performance', { error: String(error) });
      return this.generateBasicPerformanceAnalysis(testSuite, testResults);
    }
  }

  /**
   * Analyze API response
   * @param method HTTP method
   * @param endpoint API endpoint
   * @param status HTTP status code
   * @param responseTime Response time in milliseconds
   * @param requestBody Request body
   * @param responseBody Response body
   * @returns Promise resolving to analysis
   */
  public async analyzeApiResponse(
    method: string,
    endpoint: string,
    status: number,
    responseTime: number,
    requestBody: any,
    responseBody: any
  ): Promise<string> {
    logger.info(`Analyzing API response for ${method} ${endpoint}`);
    
    try {
      // Check if AI helper is initialized
      if (!aiHelper.isInitialized()) {
        logger.warn('AI helper not initialized, analysis will be limited');
        return this.generateBasicResponseAnalysis(method, endpoint, status, responseTime);
      }
      
      // Analyze API response with AI
      const response = await aiHelper.analyzeApiResponse(
        method,
        endpoint,
        status,
        responseTime,
        requestBody,
        responseBody
      );
      
      // Check if analysis was successful
      if (response.error) {
        logger.error('Failed to analyze API response with AI', { error: response.error });
        return this.generateBasicResponseAnalysis(method, endpoint, status, responseTime);
      }
      
      // Return analysis
      return response.analysis;
    } catch (error) {
      logger.error('Error analyzing API response', { error: String(error) });
      return this.generateBasicResponseAnalysis(method, endpoint, status, responseTime);
    }
  }

  /**
   * Generate basic analysis without AI
   * @param testSuite Test suite name
   * @param testResults Test results
   * @returns Basic analysis
   */
  private generateBasicAnalysis(
    testSuite: string,
    testResults: Array<{
      name: string;
      status: 'passed' | 'failed' | 'skipped';
      duration: number;
      error?: string;
    }>
  ): string {
    // Calculate success rate
    const totalTests = testResults.length;
    const passedTests = testResults.filter(test => test.status === 'passed').length;
    const failedTests = testResults.filter(test => test.status === 'failed').length;
    const skippedTests = testResults.filter(test => test.status === 'skipped').length;
    const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    
    // Calculate average duration
    const totalDuration = testResults.reduce((sum, test) => sum + test.duration, 0);
    const averageDuration = totalTests > 0 ? Math.round(totalDuration / totalTests) : 0;
    
    // Generate analysis
    return `
      Test Suite: ${testSuite}
      
      Basic Analysis:
      - Total Tests: ${totalTests}
      - Passed Tests: ${passedTests}
      - Failed Tests: ${failedTests}
      - Skipped Tests: ${skippedTests}
      - Success Rate: ${successRate}%
      - Average Duration: ${averageDuration}ms
      
      ${failedTests > 0 ? 'Failed Tests:' : ''}
      ${testResults
        .filter(test => test.status === 'failed')
        .map(test => `- ${test.name}${test.error ? `: ${test.error}` : ''}`)
        .join('\n')}
    `;
  }

  /**
   * Generate basic performance analysis without AI
   * @param testSuite Test suite name
   * @param testResults Test results
   * @returns Basic performance analysis
   */
  private generateBasicPerformanceAnalysis(
    testSuite: string,
    testResults: Array<{
      endpoint: string;
      status: number;
      responseTime: number;
    }>
  ): string {
    // Calculate average response time
    const totalResponseTime = testResults.reduce((sum, test) => sum + test.responseTime, 0);
    const averageResponseTime = testResults.length > 0 ? Math.round(totalResponseTime / testResults.length) : 0;
    
    // Find slowest endpoint
    const slowestEndpoint = testResults.reduce(
      (slowest, test) => test.responseTime > slowest.responseTime ? test : slowest,
      { endpoint: '', status: 0, responseTime: 0 }
    );
    
    // Calculate success rate
    const successfulTests = testResults.filter(test => test.status >= 200 && test.status < 300).length;
    const successRate = testResults.length > 0 ? Math.round((successfulTests / testResults.length) * 100) : 0;
    
    // Generate analysis
    return `
      Test Suite: ${testSuite}
      
      Basic Performance Analysis:
      - Total Endpoints: ${testResults.length}
      - Average Response Time: ${averageResponseTime}ms
      - Slowest Endpoint: ${slowestEndpoint.endpoint} (${slowestEndpoint.responseTime}ms)
      - Success Rate: ${successRate}%
      
      Potential Issues:
      ${testResults
        .filter(test => test.responseTime > 1000)
        .map(test => `- Slow Response: ${test.endpoint} (${test.responseTime}ms)`)
        .join('\n')}
      ${testResults
        .filter(test => test.status >= 400)
        .map(test => `- Error Status: ${test.endpoint} (${test.status})`)
        .join('\n')}
    `;
  }

  /**
   * Generate basic response analysis without AI
   * @param method HTTP method
   * @param endpoint API endpoint
   * @param status HTTP status code
   * @param responseTime Response time in milliseconds
   * @returns Basic response analysis
   */
  private generateBasicResponseAnalysis(
    method: string,
    endpoint: string,
    status: number,
    responseTime: number
  ): string {
    // Determine status category
    const statusCategory = status >= 200 && status < 300 ? 'Success' : 
                           status >= 300 && status < 400 ? 'Redirection' :
                           status >= 400 && status < 500 ? 'Client Error' :
                           status >= 500 ? 'Server Error' : 'Unknown';
    
    // Determine performance category
    const performanceCategory = responseTime < 300 ? 'Excellent' :
                               responseTime < 600 ? 'Good' :
                               responseTime < 1000 ? 'Fair' :
                               responseTime < 2000 ? 'Poor' :
                               'Very Poor';
    
    // Generate analysis
    return `
      API Response Analysis:
      
      - Method: ${method}
      - Endpoint: ${endpoint}
      - Status: ${status} (${statusCategory})
      - Response Time: ${responseTime}ms (${performanceCategory})
      
      Basic Analysis:
      - The response completed with status ${status}, which is considered a ${statusCategory}.
      - The response took ${responseTime}ms, which is considered ${performanceCategory} performance.
      ${responseTime > 1000 ? '- Performance Warning: Response time exceeds 1 second.' : ''}
      ${status >= 400 ? `- Error Warning: Response returned with error status ${status}.` : ''}
    `;
  }
}

// Export default instance
export const aiTestResultsAnalyzer = new AITestResultsAnalyzer();