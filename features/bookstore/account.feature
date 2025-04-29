@bookstore @account
Feature: Book Store Account Management
  As a user of the Book Store application
  I want to manage my account
  So that I can access the Book Store services

  Background:
    Given the Book Store API is available

  @create-account
  Scenario: Create a new user account
    When I create a new user account with random credentials
    Then the user account should be created successfully
    And I should receive a valid user ID

  @generate-token
  Scenario: Generate an authentication token
    Given I have a valid user account
    When I generate an authentication token with my credentials
    Then I should receive a valid token
    And the token status should be "Success"

  @verify-authorization
  Scenario: Verify user authorization
    Given I have a valid user account
    When I verify authorization with my credentials
    Then I should be authorized

  @get-user
  Scenario: Get user information
    Given I have a valid user account
    And I have a valid authentication token
    When I request my user information
    Then I should receive my user details
    And the username should match my credentials

  @invalid-credentials
  Scenario: Handle invalid credentials
    When I try to generate a token with invalid credentials
    Then the token status should be "Failed"
    And the result should indicate authorization failure

  @delete-account
  Scenario: Delete user account
    Given I have a valid user account
    And I have a valid authentication token
    When I delete my user account
    Then the account should be deleted successfully