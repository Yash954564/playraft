Feature: User Login
  As a user of the application
  I want to be able to log in with my credentials
  So that I can access my account

  Background:
    Given I am on the login page

  @ui @smoke
  Scenario: Successful login with valid credentials
    When I enter username "testuser" and password "testpassword"
    And I click the login button
    Then I should be redirected to the dashboard page
    And I should see a welcome message

  @ui
  Scenario: Failed login with invalid credentials
    When I enter username "invaliduser" and password "invalidpassword"
    And I click the login button
    Then I should see an error message "Invalid credentials"

  @ui
  Scenario: Login with remember me
    When I enter username "testuser" and password "testpassword"
    And I check the remember me checkbox
    And I click the login button
    Then I should be redirected to the dashboard page
    And the remember me checkbox should be checked

  @ui
  Scenario: Forgot password link
    When I click the forgot password link
    Then I should be redirected to the password reset page

  @ui
  Scenario: Register link
    When I click the register link
    Then I should be redirected to the registration page

  @ui @smoke
  Scenario: Logout after successful login
    When I enter username "testuser" and password "testpassword"
    And I click the login button
    Then I should be redirected to the dashboard page
    And I should be able to log out