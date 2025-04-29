import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiConfig } from '../config/api.config';
import { logger } from '../../core/logger';
import { allureReporter } from '../../core/reporter/allure.reporter';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  public status: number;
  public data: any;
  public headers: any;
  public request: any;
  public source?: string;

  /**
   * Initialize API error
   * @param message Error message
   * @param status HTTP status code
   * @param data Response data
   * @param headers Response headers
   * @param request Request details
   * @param source Source of the error
   */
  constructor(
    message: string,
    status: number = 0,
    data: any = null,
    headers: any = null,
    request: any = null,
    source?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.headers = headers;
    this.request = request;
    this.source = source;
  }
}

/**
 * API Response type
 */
export interface ApiResponse<T = any> {
  status: number;
  data: T;
  headers: any;
  request: {
    method: string;
    url: string;
    headers: any;
    data?: any;
  };
  responseTime: number;
}

/**
 * API Helper class for making API requests
 * Includes comprehensive logging, error handling, and performance tracking
 */
class ApiHelper {
  private axios: AxiosInstance;
  private baseUrl: string;

  /**
   * Initialize API helper
   */
  constructor() {
    this.baseUrl = apiConfig.getBaseUrl();
    
    // Create Axios instance
    this.axios = axios.create({
      baseURL: this.baseUrl,
      timeout: apiConfig.getTimeout(),
      headers: apiConfig.getDefaultHeaders()
    });
    
    // Add request interceptor for logging
    this.axios.interceptors.request.use(
      (config) => {
        // Log request details
        const method = config.method?.toUpperCase() || 'UNKNOWN';
        const url = config.url || 'Unknown URL';
        logger.info(`API Request: ${method} ${url}`);
        logger.debug(`Request Headers: ${JSON.stringify(config.headers)}`);
        logger.debug(`Request Data: ${JSON.stringify(config.data)}`);
        
        // Add timestamp for performance tracking
        config.headers = config.headers || {};
        config.headers['request-start-time'] = Date.now().toString();
        
        return config;
      },
      (error) => {
        logger.error(`API Request Error: ${error.message}`);
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for logging
    this.axios.interceptors.response.use(
      (response) => {
        // Calculate response time
        const requestStartTime = parseInt(response.config.headers['request-start-time'] || Date.now().toString());
        const responseTime = Date.now() - requestStartTime;
        
        // Log response details
        const method = response.config.method?.toUpperCase() || 'UNKNOWN';
        const url = response.config.url || 'Unknown URL';
        logger.info(`API Response: ${method} ${url} ${response.status} ${responseTime}ms`);
        
        if (responseTime > 1000) {
          logger.warn(`Slow API Response: ${method} ${url} took ${responseTime}ms`);
        }
        
        logger.debug(`Response Headers: ${JSON.stringify(response.headers)}`);
        logger.debug(`Response Data: ${JSON.stringify(response.data)}`);
        
        return response;
      },
      (error: AxiosError) => {
        // Calculate response time even for errors
        const requestStartTime = parseInt(error.config?.headers?.['request-start-time']?.toString() || Date.now().toString());
        const responseTime = Date.now() - requestStartTime;
        
        // Log error details
        const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
        const url = error.config?.url || 'Unknown URL';
        const status = error.response?.status || 0;
        
        logger.error(`API Error: ${method} ${url} ${status} ${responseTime}ms - ${error.message}`);
        logger.debug(`Error Details: ${JSON.stringify(error.response?.data)}`);
        
        // Create custom API error
        const apiError = new ApiError(
          error.message,
          error.response?.status,
          error.response?.data,
          error.response?.headers,
          {
            method,
            url,
            headers: error.config?.headers,
            data: error.config?.data
          },
          'axios'
        );
        
        return Promise.reject(apiError);
      }
    );
    
    logger.info('API Helper initialized');
  }

  /**
   * Set base URL for API requests
   * @param url Base URL
   */
  public setBaseUrl(url: string): void {
    this.baseUrl = url;
    this.axios.defaults.baseURL = url;
    logger.info(`Base URL set to: ${url}`);
  }

  /**
   * Get base URL for API requests
   * @returns Base URL
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Set request header
   * @param name Header name
   * @param value Header value
   */
  public setHeader(name: string, value: string): void {
    this.axios.defaults.headers.common[name] = value;
    logger.info(`Set header ${name}`);
  }

  /**
   * Set authorization header
   * @param token Authorization token
   * @param prefix Token prefix (e.g., 'Bearer')
   */
  public setAuthToken(token: string, prefix: string = 'Bearer'): void {
    this.setHeader('Authorization', `${prefix} ${token}`);
    logger.info('Set authorization token');
  }

  /**
   * Make a GET request
   * @param url API endpoint
   * @param config Axios request config
   * @returns Promise resolving to API response
   */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  /**
   * Make a POST request
   * @param url API endpoint
   * @param data Request data
   * @param config Axios request config
   * @returns Promise resolving to API response
   */
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  /**
   * Make a PUT request
   * @param url API endpoint
   * @param data Request data
   * @param config Axios request config
   * @returns Promise resolving to API response
   */
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  /**
   * Make a PATCH request
   * @param url API endpoint
   * @param data Request data
   * @param config Axios request config
   * @returns Promise resolving to API response
   */
  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }

  /**
   * Make a DELETE request
   * @param url API endpoint
   * @param config Axios request config
   * @returns Promise resolving to API response
   */
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  /**
   * Generic request method
   * @param method HTTP method
   * @param url API endpoint
   * @param data Request data
   * @param config Axios request config
   * @returns Promise resolving to API response
   */
  public async request<T = any>(
    method: string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    // Start API step in Allure report
    allureReporter.startStep(`API ${method} ${url}`);
    
    try {
      // Create request config
      const requestConfig: AxiosRequestConfig = {
        ...config,
        method,
        url,
        data
      };
      
      // Attach request details to Allure report
      allureReporter.addAttachment(
        'Request',
        JSON.stringify({
          method,
          url: this.baseUrl + url,
          headers: { ...this.axios.defaults.headers.common, ...config?.headers },
          data
        }, null, 2),
        'application/json'
      );
      
      // Make request and track time
      const startTime = Date.now();
      const response: AxiosResponse<T> = await this.axios.request(requestConfig);
      const responseTime = Date.now() - startTime;
      
      // Create custom response object
      const apiResponse: ApiResponse<T> = {
        status: response.status,
        data: response.data,
        headers: response.headers,
        request: {
          method,
          url: this.baseUrl + url,
          headers: { ...this.axios.defaults.headers.common, ...config?.headers },
          data
        },
        responseTime
      };
      
      // Attach response details to Allure report
      allureReporter.addAttachment(
        'Response',
        JSON.stringify({
          status: response.status,
          headers: response.headers,
          data: response.data,
          responseTime: `${responseTime}ms`
        }, null, 2),
        'application/json'
      );
      
      // End API step in Allure report
      allureReporter.endStep('passed');
      
      return apiResponse;
    } catch (error) {
      // Log error and end API step in Allure report
      logger.error(`API Request Error: ${error.message}`);
      
      // Attach error details to Allure report
      allureReporter.addAttachment(
        'Error',
        JSON.stringify(error instanceof ApiError ? {
          message: error.message,
          status: error.status,
          data: error.data
        } : {
          message: error.message
        }, null, 2),
        'application/json'
      );
      
      allureReporter.endStep('failed');
      
      // Rethrow error
      throw error;
    }
  }

  /**
   * Retry a request multiple times
   * @param requestFn Function that makes the request
   * @param retries Maximum number of retries
   * @param delay Delay between retries in milliseconds
   * @returns Promise resolving to API response
   */
  public async retry<T = any>(
    requestFn: () => Promise<ApiResponse<T>>,
    retries: number = apiConfig.getRetryCount(),
    delay: number = apiConfig.getRetryDelay()
  ): Promise<ApiResponse<T>> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        logger.info(`Request attempt ${attempt}/${retries + 1}`);
        return await requestFn();
      } catch (error) {
        lastError = error;
        logger.warn(`Request attempt ${attempt} failed: ${error.message}`);
        
        // Only delay and retry if this isn't the last attempt
        if (attempt <= retries) {
          logger.info(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All retries failed
    logger.error(`All ${retries + 1} request attempts failed`);
    throw lastError;
  }

  /**
   * Download a file
   * @param url File URL
   * @param config Axios request config
   * @returns Promise resolving to file buffer
   */
  public async downloadFile(url: string, config?: AxiosRequestConfig): Promise<Buffer> {
    allureReporter.startStep(`Download file: ${url}`);
    
    try {
      // Set response type to arraybuffer
      const requestConfig: AxiosRequestConfig = {
        ...config,
        responseType: 'arraybuffer'
      };
      
      // Make request
      const response = await this.get<Buffer>(url, requestConfig);
      
      // Log success
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const contentLength = response.headers['content-length'] || 'unknown';
      logger.info(`File downloaded: ${url} (${contentType}, ${contentLength} bytes)`);
      
      allureReporter.endStep('passed');
      
      return response.data;
    } catch (error) {
      logger.error(`File download error: ${error.message}`);
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Upload a file
   * @param url Upload URL
   * @param file File buffer
   * @param filename Filename
   * @param fieldName Form field name
   * @param config Axios request config
   * @returns Promise resolving to API response
   */
  public async uploadFile<T = any>(
    url: string,
    file: Buffer,
    filename: string,
    fieldName: string = 'file',
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    allureReporter.startStep(`Upload file: ${filename} to ${url}`);
    
    try {
      // Create form data
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append(fieldName, file, { filename });
      
      // Set headers
      const requestConfig: AxiosRequestConfig = {
        ...config,
        headers: {
          ...config?.headers,
          ...formData.getHeaders()
        }
      };
      
      // Make request
      const response = await this.post<T>(url, formData, requestConfig);
      
      // Log success
      logger.info(`File uploaded: ${filename} to ${url}`);
      
      allureReporter.endStep('passed');
      
      return response;
    } catch (error) {
      logger.error(`File upload error: ${error.message}`);
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Check if an API is available (health check)
   * @param url Health check URL
   * @param expectedStatus Expected HTTP status code
   * @returns Promise resolving to true if API is available
   */
  public async isAvailable(url: string = '/health', expectedStatus: number = 200): Promise<boolean> {
    try {
      const response = await this.get(url);
      const isAvailable = response.status === expectedStatus;
      
      if (isAvailable) {
        logger.info(`API is available: ${this.baseUrl}${url}`);
      } else {
        logger.warn(`API health check returned unexpected status: ${response.status} (expected ${expectedStatus})`);
      }
      
      return isAvailable;
    } catch (error) {
      logger.error(`API health check failed: ${error.message}`);
      return false;
    }
  }
}

// Create singleton instance
export const apiHelper = new ApiHelper();