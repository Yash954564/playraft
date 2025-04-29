/**
 * AI Helper
 * Utility for AI-powered test analysis
 */

import OpenAI from 'openai';
import { logger } from '../../utils/logger/logger';
import { testConfig } from '../../config/testConfig';
import { testRetryHandler } from '../../utils/TestRetryHandler';

/**
 * AI Analysis Request
 */
interface AIAnalysisRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/**
 * AI Analysis Response
 */
interface AIAnalysisResponse {
  analysis: string;
  confidence?: number;
  suggestions?: string[];
  error?: string;
}

/**
 * AI Helper class
 * Provides methods for AI-powered test analysis
 */
export class AIHelper {
  private openai: OpenAI;
  private initialized: boolean = false;

  /**
   * Constructor
   */
  constructor() {
    try {
      // Initialize OpenAI
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || testConfig.ai.apiKey,
      });
      
      // Set initialized flag
      this.initialized = true;
      
      logger.info('OpenAI service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize OpenAI service', { error: String(error) });
      this.initialized = false;
    }
  }

  /**
   * Check if OpenAI is initialized
   * @returns Boolean indicating if OpenAI is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Analyze text with AI
   * @param request AI analysis request
   * @returns Promise resolving to AI analysis response
   */
  public async analyzeText(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    // Check if OpenAI is initialized
    if (!this.initialized) {
      logger.error('OpenAI service not initialized');
      return {
        analysis: 'AI analysis failed: OpenAI service not initialized',
        error: 'OpenAI service not initialized',
      };
    }
    
    try {
      // Use retry handler to handle API rate limits
      return await testRetryHandler.retryWithBackoff(async () => {
        logger.debug('Sending analysis request to OpenAI', { prompt: request.prompt.substring(0, 100) + '...' });
        
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const model = request.model || testConfig.ai.model;
        const temperature = request.temperature !== undefined ? request.temperature : testConfig.ai.temperature;
        const maxTokens = request.maxTokens || testConfig.ai.maxTokens;
        
        // Create completion
        const response = await this.openai.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert test automation analyst. Analyze the provided information and provide insights.',
            },
            {
              role: 'user',
              content: request.prompt,
            },
          ],
          temperature,
          max_tokens: maxTokens,
        });
        
        // Extract response
        const analysis = response.choices[0].message.content || '';
        
        logger.debug('Received analysis from OpenAI', { analysis: analysis.substring(0, 100) + '...' });
        
        // Return analysis
        return {
          analysis,
          confidence: 0.9, // Default confidence
        };
      });
    } catch (error) {
      logger.error('Failed to analyze element with AI', { error: String(error) });
      
      return {
        analysis: `AI analysis failed: ${error}`,
        error: String(error),
      };
    }
  }

  /**
   * Analyze API response with AI
   * @param method HTTP method
   * @param endpoint API endpoint
   * @param status HTTP status code
   * @param responseTime Response time in milliseconds
   * @param requestBody Request body
   * @param responseBody Response body
   * @returns Promise resolving to AI analysis response
   */
  public async analyzeApiResponse(
    method: string,
    endpoint: string,
    status: number,
    responseTime: number,
    requestBody: any,
    responseBody: any
  ): Promise<AIAnalysisResponse> {
    const prompt = `
      Analyze the following API response:
      
      Method: ${method}
      Endpoint: ${endpoint}
      Status: ${status}
      Response Time: ${responseTime}ms
      
      Request Body:
      ${JSON.stringify(requestBody, null, 2)}
      
      Response Body:
      ${JSON.stringify(responseBody, null, 2)}
      
      Provide a comprehensive analysis of:
      1. Is the response valid and as expected?
      2. Are there any performance concerns based on the response time?
      3. Are there any potential issues or improvements that could be made?
      4. Is the data structure appropriate and well-formed?
      
      Format your response as a comprehensive analysis.
    `;
    
    return this.analyzeText({ prompt });
  }

  /**
   * Analyze test results with AI
   * @param testSuite Test suite name
   * @param tests Test results
   * @returns Promise resolving to AI analysis response
   */
  public async analyzeTestResults(
    testSuite: string,
    tests: Array<{
      name: string;
      status: 'passed' | 'failed' | 'skipped';
      duration: number;
      error?: string;
    }>
  ): Promise<AIAnalysisResponse> {
    const prompt = `
      Analyze the following test results:
      
      Test Suite: ${testSuite}
      
      Test Results:
      ${tests.map(test => {
        return `
          Test: ${test.name}
          Status: ${test.status}
          Duration: ${test.duration}ms
          ${test.error ? `Error: ${test.error}` : ''}
        `;
      }).join('\n')}
      
      Provide a comprehensive analysis of:
      1. Overall test suite health and success rate
      2. Common patterns in failures, if any
      3. Performance concerns based on test durations
      4. Recommendations for improving test stability
      
      Format your response as a comprehensive analysis.
    `;
    
    return this.analyzeText({ prompt });
  }

  /**
   * Analyze API performance with AI
   * @param testSuite Test suite name
   * @param tests Test results
   * @returns Promise resolving to AI analysis response
   */
  public async analyzeApiPerformance(
    testSuite: string,
    tests: Array<{
      endpoint: string;
      status: number;
      responseTime: number;
    }>
  ): Promise<AIAnalysisResponse> {
    const prompt = `
      Analyze the following API performance metrics:
      
      Test Suite: ${testSuite}
      
      API Metrics:
      ${tests.map(test => {
        return `
          Endpoint: ${test.endpoint}
          Status: ${test.status}
          Response Time: ${test.responseTime}ms
        `;
      }).join('\n')}
      
      Provide a comprehensive analysis of:
      1. Overall API performance health
      2. Potential bottlenecks or slow endpoints
      3. Success rate and error patterns
      4. Recommendations for performance optimization
      
      Format your response as a comprehensive analysis.
    `;
    
    return this.analyzeText({ prompt });
  }

  /**
   * Analyze UI element with AI
   * @param elementDescription Element description
   * @param elementDetails Element details
   * @param screenshot Screenshot base64 data
   * @returns Promise resolving to AI analysis response
   */
  public async analyzeUiElement(
    elementDescription: string,
    elementDetails: any,
    screenshot?: string
  ): Promise<AIAnalysisResponse> {
    let messages = [
      {
        role: 'system' as const,
        content: 'You are an expert test automation analyst. Analyze the provided information about a UI element and provide insights.'
      },
      {
        role: 'user' as const,
        content: `
          Analyze the following UI element:
          
          Element Description: ${elementDescription}
          
          Element Details:
          ${JSON.stringify(elementDetails, null, 2)}
          
          Provide a comprehensive analysis of:
          1. Is the element well-identified and accessible?
          2. Are there any potential issues with the element's properties?
          3. Recommendations for better element identification or testing
          
          Format your response as a comprehensive analysis.
        `
      }
    ];

    // Add screenshot if provided
    if (screenshot) {
      messages = [
        messages[0],
        {
          role: 'user' as const,
          content: [
            {
              type: 'text',
              text: messages[1].content
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${screenshot}`
              }
            }
          ]
        }
      ];
    }

    try {
      // Use retry handler to handle API rate limits
      return await testRetryHandler.retryWithBackoff(async () => {
        logger.debug('Sending UI element analysis request to OpenAI');
        
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const model = testConfig.ai.model;
        
        // Create completion with or without image
        const response = await this.openai.chat.completions.create({
          model,
          messages: messages as any,
          temperature: testConfig.ai.temperature,
          max_tokens: testConfig.ai.maxTokens,
        });
        
        // Extract response
        const analysis = response.choices[0].message.content || '';
        
        logger.debug('Received UI element analysis from OpenAI');
        
        // Return analysis
        return {
          analysis,
          confidence: 0.9, // Default confidence
        };
      });
    } catch (error) {
      logger.error('Failed to analyze UI element with AI', { error: String(error) });
      
      return {
        analysis: `AI analysis failed: ${error}`,
        error: String(error),
      };
    }
  }

  /**
   * Generate test cases with AI
   * @param apiSpec API specification
   * @param testScope Test scope and requirements
   * @returns Promise resolving to AI analysis response
   */
  public async generateTestCases(
    apiSpec: string,
    testScope: string
  ): Promise<AIAnalysisResponse> {
    const prompt = `
      Generate comprehensive test cases based on the following API specification:
      
      API Specification:
      ${apiSpec}
      
      Test Scope and Requirements:
      ${testScope}
      
      For each endpoint, generate test cases covering:
      1. Happy path scenarios
      2. Edge cases and error handling
      3. Security considerations
      4. Performance considerations
      
      Format your response as a well-structured set of test cases organized by endpoint.
    `;
    
    return this.analyzeText({ prompt });
  }

  /**
   * Generate test data with AI
   * @param schema Data schema
   * @param constraints Data constraints
   * @param quantity Number of data items to generate
   * @returns Promise resolving to AI analysis response
   */
  public async generateTestData(
    schema: string,
    constraints: string,
    quantity: number
  ): Promise<AIAnalysisResponse> {
    const prompt = `
      Generate test data based on the following schema:
      
      Data Schema:
      ${schema}
      
      Data Constraints:
      ${constraints}
      
      Generate ${quantity} items of test data.
      
      Format your response as a JSON array of data objects.
    `;
    
    return this.analyzeText({ 
      prompt,
      temperature: 0.7 // Higher temperature for more varied test data
    });
  }
}

// Export default instance
export const aiHelper = new AIHelper();