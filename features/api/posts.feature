Feature: JSONPlaceholder API Posts
  As a user of the JSONPlaceholder API
  I want to be able to manage posts
  So that I can create, read, update, and delete posts

  Background:
    Given the JSONPlaceholder API is available

  Scenario: Get all posts
    When I send a GET request to "/posts"
    Then the response status should be 200
    And the response should be a JSON array
    And the response should contain at least 10 posts

  Scenario: Get a specific post
    When I send a GET request to "/posts/1"
    Then the response status should be 200
    And the response should be a JSON object
    And the response should include the following fields:
      | field  | type   |
      | id     | number |
      | title  | string |
      | body   | string |
      | userId | number |

  Scenario: Create a new post
    Given I have the following post data:
      """
      {
        "title": "Test Post Title",
        "body": "This is a test post body created for API testing.",
        "userId": 1
      }
      """
    When I send a POST request to "/posts" with the post data
    Then the response status should be 201
    And the response should be a JSON object
    And the response should include the post data
    And the response should include an "id" field

  Scenario: Update an existing post
    Given I have the following post data:
      """
      {
        "title": "Updated Post Title",
        "body": "This post has been updated during API testing.",
        "userId": 1
      }
      """
    When I send a PUT request to "/posts/1" with the post data
    Then the response status should be 200
    And the response should be a JSON object
    And the response should include the post data
    And the response should include an "id" field with value 1

  Scenario: Delete a post
    When I send a DELETE request to "/posts/1"
    Then the response status should be 200
    And the response should be a JSON object

  Scenario: Filter posts by user
    When I send a GET request to "/posts?userId=1"
    Then the response status should be 200
    And the response should be a JSON array
    And every post in the response should have "userId" equal to 1

  Scenario: Search for non-existing post
    When I send a GET request to "/posts/999"
    Then the response status should be 404

  Scenario: Performance of API requests
    When I measure the response time for a GET request to "/posts/1"
    Then the response time should be less than 500 milliseconds