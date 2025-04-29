import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Global setup function that runs before all tests
 * @param config Playwright configuration
 */
async function globalSetup(config: FullConfig) {
  // Get timestamp for the test run
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Create directories for test artifacts if they don't exist
  const dirs = [
    'reports',
    'reports/test-artifacts',
    'reports/test-results',
    'reports/playwright-report',
    'reports/screenshots',
    'reports/videos',
    'reports/logs',
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  // Create a log file for the test run
  const logFile = path.join('reports/logs', `test-run-${timestamp}.log`);
  fs.writeFileSync(logFile, `Test run started at ${new Date().toISOString()}\n`);
  fs.writeFileSync(logFile, `Configuration: ${JSON.stringify(config, null, 2)}\n`);
  
  // Store the log file path for the global teardown
  process.env.TEST_RUN_LOG_FILE = logFile;
  
  // Store the timestamp for the global teardown
  process.env.TEST_RUN_TIMESTAMP = timestamp;
  
  // Log setup completion
  console.log(`Global setup completed at ${new Date().toISOString()}`);
  console.log(`Log file: ${logFile}`);
  
  // Return an object that will be passed to globalTeardown
  return { timestamp, logFile };
}

export default globalSetup;