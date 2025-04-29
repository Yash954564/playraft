import Ajv, { Schema, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { logger } from '../../core/logger';
import { allureReporter } from '../../core/reporter/allure.reporter';

/**
 * SchemaValidator class for validating API responses against JSON schemas
 * Inspired by the Java framework's SchemaValidatorUtils class
 */
class SchemaValidator {
  private ajv: Ajv;
  private compiledSchemas: Map<string, ValidateFunction> = new Map();

  /**
   * Initialize the schema validator
   */
  constructor() {
    // Create AJV instance with options
    this.ajv = new Ajv({
      allErrors: true,          // Return all errors, not just the first one
      verbose: true,            // Include schema path in errors
      strictSchema: false,      // Allow additional formats
      strictNumbers: false,     // Allow NaN and Infinity
      strictRequired: false,    // Allow required to be empty array
      strictTypes: false,       // Allow type coercion
    });
    
    // Add formats support
    addFormats(this.ajv);
    
    logger.info('SchemaValidator initialized');
  }

  /**
   * Validate data against a schema
   * @param data Data to validate
   * @param schema JSON schema
   * @param schemaName Name of the schema for caching
   * @returns Validation result
   */
  public validate(data: any, schema: Schema, schemaName?: string): { valid: boolean; errors: any[] } {
    logger.debug(`Validating data against schema${schemaName ? `: ${schemaName}` : ''}`);
    allureReporter.startStep(`Validate schema${schemaName ? `: ${schemaName}` : ''}`);
    
    try {
      // Get or compile schema
      const validate = this.getCompiledSchema(schema, schemaName);
      
      // Validate data
      const valid = validate(data);
      const errors = validate.errors || [];
      
      // Log validation result
      if (valid) {
        logger.info(`Schema validation passed${schemaName ? ` for ${schemaName}` : ''}`);
        allureReporter.endStep('passed');
      } else {
        logger.error(`Schema validation failed${schemaName ? ` for ${schemaName}` : ''}: ${JSON.stringify(errors)}`);
        
        // Attach errors to Allure report
        allureReporter.addAttachment(
          `Schema Validation Errors${schemaName ? ` (${schemaName})` : ''}`,
          JSON.stringify(errors, null, 2),
          'application/json'
        );
        
        allureReporter.endStep('failed');
      }
      
      return { valid, errors };
    } catch (error) {
      logger.error(`Schema validation error: ${error.message}`);
      allureReporter.endStep('failed');
      return { valid: false, errors: [{ message: error.message }] };
    }
  }

  /**
   * Validate data against a schema with assertion
   * @param data Data to validate
   * @param schema JSON schema
   * @param schemaName Name of the schema for caching
   * @throws Error if validation fails
   */
  public validateWithAssert(data: any, schema: Schema, schemaName?: string): void {
    const { valid, errors } = this.validate(data, schema, schemaName);
    
    if (!valid) {
      const errorMessage = `Schema validation failed${schemaName ? ` for ${schemaName}` : ''}: ${JSON.stringify(errors)}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * Add a custom format validator
   * @param formatName Format name
   * @param validateFn Validation function
   */
  public addFormat(formatName: string, validateFn: (data: any) => boolean): void {
    this.ajv.addFormat(formatName, validateFn);
    logger.info(`Added custom format: ${formatName}`);
  }

  /**
   * Add a custom keyword validator
   * @param keywordName Keyword name
   * @param definition Keyword definition
   */
  public addKeyword(keywordName: string, definition: any): void {
    this.ajv.addKeyword({ keyword: keywordName, ...definition });
    logger.info(`Added custom keyword: ${keywordName}`);
  }

  /**
   * Get a compiled schema, either from cache or by compiling it
   * @param schema JSON schema
   * @param schemaName Optional schema name for caching
   * @returns Compiled validate function
   */
  private getCompiledSchema(schema: Schema, schemaName?: string): ValidateFunction {
    // If schema name is provided, try to get from cache
    if (schemaName && this.compiledSchemas.has(schemaName)) {
      logger.debug(`Using cached schema: ${schemaName}`);
      return this.compiledSchemas.get(schemaName)!;
    }
    
    // Compile schema
    logger.debug(`Compiling schema${schemaName ? `: ${schemaName}` : ''}`);
    const validate = this.ajv.compile(schema);
    
    // Cache compiled schema if name is provided
    if (schemaName) {
      this.compiledSchemas.set(schemaName, validate);
      logger.debug(`Cached schema: ${schemaName}`);
    }
    
    return validate;
  }

  /**
   * Clear the schema cache
   */
  public clearSchemaCache(): void {
    this.compiledSchemas.clear();
    logger.info('Schema cache cleared');
  }

  /**
   * Generate a schema from a sample data object
   * Note: This is a simple implementation and not suitable for production use
   * @param data Sample data
   * @returns Generated schema
   */
  public generateSchema(data: any): Schema {
    logger.info('Generating schema from sample data');
    allureReporter.startStep('Generate schema from sample data');
    
    try {
      const schema = this.generateSchemaFromData(data);
      
      allureReporter.addAttachment(
        'Generated Schema',
        JSON.stringify(schema, null, 2),
        'application/json'
      );
      
      allureReporter.endStep('passed');
      return schema;
    } catch (error) {
      logger.error(`Schema generation error: ${error.message}`);
      allureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Recursively generate a schema from data
   * @param data Data to generate schema from
   * @returns Generated schema
   */
  private generateSchemaFromData(data: any): Schema {
    if (data === null) {
      return { type: 'null' };
    }
    
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return { type: 'array', items: {} };
      }
      
      // Use the first item as a template
      const itemSchema = this.generateSchemaFromData(data[0]);
      return { type: 'array', items: itemSchema };
    }
    
    if (typeof data === 'object') {
      const properties: Record<string, Schema> = {};
      const required: string[] = [];
      
      Object.entries(data).forEach(([key, value]) => {
        properties[key] = this.generateSchemaFromData(value);
        required.push(key);
      });
      
      return { type: 'object', properties, required };
    }
    
    // Handle primitive types
    return { type: typeof data as 'string' | 'number' | 'boolean' | 'integer' };
  }
}

// Create singleton instance
export const schemaValidator = new SchemaValidator();