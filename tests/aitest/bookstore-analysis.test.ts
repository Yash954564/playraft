/**
 * Book Store API AI Analysis Tests
 * Tests book store API with AI analysis
 */

import { test, expect } from '@playwright/test';
import { BooksEndpoint } from '../../api/endpoints/bookstore/books.endpoint';
import { AccountEndpoint } from '../../api/endpoints/bookstore/account.endpoint';
import { logger } from '../../utils/logger/logger';
import { aiHelper } from '../../ai/utils/AIHelper';
import { aiTestResultsAnalyzer } from '../../ai/utils/AITestResultsAnalyzer';
import { testRetryHandler } from '../../utils/TestRetryHandler';

// Test tags
const tags = {
  ai: test.describe.configure({ tag: 'ai-tests' }),
};

// Generate random test data for user creation
const generateRandomUser = () => {
  const randomNumber = Math.floor(Math.random() * 100000);
  return {
    userName: `testUser${randomNumber}`,
    password: 'Password123!',
  };
};

// API test suite with AI analysis
tags.ai.describe('Book Store API with AI Analysis', () => {
  // Create endpoints
  const booksEndpoint = new BooksEndpoint();
  const accountEndpoint = new AccountEndpoint();
  
  // API test results for analysis
  const apiTestResults: Array<{
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: string;
  }> = [];
  
  // API performance metrics for analysis
  const apiPerformanceMetrics: Array<{
    endpoint: string;
    status: number;
    responseTime: number;
  }> = [];
  
  // Setup
  test.beforeAll(async () => {
    logger.info('Setting up Book Store API AI Analysis Tests');
    
    // Check if AI helper is initialized
    if (!aiHelper.isInitialized()) {
      logger.warn('AI helper is not initialized, AI analysis will be limited');
    }
  });
  
  // Teardown
  test.afterAll(async () => {
    logger.info('Cleaning up and performing comprehensive AI analysis');
    
    // Analyze overall API performance
    if (apiPerformanceMetrics.length > 0) {
      const performanceAnalysis = await aiTestResultsAnalyzer.analyzeApiPerformance(
        'Book Store API',
        apiPerformanceMetrics
      );
      
      logger.info('API Performance Analysis:', { analysis: performanceAnalysis });
    }
    
    // Analyze overall test results
    if (apiTestResults.length > 0) {
      const testAnalysis = await aiTestResultsAnalyzer.analyzeApiTestResults(
        'Book Store API',
        apiTestResults
      );
      
      logger.info('Test Results Analysis:', { analysis: testAnalysis });
    }
    
    logger.info('Completed Book Store API AI Analysis Tests');
  });
  
  // Test to get all books with AI analysis
  test('should get all books with AI analysis', async () => {
    // Store test metrics
    const testName = 'Get All Books';
    const startTime = Date.now();
    
    try {
      // Get all books
      const response = await booksEndpoint.getAllBooks();
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Record metrics for performance analysis
      apiPerformanceMetrics.push({
        endpoint: '/BookStore/v1/Books',
        status: response.status,
        responseTime: duration,
      });
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.data.books).toBeTruthy();
      expect(Array.isArray(response.data.books)).toBe(true);
      
      // Perform AI analysis of API response
      const analysisResult = await aiHelper.analyzeApiResponse(
        'GET',
        '/BookStore/v1/Books',
        response.status,
        duration,
        {},
        response.data
      );
      
      // Log analysis result
      logger.info('AI Analysis of Books API Response:', { analysis: analysisResult.analysis });
      
      // Record test result for analysis
      apiTestResults.push({
        name: testName,
        status: 'passed',
        duration,
      });
    } catch (error) {
      // Record test result for analysis
      const duration = Date.now() - startTime;
      apiTestResults.push({
        name: testName,
        status: 'failed',
        duration,
        error: String(error),
      });
      
      // Re-throw error to fail test
      throw error;
    }
  });
  
  // Test to get book by ISBN with AI analysis
  test('should get book by ISBN with AI analysis', async ({ skip }) => {
    // Skip for now due to API issues
    skip('Skipping due to Book Store API connectivity issues with 502 responses');
    
    // Store test metrics
    const testName = 'Get Book by ISBN';
    const startTime = Date.now();
    
    try {
      // Get all books first to get an ISBN
      const allBooksResponse = await booksEndpoint.getAllBooks();
      
      // Verify response has books
      expect(allBooksResponse.status).toBe(200);
      expect(allBooksResponse.data.books.length).toBeGreaterThan(0);
      
      // Get first book's ISBN
      const firstBookIsbn = allBooksResponse.data.books[0].isbn;
      
      // Get book by ISBN
      const response = await booksEndpoint.getBookByIsbn(firstBookIsbn);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Record metrics for performance analysis
      apiPerformanceMetrics.push({
        endpoint: `/BookStore/v1/Book?isbn=${firstBookIsbn}`,
        status: response.status,
        responseTime: duration,
      });
      
      // Verify response
      expect(response.status).toBe(200);
      expect(response.data.isbn).toBe(firstBookIsbn);
      
      // Perform AI analysis of API response
      const analysisResult = await aiHelper.analyzeApiResponse(
        'GET',
        `/BookStore/v1/Book?isbn=${firstBookIsbn}`,
        response.status,
        duration,
        {},
        response.data
      );
      
      // Log analysis result
      logger.info('AI Analysis of Book by ISBN API Response:', { analysis: analysisResult.analysis });
      
      // Record test result for analysis
      apiTestResults.push({
        name: testName,
        status: 'passed',
        duration,
      });
    } catch (error) {
      // Record test result for analysis
      const duration = Date.now() - startTime;
      apiTestResults.push({
        name: testName,
        status: 'failed',
        duration,
        error: String(error),
      });
      
      // Re-throw error to fail test
      throw error;
    }
  });
  
  // Test to search books with AI analysis
  test('should search books with AI analysis', async ({ skip }) => {
    // Skip for now due to API issues
    skip('Skipping due to Book Store API connectivity issues with 502 responses');
    
    // Store test metrics
    const testName = 'Search Books';
    const startTime = Date.now();
    
    try {
      // Search for books with keyword "JavaScript"
      const searchKeyword = 'JavaScript';
      const response = await testRetryHandler.retryWithBackoff(async () => {
        return await booksEndpoint.searchBooks(searchKeyword);
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Record metrics for performance analysis
      apiPerformanceMetrics.push({
        endpoint: `/BookStore/v1/Books?search=${searchKeyword}`,
        status: response.status,
        responseTime: duration,
      });
      
      // Verify response
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.books)).toBe(true);
      
      // Check if search results contain keyword
      const hasKeyword = response.data.books.some((book: any) => {
        return (
          book.title.includes(searchKeyword) ||
          book.description?.includes(searchKeyword) ||
          book.subTitle?.includes(searchKeyword) ||
          book.author?.includes(searchKeyword)
        );
      });
      
      expect(hasKeyword).toBe(true);
      
      // Perform AI analysis of API response
      const analysisResult = await aiHelper.analyzeApiResponse(
        'GET',
        `/BookStore/v1/Books?search=${searchKeyword}`,
        response.status,
        duration,
        {},
        response.data
      );
      
      // Log analysis result
      logger.info('AI Analysis of Search Books API Response:', { analysis: analysisResult.analysis });
      
      // Record test result for analysis
      apiTestResults.push({
        name: testName,
        status: 'passed',
        duration,
      });
    } catch (error) {
      // Record test result for analysis
      const duration = Date.now() - startTime;
      apiTestResults.push({
        name: testName,
        status: 'failed',
        duration,
        error: String(error),
      });
      
      // Re-throw error to fail test
      throw error;
    }
  });
  
  // Test to create user with AI analysis
  test('should create user with AI analysis', async ({ skip }) => {
    // Skip for now due to API issues
    skip('Skipping due to Book Store API connectivity issues with 502 responses');
    
    // Store test metrics
    const testName = 'Create User';
    const startTime = Date.now();
    
    try {
      // Generate random user data
      const userData = generateRandomUser();
      
      // Create user
      const response = await testRetryHandler.retryWithBackoff(async () => {
        return await accountEndpoint.createUser(userData);
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Record metrics for performance analysis
      apiPerformanceMetrics.push({
        endpoint: '/Account/v1/User',
        status: response.status,
        responseTime: duration,
      });
      
      // Verify response
      expect(response.status).toBe(201);
      expect(response.data.userID).toBeTruthy();
      expect(response.data.username).toBe(userData.userName);
      
      // Perform AI analysis of API response
      const analysisResult = await aiHelper.analyzeApiResponse(
        'POST',
        '/Account/v1/User',
        response.status,
        duration,
        userData,
        response.data
      );
      
      // Log analysis result
      logger.info('AI Analysis of Create User API Response:', { analysis: analysisResult.analysis });
      
      // Record test result for analysis
      apiTestResults.push({
        name: testName,
        status: 'passed',
        duration,
      });
    } catch (error) {
      // Record test result for analysis
      const duration = Date.now() - startTime;
      apiTestResults.push({
        name: testName,
        status: 'failed',
        duration,
        error: String(error),
      });
      
      logger.error('Failed to create user', { error: String(error) });
      
      // Re-throw error to fail test
      throw error;
    }
  });
});