/**
 * API Helper
 * Utility for making API requests
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { logger } from '../../utils/logger/logger';
import { TestRetryHandler } from '../../utils/TestRetryHandler';

/**
 * API request configuration interface
 */
export interface ApiRequestConfig extends AxiosRequestConfig {
  method?: Method;
  url: string;
  data?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
}

/**
 * API Helper class
 * Provides methods for making API requests
 */
export class ApiHelper {
  private readonly axiosInstance: AxiosInstance;
  private baseUrl: string;
  private authToken: string | null = null;
  private readonly testRetryHandler: TestRetryHandler;
  
  /**
   * Constructor
   * @param baseUrl Base URL for API requests
   * @param timeout Request timeout in milliseconds
   */
  constructor(
    baseUrl: string = 'https://demoqa.com',
    timeout: number = 30000
  ) {
    this.baseUrl = baseUrl;
    
    // Create Axios instance
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Create test retry handler
    this.testRetryHandler = new TestRetryHandler({
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 5000,
      timeoutFactor: 1.5,
      jitterFactor: 0.2
    });
    
    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add auth token to request headers if available
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        
        // Log request
        logger.debug('API Request', {
          method: config.method,
          url: `${config.baseURL}${config.url}`,
          headers: config.headers,
          params: config.params,
          data: config.data
        });
        
        return config;
      },
      (error) => {
        // Log error
        logger.error('API Request Error', { error: String(error) });
        
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Log response
        logger.debug('API Response', {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data
        });
        
        return response;
      },
      (error) => {
        // Log error
        if (error.response) {
          // Server responded with an error status
          logger.error('API Response Error', {
            status: error.response.status,
            statusText: error.response.statusText,
            headers: error.response.headers,
            data: error.response.data
          });
        } else if (error.request) {
          // Request was made but no response received
          logger.error('API No Response Error', {
            request: error.request
          });
        } else {
          // Error in setting up the request
          logger.error('API Error', {
            error: String(error)
          });
        }
        
        return Promise.reject(error);
      }
    );
    
    logger.info('ApiHelper initialized');
  }
  
  /**
   * Set base URL
   * @param baseUrl Base URL for API requests
   */
  public setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
    this.axiosInstance.defaults.baseURL = baseUrl;
    
    logger.info(`Base URL set to: ${baseUrl}`);
  }
  
  /**
   * Get base URL
   * @returns Base URL
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }
  
  /**
   * Set authentication token
   * @param token Authentication token
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
    
    logger.info('Authentication token set');
  }
  
  /**
   * Get authentication token
   * @returns Authentication token
   */
  public getAuthToken(): string | null {
    return this.authToken;
  }
  
  /**
   * Clear authentication token
   */
  public clearAuthToken(): void {
    this.authToken = null;
    
    logger.info('Authentication token cleared');
  }
  
  /**
   * Make GET request
   * @param url Request URL
   * @param config Request configuration
   * @returns Promise resolving to response
   */
  public async get<T = any>(
    url: string,
    config: Omit<ApiRequestConfig, 'method' | 'url'> = {}
  ): Promise<AxiosResponse<T>> {
    // Create request configuration
    const requestConfig: ApiRequestConfig = {
      method: 'GET',
      url,
      ...config
    };
    
    // Make request with retries
    return await this.testRetryHandler.retryWithBackoff<AxiosResponse<T>>(
      async () => await this.request<T>(requestConfig),
      config.retries
    );
  }
  
  /**
   * Make POST request
   * @param url Request URL
   * @param data Request data
   * @param config Request configuration
   * @returns Promise resolving to response
   */
  public async post<T = any>(
    url: string,
    data?: any,
    config: Omit<ApiRequestConfig, 'method' | 'url' | 'data'> = {}
  ): Promise<AxiosResponse<T>> {
    // Create request configuration
    const requestConfig: ApiRequestConfig = {
      method: 'POST',
      url,
      data,
      ...config
    };
    
    // Make request with retries
    return await this.testRetryHandler.retryWithBackoff<AxiosResponse<T>>(
      async () => await this.request<T>(requestConfig),
      config.retries
    );
  }
  
  /**
   * Make PUT request
   * @param url Request URL
   * @param data Request data
   * @param config Request configuration
   * @returns Promise resolving to response
   */
  public async put<T = any>(
    url: string,
    data?: any,
    config: Omit<ApiRequestConfig, 'method' | 'url' | 'data'> = {}
  ): Promise<AxiosResponse<T>> {
    // Create request configuration
    const requestConfig: ApiRequestConfig = {
      method: 'PUT',
      url,
      data,
      ...config
    };
    
    // Make request with retries
    return await this.testRetryHandler.retryWithBackoff<AxiosResponse<T>>(
      async () => await this.request<T>(requestConfig),
      config.retries
    );
  }
  
  /**
   * Make DELETE request
   * @param url Request URL
   * @param config Request configuration
   * @returns Promise resolving to response
   */
  public async delete<T = any>(
    url: string,
    config: Omit<ApiRequestConfig, 'method' | 'url'> = {}
  ): Promise<AxiosResponse<T>> {
    // Create request configuration
    const requestConfig: ApiRequestConfig = {
      method: 'DELETE',
      url,
      ...config
    };
    
    // Make request with retries
    return await this.testRetryHandler.retryWithBackoff<AxiosResponse<T>>(
      async () => await this.request<T>(requestConfig),
      config.retries
    );
  }
  
  /**
   * Make PATCH request
   * @param url Request URL
   * @param data Request data
   * @param config Request configuration
   * @returns Promise resolving to response
   */
  public async patch<T = any>(
    url: string,
    data?: any,
    config: Omit<ApiRequestConfig, 'method' | 'url' | 'data'> = {}
  ): Promise<AxiosResponse<T>> {
    // Create request configuration
    const requestConfig: ApiRequestConfig = {
      method: 'PATCH',
      url,
      data,
      ...config
    };
    
    // Make request with retries
    return await this.testRetryHandler.retryWithBackoff<AxiosResponse<T>>(
      async () => await this.request<T>(requestConfig),
      config.retries
    );
  }
  
  /**
   * Make API request
   * @param config Request configuration
   * @returns Promise resolving to response
   */
  public async request<T = any>(config: ApiRequestConfig): Promise<AxiosResponse<T>> {
    try {
      // Make request
      const response = await this.axiosInstance.request<T>({
        method: config.method as Method,
        url: config.url,
        data: config.data,
        headers: config.headers,
        params: config.params,
        timeout: config.timeout
      });
      
      return response;
    } catch (error) {
      // Log error
      logger.error('API Request Failed', { error: String(error) });
      
      throw error;
    }
  }
  
  /**
   * Health check
   * @returns Promise resolving to health check status
   */
  public async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      // Make request to health check endpoint
      await this.get('/health');
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // Log error
      logger.error('Health Check Failed', { error: String(error) });
      
      return {
        status: 'error',
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Get performance metrics
   * @param url Request URL
   * @param method Request method
   * @param iterations Number of iterations
   * @returns Promise resolving to performance metrics
   */
  public async getPerformanceMetrics(
    url: string,
    method: Method = 'GET',
    iterations: number = 5
  ): Promise<{
    url: string;
    method: Method;
    minResponseTime: number;
    maxResponseTime: number;
    avgResponseTime: number;
    median: number;
    successRate: number;
  }> {
    // Create array to store response times
    const responseTimes: number[] = [];
    let successCount = 0;
    
    // Make requests
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      try {
        // Make request
        await this.request({
          method,
          url
        });
        
        // Calculate response time
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // Add response time to array
        responseTimes.push(responseTime);
        
        // Increment success count
        successCount++;
      } catch (error) {
        // Log error
        logger.error(`Performance Metrics Failed (Iteration ${i + 1})`, { error: String(error) });
      }
    }
    
    // Sort response times
    responseTimes.sort((a, b) => a - b);
    
    // Calculate metrics
    const minResponseTime = responseTimes.length > 0 ? responseTimes[0] : 0;
    const maxResponseTime = responseTimes.length > 0 ? responseTimes[responseTimes.length - 1] : 0;
    const avgResponseTime = responseTimes.length > 0 ?
      responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0;
    
    // Calculate median
    const median = responseTimes.length > 0 ?
      (responseTimes.length % 2 === 0 ?
        (responseTimes[responseTimes.length / 2 - 1] + responseTimes[responseTimes.length / 2]) / 2 :
        responseTimes[Math.floor(responseTimes.length / 2)]) : 0;
    
    // Calculate success rate
    const successRate = iterations > 0 ? (successCount / iterations) * 100 : 0;
    
    return {
      url,
      method,
      minResponseTime,
      maxResponseTime,
      avgResponseTime,
      median,
      successRate
    };
  }
}

// Export API helper instance
export const apiHelper = new ApiHelper();