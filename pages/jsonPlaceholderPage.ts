import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * JSONPlaceholder UI Page Object Model
 * This represents a page for viewing JSONPlaceholder data in a UI context
 */
export class JSONPlaceholderPage extends BasePage {
  // UI elements
  private readonly userTableSelector: string = 'table.users-table';
  private readonly userRowSelector: string = 'table.users-table tr.user-row';
  private readonly userNameCellSelector: string = 'td.user-name';
  private readonly userEmailCellSelector: string = 'td.user-email';
  private readonly userPhoneCellSelector: string = 'td.user-phone';
  private readonly userDetailsButtonSelector: string = 'button.view-details';
  private readonly loadingIndicatorSelector: string = '.loading-indicator';
  private readonly errorMessageSelector: string = '.error-message';
  private readonly searchInputSelector: string = 'input[placeholder="Search users"]';
  private readonly searchButtonSelector: string = 'button.search-button';
  private readonly paginationNextSelector: string = 'button.pagination-next';
  private readonly paginationPrevSelector: string = 'button.pagination-prev';
  private readonly paginationCurrentSelector: string = 'span.pagination-current';
  
  // User details modal
  private readonly userModalSelector: string = '.user-details-modal';
  private readonly userModalNameSelector: string = '.user-modal-name';
  private readonly userModalEmailSelector: string = '.user-modal-email';
  private readonly userModalPhoneSelector: string = '.user-modal-phone';
  private readonly userModalAddressSelector: string = '.user-modal-address';
  private readonly userModalCompanySelector: string = '.user-modal-company';
  private readonly userModalCloseSelector: string = 'button.modal-close';
  
  // Backend API data
  private readonly apiBaseUrl: string = 'https://jsonplaceholder.typicode.com';
  private userCache: any[] = [];

  /**
   * Initialize the JSONPlaceholder page
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
  }
  
  /**
   * Navigate to the JSONPlaceholder UI
   * For demonstration, we're using a hypothetical UI for JSONPlaceholder
   */
  async navigate(): Promise<void> {
    // In a real application, this would navigate to an actual UI
    // Since JSONPlaceholder is an API service without UI, this is for demonstration
    await this.page.goto('https://jsonplaceholder.typicode.com');
    
    // For demo purposes, we'll simulate a UI by fetching API data and rendering it
    const userData = await this.fetchUsersFromApi();
    await this.simulateUserTableRendering(userData);
  }
  
