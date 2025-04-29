import { Page } from '@playwright/test';
import BasePage from './base.page';
import { logger } from '../../core/logger';
import { allureReporter } from '../../core/reporter/allure.reporter';

/**
 * Dashboard Page - Page Object Model
 * Represents the dashboard page after successful login
 */
export class DashboardPage extends BasePage {
  // Selectors
  private profileNameSelector = '.logged-user-name';
  private logoutButtonSelector = '#log-out';
  private menuItemsSelector = '.menu-w .os-content ul.main-menu li a';
  private accountBalanceSelector = '.balance-value';
  private creditAvailableSelector = '.credit-available-value';
  private recentTransactionsSelector = '.transactions-table';
  private transactionRowSelector = '.transactions-table tbody tr';
  private searchBoxSelector = '.search-form .form-control';
  private notificationsSelector = '.top-icon.top-settings';
  private timeSelector = '.time';
  
  // Page paths
  private dashboardPath = 'index.html';
  
  /**
   * Constructor
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    super(page, 'Dashboard');
    this.baseUrl = 'https://demo.applitools.com/';
  }
  
  /**
   * Navigate to dashboard page
   */
  public async navigateToDashboard(): Promise<void> {
    await this.navigate(this.dashboardPath);
  }
  
  /**
   * Check if dashboard page is loaded
   * @returns True if page is loaded, false otherwise
   */
  public async isLoaded(): Promise<boolean> {
    return await this.helper.verifyElementExists(this.profileNameSelector) &&
           await this.helper.verifyElementExists(this.accountBalanceSelector) &&
           await this.helper.verifyElementExists(this.recentTransactionsSelector);
  }
  
  /**
   * Get logged-in user name
   * @returns User name or null if not found
   */
  public async getProfileName(): Promise<string | null> {
    if (await this.isVisible(this.profileNameSelector)) {
      return this.getText(this.profileNameSelector);
    }
    return null;
  }
  
  /**
   * Logout from the application
   */
  public async logout(): Promise<void> {
    logger.info('Logging out from the application');
    
    allureReporter.startStep('Logout from application');
    
    try {
      await this.click(this.logoutButtonSelector);
      
      // Wait for navigation to login page
      await this.page.waitForNavigation({ waitUntil: 'networkidle' });
      
      logger.info('Logout successful');
      allureReporter.endStep('passed');
    } catch (error) {
      logger.error(`Logout failed: ${error}`);
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Get account balance
   * @returns Account balance text
   */
  public async getAccountBalance(): Promise<string> {
    logger.debug('Getting account balance');
    
    allureReporter.startStep('Get account balance');
    
    try {
      const balance = await this.getText(this.accountBalanceSelector);
      allureReporter.endStep('passed');
      return balance;
    } catch (error) {
      logger.error(`Failed to get account balance: ${error}`);
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Get credit available
   * @returns Credit available text
   */
  public async getCreditAvailable(): Promise<string> {
    logger.debug('Getting credit available');
    
    allureReporter.startStep('Get credit available');
    
    try {
      const credit = await this.getText(this.creditAvailableSelector);
      allureReporter.endStep('passed');
      return credit;
    } catch (error) {
      logger.error(`Failed to get credit available: ${error}`);
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Get transactions count
   * @returns Number of transactions
   */
  public async getTransactionsCount(): Promise<number> {
    logger.debug('Getting transactions count');
    
    allureReporter.startStep('Get transactions count');
    
    try {
      const count = await this.helper.countElements(this.transactionRowSelector);
      allureReporter.endStep('passed');
      return count;
    } catch (error) {
      logger.error(`Failed to get transactions count: ${error}`);
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Search for transactions
   * @param searchText - Text to search for
   */
  public async searchTransactions(searchText: string): Promise<void> {
    logger.info(`Searching for transactions: ${searchText}`);
    
    allureReporter.startStep(`Search for transactions: ${searchText}`);
    
    try {
      await this.fill(this.searchBoxSelector, searchText, { clear: true });
      
      // Press Enter to search
      await this.helper.pressKey(this.searchBoxSelector, 'Enter');
      
      // Wait for search results
      await this.wait(1000);
      
      allureReporter.endStep('passed');
    } catch (error) {
      logger.error(`Failed to search for transactions: ${error}`);
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Click on menu item
   * @param menuItemText - Text of the menu item to click
   */
  public async clickMenuItem(menuItemText: string): Promise<void> {
    logger.info(`Clicking on menu item: ${menuItemText}`);
    
    allureReporter.startStep(`Click on menu item: ${menuItemText}`);
    
    try {
      // Find menu item by text
      const menuItemSelector = `${this.menuItemsSelector}:has-text("${menuItemText}")`;
      
      await this.click(menuItemSelector);
      
      // Wait for navigation
      await this.page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {
        // Navigation may not happen for some menu items
      });
      
      allureReporter.endStep('passed');
    } catch (error) {
      logger.error(`Failed to click on menu item: ${menuItemText}. Error: ${error}`);
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Get menu items text
   * @returns Array of menu item texts
   */
  public async getMenuItems(): Promise<string[]> {
    logger.debug('Getting menu items');
    
    allureReporter.startStep('Get menu items');
    
    try {
      const menuItems = await this.page.$$eval(
        this.menuItemsSelector,
        elements => elements.map(el => el.textContent?.trim() || '')
      );
      
      allureReporter.endStep('passed');
      return menuItems;
    } catch (error) {
      logger.error(`Failed to get menu items: ${error}`);
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Click on notifications icon
   */
  public async clickNotifications(): Promise<void> {
    logger.debug('Clicking on notifications icon');
    
    allureReporter.startStep('Click on notifications icon');
    
    try {
      await this.click(this.notificationsSelector);
      allureReporter.endStep('passed');
    } catch (error) {
      logger.error(`Failed to click on notifications icon: ${error}`);
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Get current time displayed on dashboard
   * @returns Time text
   */
  public async getCurrentTime(): Promise<string> {
    logger.debug('Getting current time');
    
    allureReporter.startStep('Get current time');
    
    try {
      const time = await this.getText(this.timeSelector);
      allureReporter.endStep('passed');
      return time;
    } catch (error) {
      logger.error(`Failed to get current time: ${error}`);
      allureReporter.endStep('failed');
      throw error;
    }
  }
  
  /**
   * Verify dashboard page title
   * @returns True if title matches expected value, false otherwise
   */
  public async verifyDashboardTitle(): Promise<boolean> {
    return this.verifyTitle('ACME Bank Web App');
  }
  
  /**
   * Verify account balance
   * @param expectedBalance - Expected balance value
   * @returns True if balance matches, false otherwise
   */
  public async verifyAccountBalance(expectedBalance: string): Promise<boolean> {
    const balance = await this.getAccountBalance();
    return balance === expectedBalance;
  }
  
  /**
   * Verify user is logged in
   * @param username - Expected username
   * @returns True if username matches, false otherwise
   */
  public async verifyUserLoggedIn(username: string): Promise<boolean> {
    const profileName = await this.getProfileName();
    return profileName === username;
  }
  
  /**
   * Take dashboard screenshot
   * @returns Path to screenshot
   */
  public async takeDashboardScreenshot(): Promise<string> {
    return this.takeScreenshot('Dashboard');
  }
}

// Export the DashboardPage class
export default DashboardPage;