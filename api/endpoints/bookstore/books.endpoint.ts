/**
 * Books Endpoint
 * Handles Book Store API book endpoints
 */

import { AxiosResponse } from 'axios';
import { ApiHelper, apiHelper } from '../../helpers/ApiHelper';
import { logger } from '../../../utils/logger/logger';

/**
 * Book interface
 */
export interface Book {
  isbn: string;
  title: string;
  subTitle: string;
  author: string;
  publish_date: string;
  publisher: string;
  pages: number;
  description: string;
  website: string;
}

/**
 * Books response interface
 */
export interface BooksResponse {
  books: Book[];
}

/**
 * User books response interface
 */
export interface UserBooksResponse {
  userId: string;
  username: string;
  books: Book[];
}

/**
 * Books Endpoint class
 * Provides methods for interacting with Book Store API book endpoints
 */
export class BooksEndpoint {
  private readonly apiHelper: ApiHelper;
  private readonly baseEndpoint: string = '/BookStore/v1';
  
  /**
   * Constructor
   * @param apiHelper API helper instance
   */
  constructor(apiHelper: ApiHelper) {
    this.apiHelper = apiHelper;
    logger.info('BooksEndpoint initialized');
  }
  
  /**
   * Get all books
   * @returns Promise resolving to all books
   */
  public async getAllBooks(): Promise<AxiosResponse<BooksResponse>> {
    logger.info('Getting all books');
    
    return await this.apiHelper.get<BooksResponse>(`${this.baseEndpoint}/Books`);
  }
  
  /**
   * Get book by ISBN
   * @param isbn Book ISBN
   * @returns Promise resolving to book
   */
  public async getBookByIsbn(isbn: string): Promise<AxiosResponse<Book>> {
    logger.info(`Getting book with ISBN: ${isbn}`);
    
    return await this.apiHelper.get<Book>(`${this.baseEndpoint}/Book`, {
      params: { isbn }
    });
  }
  
  /**
   * Add books to collection
   * @param userId User ID
   * @param isbns Array of book ISBNs
   * @returns Promise resolving to collection update response
   */
  public async addBooksToCollection(userId: string, isbns: string[]): Promise<AxiosResponse<any>> {
    logger.info(`Adding books to collection for user ID: ${userId}`);
    
    // Create collection of ISBNs
    const payload = {
      userId,
      collectionOfIsbns: isbns.map(isbn => ({ isbn }))
    };
    
    // Set auth token if available
    const authToken = this.apiHelper.getAuthToken();
    if (!authToken) {
      logger.warn('No authentication token set for addBooksToCollection');
    }
    
    return await this.apiHelper.post(`${this.baseEndpoint}/Books`, payload);
  }
  
  /**
   * Get user books
   * @param userId User ID
   * @returns Promise resolving to user books
   */
  public async getUserBooks(userId: string): Promise<AxiosResponse<UserBooksResponse>> {
    logger.info(`Getting books for user ID: ${userId}`);
    
    // Set auth token if available
    const authToken = this.apiHelper.getAuthToken();
    if (!authToken) {
      logger.warn('No authentication token set for getUserBooks');
    }
    
    return await this.apiHelper.get<UserBooksResponse>(`${this.baseEndpoint}/Books`, {
      params: { userId }
    });
  }
  
  /**
   * Replace book in collection
   * @param userId User ID
   * @param isbnToReplace ISBN to replace
   * @param isbnToAdd ISBN to add
   * @returns Promise resolving to replace book response
   */
  public async replaceBook(userId: string, isbnToReplace: string, isbnToAdd: string): Promise<AxiosResponse<any>> {
    logger.info(`Replacing book with ISBN: ${isbnToReplace} with ISBN: ${isbnToAdd} for user ID: ${userId}`);
    
    const payload = {
      userId,
      isbn: isbnToAdd
    };
    
    // Set auth token if available
    const authToken = this.apiHelper.getAuthToken();
    if (!authToken) {
      logger.warn('No authentication token set for replaceBook');
    }
    
    return await this.apiHelper.put(`${this.baseEndpoint}/Books/${isbnToReplace}`, payload);
  }
  
  /**
   * Delete book from collection
   * @param userId User ID
   * @param isbn Book ISBN
   * @returns Promise resolving to delete book response
   */
  public async deleteBook(userId: string, isbn: string): Promise<AxiosResponse<void>> {
    logger.info(`Deleting book with ISBN: ${isbn} for user ID: ${userId}`);
    
    // Set auth token if available
    const authToken = this.apiHelper.getAuthToken();
    if (!authToken) {
      logger.warn('No authentication token set for deleteBook');
    }
    
    return await this.apiHelper.delete<void>(`${this.baseEndpoint}/Book`, {
      data: {
        isbn,
        userId
      }
    });
  }
  
  /**
   * Delete all books from collection
   * @param userId User ID
   * @returns Promise resolving to delete all books response
   */
  public async deleteAllBooks(userId: string): Promise<AxiosResponse<void>> {
    logger.info(`Deleting all books for user ID: ${userId}`);
    
    // Set auth token if available
    const authToken = this.apiHelper.getAuthToken();
    if (!authToken) {
      logger.warn('No authentication token set for deleteAllBooks');
    }
    
    return await this.apiHelper.delete<void>(`${this.baseEndpoint}/Books`, {
      params: { userId }
    });
  }
  
  /**
   * Search books by title or author
   * @param query Search query
   * @returns Promise resolving to search results
   */
  public async searchBooks(query: string): Promise<Book[]> {
    logger.info(`Searching books with query: ${query}`);
    
    try {
      // Get all books
      const response = await this.getAllBooks();
      
      // Filter books by title or author
      const books = response.data.books;
      
      // Convert query to lowercase for case-insensitive search
      const lowercaseQuery = query.toLowerCase();
      
      // Filter books
      const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(lowercaseQuery) || 
        book.author.toLowerCase().includes(lowercaseQuery)
      );
      
      logger.info(`Found ${filteredBooks.length} books matching query: ${query}`);
      
      return filteredBooks;
    } catch (error) {
      logger.error('Failed to search books', { error: String(error) });
      
      throw error;
    }
  }
}

// Export books endpoint instance
export const booksEndpoint = new BooksEndpoint(apiHelper);