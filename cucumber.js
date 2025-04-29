/**
 * Cucumber.js Configuration
 * This file configures how Cucumber BDD tests are run
 */

module.exports = {
  default: {
    tags: 'not @ignored',
    paths: ['features/**/*.feature'],
    require: [
      'step_definitions/**/*.ts',
      'support/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json'
    ],
    publishQuiet: true,
    formatOptions: {
      snippetInterface: 'async-await'
    },
    parallel: 3
  },
  ui: {
    tags: '@ui and not @ignored',
    paths: ['features/**/*.feature'],
    require: [
      'step_definitions/**/*.ts',
      'support/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/cucumber-ui-report.html',
      'json:reports/cucumber-ui-report.json'
    ],
    publishQuiet: true,
    formatOptions: {
      snippetInterface: 'async-await'
    },
    parallel: 2
  },
  api: {
    tags: '@api and not @ignored',
    paths: ['features/**/*.feature'],
    require: [
      'step_definitions/**/*.ts',
      'support/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/cucumber-api-report.html',
      'json:reports/cucumber-api-report.json'
    ],
    publishQuiet: true,
    formatOptions: {
      snippetInterface: 'async-await'
    },
    parallel: 3
  },
  smoke: {
    tags: '@smoke and not @ignored',
    paths: ['features/**/*.feature'],
    require: [
      'step_definitions/**/*.ts',
      'support/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/cucumber-smoke-report.html',
      'json:reports/cucumber-smoke-report.json'
    ],
    publishQuiet: true,
    formatOptions: {
      snippetInterface: 'async-await'
    },
    parallel: 2
  }
};