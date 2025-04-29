# Parallel Test Execution Guide

This guide explains how to use the parallel test execution capabilities in the Playwright Hybrid Test Framework.

## Table of Contents

- [Introduction](#introduction)
- [Configuration](#configuration)
- [Running Tests in Parallel](#running-tests-in-parallel)
- [Sharded Test Execution](#sharded-test-execution)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Introduction

Parallel test execution allows you to run multiple tests simultaneously, significantly reducing the overall test execution time. This is particularly useful for large test suites or when running tests across multiple browsers or devices.

There are two main approaches to parallel testing in our framework:

1. **Worker-based parallelism**: Multiple test files run simultaneously using separate worker processes
2. **Sharded execution**: Test suite is split across multiple machines or environments

## Configuration

### Playwright Configuration

The `playwright.config.ts` file includes settings for parallel execution:

```typescript
const config: PlaywrightTestConfig = {
  // Number of workers (parallel processes)
  workers: process.env.WORKERS ? parseInt(process.env.WORKERS) : undefined,
  
  // Other configuration...
};
```

### Test Configuration

You can enable parallel execution for specific test suites:

```typescript
test.describe('My Parallel Tests', () => {
  // Enable parallel execution for this test suite
  test.describe.configure({ mode: 'parallel' });
  
  // Tests will run in parallel
  test('test 1', async () => { /* ... */ });
  test('test 2', async () => { /* ... */ });
});
```

## Running Tests in Parallel

### Using NPM Scripts

The package.json includes several scripts for running tests in parallel:

```bash
# Run all tests in parallel with 4 workers
npm run test:parallel

# Run API tests in parallel
npm run test:parallel:api

# Run UI tests in parallel
npm run test:parallel:ui
```

### Custom Worker Count

You can specify the number of workers to use:

```bash
# Run with 8 workers
WORKERS=8 npm run test:parallel

# Run with number of CPU cores
WORKERS=$(node -e "console.log(require('os').cpus().length)") npm run test:parallel
```

## Sharded Test Execution

Sharding splits your test suite across multiple machines or environments. This is particularly useful for CI/CD pipelines.

### Using the Sharded Test Script

```bash
# Run all shards (for local testing)
npm run test:sharded

# Run a specific shard (for CI environments)
NUM_SHARDS=5 CURRENT_SHARD=2 npm run test:sharded

# Specify test directory and pattern
TEST_DIR=./tests/apitest TEST_PATTERN="**/*.test.ts" npm run test:sharded
```

### CI/CD Configuration Example

#### GitHub Actions

```yaml
jobs:
  test:
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - name: Run tests
        run: NUM_SHARDS=4 CURRENT_SHARD=${{ matrix.shard }} npm run test:sharded
```

#### Jenkins Pipeline

```groovy
stage('Run Tests') {
  parallel {
    stage('Shard 1') {
      steps {
        sh 'NUM_SHARDS=4 CURRENT_SHARD=1 npm run test:sharded'
      }
    }
    stage('Shard 2') {
      steps {
        sh 'NUM_SHARDS=4 CURRENT_SHARD=2 npm run test:sharded'
      }
    }
    // More shards...
  }
}
```

## Best Practices

### When to Use Parallel Execution

- **Large test suites**: When you have many tests that would take too long to run sequentially
- **Multiple browsers/devices**: When testing across different browsers or device configurations
- **Independent tests**: When your tests don't depend on each other's state

### Making Tests Parallelizable

1. **Test independence**: Ensure tests don't depend on each other or on shared state
2. **Isolated data**: Each test should use its own data to avoid conflicts
3. **Clean setup/teardown**: Properly clean up resources created during tests

### Performance Optimization

1. **Worker count**: Set the optimal number of workers based on your system's resources
2. **Test grouping**: Group related tests together to avoid context switching
3. **Resource monitoring**: Monitor system resources during test execution to identify bottlenecks

## Troubleshooting

### Common Issues

#### Tests Interfering With Each Other

**Symptoms**: Flaky tests that pass when run individually but fail in parallel

**Solutions**:
- Use unique test IDs and data for each test
- Check for shared state or dependencies between tests
- Implement test isolation patterns

#### Performance Degradation

**Symptoms**: Tests run slower in parallel than expected

**Solutions**:
- Check system resource usage (CPU, memory, network)
- Reduce the number of workers
- Check for resource contention (e.g., database connections)

#### Inconsistent Results

**Symptoms**: Different test results across runs

**Solutions**:
- Add retries for flaky tests
- Implement more robust waiting mechanisms
- Check for race conditions in your tests

### Debugging Tips

1. **Run with fewer workers**: Reduce worker count to identify issues
2. **Enable verbose logging**: Set DEBUG=pw:api environment variable
3. **Check the report**: Review the test report for patterns in failures
4. **Run sequentially**: Compare parallel and sequential execution