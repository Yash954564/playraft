Feature: User API Functionality
  As an API consumer
  I want to perform operations on user resources
  So that I can manage user data programmatically

  Background:
    Given the API base URL is "https://reqres.in/api"

  @api @smoke
  Scenario: Get list of users
    When I send a GET request to "/users?page=1"
    Then the response status code should be 200
    And the response should contain a list of users
    And the response should include pagination information

  @api @smoke
  Scenario: Get single user by ID
    When I send a GET request to "/users/2"
    Then the response status code should be 200
    And the response should contain user information
    And the user should have an email address
    And the user should have an avatar image URL

  @api @negative
  Scenario: Get non-existent user
    When I send a GET request to "/users/999"
    Then the response status code should be 404
    And the response body should be empty

  @api @create
  Scenario: Create a new user
    Given I have the following user data:
      | name     | job          |
      | John Doe | QA Engineer  |
    When I send a POST request to "/users" with the user data
    Then the response status code should be 201
    And the response should contain the created user data
    And the response should include creation timestamp
    And the created user should have an ID

  @api @update
  Scenario: Update an existing user
    Given I have the following user data:
      | name      | job               |
      | Jane Doe  | DevOps Engineer   |
    When I send a PUT request to "/users/2" with the user data
    Then the response status code should be 200
    And the response should contain the updated user data
    And the response should include update timestamp

  @api @delete
  Scenario: Delete a user
    When I send a DELETE request to "/users/2"
    Then the response status code should be 204

  @api @auth
  Scenario: Register a new user
    Given I have the following registration data:
      | email              | password    |
      | test@example.com   | password123 |
    When I send a POST request to "/register" with the registration data
    Then the response status code should be 200
    And the response should contain a token
    And the response should include the user ID

  @api @auth @negative
  Scenario: Register with missing password
    Given I have the following incomplete registration data:
      | email              |
      | test@example.com   |
    When I send a POST request to "/register" with the incomplete registration data
    Then the response status code should be 400
    And the response should contain an error message

  @api @auth
  Scenario: Login with valid credentials
    Given I have the following login data:
      | email              | password    |
      | eve.holt@reqres.in | cityslicka  |
    When I send a POST request to "/login" with the login data
    Then the response status code should be 200
    And the response should contain a token

  @api @auth @negative
  Scenario: Login with invalid credentials
    Given I have the following login data:
      | email              | password    |
      | test@example.com   | wrongpass   |
    When I send a POST request to "/login" with the login data
    Then the response status code should be 400
    And the response should contain an error message

  @api @performance
  Scenario: Verify API response time
    When I send a GET request to "/users?page=1"
    Then the response time should be less than 500 milliseconds

  @api @security
  Scenario: Verify secure connection
    When I check the API connection details
    Then the connection should use HTTPS protocol
    And the response headers should include security headers