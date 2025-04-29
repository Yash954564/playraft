/**
 * Book Store API - Books Tests
 * Tests Book Store API functionality for book operations
 */

import { test, expect } from '@playwright/test';
import { booksEndpoint, Book } from '../../../api/endpoints/bookstore/books.endpoint';
import { accountEndpoint } from '../../../api/endpoints/bookstore/account.endpoint';
import { logger } from '../../../utils/logger/logger';

// Common test data
const testUsername = `testuser_${Date.now()}`;
const testPassword = 'Test@1234!';
let userId: string;
let authToken: string;
let firstIsbn: string;
let bookCatalog: Book[] = [];

// Define test groups with tags
const apiTest = test.extend({});
const bookstoreApiTest = test.extend({});

// Test suite for Book Store API - Books Tests
test.describe('Book Store API - Books Tests', () => {
  
  // Before all tests, setup user account
  test.beforeAll(async () => {
    try {
      // Create user
      const createUserResponse = await accountEndpoint.createUser(testUsername, testPassword);
      userId = createUserResponse.data.userId;
      
      // Generate token
      const tokenResponse = await accountEndpoint.generateToken(testUsername, testPassword);
      authToken = tokenResponse.data.token;
      
      logger.info(`Created test user with ID: ${userId} and generated auth token`);
    } catch (error) {
      logger.error('Failed to setup test user', { error: String(error) });
    }
  });
  
  // After all tests, cleanup by deleting user
  test.afterAll(async () => {
    if (userId && authToken) {
      try {
        await accountEndpoint.deleteUser(userId);
        logger.info(`Deleted test user with ID: ${userId}`);
      } catch (error) {
        logger.error('Failed to delete test user', { error: String(error) });
      }
    }
  });
  
  // Test to get all books
  bookstoreApiTest('should get all books', async () => {
    logger.info('Testing get all books endpoint');
    
    // Get all books
    const response = await booksEndpoint.getAllBooks();
    
    // Verify response
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.books).toBeInstanceOf(Array);
    expect(response.data.books.length).toBeGreaterThan(0);
    
    // Store books for later tests
    bookCatalog = response.data.books;
    firstIsbn = bookCatalog[0].isbn;
    
    logger.info(`Retrieved ${bookCatalog.length} books, first ISBN: ${firstIsbn}`);
  });
  
  // Test to get book by ISBN
  bookstoreApiTest('should get book by ISBN', async () => {
    // Skip if no books were retrieved
    test.skip(!firstIsbn, 'No books available');
    
    logger.info(`Testing get book by ISBN endpoint with ISBN: ${firstIsbn}`);
    
    // Get book by ISBN
    const response = await booksEndpoint.getBookByIsbn(firstIsbn);
    
    // Verify response
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.isbn).toBe(firstIsbn);
    
    logger.info(`Retrieved book: ${response.data.title} by ${response.data.author}`);
  });
  
  // Test to add books to collection
  bookstoreApiTest('should add books to collection', async () => {
    // Skip if no books were retrieved or no user account
    test.skip(!firstIsbn || !userId || !authToken, 'No books or user account available');
    
    logger.info(`Testing add books to collection endpoint for user ${userId}`);
    
    // Get first two ISBNs or just the first if only one book available
    const isbnList = bookCatalog.length > 1 ? 
      [bookCatalog[0].isbn, bookCatalog[1].isbn] : 
      [bookCatalog[0].isbn];
    
    // Add books to collection
    const response = await booksEndpoint.addBooksToCollection(userId, isbnList);
    
    // Verify response
    expect(response.status).toBe(201);
    expect(response.data).toBeDefined();
    expect(response.data.books).toBeInstanceOf(Array);
    
    // Verify books were added
    const userBooksResponse = await booksEndpoint.getUserBooks(userId);
    expect(userBooksResponse.status).toBe(200);
    expect(userBooksResponse.data.books).toBeInstanceOf(Array);
    expect(userBooksResponse.data.books.length).toBeGreaterThanOrEqual(isbnList.length);
    
    logger.info(`Added ${isbnList.length} books to user collection`);
  });
  
  // Test to replace book in collection
  bookstoreApiTest('should replace book in collection', async () => {
    // Skip if no books were retrieved or no user account
    test.skip(!bookCatalog || bookCatalog.length < 2 || !userId || !authToken, 'Not enough books or no user account available');
    
    // Get first book in collection
    const userBooksResponse = await booksEndpoint.getUserBooks(userId);
    
    // Skip if no books in collection
    test.skip(userBooksResponse.data.books.length === 0, 'No books in collection');
    
    const isbnToReplace = userBooksResponse.data.books[0].isbn;
    
    // Find a book that is not in the collection
    let isbnToAdd = null;
    for (const book of bookCatalog) {
      const isInCollection = userBooksResponse.data.books.some(userBook => userBook.isbn === book.isbn);
      if (!isInCollection) {
        isbnToAdd = book.isbn;
        break;
      }
    }
    
    // Skip if no book to add
    test.skip(!isbnToAdd, 'No book available to add');
    
    logger.info(`Testing replace book endpoint: replacing ${isbnToReplace} with ${isbnToAdd}`);
    
    // Replace book
    const response = await booksEndpoint.replaceBook(userId, isbnToReplace, isbnToAdd);
    
    // Verify response
    expect(response.status).toBe(200);
    
    // Verify book was replaced
    const updatedUserBooksResponse = await booksEndpoint.getUserBooks(userId);
    expect(updatedUserBooksResponse.status).toBe(200);
    expect(updatedUserBooksResponse.data.books).toBeInstanceOf(Array);
    
    // Check that replaced book is no longer in collection
    const hasReplacedBook = updatedUserBooksResponse.data.books.some(book => book.isbn === isbnToReplace);
    expect(hasReplacedBook).toBe(false);
    
    // Check that new book is in collection
    const hasNewBook = updatedUserBooksResponse.data.books.some(book => book.isbn === isbnToAdd);
    expect(hasNewBook).toBe(true);
    
    logger.info(`Successfully replaced book ${isbnToReplace} with ${isbnToAdd}`);
  });
  
  // Test to delete book from collection
  bookstoreApiTest('should delete book from collection', async () => {
    // Skip if no user account
    test.skip(!userId || !authToken, 'No user account available');
    
    // Get books in collection
    const userBooksResponse = await booksEndpoint.getUserBooks(userId);
    
    // Skip if no books in collection
    test.skip(userBooksResponse.data.books.length === 0, 'No books in collection');
    
    const isbnToDelete = userBooksResponse.data.books[0].isbn;
    
    logger.info(`Testing delete book endpoint with ISBN: ${isbnToDelete}`);
    
    // Delete book
    const response = await booksEndpoint.deleteBook(userId, isbnToDelete);
    
    // Verify response
    expect(response.status).toBe(204);
    
    // Verify book was deleted
    const updatedUserBooksResponse = await booksEndpoint.getUserBooks(userId);
    expect(updatedUserBooksResponse.status).toBe(200);
    expect(updatedUserBooksResponse.data.books).toBeInstanceOf(Array);
    
    // Check that deleted book is no longer in collection
    const hasDeletedBook = updatedUserBooksResponse.data.books.some(book => book.isbn === isbnToDelete);
    expect(hasDeletedBook).toBe(false);
    
    logger.info(`Successfully deleted book ${isbnToDelete} from collection`);
  });
  
  // Test to delete all books from collection
  bookstoreApiTest('should delete all books from collection', async () => {
    // Skip if no user account
    test.skip(!userId || !authToken, 'No user account available');
    
    // Ensure books are in collection
    // First check if there are any books
    const userBooksResponse = await booksEndpoint.getUserBooks(userId);
    
    // If no books in collection, add some
    if (userBooksResponse.data.books.length === 0) {
      // Skip if no books were retrieved
      test.skip(!bookCatalog || bookCatalog.length === 0, 'No books available');
      
      // Get first two ISBNs or just the first if only one book available
      const isbnList = bookCatalog.length > 1 ? 
        [bookCatalog[0].isbn, bookCatalog[1].isbn] : 
        [bookCatalog[0].isbn];
      
      // Add books to collection
      await booksEndpoint.addBooksToCollection(userId, isbnList);
      
      logger.info(`Added ${isbnList.length} books to user collection for deletion test`);
    }
    
    logger.info(`Testing delete all books endpoint for user ${userId}`);
    
    // Delete all books
    const response = await booksEndpoint.deleteAllBooks(userId);
    
    // Verify response
    expect(response.status).toBe(204);
    
    // Verify all books were deleted
    const updatedUserBooksResponse = await booksEndpoint.getUserBooks(userId);
    expect(updatedUserBooksResponse.status).toBe(200);
    expect(updatedUserBooksResponse.data.books).toBeInstanceOf(Array);
    expect(updatedUserBooksResponse.data.books.length).toBe(0);
    
    logger.info('Successfully deleted all books from collection');
  });
});