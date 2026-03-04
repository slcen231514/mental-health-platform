/**
 * 表单验证工具
 * 提供常用的表单验证规则和验证函数
 */

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean
  message?: string
}

/**
 * 验证规则类型
 */
export type ValidatorFunction = (value: any) => ValidationResult

/**
 * 验证手机号（中国大陆）
 * @param phone 手机号
 * @returns 验证结果
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { valid: false, message: '请输入手机号' }
  }

  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: '请输入正确的手机号' }
  }

  return { valid: true }
}

/**
 * 验证邮箱
 * @param email 邮箱地址
 * @returns 验证结果
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { valid: false, message: '请输入邮箱地址' }
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(email)) {
    return { valid: false, message: '请输入正确的邮箱地址' }
  }

  return { valid: true }
}

/**
 * 验证密码强度
 * 要求：至少8位，包含大小写字母、数字
 * @param password 密码
 * @returns 验证结果
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, message: '请输入密码' }
  }

  if (password.length < 8) {
    return { valid: false, message: '密码长度至少为8位' }
  }

  if (password.length > 20) {
    return { valid: false, message: '密码长度不能超过20位' }
  }

  // 检查是否包含大写字母
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: '密码必须包含大写字母' }
  }

  // 检查是否包含小写字母
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: '密码必须包含小写字母' }
  }

  // 检查是否包含数字
  if (!/\d/.test(password)) {
    return { valid: false, message: '密码必须包含数字' }
  }

  return { valid: true }
}

/**
 * 验证密码强度（简单版）
 * 要求：至少6位
 * @param password 密码
 * @returns 验证结果
 */
export function validatePasswordSimple(password: string): ValidationResult {
  if (!password) {
    return { valid: false, message: '请输入密码' }
  }

  if (password.length < 6) {
    return { valid: false, message: '密码长度至少为6位' }
  }

  if (password.length > 20) {
    return { valid: false, message: '密码长度不能超过20位' }
  }

  return { valid: true }
}

/**
 * 验证两次密码是否一致
 * @param password 密码
 * @param confirmPassword 确认密码
 * @returns 验证结果
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (!confirmPassword) {
    return { valid: false, message: '请再次输入密码' }
  }

  if (password !== confirmPassword) {
    return { valid: false, message: '两次输入的密码不一致' }
  }

  return { valid: true }
}

/**
 * 验证用户名
 * 要求：4-20位，只能包含字母、数字、下划线
 * @param username 用户名
 * @returns 验证结果
 */
export function validateUsername(username: string): ValidationResult {
  if (!username) {
    return { valid: false, message: '请输入用户名' }
  }

  if (username.length < 4) {
    return { valid: false, message: '用户名长度至少为4位' }
  }

  if (username.length > 20) {
    return { valid: false, message: '用户名长度不能超过20位' }
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!usernameRegex.test(username)) {
    return { valid: false, message: '用户名只能包含字母、数字、下划线' }
  }

  return { valid: true }
}

/**
 * 验证身份证号（中国大陆）
 * @param idCard 身份证号
 * @returns 验证结果
 */
export function validateIdCard(idCard: string): ValidationResult {
  if (!idCard) {
    return { valid: false, message: '请输入身份证号' }
  }

  // 18位身份证号正则
  const idCardRegex =
    /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/

  if (!idCardRegex.test(idCard)) {
    return { valid: false, message: '请输入正确的身份证号' }
  }

  return { valid: true }
}

/**
 * 验证 URL
 * @param url URL 地址
 * @returns 验证结果
 */
export function validateUrl(url: string): ValidationResult {
  if (!url) {
    return { valid: false, message: '请输入URL地址' }
  }

  try {
    new URL(url)
    return { valid: true }
  } catch {
    return { valid: false, message: '请输入正确的URL地址' }
  }
}

/**
 * 验证数字
 * @param value 值
 * @param min 最小值（可选）
 * @param max 最大值（可选）
 * @returns 验证结果
 */
export function validateNumber(
  value: any,
  min?: number,
  max?: number
): ValidationResult {
  if (value === '' || value === null || value === undefined) {
    return { valid: false, message: '请输入数字' }
  }

  const num = Number(value)

  if (isNaN(num)) {
    return { valid: false, message: '请输入有效的数字' }
  }

  if (min !== undefined && num < min) {
    return { valid: false, message: `数字不能小于${min}` }
  }

  if (max !== undefined && num > max) {
    return { valid: false, message: `数字不能大于${max}` }
  }

  return { valid: true }
}

/**
 * 验证整数
 * @param value 值
 * @param min 最小值（可选）
 * @param max 最大值（可选）
 * @returns 验证结果
 */
export function validateInteger(
  value: any,
  min?: number,
  max?: number
): ValidationResult {
  const numberResult = validateNumber(value, min, max)
  if (!numberResult.valid) {
    return numberResult
  }

  const num = Number(value)
  if (!Number.isInteger(num)) {
    return { valid: false, message: '请输入整数' }
  }

  return { valid: true }
}

