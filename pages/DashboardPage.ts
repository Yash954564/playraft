/**
 * Dashboard Page
 * Page object for Book Store dashboard page
 */

import { Page, BrowserContext } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger/logger';

/**
 * Dashboard Page class
 * Handles Book Store dashboard functionality
 */
export class DashboardPage extends BasePage {
  // Selectors
  private readonly bookStoreAppSelector: string = '.card:has-text("Book Store Application")';
  private readonly bookStoreSelector: string = '.element-group:has-text("Book Store Application")';
  private readonly booksMenuSelector: string = '.element-group .element-list .menu-list #item-2';
  private readonly profileMenuSelector: string = '.element-group .element-list .menu-list #item-3';
  private readonly bookStoreMenuSelector: string = '.element-group .element-list .menu-list #item-0';
  private readonly logoutButtonSelector: string = '#submit';
  private readonly userNameValueSelector: string = '#userName-value';
  private readonly searchBoxSelector: string = '#searchBox';
  private readonly booksListSelector: string = '.rt-tbody .rt-tr-group';
  private readonly loginButtonSelector: string = '#login';
  
  /**
   * Constructor
   * @param page Playwright page
   * @param context Playwright browser context
   */
  constructor(
    page: Page,
    context: BrowserContext
  ) {
    super(
      page,
      context,
      '/books',
      'Book Store',
      process.env.BASE_URL || 'https://demoqa.com'
    );
    
    logger.info('DashboardPage initialized');
  }
  
  /**
   * Navigate to Book Store
   * @returns Promise resolving when navigation is complete
   */
  public async navigateToBookStore(): Promise<void> {
    logger.info('Navigating to Book Store');
    await this.clickElement(this.bookStoreMenuSelector);
    await this.waitForNavigation();
  }
  
  /**
   * Navigate to Profile
   * @returns Promise resolving when navigation is complete
   */
  public async navigateToProfile(): Promise<void> {
    logger.info('Navigating to Profile');
    await this.clickElement(this.profileMenuSelector);
    await this.waitForNavigation();
  }
  
  /**
   * Navigate to Books
   * @returns Promise resolving when navigation is complete
   */
  public async navigateToBooks(): Promise<void> {
    logger.info('Navigating to Books');
    await this.clickElement(this.booksMenuSelector);
    await this.waitForNavigation();
  }
  
  /**
   * Logout
   * @returns Promise resolving when logout is complete
   */
  public async logout(): Promise<void> {
    logger.info('Logging out');
    
    // Navigate to profile if not already there
    await this.navigateToProfile();
    
    // Click logout button
    await this.clickElement(this.logoutButtonSelector);
    
    // Wait for redirect to login page
    await this.waitForNavigation();
  }
  
  /**
   * Get username
   * @returns Promise resolving to username
   */
  public async getUsername(): Promise<string> {
    logger.debug('Getting username');
    return await this.getText(this.userNameValueSelector);
  }
  
  /**
   * Search for book
   * @param query Search query
   * @returns Promise resolving when search is complete
   */
  public async searchBook(query: string): Promise<void> {
    logger.info(`Searching for book: ${query}`);
    await this.fillInput(this.searchBoxSelector, query);
  }
  
  /**
   * Get books list
   * @returns Promise resolving to array of book objects
   */
  public async getBooksList(): Promise<{ title: string; author: string; publisher: string; }[]> {
    logger.info('Getting books list');
    
    // Wait for books list to be visible
    await this.waitForElement(this.booksListSelector);
    
    // Get books list
    const books = await this.page.$$eval(this.booksListSelector, rows => {
      return rows.map(row => {
        const cells = row.querySelectorAll('.rt-td');
        if (cells.length >= 4 && cells[1].textContent?.trim()) {
          return {
            title: cells[1].textContent?.trim() || '',
            author: cells[2].textContent?.trim() || '',
            publisher: cells[3].textContent?.trim() || ''
          };
        }
        return null;
      }).filter(book => book !== null);
    });
    
    return books as { title: string; author: string; publisher: string; }[];
  }
  
  /**
   * Open book details
   * @param title Book title
   * @returns Promise resolving when book details are opened
   */
  public async openBookDetails(title: string): Promise<void> {
    logger.info(`Opening book details: ${title}`);
    
    // Search for book
    await this.searchBook(title);
    
    // Click on book title
    const bookTitleSelector = `.rt-tbody .rt-tr-group .rt-td:has-text("${title}")`;
    await this.clickElement(bookTitleSelector);
    
    // Wait for navigation to complete
    await this.waitForNavigation();
  }
  
  /**
   * Add book to collection
   * @returns Promise resolving when book is added to collection
   */
  public async addBookToCollection(): Promise<void> {
    logger.info('Adding book to collection');
    
    // Click add to collection button
    await this.clickElement('#addNewRecordButton');
    
    // Wait for alert and accept it
    try {
      await this.page.waitForEvent('dialog', { timeout: 5000 });
      const dialog = this.page.on('dialog', dialog => dialog.accept());
    } catch (error) {
      logger.error('No dialog appeared when adding book to collection', { error: String(error) });
    }
  }
  
  /**
   * Delete all books from collection
   * @returns Promise resolving when all books are deleted
   */
  public async deleteAllBooks(): Promise<void> {
    logger.info('Deleting all books from collection');
    
    // Navigate to profile
    await this.navigateToProfile();
    
    // Click delete all books button
    const deleteAllBooksSelector = '.buttonWrap .text-right #submit';
    
    // Check if delete button exists and is visible
    if (await this.isElementVisible(deleteAllBooksSelector)) {
      await this.clickElement(deleteAllBooksSelector);
      
      // Wait for confirmation dialog and accept it
      try {
        await this.page.waitForEvent('dialog', { timeout: 5000 });
        const dialog = this.page.on('dialog', dialog => dialog.accept());
      } catch (error) {
        logger.error('No dialog appeared when deleting all books', { error: String(error) });
      }
      
      // Wait for books to be deleted
      await this.waitForNavigation();
    } else {
      logger.info('No books to delete in collection');
    }
  }
  
  /**
   * Analyze books data with AI
   * @returns Promise resolving to analysis
   */
  public async analyzeBooksData(): Promise<string> {
    logger.info('Analyzing books data with AI');
    
    // Get books data
    const books = await this.getBooksList();
    
    // Create input for AI analysis
    const booksData = JSON.stringify(books, null, 2);
    
    // Analyze with AI
    return await this.aiHelper.analyzeElement(`Books data: ${booksData}`);
  }
}