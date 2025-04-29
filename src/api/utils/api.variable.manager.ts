import { logger } from '../../core/logger';
import { allureReporter } from '../../core/reporter/allure.reporter';

/**
 * API Variable Manager class for storing and managing variables during API testing
 * Inspired by the Java framework's API variable management
 */
class ApiVariableManager {
  private variables: Map<string, string> = new Map();
  private objects: Map<string, any> = new Map();

  /**
   * Initialize the variable manager
   */
  constructor() {
    logger.info('API Variable Manager initialized');
  }

  /**
   * Set a variable value
   * @param name Variable name
   * @param value Variable value
   */
  public setVariable(name: string, value: string): void {
    this.variables.set(name, value);
    logger.debug(`Set variable ${name} = ${value}`);
    allureReporter.addParameter(name, value);
  }

  /**
   * Get a variable value
   * @param name Variable name
   * @param defaultValue Default value if variable is not found
   * @returns Variable value or default value
   */
  public getVariable(name: string, defaultValue: string = ''): string {
    const value = this.variables.get(name);
    
    if (value === undefined) {
      logger.debug(`Variable ${name} not found, using default value: ${defaultValue}`);
      return defaultValue;
    }
    
    logger.debug(`Got variable ${name} = ${value}`);
    return value;
  }

  /**
   * Check if a variable exists
   * @param name Variable name
   * @returns True if variable exists, false otherwise
   */
  public hasVariable(name: string): boolean {
    const exists = this.variables.has(name);
    logger.debug(`Checking if variable ${name} exists: ${exists}`);
    return exists;
  }

  /**
   * Delete a variable
   * @param name Variable name
   * @returns True if variable was deleted, false if it didn't exist
   */
  public deleteVariable(name: string): boolean {
    const deleted = this.variables.delete(name);
    logger.debug(`Deleted variable ${name}: ${deleted}`);
    return deleted;
  }

  /**
   * Get all variables
   * @returns Map of all variables
   */
  public getAllVariables(): Map<string, string> {
    return new Map(this.variables);
  }

  /**
   * Clear all variables
   */
  public clearVariables(): void {
    this.variables.clear();
    this.objects.clear();
    logger.info('Cleared all variables and objects');
  }

  /**
   * Store an object for future reference
   * @param name Object name
   * @param object Object to store
   */
  public storeObject<T>(name: string, object: T): void {
    this.objects.set(name, object);
    logger.debug(`Stored object ${name}`);
    
    // Also store the object as JSON for Allure reporting
    allureReporter.addAttachment(
      `Object: ${name}`,
      JSON.stringify(object, null, 2),
      'application/json'
    );
  }

  /**
   * Get a stored object
   * @param name Object name
   * @param defaultValue Default value if object is not found
   * @returns Stored object or default value
   */
  public getObject<T>(name: string, defaultValue: T | null = null): T | null {
    const object = this.objects.get(name) as T;
    
    if (object === undefined) {
      logger.debug(`Object ${name} not found, using default value`);
      return defaultValue;
    }
    
    logger.debug(`Got object ${name}`);
    return object;
  }

  /**
   * Check if an object exists
   * @param name Object name
   * @returns True if object exists, false otherwise
   */
  public hasObject(name: string): boolean {
    const exists = this.objects.has(name);
    logger.debug(`Checking if object ${name} exists: ${exists}`);
    return exists;
  }

  /**
   * Delete an object
   * @param name Object name
   * @returns True if object was deleted, false if it didn't exist
   */
  public deleteObject(name: string): boolean {
    const deleted = this.objects.delete(name);
    logger.debug(`Deleted object ${name}: ${deleted}`);
    return deleted;
  }

  /**
   * Get all stored objects
   * @returns Map of all objects
   */
  public getAllObjects(): Map<string, any> {
    return new Map(this.objects);
  }

  /**
   * Process a template string by replacing variable placeholders with actual values
   * Variable format: ${variable_name}
   * @param template Template string
   * @returns Processed string
   */
  public processTemplate(template: string): string {
    logger.debug(`Processing template: ${template}`);
    allureReporter.startStep('Process template');
    
    try {
      // Replace ${variable} with actual values
      const processed = template.replace(/\${([^}]+)}/g, (match, variable) => {
        const value = this.getVariable(variable, match);
        logger.debug(`Replacing ${match} with ${value}`);
        return value;
      });
      
      logger.debug(`Processed template: ${processed}`);
      allureReporter.endStep('passed');
      return processed;
    } catch (error) {
      logger.error(`Template processing error: ${error.message}`);
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Process an object template by replacing variable placeholders in string properties
   * @param template Template object
   * @returns Processed object
   */
  public processObjectTemplate<T>(template: T): T {
    logger.debug(`Processing object template`);
    allureReporter.startStep('Process object template');
    
    try {
      // Create a deep copy of the template
      const processedObj = JSON.parse(JSON.stringify(template)) as T;
      
      // Process the object recursively
      this.processObjectProperties(processedObj);
      
      logger.debug(`Processed object template`);
      allureReporter.endStep('passed');
      return processedObj;
    } catch (error) {
      logger.error(`Object template processing error: ${error.message}`);
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Recursively process object properties
   * @param obj Object to process
   */
  private processObjectProperties(obj: any): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }
    
    if (Array.isArray(obj)) {
      // Process array elements
      for (let i = 0; i < obj.length; i++) {
        if (typeof obj[i] === 'string') {
          obj[i] = this.processTemplate(obj[i]);
        } else if (typeof obj[i] === 'object') {
          this.processObjectProperties(obj[i]);
        }
      }
    } else {
      // Process object properties
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          if (typeof obj[key] === 'string') {
            obj[key] = this.processTemplate(obj[key]);
          } else if (typeof obj[key] === 'object') {
            this.processObjectProperties(obj[key]);
          }
        }
      }
    }
  }

  /**
   * Generate a report of all variables and objects
   * @returns Report string
   */
  public generateReport(): string {
    let report = '=== API VARIABLES REPORT ===\n\n';
    
    // Add variables
    report += 'Variables:\n';
    this.variables.forEach((value, key) => {
      report += `  ${key} = ${value}\n`;
    });
    
    // Add objects
    report += '\nObjects:\n';
    this.objects.forEach((value, key) => {
      report += `  ${key} = ${typeof value === 'object' ? JSON.stringify(value) : value}\n`;
    });
    
    return report;
  }
}

// Create singleton instance
export const apiVariableManager = new ApiVariableManager();