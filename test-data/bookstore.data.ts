/**
 * Book Store Test Data
 * Test data for Book Store API tests
 */

/**
 * Sample book data
 */
export const sampleBooks = [
  {
    isbn: '9781449325862',
    title: 'Git Pocket Guide',
    subTitle: 'A Working Introduction',
    author: 'Richard E. Silverman',
    publish_date: '2020-06-04T08:48:39.000Z',
    publisher: 'O\'Reilly Media',
    pages: 234,
    description: 'This pocket guide is the perfect on-the-job companion to Git, the distributed version control system. It provides a compact, readable introduction to Git for new users, as well as a reference to common commands and procedures for those of you with Git experience.',
    website: 'http://chimera.labs.oreilly.com/books/1230000000561/index.html'
  },
  {
    isbn: '9781449331818',
    title: 'Learning JavaScript Design Patterns',
    subTitle: 'A JavaScript and jQuery Developer\'s Guide',
    author: 'Addy Osmani',
    publish_date: '2020-06-04T09:11:40.000Z',
    publisher: 'O\'Reilly Media',
    pages: 254,
    description: 'With Learning JavaScript Design Patterns, you\'ll learn how to write beautiful, structured, and maintainable JavaScript by applying classical and modern design patterns to the language. If you want to keep your code efficient, more manageable, and up-to-date with the latest best practices, this book is for you.',
    website: 'http://www.addyosmani.com/resources/essentialjsdesignpatterns/book/'
  },
  {
    isbn: '9781449337711',
    title: 'Designing Evolvable Web APIs with ASP.NET',
    subTitle: 'Harnessing the Power of the Web',
    author: 'Glenn Block et al.',
    publish_date: '2020-06-04T09:12:43.000Z',
    publisher: 'O\'Reilly Media',
    pages: 238,
    description: 'A practical guide to designing and building web APIs that can adapt to change. This hands-on resource teaches the theory and tools for building HTTP services with ASP.NET Web API framework.',
    website: 'http://chimera.labs.oreilly.com/books/1234000001708/index.html'
  }
];

/**
 * Sample user data
 */
export const sampleUsers = [
  {
    userId: 'c9b1e8f8-ef3e-4eee-b6af-b3c3a0e3b162',
    username: 'testuser1',
    password: 'Password123!'
  },
  {
    userId: '18a0e3b9-d2e3-4ae9-90c7-3a1c5b1e3c7b',
    username: 'testuser2',
    password: 'Password123!'
  },
  {
    userId: 'b6c1a2d3-e4f5-6a7b-8c9d-0e1f2a3b4c5d',
    username: 'testuser3',
    password: 'Password123!'
  }
];

/**
 * Sample invalid data
 */
export const invalidData = {
  users: {
    invalidUsername: {
      username: 'u',
      password: 'Password123!'
    },
    invalidPassword: {
      username: 'validusername',
      password: '123'
    },
    nonExistent: {
      username: 'nonexistentuser',
      password: 'Password123!'
    }
  },
  books: {
    invalidIsbn: '9999999999999',
    nonExistentIsbn: '1234567890123'
  }
};

/**
 * Sample response data
 */
export const sampleResponses = {
  token: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6InRlc3R1c2VyMSIsInBhc3N3b3JkIjoiUGFzc3dvcmQxMjMhIiwiaWF0IjoxNjE1MTMwMDAwLCJleHAiOjE2MTUxMzM2MDB9.7g8InxQ7JnWvTzVh7zP4bKoZBQ9H5vIGg9TE7ytA3Qo',
    expires: '2025-04-30T10:00:00.000Z',
    status: 'Success',
    result: 'User authorized successfully.'
  },
  failedToken: {
    token: null,
    expires: null,
    status: 'Failed',
    result: 'User authorization failed.'
  },
  errorResponses: {
    invalidUserName: {
      code: '1207',
      message: 'userName length should be greater than 1'
    },
    invalidPassword: {
      code: '1208',
      message: 'password length should be greater than 8'
    },
    invalidIsbn: {
      code: '1205',
      message: 'ISBN supplied is not available in Books Collection!'
    },
    unauthorized: {
      code: '1200',
      message: 'User not authorized!'
    }
  }
};