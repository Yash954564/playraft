import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';

/**
 * Configuration reader class
 * Reads configuration from config file and environment variables
 */
class ConfigReader {
  private config: Record<string, any>;
  private configPath: string;
  private isLoaded: boolean = false;

  /**
   * Constructor
   * @param configPath Path to config file
   */
  constructor(configPath?: string) {
    this.configPath = configPath || path.resolve('./config/config.json');
    this.config = {};
    this.loadConfig();
  }

  /**
   * Load configuration from file
   */
  private loadConfig(): void {
    try {
      // Check if config file exists
      if (fs.existsSync(this.configPath)) {
        // Read config file
        const configData = fs.readFileSync(this.configPath, 'utf8');
        
        // Parse config data
        this.config = JSON.parse(configData);
        
        this.isLoaded = true;
        
        logger.info(`Configuration loaded from ${this.configPath}`);
      } else {
        logger.warn(`Config file not found: ${this.configPath}`);
      }
    } catch (error) {
      logger.error(`Failed to load configuration: ${error}`);
    }
  }

  /**
   * Get configuration value
   * @param key Configuration key (supports dot notation)
   * @param defaultValue Default value if key not found
   * @returns Configuration value
   */
  getValue<T>(key: string, defaultValue?: T): T {
    try {
      // Check if config is loaded
      if (!this.isLoaded) {
        return defaultValue as T;
      }
      
      // Get value from config using dot notation
      const keyParts = key.split('.');
      let value: any = this.config;
      
      for (const part of keyParts) {
        if (value === undefined || value === null) {
          return defaultValue as T;
        }
        
        value = value[part];
      }
      
      // Return value if found, otherwise default value
      return value !== undefined ? value : defaultValue as T;
    } catch (error) {
      logger.error(`Failed to get configuration value for ${key}: ${error}`);
      return defaultValue as T;
    }
  }

  /**
   * Set configuration value
   * @param key Configuration key (supports dot notation)
   * @param value Configuration value
   */
  setValue<T>(key: string, value: T): void {
    try {
      // Get key parts
      const keyParts = key.split('.');
      const lastKey = keyParts.pop() as string;
      let obj: any = this.config;
      
      // Create nested objects if they don't exist
      for (const part of keyParts) {
        if (!obj[part]) {
          obj[part] = {};
        }
        
        obj = obj[part];
      }
      
      // Set value
      obj[lastKey] = value;
      
      logger.debug(`Configuration value set: ${key}`);
    } catch (error) {
      logger.error(`Failed to set configuration value for ${key}: ${error}`);
    }
  }

  /**
   * Save configuration to file
   * @param filePath Optional file path
   * @returns True if saved successfully, false otherwise
   */
  saveConfig(filePath?: string): boolean {
    try {
      // Use provided file path or default
      const savePath = filePath || this.configPath;
      
      // Create directory if it doesn't exist
      const directory = path.dirname(savePath);
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      
      // Write config to file
      fs.writeFileSync(savePath, JSON.stringify(this.config, null, 2));
      
      logger.info(`Configuration saved to ${savePath}`);
      
      return true;
    } catch (error) {
      logger.error(`Failed to save configuration: ${error}`);
      return false;
    }
  }

  /**
   * Get all configuration
   * @returns Complete configuration object
   */
  getConfig(): Record<string, any> {
    return this.config;
  }

  /**
   * Reload configuration from file
   * @returns True if reloaded successfully, false otherwise
   */
  reloadConfig(): boolean {
    try {
      this.loadConfig();
      return this.isLoaded;
    } catch (error) {
      logger.error(`Failed to reload configuration: ${error}`);
      return false;
    }
  }
}

// Export singleton instance
export const configReader = new ConfigReader();