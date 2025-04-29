/**
 * AI Helper
 * Utility for interacting with OpenAI's API
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../../utils/logger/logger';

/**
 * AI Helper class
 * Provides utilities for AI-powered testing and analysis
 */
export class AIHelper {
  private openai: OpenAI;
  private model = 'gpt-4o'; // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  private maxTokens = 4000;
  private temperature = 0.7;
  
  /**
   * Constructor
   */
  constructor() {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not available in environment variables');
    }
    
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    logger.debug('AIHelper initialized');
  }
  
  /**
   * Set model
   * @param model OpenAI model
   */
  public setModel(model: string): void {
    this.model = model;
    logger.debug(`AI model set to: ${model}`);
  }
  
  /**
   * Set max tokens
   * @param maxTokens Max tokens
   */
  public setMaxTokens(maxTokens: number): void {
    this.maxTokens = maxTokens;
    logger.debug(`Max tokens set to: ${maxTokens}`);
  }
  
  /**
   * Set temperature
   * @param temperature Temperature
   */
  public setTemperature(temperature: number): void {
    this.temperature = temperature;
    logger.debug(`Temperature set to: ${temperature}`);
  }
  
  /**
   * Generate code
   * @param prompt Prompt
   * @returns Promise resolving to generated code
   */
  public async generateCode(prompt: string): Promise<string> {
    try {
      logger.debug('Generating code with AI', { prompt });
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a TypeScript/JavaScript expert specializing in test automation with Playwright. Generate clean, well-documented, and efficient test code following best practices. Include detailed explanations as comments. Structure your answer in a clear format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature
      });
      
      return response.choices[0].message.content || 'No code generated';
    } catch (error) {
      logger.error('Error generating code with AI', { error });
      throw error;
    }
  }
  
  /**
   * Generate analysis
   * @param prompt Prompt
   * @returns Promise resolving to generated analysis
   */
  public async generateAnalysis(prompt: string): Promise<string> {
    try {
      logger.debug('Generating analysis with AI', { prompt });
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant specialized in analyzing test results, API responses, and test data. Provide detailed, actionable insights and recommendations based on the information provided.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature
      });
      
      return response.choices[0].message.content || 'No analysis generated';
    } catch (error) {
      logger.error('Error generating analysis with AI', { error });
      throw error;
    }
  }
  
  /**
   * Validate JSON schema
   * @param data Data to validate
   * @param schemaDescription Schema description
   * @returns Promise resolving to validation result
   */
  public async validateJSONSchema(data: any, schemaDescription: string): Promise<{ valid: boolean; issues: string[] }> {
    try {
      logger.debug('Validating JSON schema with AI', { schemaDescription });
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a JSON Schema validator. Validate the provided JSON data against the described schema requirements. Return a JSON object with "valid" (boolean) and "issues" (array of strings describing any validation issues found).'
          },
          {
            role: 'user',
            content: `
              Schema Description: ${schemaDescription}
              
              JSON Data: ${JSON.stringify(data, null, 2)}
              
              Validate this JSON data against the schema description and return a JSON object with "valid" (boolean) and "issues" (array of strings).
            `
          }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });
      
      const result = JSON.parse(response.choices[0].message.content || '{"valid": false, "issues": ["Failed to parse validation result"]}');
      return result;
    } catch (error) {
      logger.error('Error validating JSON schema with AI', { error });
      return { valid: false, issues: [`Error validating schema: ${error}`] };
    }
  }
  
  /**
   * Generate test data
   * @param prompt Prompt
   * @returns Promise resolving to generated test data
   */
  public async generateTestData(prompt: string): Promise<any> {
    try {
      logger.debug('Generating test data with AI', { prompt });
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a test data generator. Generate realistic test data based on the requirements. Return the data in a structured JSON format that can be directly used in tests.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });
      
      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      logger.error('Error generating test data with AI', { error });
      throw error;
    }
  }
  
  /**
   * Generate test strategy
   * @param prompt Prompt
   * @returns Promise resolving to generated test strategy
   */
  public async generateTestStrategy(prompt: string): Promise<string> {
    try {
      logger.debug('Generating test strategy with AI', { prompt });
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a test strategy consultant. Create comprehensive test strategies based on the requirements. Include test approach, test coverage, types of testing, test environments, test data strategy, and any other relevant aspects.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.7
      });
      
      return response.choices[0].message.content || 'No test strategy generated';
    } catch (error) {
      logger.error('Error generating test strategy with AI', { error });
      throw error;
    }
  }
  
  /**
   * Analyze test coverage
   * @param prompt Prompt
   * @returns Promise resolving to test coverage analysis
   */
  public async analyzeTestCoverage(prompt: string): Promise<string> {
    try {
      logger.debug('Analyzing test coverage with AI', { prompt });
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a test coverage analyzer. Evaluate the provided test coverage information and suggest improvements. Consider edge cases, risk areas, and untested functionality.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.7
      });
      
      return response.choices[0].message.content || 'No coverage analysis generated';
    } catch (error) {
      logger.error('Error analyzing test coverage with AI', { error });
      throw error;
    }
  }
  
  /**
   * Analyze test results
   * @param results Test results
   * @returns Promise resolving to test results analysis
   */
  public async analyzeTestResults(results: any): Promise<string> {
    try {
      logger.debug('Analyzing test results with AI');
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a test results analyzer. Provide insights on test execution results, identify patterns in failures, and suggest potential root causes and next steps.'
          },
          {
            role: 'user',
            content: `Analyze the following test results and provide insights:\n\n${JSON.stringify(results, null, 2)}`
          }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.7
      });
      
      return response.choices[0].message.content || 'No results analysis generated';
    } catch (error) {
      logger.error('Error analyzing test results with AI', { error });
      throw error;
    }
  }
  
  /**
   * Generate bug report
   * @param testInfo Test information
   * @param error Error
   * @returns Promise resolving to generated bug report
   */
  public async generateBugReport(testInfo: any, error: any): Promise<string> {
    try {
      logger.debug('Generating bug report with AI');
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a bug report generator. Create detailed, actionable bug reports based on test failures. Include steps to reproduce, expected vs actual results, environment details, and any other relevant information.'
          },
          {
            role: 'user',
            content: `
              Generate a comprehensive bug report based on this test failure:
              
              Test Information: ${JSON.stringify(testInfo, null, 2)}
              
              Error: ${JSON.stringify(error, null, 2)}
            `
          }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.7
      });
      
      return response.choices[0].message.content || 'No bug report generated';
    } catch (error) {
      logger.error('Error generating bug report with AI', { error });
      throw error;
    }
  }
  
  /**
   * Save AI response to file
   * @param content Content
   * @param filename Filename
   * @returns Promise resolving to file path
   */
  public async saveResponseToFile(content: string, filename: string): Promise<string> {
    try {
      const reportsDir = path.join(process.cwd(), 'reports', 'ai');
      
      // Create reports directory if it doesn't exist
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      // Generate file path
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filePath = path.join(reportsDir, `${filename}_${timestamp}.txt`);
      
      // Write content to file
      fs.writeFileSync(filePath, content);
      
      logger.debug(`AI response saved to file: ${filePath}`);
      
      return filePath;
    } catch (error) {
      logger.error('Error saving AI response to file', { error });
      throw error;
    }
  }
}