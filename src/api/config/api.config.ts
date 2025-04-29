import { configReader } from '../../core/utils/config.reader';

/**
 * API Configuration class for managing API endpoints and settings
 */
class ApiConfig {
  private baseUrl: string;
  private timeout: number;
  private retryCount: number;
  private retryDelay: number;
  private defaultHeaders: Record<string, string>;
  private environments: Record<string, string>;

  /**
   * Initialize API configuration
   */
  constructor() {
    // Load base configuration
    this.baseUrl = configReader.getEnv('API_BASE_URL', 'https://jsonplaceholder.typicode.com');
    this.timeout = parseInt(configReader.getEnv('API_TIMEOUT', '30000'));
    this.retryCount = parseInt(configReader.getEnv('API_RETRY_COUNT', '3'));
    this.retryDelay = parseInt(configReader.getEnv('API_RETRY_DELAY', '1000'));
    
    // Default headers for API requests
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'PlayRaft-API-Test-Framework/1.0',
    };
    
    // API environments
    this.environments = {
      local: 'http://localhost:3000',
      dev: 'https://dev-api.example.com',
      staging: 'https://staging-api.example.com',
      prod: 'https://api.example.com',
      jsonplaceholder: 'https://jsonplaceholder.typicode.com',
      reqres: 'https://reqres.in/api',
      httpbin: 'https://httpbin.org'
    };
  }

  /**
   * Get the base URL for API requests
   * @returns Base URL
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Set the base URL for API requests
   * @param url Base URL
   */
  public setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Get the timeout for API requests
   * @returns Timeout in milliseconds
   */
  public getTimeout(): number {
    return this.timeout;
  }

  /**
   * Set the timeout for API requests
   * @param timeout Timeout in milliseconds
   */
  public setTimeout(timeout: number): void {
    this.timeout = timeout;
  }

  /**
   * Get the retry count for API requests
   * @returns Retry count
   */
  public getRetryCount(): number {
    return this.retryCount;
  }

  /**
   * Set the retry count for API requests
   * @param count Retry count
   */
  public setRetryCount(count: number): void {
    this.retryCount = count;
  }

  /**
   * Get the retry delay for API requests
   * @returns Retry delay in milliseconds
   */
  public getRetryDelay(): number {
    return this.retryDelay;
  }

  /**
   * Set the retry delay for API requests
   * @param delay Retry delay in milliseconds
   */
  public setRetryDelay(delay: number): void {
    this.retryDelay = delay;
  }

  /**
   * Get default headers for API requests
   * @returns Default headers
   */
  public getDefaultHeaders(): Record<string, string> {
    return { ...this.defaultHeaders };
  }

  /**
   * Set a default header for API requests
   * @param name Header name
   * @param value Header value
   */
  public setDefaultHeader(name: string, value: string): void {
    this.defaultHeaders[name] = value;
  }

  /**
   * Remove a default header for API requests
   * @param name Header name
   */
  public removeDefaultHeader(name: string): void {
    delete this.defaultHeaders[name];
  }

  /**
   * Get an environment URL by name
   * @param name Environment name
   * @returns Environment URL
   */
  public getEnvironmentUrl(name: string): string {
    return this.environments[name] || this.baseUrl;
  }

  /**
   * Set an environment URL
   * @param name Environment name
   * @param url Environment URL
   */
  public setEnvironmentUrl(name: string, url: string): void {
    this.environments[name] = url;
  }

  /**
   * Get all environments
   * @returns All environments
   */
  public getEnvironments(): Record<string, string> {
    return { ...this.environments };
  }

  /**
   * Switch to a different environment
   * @param name Environment name
   * @returns Base URL for the environment
   */
  public switchEnvironment(name: string): string {
    const url = this.getEnvironmentUrl(name);
    this.setBaseUrl(url);
    return url;
  }

  /**
   * Get the full URL for an endpoint
   * @param endpoint API endpoint
   * @returns Full URL
   */
  public getFullUrl(endpoint: string): string {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`;
    const path = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return `${base}${path}`;
  }

  /**
   * Get API configuration object for use in API clients
   * @returns API configuration object
   */
  public getConfig(): Record<string, any> {
    return {
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      retryCount: this.retryCount,
      retryDelay: this.retryDelay,
      defaultHeaders: this.getDefaultHeaders(),
      environments: this.getEnvironments()
    };
  }
}

// Create singleton instance
export const apiConfig = new ApiConfig();