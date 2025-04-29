import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * ParallelTestResult interface
 */
interface ParallelTestResult {
  command: string;
  exitCode: number;
  output: string;
  error?: string;
  duration: number;
  worker: number;
}

/**
 * ParallelExecutor class
 * Utility class for executing tests in parallel
 */
export class ParallelExecutor {
  /**
   * Run tests in parallel
   * @param testCommand Base test command to run
   * @param testFiles Array of test files to run
   * @param maxWorkers Maximum number of parallel workers (default: use number of CPU cores)
   * @returns Promise resolving to array of test results
   */
  public static async runTestsInParallel(
    testCommand: string,
    testFiles: string[],
    maxWorkers: number = os.cpus().length
  ): Promise<ParallelTestResult[]> {
    console.log(`Running ${testFiles.length} test files with ${maxWorkers} workers`);
    
    // Create batches of test files based on worker count
    const workerBatches = this.createWorkerBatches(testFiles, maxWorkers);
    
    // Run all batches in parallel
    const startTime = Date.now();
    const results = await Promise.all(
      workerBatches.map((batch, workerIndex) => 
        this.runWorkerBatch(testCommand, batch, workerIndex)
      )
    );
    const endTime = Date.now();
    
    // Flatten results
    const flatResults = results.reduce((acc, val) => acc.concat(val), []);
    
    // Log summary
    console.log('\nParallel Test Execution Summary:');
    console.log(`Total test files: ${testFiles.length}`);
    console.log(`Workers used: ${maxWorkers}`);
    console.log(`Total duration: ${(endTime - startTime) / 1000} seconds`);
    console.log(`Passed: ${flatResults.filter(r => r.exitCode === 0).length}`);
    console.log(`Failed: ${flatResults.filter(r => r.exitCode !== 0).length}`);
    
    return flatResults;
  }
  
  /**
   * Create batches of test files for workers
   * @param testFiles Array of test files
   * @param workerCount Number of workers
   * @returns Array of test file batches
   */
  private static createWorkerBatches(testFiles: string[], workerCount: number): string[][] {
    const batches: string[][] = Array(workerCount).fill(null).map(() => []);
    
    // Distribute files among workers
    testFiles.forEach((file, index) => {
      const workerIndex = index % workerCount;
      batches[workerIndex].push(file);
    });
    
    return batches;
  }
  
  /**
   * Run a batch of tests on a worker
   * @param testCommand Base test command
   * @param testFiles Array of test files for this worker
   * @param workerIndex Worker index
   * @returns Promise resolving to array of test results
   */
  private static async runWorkerBatch(
    testCommand: string,
    testFiles: string[],
    workerIndex: number
  ): Promise<ParallelTestResult[]> {
    const results: ParallelTestResult[] = [];
    
    console.log(`Worker ${workerIndex}: Starting execution of ${testFiles.length} files`);
    
    // Run each test file sequentially within this worker
    for (const testFile of testFiles) {
      const result = await this.runSingleTest(testCommand, testFile, workerIndex);
      results.push(result);
      
      // Log result
      const status = result.exitCode === 0 ? 'PASSED' : 'FAILED';
      console.log(`Worker ${workerIndex}: ${status} - ${testFile} (${result.duration / 1000}s)`);
    }
    
    console.log(`Worker ${workerIndex}: Completed execution of ${testFiles.length} files`);
    
    return results;
  }
  
  /**
   * Run a single test
   * @param testCommand Base test command
   * @param testFile Test file to run
   * @param workerIndex Worker index
   * @returns Promise resolving to test result
   */
  private static async runSingleTest(
    testCommand: string,
    testFile: string,
    workerIndex: number
  ): Promise<ParallelTestResult> {
    const command = `${testCommand} ${testFile}`;
    const startTime = Date.now();
    
    try {
      // Execute test command
      const { stdout, stderr } = await execAsync(command);
      const endTime = Date.now();
      
      return {
        command,
        exitCode: 0,
        output: stdout,
        duration: endTime - startTime,
        worker: workerIndex
      };
    } catch (error) {
      const endTime = Date.now();
      
      return {
        command,
        exitCode: error.code || 1,
        output: error.stdout || '',
        error: error.stderr || error.message,
        duration: endTime - startTime,
        worker: workerIndex
      };
    }
  }
  
  /**
   * Find all test files matching a pattern
   * @param directory Directory to search
   * @param pattern File pattern to match
   * @returns Array of matching file paths
   */
  public static findTestFiles(directory: string, pattern: string): string[] {
    const files: string[] = [];
    
    // Function to recursively scan directory
    const scan = (dir: string): void => {
      // Get directory contents
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      // Process each entry
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Recursively scan subdirectory
          scan(fullPath);
        } else if (entry.isFile() && this.matchesPattern(entry.name, pattern)) {
          // Add matching file to list
          files.push(fullPath);
        }
      }
    };
    
    // Start scanning
    scan(directory);
    
    return files;
  }
  
  /**
   * Check if filename matches pattern
   * @param filename Filename to check
   * @param pattern Pattern to match
   * @returns True if filename matches pattern
   */
  private static matchesPattern(filename: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    
    return regex.test(filename);
  }
  
  /**
   * Create shard from test files
   * @param testFiles Array of all test files
   * @param shardIndex Index of current shard (1-based)
   * @param totalShards Total number of shards
   * @returns Array of test files for this shard
   */
  public static createShard(
    testFiles: string[],
    shardIndex: number,
    totalShards: number
  ): string[] {
    // Validate inputs
    if (shardIndex < 1 || shardIndex > totalShards) {
      throw new Error(`Invalid shard index: ${shardIndex}. Must be between 1 and ${totalShards}`);
    }
    
    // Calculate shard
    const filesPerShard = Math.ceil(testFiles.length / totalShards);
    const startIndex = (shardIndex - 1) * filesPerShard;
    const endIndex = Math.min(startIndex + filesPerShard, testFiles.length);
    
    return testFiles.slice(startIndex, endIndex);
  }
  
  /**
   * Run tests in a specific shard
   * @param testCommand Base test command
   * @param directory Directory containing test files
   * @param pattern File pattern to match
   * @param shardIndex Index of current shard (1-based)
   * @param totalShards Total number of shards
   * @param maxWorkers Maximum number of parallel workers
   * @returns Promise resolving to array of test results
   */
  public static async runShardedTests(
    testCommand: string,
    directory: string,
    pattern: string,
    shardIndex: number,
    totalShards: number,
    maxWorkers: number = os.cpus().length
  ): Promise<ParallelTestResult[]> {
    // Find all test files
    const allTestFiles = this.findTestFiles(directory, pattern);
    console.log(`Found ${allTestFiles.length} test files matching pattern: ${pattern}`);
    
    // Create shard
    const shardFiles = this.createShard(allTestFiles, shardIndex, totalShards);
    console.log(`Shard ${shardIndex}/${totalShards} contains ${shardFiles.length} test files`);
    
    // Run tests in parallel
    return await this.runTestsInParallel(testCommand, shardFiles, maxWorkers);
  }
}