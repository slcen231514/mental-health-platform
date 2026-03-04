/**
 * 环境变量配置
 * Environment Configuration
 */

export const env = {
  // API 配置
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  wsUrl: import.meta.env.VITE_WS_URL,
  
  // 应用配置
  appTitle: import.meta.env.VITE_APP_TITLE,
  appVersion: import.meta.env.VITE_APP_VERSION,
  environment: import.meta.env.VITE_ENV,
  
  // 第三方服务
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
  
  // 调试配置
  debug: import.meta.env.VITE_DEBUG === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL,
  enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',
  
  // 环境判断
  isDevelopment: import.meta.env.VITE_ENV === 'development',
  isProduction: import.meta.env.VITE_ENV === 'production',
  isTest: import.meta.env.VITE_ENV === 'test',
} as const

// 验证必需的环境变量
const requiredEnvVars = [
  'VITE_API_BASE_URL',
  'VITE_APP_TITLE',
] as const

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`)
  }
}

export default env
