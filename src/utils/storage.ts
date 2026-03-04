/**
 * 本地存储工具
 * 封装 localStorage 和 sessionStorage，提供类型安全的存储操作
 */

/**
 * 存储类型
 */
export type StorageType = 'local' | 'session'

/**
 * 存储键名常量
 */
export const STORAGE_KEYS = {
  // 认证相关
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',

  // 用户偏好
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',

  // 缓存数据
  ASSESSMENT_DRAFT: 'assessment_draft',
  DIALOGUE_DRAFT: 'dialogue_draft',

  // 其他
  LAST_VISIT: 'last_visit',
  REMEMBER_ME: 'remember_me',
} as const

/**
 * 获取存储对象
 */
function getStorage(type: StorageType = 'local'): Storage {
  return type === 'local' ? localStorage : sessionStorage
}

/**
 * 设置存储项
 * @param key 键名
 * @param value 值（会自动序列化为 JSON）
 * @param type 存储类型，默认 'local'
 */
export function setItem<T = any>(
  key: string,
  value: T,
  type: StorageType = 'local'
): void {
  try {
    const storage = getStorage(type)
    const serializedValue = JSON.stringify(value)
    storage.setItem(key, serializedValue)
  } catch (error) {
    console.error(`Failed to set storage item "${key}":`, error)
  }
}

/**
 * 获取存储项
 * @param key 键名
 * @param type 存储类型，默认 'local'
 * @returns 值（会自动反序列化）
 */
export function getItem<T = any>(key: string, type: StorageType = 'local'): T | null {
  try {
    const storage = getStorage(type)
    const serializedValue = storage.getItem(key)

    if (serializedValue === null) {
      return null
    }

    return JSON.parse(serializedValue) as T
  } catch (error) {
    console.error(`Failed to get storage item "${key}":`, error)
    return null
  }
}

/**
 * 获取存储项，如果不存在则返回默认值
 * @param key 键名
 * @param defaultValue 默认值
 * @param type 存储类型，默认 'local'
 * @returns 值或默认值
 */
export function getItemOrDefault<T = any>(
  key: string,
  defaultValue: T,
  type: StorageType = 'local'
): T {
  const value = getItem<T>(key, type)
  return value !== null ? value : defaultValue
}

/**
 * 移除存储项
 * @param key 键名
 * @param type 存储类型，默认 'local'
 */
export function removeItem(key: string, type: StorageType = 'local'): void {
  try {
    const storage = getStorage(type)
    storage.removeItem(key)
  } catch (error) {
    console.error(`Failed to remove storage item "${key}":`, error)
  }
}

/**
 * 清空所有存储项
 * @param type 存储类型，默认 'local'
 */
export function clear(type: StorageType = 'local'): void {
  try {
    const storage = getStorage(type)
    storage.clear()
  } catch (error) {
    console.error('Failed to clear storage:', error)
  }
}

/**
 * 检查存储项是否存在
 * @param key 键名
 * @param type 存储类型，默认 'local'
 * @returns 是否存在
 */
export function hasItem(key: string, type: StorageType = 'local'): boolean {
  try {
    const storage = getStorage(type)
    return storage.getItem(key) !== null
  } catch (error) {
    console.error(`Failed to check storage item "${key}":`, error)
    return false
  }
}

/**
 * 获取所有存储键名
 * @param type 存储类型，默认 'local'
 * @returns 键名数组
 */
export function getAllKeys(type: StorageType = 'local'): string[] {
  try {
    const storage = getStorage(type)
    return Object.keys(storage)
  } catch (error) {
    console.error('Failed to get all storage keys:', error)
    return []
  }
}

/**
 * 获取存储项数量
 * @param type 存储类型，默认 'local'
 * @returns 数量
 */
export function getLength(type: StorageType = 'local'): number {
  try {
    const storage = getStorage(type)
    return storage.length
  } catch (error) {
    console.error('Failed to get storage length:', error)
    return 0
  }
}

/**
 * 设置带过期时间的存储项
 * @param key 键名
 * @param value 值
 * @param expiresIn 过期时间（毫秒）
 * @param type 存储类型，默认 'local'
 */
export function setItemWithExpiry<T = any>(
  key: string,
  value: T,
  expiresIn: number,
  type: StorageType = 'local'
): void {
  const now = Date.now()
  const item = {
    value,
    expiry: now + expiresIn,
  }
  setItem(key, item, type)
}

/**
 * 获取带过期时间的存储项
 * @param key 键名
 * @param type 存储类型，默认 'local'
 * @returns 值（如果已过期则返回 null）
 */
export function getItemWithExpiry<T = any>(
  key: string,
  type: StorageType = 'local'
): T | null {
  const item = getItem<{ value: T; expiry: number }>(key, type)

  if (!item) {
    return null
  }

  const now = Date.now()

  // 检查是否过期
  if (now > item.expiry) {
    removeItem(key, type)
    return null
  }

  return item.value
}

/**
 * 批量设置存储项
 * @param items 键值对对象
 * @param type 存储类型，默认 'local'
 */
export function setItems(
  items: Record<string, any>,
  type: StorageType = 'local'
): void {
  Object.entries(items).forEach(([key, value]) => {
    setItem(key, value, type)
  })
}

/**
 * 批量获取存储项
 * @param keys 键名数组
 * @param type 存储类型，默认 'local'
 * @returns 键值对对象
 */
export function getItems(
  keys: string[],
  type: StorageType = 'local'
): Record<string, any> {
  const result: Record<string, any> = {}

  keys.forEach((key) => {
    result[key] = getItem(key, type)
  })

  return result
}

/**
 * 批量移除存储项
 * @param keys 键名数组
 * @param type 存储类型，默认 'local'
 */
export function removeItems(keys: string[], type: StorageType = 'local'): void {
  keys.forEach((key) => {
    removeItem(key, type)
  })
}

/**
 * 获取存储空间使用情况（估算）
 * @param type 存储类型，默认 'local'
 * @returns 使用的字节数（估算值）
 */
export function getStorageSize(type: StorageType = 'local'): number {
  try {
    const storage = getStorage(type)
    let size = 0

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key) {
        const value = storage.getItem(key)
        if (value) {
          // 估算：key + value 的字符长度 * 2（UTF-16）
          size += (key.length + value.length) * 2
        }
      }
    }

    return size
  } catch (error) {
    console.error('Failed to get storage size:', error)
    return 0
  }
}

/**
 * 格式化存储大小为可读字符串
 * @param bytes 字节数
 * @returns 格式化后的字符串（如：1.5 MB）
 */
export function formatStorageSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  const kb = bytes / 1024
  if (kb < 1024) {
    return `${kb.toFixed(2)} KB`
  }

  const mb = kb / 1024
  return `${mb.toFixed(2)} MB`
}

/**
 * 检查存储是否可用
 * @param type 存储类型，默认 'local'
 * @returns 是否可用
 */
export function isStorageAvailable(type: StorageType = 'local'): boolean {
  try {
    const storage = getStorage(type)
    const testKey = '__storage_test__'
    storage.setItem(testKey, 'test')
    storage.removeItem(testKey)
    return true
  } catch (error) {
    return false
  }
}

export default {
  setItem,
  getItem,
  getItemOrDefault,
  removeItem,
  clear,
  hasItem,
  getAllKeys,
  getLength,
  setItemWithExpiry,
  getItemWithExpiry,
  setItems,
  getItems,
  removeItems,
  getStorageSize,
  formatStorageSize,
  isStorageAvailable,
  STORAGE_KEYS,
}
