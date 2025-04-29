/**
 * Dashboard Page
 * Page object for dashboard functionality
 */

import { Page, BrowserContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger/logger';

/**
 * Dashboard page class
 * Provides methods for interacting with dashboard functionality
 */
export class DashboardPage extends BasePage {
  // Page selectors
  private readonly userName: string = '#userName-value';
  private readonly logoutButton: string = '#submit';
  private readonly bookStoreButton: string = 'span:has-text("Book Store")';
  private readonly profileButton: string = 'span:has-text("Profile")';
  private readonly booksTable: string = '.rt-table';
  private readonly booksRows: string = '.rt-tr-group';
  private readonly searchBox: string = '#searchBox';
  
  /**
   * Constructor
   * @param page Playwright page
   * @param context Playwright browser context
   */
  constructor(page: Page, context: BrowserContext) {
    super(page, context, '/profile', 'Book Store - Profile');
    logger.info('Dashboard page initialized');
  }
  
  /**
   * Get logged in username
   * @returns Promise resolving to username text
   */
  public async getUsername(): Promise<string> {
    logger.info('Getting logged in username');
    return this.getText(this.userName);
  }
  
  /**
   * Log out
   * @returns Promise resolving when logout is complete
   */
  public async logout(): Promise<void> {
    logger.info('Logging out');
    await this.clickElement(this.logoutButton);
    await this.waitForNavigation();
  }
  
  /**
   * Navigate to Book Store
   * @returns Promise resolving when navigation is complete
   */
  public async navigateToBookStore(): Promise<void> {
    logger.info('Navigating to Book Store');
    await this.clickElement(this.bookStoreButton);
    await this.waitForNavigation();
  }
  
  /**
   * Navigate to Profile
   * @returns Promise resolving when navigation is complete
   */
  public async navigateToProfile(): Promise<void> {
    logger.info('Navigating to Profile');
    await this.clickElement(this.profileButton);
    await this.waitForNavigation();
  }
  
  /**
   * Get all book titles
   * @returns Promise resolving to array of book titles
   */
  public async getBookTitles(): Promise<string[]> {
    logger.info('Getting book titles');
    
    const bookElements = await this.page.$$(this.booksRows);
    const titles: string[] = [];
    
    for (const bookElement of bookElements) {
      const titleElement = await bookElement.$('.rt-td:nth-child(2)');
      if (titleElement) {
        const title = await titleElement.textContent();
        if (title && title.trim()) {
          titles.push(title.trim());
        }
      }
    }
    
    return titles;
  }
  
  /**
   * Search for book
   * @param searchText Text to search for
   * @returns Promise resolving when search is complete
   */
  public async searchBook(searchText: string): Promise<void> {
    logger.info(`Searching for book: ${searchText}`);
    await this.fillInput(this.searchBox, searchText);
    
    // Wait for search results to update
    await this.page.waitForTimeout(500);
  }
  
  /**
   * Click on book by title
   * @param title Book title
   * @returns Promise resolving when book is clicked
   */
  public async clickBook(title: string): Promise<void> {
    logger.info(`Clicking book: ${title}`);
    
    const titleSelector = `text="${title}"`;
    await this.clickElement(titleSelector);
    await this.waitForNavigation();
  }
  
  /**
   * Check if book exists
   * @param title Book title
   * @returns Promise resolving to boolean indicating if book exists
   */
  public async bookExists(title: string): Promise<boolean> {
    logger.info(`Checking if book exists: ${title}`);
    
    const titleSelector = `text="${title}"`;
    return this.isElementVisible(titleSelector);
  }
  
  /**
   * Get widget data from dashboard
   * @param widgetName Name of widget
   * @returns Promise resolving to widget data
   */
  public async getWidgetData(widget: string): Promise<string> {
    logger.info(`Getting widget data: ${widget}`);
    
    const widgetSelector = `.widget:has-text("${widget}")`;
    return this.getText(widgetSelector);
  }
  
  /**
   * Analyze dashboard with AI
   * @returns Promise resolving to dashboard analysis
   */
  public async analyzeDashboard(): Promise<string> {
    logger.info('Analyzing dashboard with AI');
    
    const dashboardHtml = await this.getPageHtml();
    
    // Analyze the dashboard
    return this.aiHelper.analyzeElement(dashboardHtml);
  }
}