/**
 * 验证必填项
 * @param value 值
 * @param fieldName 字段名称
 * @returns 验证结果
 */
export function validateRequired(value: any, fieldName: string = '此项'): ValidationResult {
  if (value === '' || value === null || value === undefined) {
    return { valid: false, message: `${fieldName}不能为空` }
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, message: `${fieldName}不能为空` }
  }

  if (Array.isArray(value) && value.length === 0) {
    return { valid: false, message: `${fieldName}不能为空` }
  }

  return { valid: true }
}

/**
 * 验证字符串长度
 * @param value 值
 * @param min 最小长度
 * @param max 最大长度
 * @param fieldName 字段名称
 * @returns 验证结果
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string = '此项'
): ValidationResult {
  if (!value) {
    return { valid: false, message: `请输入${fieldName}` }
  }

  const length = value.length

  if (length < min) {
    return { valid: false, message: `${fieldName}长度至少为${min}位` }
  }

  if (length > max) {
    return { valid: false, message: `${fieldName}长度不能超过${max}位` }
  }

  return { valid: true }
}

/**
 * 验证正则表达式
 * @param value 值
 * @param regex 正则表达式
 * @param message 错误消息
 * @returns 验证结果
 */
export function validateRegex(
  value: string,
  regex: RegExp,
  message: string = '格式不正确'
): ValidationResult {
  if (!value) {
    return { valid: false, message: '请输入内容' }
  }

  if (!regex.test(value)) {
    return { valid: false, message }
  }

  return { valid: true }
}

/**
 * 组合多个验证器
 * @param validators 验证器数组
 * @returns 组合后的验证器
 */
export function combineValidators(
  ...validators: ValidatorFunction[]
): ValidatorFunction {
  return (value: any): ValidationResult => {
    for (const validator of validators) {
      const result = validator(value)
      if (!result.valid) {
        return result
      }
    }
    return { valid: true }
  }
}

/**
 * Ant Design Form 验证规则生成器
 */
export const formRules = {
  /**
   * 必填规则
   */
  required: (message: string = '此项为必填项') => ({
    required: true,
    message,
  }),

  /**
   * 手机号规则
   */
  phone: () => ({
    validator: (_: any, value: string) => {
      const result = validatePhone(value)
      return result.valid ? Promise.resolve() : Promise.reject(result.message)
    },
  }),

  /**
   * 邮箱规则
   */
  email: () => ({
    validator: (_: any, value: string) => {
      const result = validateEmail(value)
      return result.valid ? Promise.resolve() : Promise.reject(result.message)
    },
  }),

  /**
   * 密码规则
   */
  password: () => ({
    validator: (_: any, value: string) => {
      const result = validatePassword(value)
      return result.valid ? Promise.resolve() : Promise.reject(result.message)
    },
  }),

  /**
   * 密码规则（简单版）
   */
  passwordSimple: () => ({
    validator: (_: any, value: string) => {
      const result = validatePasswordSimple(value)
      return result.valid ? Promise.resolve() : Promise.reject(result.message)
    },
  }),

  /**
   * 确认密码规则
   */
  confirmPassword: (passwordField: string = 'password') => ({
    validator: (_: any, value: string, form: any) => {
      const password = form.getFieldValue(passwordField)
      const result = validatePasswordMatch(password, value)
      return result.valid ? Promise.resolve() : Promise.reject(result.message)
    },
  }),

  /**
   * 用户名规则
   */
  username: () => ({
    validator: (_: any, value: string) => {
      const result = validateUsername(value)
      return result.valid ? Promise.resolve() : Promise.reject(result.message)
    },
  }),

  /**
   * 长度规则
   */
  length: (min: number, max: number, fieldName: string = '此项') => ({
    validator: (_: any, value: string) => {
      const result = validateLength(value, min, max, fieldName)
      return result.valid ? Promise.resolve() : Promise.reject(result.message)
    },
  }),

  /**
   * 数字规则
   */
  number: (min?: number, max?: number) => ({
    validator: (_: any, value: any) => {
      const result = validateNumber(value, min, max)
      return result.valid ? Promise.resolve() : Promise.reject(result.message)
    },
  }),

  /**
   * 整数规则
   */
  integer: (min?: number, max?: number) => ({
    validator: (_: any, value: any) => {
      const result = validateInteger(value, min, max)
      return result.valid ? Promise.resolve() : Promise.reject(result.message)
    },
  }),
}

export default {
  validatePhone,
  validateEmail,
  validatePassword,
  validatePasswordSimple,
  validatePasswordMatch,
  validateUsername,
  validateIdCard,
  validateUrl,
  validateNumber,
  validateInteger,
  validateRequired,
  validateLength,
  validateRegex,
  combineValidators,
  formRules,
}
