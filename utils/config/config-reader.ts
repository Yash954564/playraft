/**
 * Configuration Reader
 * Centralized configuration management for the testing framework
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { logger } from '../logger/logger';

// Load environment variables from .env file
dotenv.config();

/**
 * Configuration Reader class
 * Provides methods to read configuration from various sources
 */
class ConfigReader {
  private configCache: Map<string, any> = new Map();
  private readonly configDir: string;

  /**
   * Constructor
   * @param configDir Directory where configuration files are stored
   */
  constructor(configDir?: string) {
    this.configDir = configDir || path.join(process.cwd(), 'playraft/hybdpytest/config');
  }

  /**
   * Read JSON configuration file
   * @param filename Configuration file name
   * @returns Parsed configuration object
   */
  public readJsonConfig<T>(filename: string): T {
    const cacheKey = `json:${filename}`;

    // Return cached value if available
    if (this.configCache.has(cacheKey)) {
      return this.configCache.get(cacheKey) as T;
    }

    try {
      const filePath = path.join(this.configDir, filename);
      logger.debug(`Reading configuration from ${filePath}`);
      
      const configContent = fs.readFileSync(filePath, 'utf8');
      const config = JSON.parse(configContent) as T;
      
      // Cache the result
      this.configCache.set(cacheKey, config);
      
      return config;
    } catch (error) {
      logger.error(`Failed to read configuration from ${filename}`, { error });
      throw new Error(`Failed to read configuration: ${(error as Error).message}`);
    }
  }

  /**
   * Get environment variable
   * @param key Environment variable key
   * @param defaultValue Default value if environment variable is not set
   * @returns Environment variable value or default value
   */
  public getEnv(key: string, defaultValue?: string): string {
    const value = process.env[key] || defaultValue;
    
    if (value === undefined) {
      logger.warn(`Environment variable ${key} is not set and no default value provided`);
    }
    
    return value || '';
  }

  /**
   * Get boolean environment variable
   * @param key Environment variable key
   * @param defaultValue Default value if environment variable is not set
   * @returns Boolean value of environment variable
   */
  public getEnvBool(key: string, defaultValue: boolean = false): boolean {
    const value = process.env[key];
    
    if (value === undefined) {
      return defaultValue;
    }
    
    return value.toLowerCase() === 'true' || value === '1';
  }

  /**
   * Get numeric environment variable
   * @param key Environment variable key
   * @param defaultValue Default value if environment variable is not set
   * @returns Numeric value of environment variable
   */
  public getEnvNumber(key: string, defaultValue: number = 0): number {
    const value = process.env[key];
    
    if (value === undefined) {
      return defaultValue;
    }
    
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * Get value from configuration
   * @param key Configuration key (supports dot notation)
   * @param configFile Configuration file to read from
   * @param defaultValue Default value if key is not found
   * @returns Configuration value
   */
  public getValue<T>(key: string, configFile: string, defaultValue?: T): T {
    try {
      const config = this.readJsonConfig<Record<string, any>>(configFile);
      
      // Handle dot notation (e.g., "browser.headless")
      const keyParts = key.split('.');
      let value: any = config;
      
      for (const part of keyParts) {
        if (value === undefined || value === null) {
          return defaultValue as T;
        }
        
        value = value[part];
      }
      
      return (value === undefined) ? defaultValue as T : value as T;
    } catch (error) {
      logger.error(`Failed to get configuration value ${key} from ${configFile}`, { error });
      return defaultValue as T;
    }
  }

  /**
   * Clear configuration cache
   */
  public clearCache(): void {
    this.configCache.clear();
    logger.debug('Configuration cache cleared');
  }
}

// Create singleton instance
const configReader = new ConfigReader();

export { configReader, ConfigReader };