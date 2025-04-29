import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

/**
 * Configuration reader class for loading and accessing configuration
 * from environment variables, .env files, and JSON config files
 */
class ConfigReader {
  private envConfig: Record<string, string> = {};
  private jsonConfig: Record<string, any> = {};

  /**
   * Initialize the config reader
   */
  constructor() {
    // Load environment variables from .env file if present
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        this.envConfig = { ...envConfig };
        console.log(`Loaded environment variables from ${envPath}`);
      }
    } catch (error) {
      console.error(`Error loading .env file: ${error.message}`);
    }

    // Load JSON configuration if present
    try {
      const configPath = path.resolve(process.cwd(), 'config', 'config.json');
      if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, 'utf8');
        this.jsonConfig = JSON.parse(configData);
        console.log(`Loaded configuration from ${configPath}`);
      }
    } catch (error) {
      console.error(`Error loading config.json: ${error.message}`);
    }
  }

  /**
   * Get environment variable value
   * @param key Environment variable key
   * @param defaultValue Default value if key is not found
   * @returns Environment variable value or default value
   */
  public getEnv(key: string, defaultValue?: string): string {
    // Check process.env first (highest priority)
    if (process.env[key] !== undefined) {
      return process.env[key]!;
    }
    
    // Check .env file config
    if (this.envConfig[key] !== undefined) {
      return this.envConfig[key];
    }
    
    // Return default value if provided
    return defaultValue || '';
  }

  /**
   * Get configuration value from config.json
   * @param key Configuration key (supports dot notation for nested properties)
   * @param defaultValue Default value if key is not found
   * @returns Configuration value or default value
   */
  public getConfig<T>(key: string, defaultValue?: T): T {
    // Split key by dots to support nested properties
    const keys = key.split('.');
    let value: any = this.jsonConfig;
    
    // Traverse the config object
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue as T;
      }
    }
    
    return value !== undefined ? value : defaultValue as T;
  }

  /**
   * Get boolean configuration value
   * @param key Configuration key
   * @param defaultValue Default value if key is not found
   * @returns Boolean configuration value
   */
  public getBooleanConfig(key: string, defaultValue: boolean = false): boolean {
    const value = this.getConfig<string | boolean>(key);
    
    if (typeof value === 'boolean') {
      return value;
    }
    
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
        return true;
      }
      if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
        return false;
      }
    }
    
    return defaultValue;
  }

  /**
   * Get numeric configuration value
   * @param key Configuration key
   * @param defaultValue Default value if key is not found or not a number
   * @returns Numeric configuration value
   */
  public getNumberConfig(key: string, defaultValue: number = 0): number {
    const value = this.getConfig<string | number>(key);
    
    if (typeof value === 'number') {
      return value;
    }
    
    if (typeof value === 'string') {
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue)) {
        return parsedValue;
      }
    }
    
    return defaultValue;
  }

  /**
   * Get array configuration value
   * @param key Configuration key
   * @param defaultValue Default value if key is not found or not an array
   * @returns Array configuration value
   */
  public getArrayConfig<T>(key: string, defaultValue: T[] = []): T[] {
    const value = this.getConfig<T[]>(key);
    
    if (Array.isArray(value)) {
      return value;
    }
    
    return defaultValue;
  }

  /**
   * Get configuration for a specific environment
   * @param key Configuration key
   * @param defaultValue Default value if key is not found
   * @returns Environment-specific configuration value
   */
  public getEnvironmentConfig<T>(key: string, defaultValue?: T): T {
    const environment = this.getEnv('NODE_ENV', 'development');
    const envKey = `${environment}.${key}`;
    
    return this.getConfig<T>(envKey, this.getConfig<T>(key, defaultValue));
  }

  /**
   * Get base URL for the application
   * @returns Base URL
   */
  public getBaseUrl(): string {
    return this.getEnv('BASE_URL', this.getConfig<string>('baseUrl', 'http://localhost:3000'));
  }

  /**
   * Get API base URL
   * @returns API base URL
   */
  public getApiBaseUrl(): string {
    return this.getEnv('API_BASE_URL', this.getConfig<string>('apiBaseUrl', 'http://localhost:3000/api'));
  }

  /**
   * Get timeout value in milliseconds
   * @param key Timeout key
   * @param defaultValue Default timeout value
   * @returns Timeout value in milliseconds
   */
  public getTimeout(key: string = 'timeout', defaultValue: number = 30000): number {
    return this.getNumberConfig(key, parseInt(this.getEnv(`${key.toUpperCase()}_TIMEOUT`, defaultValue.toString())));
  }
}

export const configReader = new ConfigReader();