import request from './request'
import { MOCK_ENABLED, mockLogin, mockRegister } from './mock'

// ==================== 请求类型 ====================

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  phone?: string
  gender?: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

// ==================== 响应类型 ====================

export interface User {
  id: number
  username: string
  email: string
  phone?: string
  gender?: string
  avatar?: string
  bio?: string
  status: string
  roles: string[]
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// ==================== Auth API ====================

export const authApi = {
  /**
   * 用户登录
   * @param data 登录信息
   * @returns Token 和用户信息
   */
  login: (data: LoginRequest): Promise<ApiResponse<TokenResponse>> => {
    if (MOCK_ENABLED) {
      return mockLogin(data.username, data.password) as Promise<
        ApiResponse<TokenResponse>
      >
    }
    return request.post('/users/login', data)
  },

  /**
   * 用户注册
   * @param data 注册信息
   * @returns 注册结果
   */
  register: (data: RegisterRequest): Promise<ApiResponse<TokenResponse>> => {
    if (MOCK_ENABLED) {
      return mockRegister(data) as Promise<ApiResponse<TokenResponse>>
    }
    return request.post('/users/register', data)
  },

  /**
   * 刷新访问令牌
   * @param refreshToken 刷新令牌
   * @returns 新的 Token
   */
  refreshToken: (refreshToken: string): Promise<ApiResponse<TokenResponse>> => {
    return request.post('/users/refresh', null, {
      params: { refreshToken },
    })
  },

  /**
   * 用户登出
   * @returns 登出结果
   */
  logout: (): Promise<ApiResponse<void>> => {
    return request.post('/users/logout')
  },

  /**
   * 请求密码重置
   * @param email 用户邮箱
   * @returns 请求结果
   */
  requestPasswordReset: (email: string): Promise<ApiResponse<void>> => {
    return request.post('/users/password/reset/request', null, {
      params: { email },
    })
  },

  /**
   * 重置密码
   * @param token 重置令牌
   * @param newPassword 新密码
   * @returns 重置结果
   */
  resetPassword: (
    token: string,
    newPassword: string
  ): Promise<ApiResponse<void>> => {
    return request.post('/users/password/reset', {
      token,
      newPassword,
    })
  },

  /**
   * 验证邮箱
   * @param token 验证令牌
   * @returns 验证结果
   */
  verifyEmail: (token: string): Promise<ApiResponse<void>> => {
    return request.post('/users/email/verify', null, {
      params: { token },
    })
  },

  /**
   * 重新发送验证邮件
   * @param email 用户邮箱
   * @returns 发送结果
   */
  resendVerificationEmail: (email: string): Promise<ApiResponse<void>> => {
    return request.post('/users/email/resend', null, {
      params: { email },
    })
  },
}

export default authApi
