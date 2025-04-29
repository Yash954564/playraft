import * as fs from 'fs';
import * as path from 'path';
import { AIHelper } from '../ai/utils/ai.helper';

/**
 * Data Manager
 * Utility class for managing test data
 */
export class DataManager {
  private static instance: DataManager;
  private dataCache: Map<string, any> = new Map();
  private readonly dataDir: string = path.join('testData');
  
  /**
   * Constructor - initializes the data directory
   */
  private constructor() {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }
  
  /**
   * Get singleton instance
   * @returns Data manager instance
   */
  public static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }
  
  /**
   * Load test data from file
   * @param fileName Name of data file
   * @returns Loaded data object
   */
  public loadData(fileName: string): any {
    // Check if data is already cached
    if (this.dataCache.has(fileName)) {
      return this.dataCache.get(fileName);
    }
    
    // Construct file path
    const filePath = path.join(this.dataDir, fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Data file not found: ${filePath}`);
    }
    
    try {
      // Read and parse data file
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Cache data for future use
      this.dataCache.set(fileName, data);
      
      return data;
    } catch (error) {
      throw new Error(`Error loading data from ${filePath}: ${error.message}`);
    }
  }
  
  /**
   * Save test data to file
   * @param fileName Name of data file
   * @param data Data to save
   */
  public saveData(fileName: string, data: any): void {
    // Construct file path
    const filePath = path.join(this.dataDir, fileName);
    
    try {
      // Write data to file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      
      // Update cache
      this.dataCache.set(fileName, data);
    } catch (error) {
      throw new Error(`Error saving data to ${filePath}: ${error.message}`);
    }
  }
  
  /**
   * Get data from cache
   * @param key Cache key
   * @returns Cached data or undefined
   */
  public getCachedData(key: string): any {
    return this.dataCache.get(key);
  }
  
  /**
   * Set data in cache
   * @param key Cache key
   * @param data Data to cache
   */
  public setCachedData(key: string, data: any): void {
    this.dataCache.set(key, data);
  }
  
  /**
   * Clear all cached data
   */
  public clearCache(): void {
    this.dataCache.clear();
  }
  
  /**
   * Generate test data using AI and save to file
   * @param description Description of the test data needed
   * @param count Number of data items to generate
   * @param fileName Name of the file to save data to
   * @returns Generated test data
   */
  public async generateDataWithAI(description: string, count: number = 5, fileName?: string): Promise<any> {
    try {
      // Generate data using OpenAI
      const data = await AIHelper.generateTestData(description, count);
      
      // Save data to file if filename provided
      if (fileName) {
        this.saveData(fileName, data);
      }
      
      return data;
    } catch (error) {
      console.error('Error generating test data with AI:', error);
      throw error;
    }
  }
  
  /**
   * Get specific test data for user testing
   * @returns User test data
   */
  public getUserTestData(): any {
    // Try to load from file
    try {
      return this.loadData('users.json');
    } catch (error) {
      // Return default data if file not found
      return {
        validUser: {
          username: 'testuser',
          password: 'password123',
          email: 'testuser@example.com'
        },
        invalidUser: {
          username: 'invaliduser',
          password: 'wrongpassword',
          email: 'invalid@example.com'
        },
        newUser: {
          username: `newuser_${Date.now()}`,
          password: 'newpassword123',
          email: `newuser_${Date.now()}@example.com`,
          name: 'New Test User'
        }
      };
    }
  }
  
  /**
   * Get specific test data for post testing
   * @returns Post test data
   */
  public getPostTestData(): any {
    // Try to load from file
    try {
      return this.loadData('posts.json');
    } catch (error) {
      // Return default data if file not found
      return {
        newPost: {
          title: `Test Post ${Date.now()}`,
          body: 'This is a test post created by the automated test framework',
          userId: 1
        },
        updatedPost: {
          title: `Updated Post ${Date.now()}`,
          body: 'This post has been updated by the automated test framework',
          userId: 1
        }
      };
    }
  }
  
  /**
   * Get random item from an array
   * @param array Array to get random item from
   * @returns Random item
   */
  public getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  /**
   * Get random number in range
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   * @returns Random number
   */
  public getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Generate random string
   * @param length String length
   * @returns Random string
   */
  public getRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  /**
   * Generate random email
   * @returns Random email address
   */
  public getRandomEmail(): string {
    return `test_${this.getRandomString(8)}@example.com`;
  }
}

/**
 * Export singleton instance for easy import
 */
export const dataManager = DataManager.getInstance();