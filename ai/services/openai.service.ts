/**
 * OpenAI Service
 * Provides integration with OpenAI API for test generation, analysis, and test data creation
 */

import OpenAI from 'openai';
import { configReader } from '../../utils/config/config-reader';
import { logger } from '../../utils/logger/logger';

// Configuration interface for OpenAI service
interface OpenAIServiceConfig {
  apiKey?: string;
  defaultModel: string;
  enabled: boolean;
  maxRetries: number;
  requestTimeout: number;
}

/**
 * OpenAI Service class
 */
class OpenAIService {
  private client: OpenAI | null = null;
  private config: OpenAIServiceConfig;
  
  /**
   * Constructor
   */
  constructor() {
    this.config = {
      apiKey: process.env.OPENAI_API_KEY,
      defaultModel: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      enabled: true,
      maxRetries: 3,
      requestTimeout: 60000
    };
    
    this.initialize();
  }
  
  /**
   * Initialize OpenAI client
   */
  private initialize(): void {
    try {
      if (!this.config.apiKey) {
        logger.warn('OpenAI API key is not set. AI features will be disabled.');
        this.config.enabled = false;
        return;
      }
      
      this.client = new OpenAI({
        apiKey: this.config.apiKey,
        timeout: this.config.requestTimeout,
        maxRetries: this.config.maxRetries
      });
      
      logger.info('OpenAI service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize OpenAI service', { error });
      this.config.enabled = false;
    }
  }
  
