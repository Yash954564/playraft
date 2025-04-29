/**
 * Test environment configuration
 * This file contains configuration for the test environment
 */
export const testConfig = {
  // Environment-specific settings
  env: {
    name: 'test',
    baseUrl: 'https://jsonplaceholder.typicode.com',
    apiUrl: 'https://jsonplaceholder.typicode.com',
    uiUrl: 'https://jsonplaceholder.typicode.com',
    defaultTimeout: 30000,
    headless: true,
    enableVideo: false,
    enableScreenshots: true,
    enableTracing: false,
    enableHar: false,
    enableConsoleLogs: true,
    defaultViewport: {
      width: 1280,
      height: 720
    }
  },
  
  // Test data settings
  testData: {
    users: {
      admin: {
        username: 'admin',
        password: 'admin123',
        email: 'admin@example.com'
      },
      standard: {
        username: 'user',
        password: 'user123',
        email: 'user@example.com'
      },
      invalid: {
        username: 'invalid',
        password: 'invalid123',
        email: 'invalid@example.com'
      }
    },
    posts: {
      validPost: {
        title: 'Test Post',
        body: 'This is a test post',
        userId: 1
      },
      updatedPost: {
        title: 'Updated Post',
        body: 'This post has been updated',
        userId: 1
      }
    }
  },
  
  // API testing settings
  api: {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    timeout: 5000,
    defaultHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    endpoints: {
      users: '/users',
      posts: '/posts',
      comments: '/comments',
      albums: '/albums',
      photos: '/photos',
      todos: '/todos'
    },
    retry: {
      enabled: true,
      maxRetries: 3,
      delay: 1000
    }
  },
  
  // UI testing settings
  ui: {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    login: {
      url: '/login',
      usernameSelector: 'input[name="username"]',
      passwordSelector: 'input[name="password"]',
      submitSelector: 'button[type="submit"]'
    },
    dashboard: {
      url: '/dashboard',
      headerSelector: '.dashboard-header'
    },
    users: {
      url: '/users',
      tableSelector: '.users-table'
    },
    posts: {
      url: '/posts',
      tableSelector: '.posts-table'
    },
    navigation: {
      mainMenuSelector: '.main-menu',
      userMenuSelector: '.user-menu',
      logoutSelector: '.logout-button'
    }
  },
  
  // Reporting settings
  reporting: {
    outputDir: './reports',
    screenshotsDir: './reports/screenshots',
    videosDir: './reports/videos',
    logsDir: './reports/logs',
    reportPortal: {
      enabled: false,
      endpoint: 'https://reportportal.example.com/api/v1',
      project: 'hybdpytest',
      launchName: 'Test Run'
    },
    allure: {
      enabled: true,
      outputDir: './reports/allure-results',
      categories: './allure-categories.json'
    },
    junit: {
      enabled: true,
      outputFile: './reports/junit-results.xml'
    },
    html: {
      enabled: true,
      outputDir: './reports/html-report'
    }
  },
  
  // Parallel execution settings
  parallel: {
    enabled: true,
    workers: 4,
    sharding: {
      enabled: false,
      shards: 1,
      currentShard: 1
    }
  },
  
  // Browser settings
  browsers: {
    chrome: {
      enabled: true,
      headless: true,
      defaultViewport: {
        width: 1280,
        height: 720
      },
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox'
      ]
    },
    firefox: {
      enabled: false,
      headless: true,
      defaultViewport: {
        width: 1280,
        height: 720
      }
    },
    webkit: {
      enabled: false,
      headless: true,
      defaultViewport: {
        width: 1280,
        height: 720
      }
    }
  },
  
  // AI integration settings
  ai: {
    enabled: true,
    openAI: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      maxTokens: 2000
    },
    generationEnabled: true,
    analysisEnabled: true
  },
  
  // Cloud integration settings
  cloud: {
    browserStack: {
      enabled: false,
      username: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
      projectName: 'Hybrid Playwright Framework',
      buildName: 'Test Build',
      local: true
    },
    lambdaTest: {
      enabled: false,
      username: process.env.LAMBDATEST_USERNAME,
      accessKey: process.env.LAMBDATEST_ACCESS_KEY,
      projectName: 'Hybrid Playwright Framework',
      buildName: 'Test Build',
      local: true
    }
  },
  
  // Integration settings
  integrations: {
    jira: {
      enabled: false,
      url: 'https://jira.example.com',
      project: 'TEST',
      issueType: 'Bug',
      username: process.env.JIRA_USERNAME,
      password: process.env.JIRA_PASSWORD
    },
    slack: {
      enabled: false,
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      channel: '#test-automation',
      username: 'Test Bot'
    },
    aws: {
      enabled: false,
      region: 'us-west-2',
      s3: {
        bucket: 'test-reports',
        prefix: 'hybrid-playwright-framework'
      }
    }
  }
};