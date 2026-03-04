import { message as antdMessage, notification } from 'antd'
import type { AxiosError } from 'axios'

/**
 * 错误处理工具
 */

/**
 * API 错误响应接口
 */
export interface ApiErrorResponse {
  code: number
  message: string
  data?: any
  timestamp?: number
}

/**
 * 错误类型
 */
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BUSINESS_ERROR = 'BUSINESS_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * 标准化错误对象
 */
export interface StandardError {
  type: ErrorType
  code: number
  message: string
  originalError?: any
  timestamp: number
}

/**
 * 错误消息映射
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: '请求参数错误',
  401: '未登录或登录已过期，请重新登录',
  403: '没有权限访问此资源',
  404: '请求的资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务暂时不可用',
  504: '网关超时',
}

/**
 * 解析 Axios 错误
 * @param error Axios 错误对象
 * @returns 标准化错误对象
 */
export function parseAxiosError(error: AxiosError<ApiErrorResponse>): StandardError {
  const timestamp = Date.now()

  // 网络错误
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return {
        type: ErrorType.TIMEOUT_ERROR,
        code: 408,
        message: '请求超时，请稍后重试',
        originalError: error,
        timestamp,
      }
    }

    return {
      type: ErrorType.NETWORK_ERROR,
      code: 0,
      message: '网络连接失败，请检查网络设置',
      originalError: error,
      timestamp,
    }
  }

  const { status, data } = error.response

  // 根据状态码分类错误
  let type: ErrorType
  let message: string

  switch (status) {
    case 401:
      type = ErrorType.AUTH_ERROR
      message = data?.message || ERROR_MESSAGES[401]
      break

    case 403:
      type = ErrorType.PERMISSION_ERROR
      message = data?.message || ERROR_MESSAGES[403]
      break

    case 404:
      type = ErrorType.NOT_FOUND_ERROR
      message = data?.message || ERROR_MESSAGES[404]
      break

    case 400:
    case 422:
      type = ErrorType.VALIDATION_ERROR
      message = data?.message || ERROR_MESSAGES[400]
      break

    case 500:
    case 502:
    case 503:
    case 504:
      type = ErrorType.SERVER_ERROR
      message = data?.message || ERROR_MESSAGES[status] || '服务器错误'
      break

    default:
      if (status >= 400 && status < 500) {
        type = ErrorType.BUSINESS_ERROR
        message = data?.message || '请求失败'
      } else {
        type = ErrorType.UNKNOWN_ERROR
        message = data?.message || '未知错误'
      }
  }

  return {
    type,
    code: status,
    message,
    originalError: error,
    timestamp,
  }
}

/**
 * 处理错误并显示提示
 * @param error 错误对象
 * @param options 选项
 */
export function handleError(
  error: any,
  options: {
    showMessage?: boolean
    showNotification?: boolean
    customMessage?: string
    onError?: (error: StandardError) => void
  } = {}
): StandardError {
  const {
    showMessage = true,
    showNotification = false,
    customMessage,
    onError,
  } = options

  // 解析错误
  let standardError: StandardError

  if (error.isAxiosError) {
    standardError = parseAxiosError(error as AxiosError<ApiErrorResponse>)
  } else if (error instanceof Error) {
    standardError = {
      type: ErrorType.UNKNOWN_ERROR,
      code: 0,
      message: error.message,
      originalError: error,
      timestamp: Date.now(),
    }
  } else {
    standardError = {
      type: ErrorType.UNKNOWN_ERROR,
      code: 0,
      message: String(error),
      originalError: error,
      timestamp: Date.now(),
    }
  }

  // 使用自定义消息
  if (customMessage) {
    standardError.message = customMessage
  }

  // 显示错误提示
  if (showMessage) {
    antdMessage.error(standardError.message)
  }

  if (showNotification) {
    notification.error({
      message: '错误',
      description: standardError.message,
      duration: 4.5,
    })
  }

  // 调用自定义错误处理函数
  if (onError) {
    onError(standardError)
  }

  // 记录错误日志
  console.error('[Error Handler]', standardError)

  return standardError
}