  /**
   * Fetch users from the JSONPlaceholder API
   * @returns Array of user data
   */
  private async fetchUsersFromApi(): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/users`);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const users = await response.json();
      this.userCache = users;
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
  
  /**
   * Simulate rendering a user table in the UI
   * This method adds elements to the page to simulate UI rendering
   * @param users Array of user data
   */
  private async simulateUserTableRendering(users: any[]): Promise<void> {
    // In a real scenario, this would be handled by the application
    // For demo purposes, we'll create a simple table in the page
    await this.page.evaluate((userData) => {
      // Create a table element
      const tableHtml = `
        <div class="container">
          <h1>JSONPlaceholder Users</h1>
          <div class="search-container">
            <input placeholder="Search users" class="search-input">
            <button class="search-button">Search</button>
          </div>
          <div class="loading-indicator" style="display: none;">Loading...</div>
          <div class="error-message" style="display: none;"></div>
          <table class="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${userData.map(user => `
                <tr class="user-row" data-id="${user.id}">
                  <td>${user.id}</td>
                  <td class="user-name">${user.name}</td>
                  <td class="user-email">${user.email}</td>
                  <td class="user-phone">${user.phone}</td>
                  <td><button class="view-details" data-id="${user.id}">View Details</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="pagination">
            <button class="pagination-prev" disabled>Previous</button>
            <span class="pagination-current">Page 1 of 1</span>
            <button class="pagination-next" disabled>Next</button>
          </div>
          <div class="user-details-modal" style="display: none;">
            <div class="modal-content">
              <h2>User Details</h2>
              <p class="user-modal-name"></p>
              <p class="user-modal-email"></p>
              <p class="user-modal-phone"></p>
              <div class="user-modal-address"></div>
              <div class="user-modal-company"></div>
              <button class="modal-close">Close</button>
            </div>
          </div>
        </div>
      `;
      
      // Add styles
      const styles = `
        <style>
          .container { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; }
          .users-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .users-table th, .users-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .users-table th { background-color: #f2f2f2; }
          .users-table tr:nth-child(even) { background-color: #f9f9f9; }
          .users-table tr:hover { background-color: #f1f1f1; }
          .view-details { background-color: #4CAF50; color: white; border: none; padding: 6px 10px; cursor: pointer; border-radius: 3px; }
          .search-container { margin-bottom: 20px; }
          .search-input { padding: 8px; width: 300px; margin-right: 10px; }
          .search-button { padding: 8px 15px; background-color: #008CBA; color: white; border: none; cursor: pointer; }
          .loading-indicator { margin: 20px 0; font-style: italic; color: #666; }
          .error-message { color: red; margin: 20px 0; }
          .pagination { margin-top: 20px; text-align: center; }
          .pagination button { padding: 8px 15px; margin: 0 5px; cursor: pointer; }
          .pagination-current { display: inline-block; padding: 8px 15px; }
          .user-details-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }
          .modal-content { background-color: white; padding: 20px; border-radius: 5px; width: 50%; max-width: 500px; }
          .modal-close { margin-top: 20px; padding: 8px 15px; background-color: #f44336; color: white; border: none; cursor: pointer; }
        </style>
      `;
      
      // Insert into document
      document.body.innerHTML = styles + tableHtml;
      
      // Add event listeners
      document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function() {
          const userId = this.getAttribute('data-id');
          const user = userData.find(u => u.id.toString() === userId);
          if (user) {
            document.querySelector('.user-modal-name').textContent = `Name: ${user.name}`;
            document.querySelector('.user-modal-email').textContent = `Email: ${user.email}`;
            document.querySelector('.user-modal-phone').textContent = `Phone: ${user.phone}`;
            document.querySelector('.user-modal-address').innerHTML = `
              <h3>Address:</h3>
              <p>${user.address.street}, ${user.address.suite}</p>
              <p>${user.address.city}, ${user.address.zipcode}</p>
              <p>Geo: ${user.address.geo.lat}, ${user.address.geo.lng}</p>
            `;
            document.querySelector('.user-modal-company').innerHTML = `
              <h3>Company:</h3>
              <p>${user.company.name}</p>
              <p>${user.company.catchPhrase}</p>
              <p>${user.company.bs}</p>
            `;
            document.querySelector('.user-details-modal').style.display = 'flex';
          }
        });
      });
      
      document.querySelector('.modal-close').addEventListener('click', function() {
        document.querySelector('.user-details-modal').style.display = 'none';
      });
      
      document.querySelector('.search-button').addEventListener('click', function() {
        const searchTerm = document.querySelector('.search-input').value.toLowerCase();
        document.querySelectorAll('.user-row').forEach(row => {
          const name = row.querySelector('.user-name').textContent.toLowerCase();
          const email = row.querySelector('.user-email').textContent.toLowerCase();
          if (name.includes(searchTerm) || email.includes(searchTerm)) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    }, users);
  }
  
  /**
   * Get all user rows from the table
   * @returns Array of user row elements
   */
  async getUserRows(): Promise<Locator[]> {
    await this.waitForVisible(this.userRowSelector);
    return this.page.locator(this.userRowSelector).all();
  }
  
  /**
   * Get the count of user rows
   * @returns Number of user rows
   */
  async getUserCount(): Promise<number> {
    await this.waitForVisible(this.userRowSelector);
    return this.page.locator(this.userRowSelector).count();
  }
  
  /**
   * Search for users by name or email
   * @param searchTerm Search term
   */
  async searchUsers(searchTerm: string): Promise<void> {
    await this.fill(this.searchInputSelector, searchTerm);
    await this.click(this.searchButtonSelector);
    
    // Wait for the search to be applied
    await this.page.waitForTimeout(500);
  }
  
  /**
   * Get user by index from the table
   * @param index User index (0-based)
   * @returns User data object
   */
  async getUserByIndex(index: number): Promise<any> {
    const rows = await this.getUserRows();
    if (index >= rows.length) {
      throw new Error(`Index ${index} is out of bounds. Only ${rows.length} users available.`);
    }
    
    const row = rows[index];
    const id = await row.getAttribute('data-id');
    const name = await row.locator(this.userNameCellSelector).textContent();
    const email = await row.locator(this.userEmailCellSelector).textContent();
    const phone = await row.locator(this.userPhoneCellSelector).textContent();
    
    return {
      id: parseInt(id || '0'),
      name: name?.trim() || '',
      email: email?.trim() || '',
      phone: phone?.trim() || ''
    };
  }
  
  /**
   * View user details by index
   * @param index User index (0-based)
   */
  async viewUserDetails(index: number): Promise<void> {
    const rows = await this.getUserRows();
    if (index >= rows.length) {
      throw new Error(`Index ${index} is out of bounds. Only ${rows.length} users available.`);
    }
    
    await rows[index].locator(this.userDetailsButtonSelector).click();
    await this.waitForVisible(this.userModalSelector);
  }
  
  /**
   * Get user details from modal
   * @returns User details object
   */
  async getUserDetailsFromModal(): Promise<any> {
    await this.waitForVisible(this.userModalSelector);
    
    const name = await this.page.locator(this.userModalNameSelector).textContent();
    const email = await this.page.locator(this.userModalEmailSelector).textContent();
    const phone = await this.page.locator(this.userModalPhoneSelector).textContent();
    const address = await this.page.locator(this.userModalAddressSelector).textContent();
    const company = await this.page.locator(this.userModalCompanySelector).textContent();
    
    return {
      name: name?.replace('Name:', '').trim() || '',
      email: email?.replace('Email:', '').trim() || '',
      phone: phone?.replace('Phone:', '').trim() || '',
      address: address?.trim() || '',
      company: company?.trim() || ''
    };
  }
  
  /**
   * Close user details modal
   */
  async closeUserDetailsModal(): Promise<void> {
    await this.click(this.userModalCloseSelector);
    await this.page.waitForSelector(this.userModalSelector, { state: 'hidden' });
  }
  
  /**
   * Check if the user table is displayed
   * @returns True if the table is displayed
   */
  async isUserTableDisplayed(): Promise<boolean> {
    return await this.isVisible(this.userTableSelector);
  }
  
  /**
   * Check if loading indicator is displayed
   * @returns True if loading indicator is displayed
   */
  async isLoadingIndicatorDisplayed(): Promise<boolean> {
    return await this.isVisible(this.loadingIndicatorSelector);
  }
  
  /**
   * Check if error message is displayed
   * @returns True if error message is displayed
   */
  async isErrorMessageDisplayed(): Promise<boolean> {
    return await this.isVisible(this.errorMessageSelector);
  }
  
  /**
   * Get the current page number from pagination
   * @returns Current page number
   */
  async getCurrentPageNumber(): Promise<number> {
    const paginationText = await this.page.locator(this.paginationCurrentSelector).textContent();
    const match = paginationText?.match(/Page (\d+) of/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return 1;
  }
}