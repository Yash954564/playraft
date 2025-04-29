/**
 * ReportPortal Configuration
 * Configuration for ReportPortal integration
 */

require('dotenv').config();

module.exports = {
  token: process.env.RP_TOKEN || 'default-token',
  endpoint: process.env.RP_ENDPOINT || 'https://reportportal-endpoint/api/v1',
  project: process.env.RP_PROJECT || 'default_project',
  
  launch: process.env.RP_LAUNCH || 'Playraft Tests',
  
  description: 'Automated tests execution for Playraft test framework',
  attributes: [
    {
      key: 'framework',
      value: 'playwright'
    },
    {
      key: 'environment',
      value: process.env.RP_ENVIRONMENT || 'dev'
    },
    {
      value: 'api-test'
    },
    {
      value: 'book-store'
    }
  ],
  
  // Reporting mode
  mode: process.env.RP_MODE || 'DEFAULT',
  
  // Debug logging
  debug: process.env.RP_DEBUG === 'true',
  
  // Launch status tracking
  skippedIssue: true,
  
  // Timeout configuration
  restClientConfig: {
    timeout: 120000
  },
  
  // Retry settings
  rerun: false,
  rerunOf: process.env.RP_RERUN_OF || '',
  
  // Parallel settings
  parallel: true,
};