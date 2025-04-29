Feature: Dashboard Functionality
  As a logged in user
  I want to access and interact with my dashboard
  So that I can view relevant information and perform actions

  Background:
    Given I am logged in to the application
    And I am on the dashboard page

  @ui @smoke
  Scenario: View dashboard widgets
    When the dashboard loads
    Then I should see all dashboard widgets
    And each widget should display relevant information

  @ui @functional
  Scenario: Navigate to different sections from dashboard
    When I click on the "Users" section in the main menu
    Then I should be taken to the Users page
    When I navigate back to the dashboard
    And I click on the "Posts" section in the main menu
    Then I should be taken to the Posts page

  @ui @functional
  Scenario: Quick actions from dashboard
    When I click on the "Create New Post" quick action
    Then I should be taken to the post creation page
    When I navigate back to the dashboard
    And I click on the "View Profile" quick action
    Then I should be taken to my profile page

  @ui @performance
  Scenario: Dashboard loading time
    When I refresh the dashboard page
    Then the dashboard should load within 3 seconds
    And all widgets should be displayed correctly
