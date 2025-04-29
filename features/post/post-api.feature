Feature: JSONPlaceholder Post API
  As an API user
  I want to manage posts via the API
  So that I can create, read, update, and delete posts

  Background:
    Given the JSONPlaceholder API is available for posts
    And I have the posts base URL "https://jsonplaceholder.typicode.com"

  @api @smoke
  Scenario: Get all posts
    When I send a GET request to posts endpoint
    Then the response status code should be 200
    And the response should contain a list of posts
    And each post should have a title and body
    And I store the first post ID for later use

  @api @smoke
  Scenario: Get a specific post
    When I send a GET request to post with ID "1"
    Then the response status code should be 200
    And the response should contain a post with id "1"
    And the post should have a title "sunt aut facere repellat provident occaecati excepturi optio reprehenderit"
    And the post should have a body containing "quia et suscipit"

  @api @regression
  Scenario: Create a new post
    Given I have the following user data:
      | title                | body                                | userId |
      | Test Post Title      | This is a test post created for API testing | 1      |
    When I create a new post with the following data:
      | title                | body                                | userId |
      | Test Post Title      | This is a test post created for API testing | 1      |
    Then the response status code should be 201
    And the post should be created with the data I provided

  @api @regression
  Scenario: Update an existing post
    Given I send a GET request to post with ID "1"
    When I update the post with the following data:
      | title                | body                                |
      | Updated Post Title   | This post has been updated via API  |
    Then the response status code should be 200
    And the post should be updated with the data I provided

  @api @regression
  Scenario: Delete a post
    When I delete the post with ID "1"
    Then the response status code should be 200
    And the post should no longer exist

  @api @functional
  Scenario: Get comments for a post
    When I get the comments for post with ID "1"
    Then the response status code should be 200
    And the response should contain comments for the post
    And each comment should have an email and body

  @api @performance
  Scenario: Verify API response time for getting posts
    When I send a GET request to posts endpoint
    Then the response status code should be 200
    And the posts API should respond within 1000 milliseconds