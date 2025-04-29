@bookstore @books
Feature: Book Store Books Management
  As a user of the Book Store application
  I want to browse and manage books in my collection
  So that I can keep track of my reading list

  Background:
    Given the Book Store API is available
    And I have a valid user account
    And I have a valid authentication token

  @get-all-books
  Scenario: Get all books from the Book Store
    When I request all available books
    Then I should receive a list of books
    And the list should not be empty

  @get-book-by-isbn
  Scenario: Get a specific book by ISBN
    Given I have retrieved all available books
    When I request a book by its ISBN
    Then I should receive the book details
    And the book details should include title and author

  @add-books
  Scenario: Add books to user collection
    Given I have retrieved all available books
    When I add the first 2 books to my collection
    Then the books should be added successfully
    And my user collection should contain the added books

  @delete-all-books
  Scenario: Delete all books from user collection
    Given I have books in my collection
    When I delete all books from my collection
    Then all books should be removed from my collection
    And my user collection should be empty

  @invalid-isbn
  Scenario: Handle invalid ISBN
    When I request a book with an invalid ISBN
    Then I should receive an error response
    And the error should indicate the ISBN is not available

  @unauthorized
  Scenario: Handle unauthorized book operation
    Given I don't have a valid authentication token
    When I try to add books to my collection
    Then I should receive an unauthorized error response