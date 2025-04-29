import { configReader } from './configReader';
import { logger } from './logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Data Reader class for retrieving test data
 */
class DataReader {
  private dataDir: string;
  
  /**
   * Constructor
   * @param dataDir Data directory path
   */
  constructor(dataDir?: string) {
    this.dataDir = dataDir || path.resolve('./data');
    this.createDataDirectoryIfNeeded();
  }
  
  /**
   * Create data directory if it doesn't exist
   */
  private createDataDirectoryIfNeeded(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
        logger.info(`Created data directory: ${this.dataDir}`);
      }
    } catch (error) {
      logger.error(`Failed to create data directory: ${error}`);
    }
  }
  
  /**
   * Get credentials from config
   * @param type Credentials type (e.g., validUser, invalidUser)
   * @returns Credentials object
   */
  getCredentials(type: string): { username: string; password: string } {
    try {
      // Get credentials from config
      const credentials = configReader.getValue<any>(`testData.login.${type}`);
      
      if (!credentials) {
        logger.warn(`Credentials not found for type: ${type}`);
        return { username: '', password: '' };
      }
      
      return credentials;
    } catch (error) {
      logger.error(`Failed to get credentials: ${error}`);
      return { username: '', password: '' };
    }
  }
  
  /**
   * Get test data from config
   * @param testType Test type (e.g., login, api, dashboardTests)
   * @returns Test data object
   */
  getTestData(testType: string): any {
    try {
      // Get test data from config
      const testData = configReader.getValue<any>(`testData.${testType}`);
      
      if (!testData) {
        logger.warn(`Test data not found for type: ${testType}`);
        return null;
      }
      
      return testData;
    } catch (error) {
      logger.error(`Failed to get test data: ${error}`);
      return null;
    }
  }
  
  /**
   * Get data from JSON file
   * @param fileName JSON file name (without .json extension)
   * @returns Data object
   */
  getDataFromFile(fileName: string): any {
    try {
      // Get file path
      const filePath = path.join(this.dataDir, `${fileName}.json`);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        logger.warn(`Data file not found: ${filePath}`);
        return null;
      }
      
      // Read and parse JSON file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    } catch (error) {
      logger.error(`Failed to get data from file: ${error}`);
      return null;
    }
  }
  
  /**
   * Save data to JSON file
   * @param fileName JSON file name (without .json extension)
   * @param data Data object
   * @returns True if saved successfully, false otherwise
   */
  saveDataToFile(fileName: string, data: any): boolean {
    try {
      // Get file path
      const filePath = path.join(this.dataDir, `${fileName}.json`);
      
      // Write data to file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      
      logger.info(`Data saved to file: ${filePath}`);
      return true;
    } catch (error) {
      logger.error(`Failed to save data to file: ${error}`);
      return false;
    }
  }
  
  /**
   * Generate random test data
   * @param type Data type (e.g., email, name, phone)
   * @param options Generation options
   * @returns Random test data
   */
  generateTestData(type: string, options?: any): string {
    try {
      switch (type) {
        case 'email':
          return this.generateRandomEmail(options?.domain);
        case 'name':
          return this.generateRandomName();
        case 'phone':
          return this.generateRandomPhone();
        case 'address':
          return this.generateRandomAddress();
        default:
          logger.warn(`Unknown data type: ${type}`);
          return '';
      }
    } catch (error) {
      logger.error(`Failed to generate test data: ${error}`);
      return '';
    }
  }
  
  /**
   * Generate random email
   * @param domain Email domain (optional)
   * @returns Random email
   */
  private generateRandomEmail(domain?: string): string {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 8);
    const emailDomain = domain || 'example.com';
    
    return `test.${randomString}.${timestamp}@${emailDomain}`;
  }
  
  /**
   * Generate random name
   * @returns Random name
   */
  private generateRandomName(): string {
    const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Olivia'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }
  
  /**
   * Generate random phone number
   * @returns Random phone number
   */
  private generateRandomPhone(): string {
    return `555${Math.floor(1000000 + Math.random() * 9000000)}`;
  }
  
  /**
   * Generate random address
   * @returns Random address
   */
  private generateRandomAddress(): string {
    const streetNumbers = Array.from({ length: 100 }, (_, i) => i + 1);
    const streetNames = ['Main', 'Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Washington', 'Park'];
    const streetTypes = ['St', 'Ave', 'Blvd', 'Rd', 'Ln', 'Dr', 'Way', 'Pl'];
    const cities = ['Springfield', 'Riverdale', 'Franklin', 'Greenville', 'Bristol', 'Clinton', 'Georgetown', 'Salem'];
    const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA'];
    const zipCodes = Array.from({ length: 100 }, () => Math.floor(10000 + Math.random() * 90000));
    
    const streetNumber = streetNumbers[Math.floor(Math.random() * streetNumbers.length)];
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
    const streetType = streetTypes[Math.floor(Math.random() * streetTypes.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const state = states[Math.floor(Math.random() * states.length)];
    const zipCode = zipCodes[Math.floor(Math.random() * zipCodes.length)];
    
    return `${streetNumber} ${streetName} ${streetType}, ${city}, ${state} ${zipCode}`;
  }
}

// Export singleton instance
export const dataReader = new DataReader();