Feature: JSONPlaceholder User UI
  As a user
  I want to interact with JSONPlaceholder user data through a UI interface
  So that I can view and manage user information visually

  Background:
    Given I am on the JSONPlaceholder UI page

  @ui @smoke
  Scenario: View user list
    When the user data has loaded
    Then I should see a list of users in the table
    And each user should have a name, email, and phone displayed
    And each user should have a view details button

  @ui @smoke
  Scenario: View user details
    When the user data has loaded
    And I click the view details button for user 1
    Then a user details modal should appear
    And the modal should display the user's name, email, and phone
    And the modal should display the user's address information
    And the modal should display the user's company information
    When I click the close button on the modal
    Then the modal should close

  @ui @functional
  Scenario: Search for users
    When the user data has loaded
    And I enter "Leanne" in the search field
    And I click the search button
    Then the user list should be filtered
    And I should see users with "Leanne" in their name or email
    And I should not see users without "Leanne" in their name or email

  @ui @functional
  Scenario: Search for non-existent user
    When the user data has loaded
    And I enter "NonExistentUser123" in the search field
    And I click the search button
    Then I should see no users in the table

  @ui @negative
  Scenario: Handle empty search
    When the user data has loaded
    And I enter "" in the search field
    And I click the search button
    Then I should see all users in the table

  @ui @performance
  Scenario: Verify page load performance
    When I navigate to the JSONPlaceholder UI page
    Then the page should load within 5 seconds
    And the user table should be displayed
    And the loading indicator should not be visible

  @ui @error
  Scenario: Handle API errors
    Given the JSONPlaceholder API will return an error
    When I try to load the JSONPlaceholder UI page
    Then an error message should be displayed
    And the user table should not be visible