  /**
   * Check if OpenAI service is enabled
   * @returns True if service is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled && this.client !== null;
  }
  
  /**
   * Generate completion with OpenAI
   * @param messages Chat messages
   * @param options Options for generation
   * @returns Completion response
   */
  public async generateCompletion(
    messages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>,
    options?: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
      json?: boolean;
    }
  ): Promise<any> {
    if (!this.isEnabled()) {
      throw new Error('OpenAI service is not enabled');
    }
    
    try {
      const response = await this.client!.chat.completions.create({
        model: options?.model || this.config.defaultModel,
        messages,
        temperature: options?.temperature !== undefined ? options.temperature : 0.7,
        max_tokens: options?.max_tokens,
        response_format: options?.json ? { type: 'json_object' } : undefined
      });
      
      return response;
    } catch (error: any) {
      logger.error('Error in OpenAI completion request', {
        error: error.message,
        messages: messages.map(m => ({ role: m.role, contentLength: m.content.length }))
      });
      
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
  
  /**
   * Generate images with OpenAI
   * @param prompt Image prompt
   * @param options Options for image generation
   * @returns Generated image data
   */
  public async generateImage(
    prompt: string,
    options?: {
      model?: string;
      size?: '256x256' | '512x512' | '1024x1024';
      quality?: 'standard' | 'hd';
      n?: number;
    }
  ): Promise<any> {
    if (!this.isEnabled()) {
      throw new Error('OpenAI service is not enabled');
    }
    
    try {
      const response = await this.client!.images.generate({
        model: options?.model || 'dall-e-3',
        prompt,
        n: options?.n || 1,
        size: options?.size || '1024x1024',
        quality: options?.quality || 'standard'
      });
      
      return response;
    } catch (error: any) {
      logger.error('Error in OpenAI image generation request', {
        error: error.message,
        promptLength: prompt.length
      });
      
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
  
  /**
   * Generate test data with OpenAI
   * @param schema Schema or description of the data to generate
   * @param count Number of items to generate
   * @param constraints Additional constraints for the data
   * @returns Generated test data
   */
  public async generateTestData<T>(
    schema: string,
    count: number = 1,
    constraints?: string[]
  ): Promise<T[]> {
    if (!this.isEnabled()) {
      throw new Error('OpenAI service is not enabled');
    }
    
    try {
      const prompt = `
        Generate ${count} test data items that satisfy the following schema:
        
        ${schema}
        
        ${constraints ? `Additional constraints:
        ${constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}` : ''}
        
        Return the data as a valid JSON array with ${count} items.
      `;
      
      const response = await this.generateCompletion(
        [
          { 
            role: 'system', 
            content: 'You are a test data generator. Generate realistic and diverse test data in JSON format.'
          },
          { role: 'user', content: prompt }
        ],
        {
          temperature: 0.8,
          max_tokens: 2000,
          json: true
        }
      );
      
      const content = response.choices[0].message.content;
      
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }
      
      try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseError) {
        logger.error('Error parsing generated test data', { content, error: parseError });
        throw new Error('Invalid JSON in response');
      }
    } catch (error: any) {
      logger.error('Error generating test data with OpenAI', { error: error.message });
      throw new Error(`Failed to generate test data: ${error.message}`);
    }
  }
  
  /**
   * Generate API test cases with OpenAI
   * @param apiDetails API endpoint details
   * @returns Generated test cases
   */
  public async generateApiTestCases(apiDetails: {
    endpoint: string;
    method: string;
    description: string;
    requestParams?: any;
    requestBody?: any;
    responseSchema?: any;
  }): Promise<any[]> {
    if (!this.isEnabled()) {
      throw new Error('OpenAI service is not enabled');
    }
    
    try {
      const prompt = `
        Generate test cases for the following API endpoint:
        
        Endpoint: ${apiDetails.endpoint}
        Method: ${apiDetails.method}
        Description: ${apiDetails.description}
        ${apiDetails.requestParams ? `Request Parameters: ${JSON.stringify(apiDetails.requestParams, null, 2)}` : ''}
        ${apiDetails.requestBody ? `Request Body: ${JSON.stringify(apiDetails.requestBody, null, 2)}` : ''}
        ${apiDetails.responseSchema ? `Response Schema: ${JSON.stringify(apiDetails.responseSchema, null, 2)}` : ''}
        
        Include test cases for:
        1. Happy path scenarios
        2. Error scenarios
        3. Edge cases
        4. Performance testing
        5. Security testing
        
        For each test case, include:
        - Test case ID
        - Description
        - Test data
        - Expected result
        - Priority (High, Medium, Low)
        
        Return the test cases as a valid JSON array.
      `;
      
      const response = await this.generateCompletion(
        [
          { 
            role: 'system', 
            content: 'You are an API testing expert. Generate comprehensive test cases for API endpoints.'
          },
          { role: 'user', content: prompt }
        ],
        {
          temperature: 0.4,
          max_tokens: 3000,
          json: true
        }
      );
      
      const content = response.choices[0].message.content;
      
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }
      
      try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseError) {
        logger.error('Error parsing generated API test cases', { content, error: parseError });
        throw new Error('Invalid JSON in response');
      }
    } catch (error: any) {
      logger.error('Error generating API test cases with OpenAI', { error: error.message });
      throw new Error(`Failed to generate API test cases: ${error.message}`);
    }
  }
  
  /**
   * Analyze test results with OpenAI
   * @param testResults Test results to analyze
   * @returns Analysis of test results
   */
  public async analyzeTestResults(testResults: any): Promise<string> {
    if (!this.isEnabled()) {
      throw new Error('OpenAI service is not enabled');
    }
    
    try {
      const prompt = `
        Analyze the following test results and provide insights:
        
        ${JSON.stringify(testResults, null, 2)}
        
        Please provide:
        1. Summary of test execution
        2. Analysis of failures and their potential causes
        3. Patterns in failures (if any)
        4. Suggestions for improving test coverage or quality
        5. Areas that need more attention based on the results
      `;
      
      const response = await this.generateCompletion(
        [
          { 
            role: 'system', 
            content: 'You are a test analysis expert. Analyze test results and provide actionable insights.'
          },
          { role: 'user', content: prompt }
        ],
        {
          temperature: 0.3,
          max_tokens: 2000
        }
      );
      
      return response.choices[0].message.content || '';
    } catch (error: any) {
      logger.error('Error analyzing test results with OpenAI', { error: error.message });
      throw new Error(`Failed to analyze test results: ${error.message}`);
    }
  }
  
  /**
   * Generate Playwright test code with OpenAI
   * @param testCase Test case details
   * @returns Generated Playwright test code
   */
  public async generatePlaywrightTest(testCase: {
    description: string;
    steps: string[];
    pageObjects?: string[];
    assertions?: string[];
  }): Promise<string> {
    if (!this.isEnabled()) {
      throw new Error('OpenAI service is not enabled');
    }
    
    try {
      const prompt = `
        Generate a Playwright test in TypeScript for the following test case:
        
        Description: ${testCase.description}
        
        Steps:
        ${testCase.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
        
        ${testCase.pageObjects ? `Page Objects to use:
        ${testCase.pageObjects.join('\n')}` : ''}
        
        ${testCase.assertions ? `Assertions to include:
        ${testCase.assertions.join('\n')}` : ''}
        
        Include:
        - Proper imports
        - Test setup and teardown
        - Page object instantiation
        - Error handling
        - Reporting
        - Screenshots for failures
        
        Return only the code, without any explanations.
      `;
      
      const response = await this.generateCompletion(
        [
          { 
            role: 'system', 
            content: 'You are a Playwright testing expert. Generate clean, maintainable Playwright tests in TypeScript.'
          },
          { role: 'user', content: prompt }
        ],
        {
          temperature: 0.2,
          max_tokens: 2000
        }
      );
      
      const generatedCode = response.choices[0].message.content || '';
      
      // Extract code if wrapped in backticks
      const codeMatch = generatedCode.match(/```(?:typescript|ts)?\s*([\s\S]*?)\s*```/);
      return codeMatch ? codeMatch[1] : generatedCode;
    } catch (error: any) {
      logger.error('Error generating Playwright test with OpenAI', { error: error.message });
      throw new Error(`Failed to generate Playwright test: ${error.message}`);
    }
  }
}

// Create singleton instance
const openAIService = new OpenAIService();

export { openAIService, OpenAIService };