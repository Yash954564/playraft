import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Global teardown function that runs after all tests
 * @param config Playwright configuration
 */
async function globalTeardown(config: FullConfig) {
  // Get the log file path from the global setup
  const logFile = process.env.TEST_RUN_LOG_FILE;
  
  // Get the timestamp from the global setup
  const timestamp = process.env.TEST_RUN_TIMESTAMP;
  
  // Append teardown information to the log file
  if (logFile && fs.existsSync(logFile)) {
    fs.appendFileSync(logFile, `\nTest run completed at ${new Date().toISOString()}\n`);
    
    // Calculate test run duration
    if (timestamp) {
      const startTime = new Date(timestamp.replace(/-/g, ':').replace(/-/g, '.'));
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      // Format the duration as HH:MM:SS
      const hours = Math.floor(duration / 3600000);
      const minutes = Math.floor((duration % 3600000) / 60000);
      const seconds = Math.floor((duration % 60000) / 1000);
      
      const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      fs.appendFileSync(logFile, `Test run duration: ${formattedDuration}\n`);
    }
  }
  
  // Clean up any temporary resources
  // ...

  // Log teardown completion
  console.log(`Global teardown completed at ${new Date().toISOString()}`);
}

export default globalTeardown;