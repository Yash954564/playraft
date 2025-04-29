/**
 * API Helper
 * Utility for making API requests with advanced features
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../../utils/logger/logger';
import { AIHelper } from '../../ai/utils/ai.helper';

/**
 * API Helper class
 * Provides utilities for API testing with enhanced capabilities
 */
export class ApiHelper {
  private axiosInstance: AxiosInstance;
  private baseUrl: string;
  private aiHelper: AIHelper | null = null;
  
  // Default retry configuration
  private defaultRetryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    retryStatusCodes: [408, 429, 500, 502, 503, 504]
  };
  
  /**
   * Constructor
   * @param baseUrl Base URL for API requests
   * @param config Axios configuration
   */
  constructor(baseUrl: string, config: AxiosRequestConfig = {}) {
    this.baseUrl = baseUrl;
    
    // Initialize Axios instance with default configuration
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Hybrid-PyTest-Framework'
      },
      timeout: 30000,
      ...config
    });
    
    // Initialize request interceptor for logging
    this.initRequestInterceptor();
    
    // Initialize response interceptor for logging
    this.initResponseInterceptor();
    
    // Try to initialize AI helper if available
    this.initAiHelper();
    
    logger.debug(`ApiHelper initialized with base URL: ${baseUrl}`);
  }
  
  /**
   * Initialize AI helper
   */
  private initAiHelper(): void {
    try {
      this.aiHelper = new AIHelper();
      logger.debug('AI Helper initialized for API testing');
    } catch (error) {
      logger.warn('Failed to initialize AI Helper for API testing', { error });
    }
  }
  
  /**
   * Initialize request interceptor
   */
  private initRequestInterceptor(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
          params: config.params,
          data: config.data
        });
        return config;
      },
      (error) => {
        logger.error('API Request Error', { error });
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Initialize response interceptor
   */
  private initResponseInterceptor(): void {
    this.axiosInstance.interceptors.response.use(
      (response) => {
        logger.debug(`API Response: ${response.status} ${response.statusText}`, {
          headers: response.headers,
          data: response.data
        });
        return response;
      },
      (error) => {
        if (error.response) {
          logger.error(`API Response Error: ${error.response.status} ${error.response.statusText}`, {
            headers: error.response.headers,
            data: error.response.data
          });
        } else if (error.request) {
          logger.error('API Request Error: No response received', { request: error.request });
        } else {
          logger.error('API Error', { message: error.message });
        }
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Get the base URL
   * @returns Base URL
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }
  
  /**
   * Set the base URL
   * @param baseUrl Base URL
   */
  public setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
    this.axiosInstance.defaults.baseURL = baseUrl;
    logger.debug(`Base URL updated: ${baseUrl}`);
  }
  
  /**
   * Set a header
   * @param key Header key
   * @param value Header value
   */
  public setHeader(key: string, value: string): void {
    this.axiosInstance.defaults.headers.common[key] = value;
    logger.debug(`Header set: ${key}`);
  }
  
  /**
   * Remove a header
   * @param key Header key
   */
  public removeHeader(key: string): void {
    delete this.axiosInstance.defaults.headers.common[key];
    logger.debug(`Header removed: ${key}`);
  }
  
  /**
   * Set auth token
   * @param token Auth token
   * @param scheme Auth scheme (default: Bearer)
   */
  public setAuthToken(token: string, scheme: string = 'Bearer'): void {
    this.axiosInstance.defaults.headers.common['Authorization'] = `${scheme} ${token}`;
    logger.debug('Auth token set');
  }
  
  /**
   * Clear auth token
   */
  public clearAuthToken(): void {
    delete this.axiosInstance.defaults.headers.common['Authorization'];
    logger.debug('Auth token cleared');
  }
  
  /**
   * Make a GET request
   * @param url URL
   * @param config Axios request config
   * @returns Promise resolving to Axios response
   */
  public async get(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse> {
    try {
      return await this.axiosInstance.get(url, config);
    } catch (error) {
      logger.error(`GET request failed: ${url}`, { error });
      throw error;
    }
  }
  
  /**
   * Make a POST request
   * @param url URL
   * @param data Request data
   * @param config Axios request config
   * @returns Promise resolving to Axios response
   */
  public async post(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse> {
    try {
      return await this.axiosInstance.post(url, data, config);
    } catch (error) {
      logger.error(`POST request failed: ${url}`, { error });
      throw error;
    }
  }
  
  /**
   * Make a PUT request
   * @param url URL
   * @param data Request data
   * @param config Axios request config
   * @returns Promise resolving to Axios response
   */
  public async put(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse> {
    try {
      return await this.axiosInstance.put(url, data, config);
    } catch (error) {
      logger.error(`PUT request failed: ${url}`, { error });
      throw error;
    }
  }
  
  /**
   * Make a PATCH request
   * @param url URL
   * @param data Request data
   * @param config Axios request config
   * @returns Promise resolving to Axios response
   */
  public async patch(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse> {
    try {
      return await this.axiosInstance.patch(url, data, config);
    } catch (error) {
      logger.error(`PATCH request failed: ${url}`, { error });
      throw error;
    }
  }
  
  /**
   * Make a DELETE request
   * @param url URL
   * @param config Axios request config
   * @returns Promise resolving to Axios response
   */
  public async delete(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse> {
    try {
      return await this.axiosInstance.delete(url, config);
    } catch (error) {
      logger.error(`DELETE request failed: ${url}`, { error });
      throw error;
    }
  }
  
  /**
   * Make a request with retry
   * @param method HTTP method
   * @param url URL
   * @param data Request data
   * @param config Axios request config
   * @param retryConfig Retry configuration
   * @returns Promise resolving to Axios response
   */
  public async requestWithRetry(
    method: string,
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {},
    retryConfig = this.defaultRetryConfig
  ): Promise<AxiosResponse> {
    const { maxRetries, retryDelay, retryStatusCodes } = retryConfig;
    
    let lastError;
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        let response;
        
        switch (method.toLowerCase()) {
          case 'get':
            response = await this.get(url, config);
            break;
          case 'post':
            response = await this.post(url, data, config);
            break;
          case 'put':
            response = await this.put(url, data, config);
            break;
          case 'patch':
            response = await this.patch(url, data, config);
            break;
          case 'delete':
            response = await this.delete(url, config);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }
        
        return response;
      } catch (error: any) {
        lastError = error;
        
        const shouldRetry = (
          attempt <= maxRetries &&
          error.response &&
          retryStatusCodes.includes(error.response.status)
        );
        
        if (!shouldRetry) {
          break;
        }
        
        logger.warn(`Retrying ${method.toUpperCase()} request to ${url} (Attempt ${attempt}/${maxRetries + 1})`, {
          status: error.response?.status,
          statusText: error.response?.statusText
        });
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    throw lastError;
  }
  
  /**
   * Validate API response schema using AI
   * @param response API response
   * @param expectedSchema Expected schema description
   * @returns Promise resolving to validation result
   */
  public async validateSchemaWithAI(response: any, expectedSchema: string): Promise<{ valid: boolean; issues: string[] }> {
    if (!this.aiHelper) {
      logger.warn('AI Helper not available for schema validation');
      return { valid: true, issues: [] };
    }
    
    try {
      const result = await this.aiHelper.validateJSONSchema(response, expectedSchema);
      return result;
    } catch (error) {
      logger.error('Error validating schema with AI', { error });
      return { valid: false, issues: ['Failed to validate schema with AI'] };
    }
  }
  
  /**
   * Generate test cases for an API endpoint using AI
   * @param endpoint API endpoint
   * @param method HTTP method
   * @param description Endpoint description
   * @returns Promise resolving to generated test cases
   */
  public async generateTestCasesWithAI(endpoint: string, method: string, description: string): Promise<string> {
    if (!this.aiHelper) {
      logger.warn('AI Helper not available for test case generation');
      return '// AI-powered test generation not available';
    }
    
    try {
      const prompt = `Generate TypeScript test cases for the following API endpoint:\n\nEndpoint: ${endpoint}\nMethod: ${method}\nDescription: ${description}\n\nPlease include positive and negative test cases using Playwright Test.`;
      
      const result = await this.aiHelper.generateCode(prompt);
      return result;
    } catch (error) {
      logger.error('Error generating test cases with AI', { error });
      return `// Failed to generate tests: ${error}`;
    }
  }
  
  /**
   * Analyze API response with AI
   * @param response API response
   * @returns Promise resolving to analysis
   */
  public async analyzeResponseWithAI(response: any): Promise<string> {
    if (!this.aiHelper) {
      logger.warn('AI Helper not available for response analysis');
      return 'AI analysis not available';
    }
    
    try {
      const prompt = `Analyze the following API response and provide insights:\n\n${JSON.stringify(response, null, 2)}\n\nPlease include information about the structure, any issues or anomalies, and recommendations.`;
      
      const result = await this.aiHelper.generateAnalysis(prompt);
      return result;
    } catch (error) {
      logger.error('Error analyzing response with AI', { error });
      return `Failed to analyze response: ${error}`;
    }
  }
  
  /**
   * Save response to file
   * @param response API response
   * @param filename Filename
   * @returns Promise resolving to file path
   */
  public async saveResponseToFile(response: any, filename: string): Promise<string> {
    try {
      const reportsDir = path.join(process.cwd(), 'reports', 'api');
      
      // Create reports directory if it doesn't exist
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      // Generate file path
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filePath = path.join(reportsDir, `${filename}_${timestamp}.json`);
      
      // Write response to file
      fs.writeFileSync(filePath, JSON.stringify(response.data, null, 2));
      
      logger.debug(`Response saved to file: ${filePath}`);
      
      return filePath;
    } catch (error) {
      logger.error('Error saving response to file', { error });
      throw error;
    }
  }
  
  /**
   * Measure API response time
   * @param url URL
   * @param config Axios request config
   * @param iterations Number of iterations (default: 3)
   * @returns Promise resolving to response time statistics
   */
  public async measureResponseTime(
    url: string,
    config: AxiosRequestConfig = {},
    iterations: number = 3
  ): Promise<{ min: number; max: number; avg: number; measurements: number[] }> {
    try {
      const measurements: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await this.get(url, config);
        const endTime = Date.now();
        
        const responseTime = endTime - startTime;
        measurements.push(responseTime);
      }
      
      const min = Math.min(...measurements);
      const max = Math.max(...measurements);
      const avg = measurements.reduce((sum, time) => sum + time, 0) / iterations;
      
      logger.debug(`Response time measurements for ${url}`, { min, max, avg, measurements });
      
      return { min, max, avg, measurements };
    } catch (error) {
      logger.error(`Error measuring response time for ${url}`, { error });
      throw error;
    }
  }
}