/**
 * API 工具函数
 * API Utility Functions
 */

import env from '@/config/env'

/**
 * 获取完整的 API URL
 */
export function getApiUrl(path: string): string {
  const baseUrl = env.apiBaseUrl
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}

/**
 * 获取 WebSocket URL
 */
export function getWsUrl(path: string = ''): string {
  const baseUrl = env.wsUrl
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}

/**
 * 日志工具
 */
export const logger = {
  debug: (...args: any[]) => {
    if (env.debug && env.logLevel === 'debug') {
      console.debug('[DEBUG]', ...args)
    }
  },
  info: (...args: any[]) => {
    if (env.debug && ['debug', 'info'].includes(env.logLevel)) {
      console.info('[INFO]', ...args)
    }
  },
  warn: (...args: any[]) => {
    if (['debug', 'info', 'warn'].includes(env.logLevel)) {
      console.warn('[WARN]', ...args)
    }
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args)
  },
}

/**
 * 环境信息
 */
export function getEnvironmentInfo() {
  return {
    title: env.appTitle,
    version: env.appVersion,
    environment: env.environment,
    isDevelopment: env.isDevelopment,
    isProduction: env.isProduction,
    debug: env.debug,
  }
}