/**
 * 显示成功消息
 * @param message 消息内容
 * @param duration 显示时长（秒）
 */
export function showSuccess(message: string, duration: number = 3): void {
  antdMessage.success(message, duration)
}

/**
 * 显示错误消息
 * @param message 消息内容
 * @param duration 显示时长（秒）
 */
export function showError(message: string, duration: number = 3): void {
  antdMessage.error(message, duration)
}

/**
 * 显示警告消息
 * @param message 消息内容
 * @param duration 显示时长（秒）
 */
export function showWarning(message: string, duration: number = 3): void {
  antdMessage.warning(message, duration)
}

/**
 * 显示信息消息
 * @param message 消息内容
 * @param duration 显示时长（秒）
 */
export function showInfo(message: string, duration: number = 3): void {
  antdMessage.info(message, duration)
}

/**
 * 显示加载消息
 * @param message 消息内容
 * @param duration 显示时长（秒），0 表示不自动关闭
 * @returns 关闭函数
 */
export function showLoading(message: string = '加载中...', duration: number = 0): () => void {
  return antdMessage.loading(message, duration)
}

/**
 * 显示成功通知
 * @param title 标题
 * @param description 描述
 * @param duration 显示时长（秒）
 */
export function notifySuccess(
  title: string,
  description?: string,
  duration: number = 4.5
): void {
  notification.success({
    message: title,
    description,
    duration,
  })
}

/**
 * 显示错误通知
 * @param title 标题
 * @param description 描述
 * @param duration 显示时长（秒）
 */
export function notifyError(
  title: string,
  description?: string,
  duration: number = 4.5
): void {
  notification.error({
    message: title,
    description,
    duration,
  })
}

/**
 * 显示警告通知
 * @param title 标题
 * @param description 描述
 * @param duration 显示时长（秒）
 */
export function notifyWarning(
  title: string,
  description?: string,
  duration: number = 4.5
): void {
  notification.warning({
    message: title,
    description,
    duration,
  })
}

/**
 * 显示信息通知
 * @param title 标题
 * @param description 描述
 * @param duration 显示时长（秒）
 */
export function notifyInfo(
  title: string,
  description?: string,
  duration: number = 4.5
): void {
  notification.info({
    message: title,
    description,
    duration,
  })
}

/**
 * 关闭所有消息提示
 */
export function closeAllMessages(): void {
  antdMessage.destroy()
}

/**
 * 关闭所有通知
 */
export function closeAllNotifications(): void {
  notification.destroy()
}

/**
 * 错误重试包装器
 * @param fn 要执行的函数
 * @param maxRetries 最大重试次数
 * @param retryDelay 重试延迟（毫秒）
 * @returns Promise
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: any

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      console.warn(`Retry ${i + 1}/${maxRetries} failed:`, error)

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
      }
    }
  }

  throw lastError
}

/**
 * 安全执行函数（捕获错误）
 * @param fn 要执行的函数
 * @param fallbackValue 失败时的默认值
 * @returns 执行结果或默认值
 */
export function safeExecute<T>(fn: () => T, fallbackValue: T): T {
  try {
    return fn()
  } catch (error) {
    console.error('Safe execute failed:', error)
    return fallbackValue
  }
}

/**
 * 安全执行异步函数（捕获错误）
 * @param fn 要执行的异步函数
 * @param fallbackValue 失败时的默认值
 * @returns 执行结果或默认值
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  fallbackValue: T
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    console.error('Safe execute async failed:', error)
    return fallbackValue
  }
}

/**
 * 创建错误日志记录器
 * @param context 上下文信息
 * @returns 日志记录函数
 */
export function createErrorLogger(context: string) {
  return (error: any, additionalInfo?: any) => {
    console.error(`[${context}]`, error, additionalInfo)

    // 这里可以添加错误上报逻辑
    // reportErrorToService(context, error, additionalInfo)
  }
}

export default {
  parseAxiosError,
  handleError,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo,
  closeAllMessages,
  closeAllNotifications,
  withRetry,
  safeExecute,
  safeExecuteAsync,
  createErrorLogger,
  ErrorType,
}
