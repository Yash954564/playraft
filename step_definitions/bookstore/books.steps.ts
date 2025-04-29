/**
 * Books Step Definitions
 * Cucumber step definitions for Book Store Books feature
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { accountEndpoint } from '../../api/endpoints/bookstore/account.endpoint';
import { booksEndpoint } from '../../api/endpoints/bookstore/books.endpoint';
import { bookStoreConfig } from '../../api/endpoints/bookstore/bookstore.config';
import { logger } from '../../utils/logger/logger';

// Test context
interface TestContext {
  credentials?: { username: string; password: string };
  userId?: string;
  token?: string;
  apiResponse?: any;
  errorResponse?: any;
  books?: any[];
  selectedBooks?: string[];
}

// Initialize test context
const testContext: TestContext = {};

// Books retrieval
When('I request all available books', async function() {
  logger.info('Requesting all available books');
  
  try {
    // Get all books
    const response = await booksEndpoint.getAllBooks();
    testContext.apiResponse = response;
    testContext.books = response.data.books;
    
    logger.info(`Retrieved ${testContext.books.length} books`);
  } catch (error) {
    logger.error('Error getting all books', { error: String(error) });
    testContext.errorResponse = error.response;
    throw error;
  }
});

Then('I should receive a list of books', function() {
  logger.info('Verifying book list');
  
  expect(testContext.apiResponse.status).toBe(200);
  expect(testContext.books).toBeDefined();
  expect(Array.isArray(testContext.books)).toBe(true);
  
  logger.info('Book list verified');
});

Then('the list should not be empty', function() {
  logger.info('Verifying book list is not empty');
  
  expect(testContext.books!.length).toBeGreaterThan(0);
  
  logger.info(`Book list contains ${testContext.books!.length} books`);
});

// Book by ISBN
Given('I have retrieved all available books', async function() {
  logger.info('Ensuring books have been retrieved');
  
  if (!testContext.books || testContext.books.length === 0) {
    // Get all books if not already retrieved
    const response = await booksEndpoint.getAllBooks();
    testContext.books = response.data.books;
    
    logger.info(`Retrieved ${testContext.books.length} books`);
  } else {
    logger.info(`Using ${testContext.books.length} previously retrieved books`);
  }
});

When('I request a book by its ISBN', async function() {
  logger.info('Requesting book by ISBN');
  
  // Select first book from the list
  const isbn = testContext.books![0].isbn;
  
  try {
    // Get book by ISBN
    const response = await booksEndpoint.getBookByIsbn(isbn);
    testContext.apiResponse = response;
    
    logger.info(`Retrieved book with ISBN: ${isbn}`);
  } catch (error) {
    logger.error(`Error getting book by ISBN: ${isbn}`, { error: String(error) });
    testContext.errorResponse = error.response;
    throw error;
  }
});

Then('I should receive the book details', function() {
  logger.info('Verifying book details');
  
  expect(testContext.apiResponse.status).toBe(200);
  expect(testContext.apiResponse.data).toBeDefined();
  expect(testContext.apiResponse.data.isbn).toBeDefined();
  
  logger.info('Book details verified');
});

Then('the book details should include title and author', function() {
  logger.info('Verifying book title and author');
  
  expect(testContext.apiResponse.data.title).toBeDefined();
  expect(testContext.apiResponse.data.author).toBeDefined();
  
  logger.info(`Book title: ${testContext.apiResponse.data.title}, Author: ${testContext.apiResponse.data.author}`);
});

// Add books to collection
When('I add the first {int} books to my collection', async function(count: number) {
  logger.info(`Adding ${count} books to collection`);
  
  // Select books
  testContext.selectedBooks = testContext.books!
    .slice(0, count)
    .map(book => book.isbn);
  
  try {
    // Add books to collection
    const response = await booksEndpoint.addBooksToCollection(
      testContext.userId!,
      testContext.selectedBooks,
      testContext.token!
    );
    testContext.apiResponse = response;
    
    logger.info(`Added ${count} books to collection`);
  } catch (error) {
    logger.error('Error adding books to collection', { error: String(error) });
    testContext.errorResponse = error.response;
    throw error;
  }
});

Then('the books should be added successfully', function() {
  logger.info('Verifying books were added successfully');
  
  expect(testContext.apiResponse.status).toBe(201);
  expect(testContext.apiResponse.data).toBeDefined();
  expect(testContext.apiResponse.data.books).toBeInstanceOf(Array);
  
  logger.info('Books added successfully');
});

Then('my user collection should contain the added books', async function() {
  logger.info('Verifying user collection contains added books');
  
  try {
    // Get user by ID to verify books
    const response = await accountEndpoint.getUserById(testContext.userId!, testContext.token!);
    
    expect(response.status).toBe(200);
    expect(response.data.books).toBeInstanceOf(Array);
    
    // Verify each selected book is in the user's collection
    const userBookIsbns = response.data.books.map((book: any) => book.isbn);
    for (const isbn of testContext.selectedBooks!) {
      expect(userBookIsbns).toContain(isbn);
    }
    
    logger.info('User collection contains all added books');
  } catch (error) {
    logger.error('Error verifying user collection', { error: String(error) });
    throw error;
  }
});

// Books in collection
Given('I have books in my collection', async function() {
  logger.info('Ensuring user has books in collection');
  
  try {
    // Get user by ID to check books
    const response = await accountEndpoint.getUserById(testContext.userId!, testContext.token!);
    
    if (response.data.books.length === 0) {
      // Add books if collection is empty
      if (!testContext.books || testContext.books.length === 0) {
        // Get all books if not already retrieved
        const booksResponse = await booksEndpoint.getAllBooks();
        testContext.books = booksResponse.data.books;
      }
      
      // Select first 2 books
      testContext.selectedBooks = testContext.books!
        .slice(0, 2)
        .map(book => book.isbn);
      
      // Add books to collection
      await booksEndpoint.addBooksToCollection(
        testContext.userId!,
        testContext.selectedBooks,
        testContext.token!
      );
      
      logger.info('Added books to collection');
    } else {
      logger.info(`User already has ${response.data.books.length} books in collection`);
    }
  } catch (error) {
    logger.error('Error preparing books in collection', { error: String(error) });
    throw error;
  }
});

// Delete all books
When('I delete all books from my collection', async function() {
  logger.info('Deleting all books from collection');
  
  try {
    // Delete all books
    const response = await booksEndpoint.deleteAllBooks(testContext.userId!, testContext.token!);
    testContext.apiResponse = response;
    
    logger.info('All books deleted from collection');
  } catch (error) {
    logger.error('Error deleting all books', { error: String(error) });
    testContext.errorResponse = error.response;
    throw error;
  }
});

Then('all books should be removed from my collection', function() {
  logger.info('Verifying all books were removed');
  
  expect(testContext.apiResponse.status).toBe(204);
  
  logger.info('All books removed successfully');
});

Then('my user collection should be empty', async function() {
  logger.info('Verifying user collection is empty');
  
  try {
    // Get user by ID to verify books
    const response = await accountEndpoint.getUserById(testContext.userId!, testContext.token!);
    
    expect(response.status).toBe(200);
    expect(response.data.books).toBeInstanceOf(Array);
    expect(response.data.books.length).toBe(0);
    
    logger.info('User collection is empty');
  } catch (error) {
    logger.error('Error verifying empty collection', { error: String(error) });
    throw error;
  }
});

// Invalid ISBN
When('I request a book with an invalid ISBN', async function() {
  logger.info('Requesting book with invalid ISBN');
  
  // Invalid ISBN
  const invalidIsbn = bookStoreConfig.testData.invalidIsbn;
  
  try {
    // Get book by ISBN
    await booksEndpoint.getBookByIsbn(invalidIsbn);
    
    // Should not reach here
    throw new Error('Request should have failed but succeeded');
  } catch (error) {
    logger.info('Request failed as expected');
    testContext.errorResponse = error.response;
  }
});

Then('I should receive an error response', function() {
  logger.info('Verifying error response');
  
  expect(testContext.errorResponse).toBeDefined();
  expect(testContext.errorResponse.status).toBe(400);
  
  logger.info('Error response verified');
});

Then('the error should indicate the ISBN is not available', function() {
  logger.info('Verifying error message');
  
  expect(testContext.errorResponse.data.code).toBe('1205');
  expect(testContext.errorResponse.data.message).toBe('ISBN supplied is not available in Books Collection!');
  
  logger.info('Error message verified');
});

// Unauthorized
Given('I don\'t have a valid authentication token', function() {
  logger.info('Setting invalid authentication token');
  
  // Save original token for later
  const originalToken = testContext.token;
  
  // Set invalid token
  testContext.token = '';
  
  // Restore original token after test
  this.After(() => {
    testContext.token = originalToken;
  });
  
  logger.info('Invalid authentication token set');
});

When('I try to add books to my collection', async function() {
  logger.info('Attempting to add books without authorization');
  
  try {
    // Select books if not already selected
    if (!testContext.selectedBooks || testContext.selectedBooks.length === 0) {
      testContext.selectedBooks = testContext.books!
        .slice(0, 2)
        .map(book => book.isbn);
    }
    
    // Try to add books
    await booksEndpoint.addBooksToCollection(
      testContext.userId!,
      testContext.selectedBooks,
      testContext.token!
    );
    
    // Should not reach here
    throw new Error('Request should have failed but succeeded');
  } catch (error) {
    logger.info('Request failed as expected');
    testContext.errorResponse = error.response;
  }
});

Then('I should receive an unauthorized error response', function() {
  logger.info('Verifying unauthorized error');
  
  expect(testContext.errorResponse).toBeDefined();
  expect(testContext.errorResponse.status).toBe(401);
  
  logger.info('Unauthorized error verified');
});