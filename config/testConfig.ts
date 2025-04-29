/**
 * Test Configuration
 * Central configuration parameters for the test framework
 */

/**
 * Environment enum
 * Supported environment types
 */
export enum Environment {
  LOCAL = 'local',
  DEV = 'dev',
  QA = 'qa',
  STAGING = 'staging',
  PROD = 'prod'
}

/**
 * Browser enum
 * Supported browser types
 */
export enum Browser {
  CHROMIUM = 'chromium',
  FIREFOX = 'firefox',
  WEBKIT = 'webkit',
  CHROME = 'chrome',
  EDGE = 'edge'
}

/**
 * Test mode enum
 * Supported test modes
 */
export enum TestMode {
  UI = 'ui',
  API = 'api',
  PERFORMANCE = 'performance',
  VISUAL = 'visual',
  ACCESSIBILITY = 'accessibility',
  SECURITY = 'security',
  AI = 'ai'
}

/**
 * Cloud Provider enum
 * Supported cloud providers
 */
export enum CloudProvider {
  NONE = 'none',
  BROWSER_STACK = 'browserstack',
  LAMBDA_TEST = 'lambdatest'
}

/**
 * Test data source enum
 * Supported test data sources
 */
export enum TestDataSource {
  STATIC = 'static',
  API = 'api',
  DB = 'db',
  CSV = 'csv',
  EXCEL = 'excel',
  JSON = 'json',
  FAKER = 'faker'
}

/**
 * Reporting tool enum
 * Supported reporting tools
 */
export enum ReportingTool {
  ALLURE = 'allure',
  REPORT_PORTAL = 'reportportal',
  PLAYWRIGHT = 'playwright',
  HTML = 'html',
  JSON = 'json',
  JUNIT = 'junit'
}

/**
 * External service integration enum
 * Supported external service integrations
 */
export enum ExternalService {
  JIRA = 'jira',
  SLACK = 'slack',
  TEAMS = 'teams',
  EMAIL = 'email',
  AWS = 's3',
  OPENAI = 'openai'
}

/**
 * Log level enum
 * Supported log levels
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

/**
 * Test Configuration
 * Central configuration for the test framework
 * 
 * Note: Configuration priority order:
 * 1. Environment variables
 * 2. Command line arguments
 * 3. Configuration file
 * 4. Default values
 */
