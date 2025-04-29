Feature: JSONPlaceholder User API
  As an API user
  I want to perform CRUD operations on users
  So that I can manage user data effectively

  Background:
    Given the JSONPlaceholder API is available
    And I have the base URL "https://jsonplaceholder.typicode.com"

  @api @smoke
  Scenario: Get all users
    When I send a GET request to "/users"
    Then the response status code should be 200
    And the response should contain a list of users
    And each user should have an "id" field
    And each user should have a "name" field
    And each user should have an "email" field

  @api @smoke
  Scenario: Get a specific user
    When I send a GET request to "/users/1"
    Then the response status code should be 200
    And the response should contain a user with id 1
    And the user should have a "name" field
    And the user should have an "email" field
    And the user should have a "phone" field
    And the user should have a "website" field

  @api @regression
  Scenario: Create a new user
    Given I have the following user data:
      | name     | email              | phone        | website            |
      | John Doe | john.doe@email.com | 123-456-7890 | www.johndoe.com    |
    When I send a POST request to "/users" with the user data
    Then the response status code should be 201
    And the response should contain the created user
    And the created user should have an "id" field
    And the response should match the request data

  @api @regression
  Scenario: Update an existing user
    Given I have the following user data:
      | name           | email                  |
      | John Updated   | john.updated@email.com |
    When I send a PUT request to "/users/1" with the user data
    Then the response status code should be 200
    And the response should contain the updated user
    And the updated user should have the new name "John Updated"
    And the updated user should have the new email "john.updated@email.com"

  @api @regression
  Scenario: Delete a user
    When I send a DELETE request to "/users/1"
    Then the response status code should be 200
    And the response body should be empty or contain an empty object

  @api @negative
  Scenario: Get a non-existent user
    When I send a GET request to "/users/9999"
    Then the response status code should be 404

  @api @performance
  Scenario: Verify response time for getting all users
    When I send a GET request to "/users"
    Then the response status code should be 200
    And the response time should be less than 1000 milliseconds

  @api @security
  Scenario Outline: Send invalid requests and verify error responses
    When I send a <method> request to "<endpoint>" with invalid data
    Then the response status code should match the expected <status>

    Examples:
      | method | endpoint    | status |
      | POST   | /users      | 400    |
      | PUT    | /users/1    | 400    |
      | PATCH  | /users/1    | 400    |

  @api @pagination
  Scenario: Get users with pagination parameters
    When I send a GET request to "/users" with query parameters:
      | _page | 1     |
      | _limit| 5     |
    Then the response status code should be 200
    And the response should contain exactly 5 users
    And the response headers should include pagination information