import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { logger } from './logger';
import { allureReporter } from './allureReporter';
import { configReader } from './configReader';
import fs from 'fs';
import path from 'path';

/**
 * API Helper class for making API requests
 */
export class ApiHelper {
  private axiosInstance: AxiosInstance;
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private requestLogs: boolean;

  /**
   * Initialize API helper
   * @param baseUrl - Base URL for API requests (optional)
   * @param headers - Default headers for API requests (optional)
   * @param timeout - Timeout for API requests in milliseconds (optional)
   */
  constructor(
    baseUrl?: string,
    headers?: Record<string, string>,
    timeout?: number
  ) {
    // Get base URL from config if not provided
    this.baseUrl = baseUrl || configReader.getValue<string>('api.baseUrl', process.env.API_BASE_URL || '');
    
    // Get default timeout from config if not provided
    const apiTimeout = timeout || configReader.getValue<number>('api.timeout', 30000);
    
    // Get default headers from config if not provided
    this.defaultHeaders = headers || configReader.getValue<Record<string, string>>('api.headers', {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    // Enable request logs by default
    this.requestLogs = configReader.getValue<boolean>('api.requestLogs', true);
    
    // Create axios instance with default config
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: apiTimeout,
      headers: this.defaultHeaders
    });
    
    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.requestLogs) {
          logger.info(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
          if (config.data) {
            logger.debug(`Request Body: ${JSON.stringify(config.data)}`);
          }
          if (config.headers) {
            const safeHeaders = { ...config.headers };
            // Mask sensitive headers
            if (safeHeaders['Authorization']) {
              safeHeaders['Authorization'] = '***MASKED***';
            }
            logger.debug(`Request Headers: ${JSON.stringify(safeHeaders)}`);
          }
        }
        return config;
      },
      (error) => {
        logger.error(`API Request Error: ${error}`);
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (this.requestLogs) {
          logger.info(`API Response: ${response.status} ${response.statusText}`);
          logger.debug(`Response Data: ${JSON.stringify(response.data)}`);
        }
        return response;
      },
      (error) => {
        if (error.response) {
          logger.error(`API Response Error: ${error.response.status} ${error.response.statusText}`);
          logger.error(`Response Data: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          logger.error(`API No Response Error: ${error.message}`);
        } else {
          logger.error(`API Request Setup Error: ${error.message}`);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authorization token
   * @param token - Authorization token
   * @param prefix - Token prefix (default: 'Bearer')
   */
  setAuthToken(token: string, prefix: string = 'Bearer'): void {
    this.defaultHeaders['Authorization'] = `${prefix} ${token}`;
    this.axiosInstance.defaults.headers.common['Authorization'] = `${prefix} ${token}`;
    logger.debug('Authorization token set');
  }

  /**
   * Clear authorization token
   */
  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
    delete this.axiosInstance.defaults.headers.common['Authorization'];
    logger.debug('Authorization token cleared');
  }

  /**
   * Set base URL
   * @param baseUrl - Base URL for API requests
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
    this.axiosInstance.defaults.baseURL = baseUrl;
    logger.debug(`Base URL set to: ${baseUrl}`);
  }

  /**
   * Set default headers
   * @param headers - Default headers for API requests
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
    this.axiosInstance.defaults.headers.common = { ...this.axiosInstance.defaults.headers.common, ...headers };
    logger.debug(`Default headers updated: ${JSON.stringify(headers)}`);
  }

  /**
   * Get request
   * @param url - Request URL
   * @param params - Request parameters
   * @param config - Axios request config
   * @returns Promise with response
   */
  async get<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return await allureReporter.step(`GET request to ${url}`, async () => {
      try {
        const response = await this.axiosInstance.get<T>(url, { ...config, params });
        this.saveResponseForAllure('GET', url, undefined, response);
        return response;
      } catch (error) {
        this.handleApiError('GET', url, undefined, error);
        throw error;
      }
    });
  }

  /**
   * Post request
   * @param url - Request URL
   * @param data - Request body
   * @param config - Axios request config
   * @returns Promise with response
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return await allureReporter.step(`POST request to ${url}`, async () => {
      try {
        const response = await this.axiosInstance.post<T>(url, data, config);
        this.saveResponseForAllure('POST', url, data, response);
        return response;
      } catch (error) {
        this.handleApiError('POST', url, data, error);
        throw error;
      }
    });
  }

  /**
   * Put request
   * @param url - Request URL
   * @param data - Request body
   * @param config - Axios request config
   * @returns Promise with response
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return await allureReporter.step(`PUT request to ${url}`, async () => {
      try {
        const response = await this.axiosInstance.put<T>(url, data, config);
        this.saveResponseForAllure('PUT', url, data, response);
        return response;
      } catch (error) {
        this.handleApiError('PUT', url, data, error);
        throw error;
      }
    });
  }

  /**
   * Patch request
   * @param url - Request URL
   * @param data - Request body
   * @param config - Axios request config
   * @returns Promise with response
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return await allureReporter.step(`PATCH request to ${url}`, async () => {
      try {
        const response = await this.axiosInstance.patch<T>(url, data, config);
        this.saveResponseForAllure('PATCH', url, data, response);
        return response;
      } catch (error) {
        this.handleApiError('PATCH', url, data, error);
        throw error;
      }
    });
  }

  /**
   * Delete request
   * @param url - Request URL
   * @param config - Axios request config
   * @returns Promise with response
   */
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return await allureReporter.step(`DELETE request to ${url}`, async () => {
      try {
        const response = await this.axiosInstance.delete<T>(url, config);
        this.saveResponseForAllure('DELETE', url, undefined, response);
        return response;
      } catch (error) {
        this.handleApiError('DELETE', url, undefined, error);
        throw error;
      }
    });
  }

  /**
   * Upload file
   * @param url - Request URL
   * @param filePath - Path to file
   * @param fileField - File field name
   * @param additionalFields - Additional form fields
   * @param config - Axios request config
   * @returns Promise with response
   */
  async uploadFile<T = any>(
    url: string,
    filePath: string,
    fileField: string = 'file',
    additionalFields?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return await allureReporter.step(`Upload file to ${url}`, async () => {
      try {
        // Create form data
        const formData = new FormData();
        
        // Add file to form data
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        const fileBlob = new Blob([fileBuffer]);
        formData.append(fileField, fileBlob, fileName);
        
        // Add additional fields to form data
        if (additionalFields) {
          Object.entries(additionalFields).forEach(([key, value]) => {
            formData.append(key, value);
          });
        }
        
        // Set headers for file upload
        const uploadConfig: AxiosRequestConfig = {
          ...config,
          headers: {
            ...this.defaultHeaders,
            ...config?.headers,
            'Content-Type': 'multipart/form-data'
          }
        };
        
        // Make request
        const response = await this.axiosInstance.post<T>(url, formData, uploadConfig);
        this.saveResponseForAllure('UPLOAD', url, { filePath, additionalFields }, response);
        return response;
      } catch (error) {
        this.handleApiError('UPLOAD', url, { filePath, additionalFields }, error);
        throw error;
      }
    });
  }

  /**
   * Download file
   * @param url - Request URL
   * @param filePath - Path to save file
   * @param config - Axios request config
   * @returns Promise with file path
   */
  async downloadFile(
    url: string,
    filePath: string,
    config?: AxiosRequestConfig
  ): Promise<string> {
    return await allureReporter.step(`Download file from ${url}`, async () => {
      try {
        // Set response type to arraybuffer
        const downloadConfig: AxiosRequestConfig = {
          ...config,
          responseType: 'arraybuffer'
        };
        
        // Make request
        const response = await this.axiosInstance.get(url, downloadConfig);
        
        // Create directory if it doesn't exist
        const directory = path.dirname(filePath);
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory, { recursive: true });
        }
        
        // Save file
        fs.writeFileSync(filePath, response.data);
        
        logger.info(`File downloaded to: ${filePath}`);
        
        // Add file to allure report
        allureReporter.attachment(
          'Downloaded File',
          fs.readFileSync(filePath),
          path.extname(filePath).replace('.', '')
        );
        
        return filePath;
      } catch (error) {
        this.handleApiError('DOWNLOAD', url, { filePath }, error);
        throw error;
      }
    });
  }

  /**
   * Handle API error
   * @param method - Request method
   * @param url - Request URL
   * @param data - Request data
   * @param error - Error object
   */
  private handleApiError(method: string, url: string, data: any, error: any): void {
    // Create error details for allure report
    const errorDetails = {
      method,
      url,
      data,
      error: {
        message: error.message,
        stack: error.stack,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : null
      }
    };
    
    // Attach error details to allure report
    allureReporter.attachment(
      `${method} ${url} Error`,
      JSON.stringify(errorDetails, null, 2),
      'application/json'
    );
  }

  /**
   * Save API response for allure report
   * @param method - Request method
   * @param url - Request URL
   * @param requestData - Request data
   * @param response - Response object
   */
  private saveResponseForAllure(
    method: string,
    url: string,
    requestData: any,
    response: AxiosResponse
  ): void {
    // Create request details
    const requestDetails = {
      method,
      url,
      data: requestData,
      headers: this.maskSensitiveHeaders(response.config.headers || {})
    };
    
    // Create response details
    const responseDetails = {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    };
    
    // Attach request details to allure report
    allureReporter.attachment(
      `${method} ${url} Request`,
      JSON.stringify(requestDetails, null, 2),
      'application/json'
    );
    
    // Attach response details to allure report
    allureReporter.attachment(
      `${method} ${url} Response`,
      JSON.stringify(responseDetails, null, 2),
      'application/json'
    );
  }

  /**
   * Mask sensitive headers
   * @param headers - Headers object
   * @returns Masked headers object
   */
  private maskSensitiveHeaders(headers: Record<string, any>): Record<string, any> {
    const maskedHeaders = { ...headers };
    
    // List of sensitive headers to mask
    const sensitiveHeaders = [
      'authorization',
      'x-api-key',
      'api-key',
      'x-auth-token',
      'cookie',
      'set-cookie'
    ];
    
    // Mask sensitive headers
    Object.keys(maskedHeaders).forEach(key => {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        maskedHeaders[key] = '***MASKED***';
      }
    });
    
    return maskedHeaders;
  }
}

// Export singleton instance
export const apiHelper = new ApiHelper();