import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { DashboardPage } from '../pages/dashboardPage';
import { dataReader } from '../utils/dataReader';
import { logger } from '../utils/logger';
import { allureReporter } from '../utils/allureReporter';

test.describe('Dashboard Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  
  test.beforeEach(async ({ page }) => {
    // Initialize pages
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    
    // Navigate to login page
    await loginPage.navigate();
    
    // Verify login page is displayed
    const loginPageDisplayed = await loginPage.verifyLoginPageDisplayed();
    expect(loginPageDisplayed).toBeTruthy('Login page should be displayed');
    
    // Login with valid credentials
    const credentials = dataReader.getCredentials('validUser');
    await loginPage.login(credentials.username, credentials.password);
    
    // Verify login is successful
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy('User should be logged in with valid credentials');
  });
  
  test.afterEach(async () => {
    // Logout after each test
    await dashboardPage.logout();
  });
  
  test('Verify dashboard widgets', async () => {
    await allureReporter.step('Verify dashboard widgets', async () => {
      logger.info('Testing dashboard widgets');
      
      // Verify dashboard is loaded
      const isDashboardLoaded = await dashboardPage.verifyDashboardLoaded();
      expect(isDashboardLoaded).toBeTruthy('Dashboard should be loaded');
      
      // Verify expected widgets are displayed
      const expectedWidgetsDisplayed = await dashboardPage.verifyExpectedWidgets();
      expect(expectedWidgetsDisplayed).toBeTruthy('All expected widgets should be displayed');
      
      // Get actual widgets and verify count
      const widgets = await dashboardPage.getDashboardWidgets();
      const testData = dataReader.getTestData('dashboardTests');
      const expectedWidgetsCount = testData?.widgets.length || 0;
      
      expect(widgets.length).toBeGreaterThan(0, 'Dashboard should have at least one widget');
      expect(widgets.length).toEqual(expectedWidgetsCount, `Dashboard should have ${expectedWidgetsCount} widgets`);
    });
  });
  
  test('Verify main menu navigation', async () => {
    await allureReporter.step('Verify main menu navigation', async () => {
      logger.info('Testing main menu navigation');
      
      // Get main menu items
      const menuItems = await dashboardPage.getMainMenuItems();
      expect(menuItems.length).toBeGreaterThan(0, 'Dashboard should have main menu items');
      
      // Navigate to Admin menu item
      if (menuItems.includes('Admin')) {
        await dashboardPage.navigateToMenuItem('Admin');
        
        // Verify page title
        const pageTitle = await dashboardPage.getPageTitle();
        expect(pageTitle).toContain('Admin', 'Page title should contain Admin');
      } else {
        // Skip test if Admin menu item is not available
        logger.warning('Admin menu item not found, skipping navigation test');
        test.skip();
      }
    });
  });
  
  test('Verify search functionality', async () => {
    await allureReporter.step('Verify search functionality', async () => {
      logger.info('Testing search functionality');
      
      // Get main menu items to search for
      const menuItems = await dashboardPage.getMainMenuItems();
      
      if (menuItems.length > 0) {
        // Search for the first menu item
        const searchTerm = menuItems[0];
        await dashboardPage.search(searchTerm);
        
        // Verify page updated after search (just a basic verification)
        const pageTitle = await dashboardPage.getPageTitle();
        expect(pageTitle).not.toBe('', 'Page title should not be empty after search');
      } else {
        // Skip test if no menu items are available
        logger.warning('No menu items found, skipping search test');
        test.skip();
      }
    });
  });
});