export const testConfig = {
  // Environment
  environment: (process.env.TEST_ENV as Environment) || Environment.QA,
  logLevel: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
  timeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
  retryDelay: parseInt(process.env.RETRY_DELAY || '1000'),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  
  // URLs
  baseUrl: process.env.BASE_URL || 'https://demoqa.com',
  apiBaseUrl: process.env.API_BASE_URL || 'https://demoqa.com',
  uiBaseUrl: process.env.UI_BASE_URL || 'https://demo.applitools.com',
  
  // Browser
  browser: (process.env.BROWSER as Browser) || Browser.CHROMIUM,
  headless: process.env.HEADLESS === 'true',
  
  // Test mode
  testMode: (process.env.TEST_MODE as TestMode) || TestMode.API,
  
  // Cloud provider
  cloudProvider: (process.env.CLOUD_PROVIDER as CloudProvider) || CloudProvider.NONE,
  
  // Test data
  testDataSource: (process.env.TEST_DATA_SOURCE as TestDataSource) || TestDataSource.JSON,
  testDataFile: process.env.TEST_DATA_FILE || './data/testData.json',
  
  // Reporting
  reporting: {
    tools: [(process.env.REPORTING_TOOLS as ReportingTool) || ReportingTool.ALLURE],
    outputDir: process.env.REPORT_OUTPUT_DIR || './reports',
    screenshots: process.env.CAPTURE_SCREENSHOTS === 'true',
    video: process.env.CAPTURE_VIDEO === 'true',
    trace: process.env.CAPTURE_TRACE === 'true',
    console: process.env.CAPTURE_CONSOLE === 'true',
    html: process.env.CAPTURE_HTML === 'true',
  },
  
  // External integrations
  integrations: {
    jira: {
      enabled: process.env.JIRA_ENABLED === 'true',
      url: process.env.JIRA_URL || '',
      username: process.env.JIRA_USERNAME || '',
      apiToken: process.env.JIRA_API_TOKEN || '',
      project: process.env.JIRA_PROJECT || '',
    },
    slack: {
      enabled: process.env.SLACK_ENABLED === 'true',
      webhook: process.env.SLACK_WEBHOOK_URL || '',
      channel: process.env.SLACK_CHANNEL || '',
      token: process.env.SLACK_BOT_TOKEN || '',
    },
    aws: {
      enabled: process.env.AWS_ENABLED === 'true',
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET || '',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
    reportPortal: {
      enabled: process.env.REPORT_PORTAL_ENABLED === 'true',
      endpoint: process.env.REPORT_PORTAL_ENDPOINT || '',
      project: process.env.REPORT_PORTAL_PROJECT || '',
      launchName: process.env.REPORT_PORTAL_LAUNCH_NAME || 'PlayRaft Test Run',
      token: process.env.REPORT_PORTAL_TOKEN || '',
    },
  },
  
  // AI
  ai: {
    enabled: process.env.AI_ENABLED === 'true',
    provider: (process.env.AI_PROVIDER as ExternalService) || ExternalService.OPENAI,
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.AI_MODEL || 'gpt-4o',
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
  },
  
  // Authentication
  auth: {
    username: process.env.AUTH_USERNAME || 'test',
    password: process.env.AUTH_PASSWORD || 'Password123!',
    token: process.env.AUTH_TOKEN || '',
  },
  
  // API specific configuration
  api: {
    timeout: parseInt(process.env.API_TIMEOUT || '30000'),
    maxRetries: parseInt(process.env.API_MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.API_RETRY_DELAY || '1000'),
    validateResponse: process.env.API_VALIDATE_RESPONSE === 'true',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
  
  // UI specific configuration
  ui: {
    viewport: {
      width: parseInt(process.env.VIEWPORT_WIDTH || '1366'),
      height: parseInt(process.env.VIEWPORT_HEIGHT || '768'),
    },
    ignoreHTTPSErrors: process.env.IGNORE_HTTPS_ERRORS === 'true',
    bypassCSP: process.env.BYPASS_CSP === 'true',
    locale: process.env.LOCALE || 'en-US',
    geolocation: {
      latitude: parseFloat(process.env.GEO_LATITUDE || '37.7749'),
      longitude: parseFloat(process.env.GEO_LONGITUDE || '-122.4194'),
    },
    colorScheme: process.env.COLOR_SCHEME || 'light',
    deviceScaleFactor: parseInt(process.env.DEVICE_SCALE_FACTOR || '1'),
    isMobile: process.env.IS_MOBILE === 'true',
    hasTouch: process.env.HAS_TOUCH === 'true',
  },
  
  // BDD specific configuration
  bdd: {
    featuresDir: process.env.BDD_FEATURES_DIR || './features',
    stepsDir: process.env.BDD_STEPS_DIR || './step_definitions',
    timeout: parseInt(process.env.BDD_TIMEOUT || '60000'),
  },
  
  // Performance testing configuration
  performance: {
    maxResponseTime: parseInt(process.env.MAX_RESPONSE_TIME || '3000'),
    maxLoadTime: parseInt(process.env.MAX_LOAD_TIME || '5000'),
    cpuThrottling: parseInt(process.env.CPU_THROTTLING || '4'),
    networkThrottling: process.env.NETWORK_THROTTLING || '3G',
    collectMetrics: process.env.COLLECT_PERFORMANCE_METRICS === 'true',
  },
  
  // Docker configuration
  docker: {
    enabled: process.env.DOCKER_ENABLED === 'true',
    image: process.env.DOCKER_IMAGE || 'playwright:latest',
    sharedVolume: process.env.DOCKER_SHARED_VOLUME || './shared',
  },
  
  // CI/CD configuration
  ci: {
    enabled: process.env.CI_ENABLED === 'true',
    provider: process.env.CI_PROVIDER || 'github',
    buildNumber: process.env.BUILD_NUMBER || '',
    branch: process.env.BRANCH_NAME || 'main',
  },
};

// Export configuration
export default testConfig;