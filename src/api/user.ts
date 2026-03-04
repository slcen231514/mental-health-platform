import request from './request'
import { ApiResponse, User } from './auth'

// ==================== 请求类型 ====================

export interface UpdateUserProfileRequest {
  username?: string
  email?: string
  phone?: string
  gender?: string
  avatar?: string
  bio?: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UploadAvatarRequest {
  file: File
}

// ==================== 响应类型 ====================

export interface UserProfile extends User {
  avatar?: string
  bio?: string
  createdAt?: string
  updatedAt?: string
}

export interface UserStatistics {
  assessmentCount: number
  dialogueCount: number
  appointmentCount: number
  interventionCount: number
}

// ==================== User API ====================

export const userApi = {
  /**
   * 获取用户信息
   * @returns 用户详细信息
   */
  getUserProfile: (): Promise<ApiResponse<UserProfile>> => {
    return request.get('/users/profile')
  },

  /**
   * 更新用户信息
   * @param data 更新的用户信息
   * @returns 更新后的用户信息
   */
  updateUserProfile: (
    data: UpdateUserProfileRequest
  ): Promise<ApiResponse<UserProfile>> => {
    return request.put('/users/profile', data)
  },

  /**
   * 修改密码
   * @param data 密码信息
   * @returns 修改结果
   */
  changePassword: (
    data: ChangePasswordRequest
  ): Promise<ApiResponse<void>> => {
    return request.put('/users/password', data)
  },

  /**
   * 上传头像
   * @param file 头像文件
   * @returns 头像 URL
   */
  uploadAvatar: (file: File): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData()
    formData.append('file', file)

    return request.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * 获取用户统计信息
   * @returns 用户统计数据
   */
  getUserStatistics: (): Promise<ApiResponse<UserStatistics>> => {
    return request.get('/users/statistics')
  },

  /**
   * 删除用户账号
   * @param password 确认密码
   * @returns 删除结果
   */
  deleteAccount: (password: string): Promise<ApiResponse<void>> => {
    return request.delete('/users/account', {
      data: { password },
    })
  },

  /**
   * 获取用户活动日志
   * @param page 页码
   * @param size 每页数量
   * @returns 活动日志列表
   */
  getActivityLogs: (
    page: number = 1,
    size: number = 20
  ): Promise<
    ApiResponse<{
      items: Array<{
        id: number
        action: string
        description: string
        ipAddress: string
        createdAt: string
      }>
      total: number
      page: number
      size: number
    }>
  > => {
    return request.get('/users/activity-logs', {
      params: { page, size },
    })
  },
}

export default userApi
