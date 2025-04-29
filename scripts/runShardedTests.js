/**
 * Script for running sharded tests across multiple processes
 * This helps with more efficient parallel test execution
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Get command line arguments
const numShards = parseInt(process.env.NUM_SHARDS || '1');
const currentShard = parseInt(process.env.CURRENT_SHARD || '1');
const testDir = process.env.TEST_DIR || './tests';
const testPattern = process.env.TEST_PATTERN || '**/*.test.ts';
const baseCommand = process.env.TEST_COMMAND || 'npx playwright test';
const reportPrefix = process.env.REPORT_PREFIX || '';

/**
 * Find all test files matching the pattern
 * @param {string} dir Directory to scan
 * @param {string} pattern File pattern to match
 * @returns {string[]} Array of test file paths
 */
function findTestFiles(dir, pattern) {
  const files = [];
  
  function scan(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (entry.isFile() && matchesPattern(entry.name, pattern)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${currentDir}:`, error);
    }
  }
  
  scan(dir);
  return files;
}

/**
 * Check if filename matches pattern
 * @param {string} filename Filename to check
 * @param {string} pattern Pattern to match (glob-like)
 * @returns {boolean} True if filename matches pattern
 */
function matchesPattern(filename, pattern) {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  
  const regex = new RegExp(`^${regexPattern}$`);
  
  return regex.test(filename);
}

/**
 * Divide tests into shards
 * @param {string[]} testFiles Array of test files
 * @param {number} numShards Number of shards
 * @returns {Array<string[]>} Array of shards, each containing file paths
 */
function createShards(testFiles, numShards) {
  const shards = Array(numShards).fill().map(() => []);
  
  // Distribute files among shards
  testFiles.forEach((file, index) => {
    const shardIndex = index % numShards;
    shards[shardIndex].push(file);
  });
  
  return shards;
}

/**
 * Run a single shard
 * @param {string[]} testFiles Test files in the shard
 * @param {number} shardIndex Shard index
 * @returns {Promise<object>} Test results
 */
async function runShard(testFiles, shardIndex) {
  console.log(`Running shard ${shardIndex + 1}/${numShards} with ${testFiles.length} test files`);
  
  // Create list of test files for command
  const fileList = testFiles.join(' ');
  
  // Build command
  const command = `${baseCommand} ${fileList} --shard=${shardIndex + 1}/${numShards}`;
  
  console.log(`Command: ${command}`);
  
  // Start time for this shard
  const startTime = Date.now();
  
  try {
    // Run command
    const { stdout, stderr } = await execAsync(command);
    
    // Calculate duration
    const duration = (Date.now() - startTime) / 1000;
    
    console.log(`Shard ${shardIndex + 1} completed in ${duration.toFixed(2)} seconds`);
    
    // Return results
    return {
      shard: shardIndex + 1,
      success: true,
      duration,
      output: stdout,
      error: stderr
    };
  } catch (error) {
    // Calculate duration even if failed
    const duration = (Date.now() - startTime) / 1000;
    
    console.error(`Shard ${shardIndex + 1} failed after ${duration.toFixed(2)} seconds`);
    console.error(error.message);
    
    // Return error results
    return {
      shard: shardIndex + 1,
      success: false,
      duration,
      output: error.stdout || '',
      error: error.stderr || error.message
    };
  }
}

/**
 * Run all shards in parallel
 * @param {Array<string[]>} shards Array of shards
 * @returns {Promise<object[]>} Array of test results
 */
async function runAllShards(shards) {
  console.log(`Running all ${shards.length} shards in parallel`);
  
  // Start time for all shards
  const startTime = Date.now();
  
  // Run all shards
  const results = await Promise.all(
    shards.map((shardFiles, index) => runShard(shardFiles, index))
  );
  
  // Calculate total duration
  const totalDuration = (Date.now() - startTime) / 1000;
  
  console.log(`All shards completed in ${totalDuration.toFixed(2)} seconds`);
  
  return results;
}

/**
 * Run a specific shard
 * @param {Array<string[]>} shards Array of shards
 * @param {number} shardIndex Shard index to run
 * @returns {Promise<object>} Test result
 */
async function runSpecificShard(shards, shardIndex) {
  console.log(`Running shard ${shardIndex}/${shards.length}`);
  
  if (shardIndex < 1 || shardIndex > shards.length) {
    console.error(`Invalid shard index: ${shardIndex}. Must be between 1 and ${shards.length}`);
    process.exit(1);
  }
  
  // Run the specified shard
  return await runShard(shards[shardIndex - 1], shardIndex - 1);
}

/**
 * Merge test results from all shards
 * @param {Array<object>} results Array of test results
 */
function mergeResults(results) {
  // Output report file path
  const reportFile = `${reportPrefix}sharded-test-report.json`;
  
  // Create summary
  const summary = {
    totalShards: results.length,
    successfulShards: results.filter(r => r.success).length,
    failedShards: results.filter(r => !r.success).length,
    totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
    results
  };
  
  // Write to file
  fs.writeFileSync(reportFile, JSON.stringify(summary, null, 2));
  
  console.log(`Test report saved to ${reportFile}`);
  
  // Log summary
  console.log('\nTest Summary:');
  console.log(`Total Shards: ${summary.totalShards}`);
  console.log(`Successful Shards: ${summary.successfulShards}`);
  console.log(`Failed Shards: ${summary.failedShards}`);
  console.log(`Total Duration: ${summary.totalDuration.toFixed(2)} seconds`);
  
  // Exit with error if any shard failed
  if (summary.failedShards > 0) {
    process.exit(1);
  }
}

async function main() {
  try {
    // Find test files
    const testFiles = findTestFiles(testDir, testPattern);
    console.log(`Found ${testFiles.length} test files matching pattern: ${testPattern}`);
    
    // Create shards
    const shards = createShards(testFiles, numShards);
    
    // Log distribution
    shards.forEach((shardFiles, index) => {
      console.log(`Shard ${index + 1}: ${shardFiles.length} test files`);
    });
    
    let results;
    
    if (currentShard > 0 && currentShard <= numShards) {
      // Run specific shard
      results = [await runSpecificShard(shards, currentShard)];
    } else {
      // Run all shards
      results = await runAllShards(shards);
    }
    
    // Merge results
    mergeResults(results);
    
  } catch (error) {
    console.error('Error running sharded tests:', error);
    process.exit(1);
  }
}

// Run the script
main();