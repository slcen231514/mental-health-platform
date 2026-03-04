import request from './request'
import { ApiResponse } from './auth'

// ==================== 枚举类型 ====================

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  ASSESSMENT = 'ASSESSMENT',
  APPOINTMENT = 'APPOINTMENT',
  DIALOGUE = 'DIALOGUE',
  INTERVENTION = 'INTERVENTION',
  REMINDER = 'REMINDER',
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
}

// ==================== 请求类型 ====================

export interface GetNotificationsRequest {
  page?: number
  size?: number
  type?: NotificationType
  status?: NotificationStatus
}

export interface UpdatePreferencesRequest {
  channels: NotificationChannel[]
  types: NotificationType[]
  quietHoursStart?: string // HH:mm 格式
  quietHoursEnd?: string // HH:mm 格式
  enableQuietHours?: boolean
}

// ==================== 响应类型 ====================

export interface Notification {
  id: number
  type: NotificationType
  title: string
  content: string
  status: NotificationStatus
  relatedId?: number
  relatedType?: string
  createdAt: string
  readAt?: string
}

export interface NotificationPreferences {
  id: number
  userId: number
  channels: NotificationChannel[]
  types: NotificationType[]
  quietHoursStart?: string
  quietHoursEnd?: string
  enableQuietHours: boolean
  createdAt: string
  updatedAt: string
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Record<NotificationType, number>
}

// ==================== Notification API ====================

export const notificationApi = {
  /**
   * 获取通知列表
   * @param params 查询参数
   * @returns 通知列表
   */
  getNotifications: (
    params: GetNotificationsRequest = {}
  ): Promise<
    ApiResponse<{
      items: Notification[]
      total: number
      page: number
      size: number
      unreadCount: number
    }>
  > => {
    return request.get('/notifications', { params })
  },

  /**
   * 获取未读通知数量
   * @returns 未读数量
   */
  getUnreadCount: (): Promise<ApiResponse<{ count: number }>> => {
    return request.get('/notifications/unread/count')
  },

  /**
   * 标记通知为已读
   * @param id 通知ID
   * @returns 操作结果
   */
  markAsRead: (id: number): Promise<ApiResponse<void>> => {
    return request.put(`/notifications/${id}/read`)
  },

  /**
   * 批量标记通知为已读
   * @param ids 通知ID数组
   * @returns 操作结果
   */
  markMultipleAsRead: (ids: number[]): Promise<ApiResponse<void>> => {
    return request.put('/notifications/read/batch', { ids })
  },

  /**
   * 标记所有通知为已读
   * @returns 操作结果
   */
  markAllAsRead: (): Promise<ApiResponse<void>> => {
    return request.put('/notifications/read/all')
  },

  /**
   * 删除通知
   * @param id 通知ID
   * @returns 操作结果
   */
  deleteNotification: (id: number): Promise<ApiResponse<void>> => {
    return request.delete(`/notifications/${id}`)
  },

  /**
   * 批量删除通知
   * @param ids 通知ID数组
   * @returns 操作结果
   */
  deleteMultiple: (ids: number[]): Promise<ApiResponse<void>> => {
    return request.delete('/notifications/batch', { data: { ids } })
  },

  /**
   * 清空所有已读通知
   * @returns 操作结果
   */
  clearRead: (): Promise<ApiResponse<void>> => {
    return request.delete('/notifications/read/clear')
  },

  /**
   * 获取通知偏好设置
   * @returns 偏好设置
   */
  getPreferences: (): Promise<ApiResponse<NotificationPreferences>> => {
    return request.get('/notifications/preferences')
  },

  /**
   * 更新通知偏好设置
   * @param data 偏好设置
   * @returns 更新后的偏好设置
   */
  updatePreferences: (
    data: UpdatePreferencesRequest
  ): Promise<ApiResponse<NotificationPreferences>> => {
    return request.put('/notifications/preferences', data)
  },

  /**
   * 获取通知统计信息
   * @returns 统计信息
   */
  getStatistics: (): Promise<ApiResponse<NotificationStats>> => {
    return request.get('/notifications/statistics')
  },

  /**
   * 测试通知发送
   * @param channel 通知渠道
   * @returns 测试结果
   */
  testNotification: (
    channel: NotificationChannel
  ): Promise<ApiResponse<void>> => {
    return request.post('/notifications/test', { channel })
  },
}

export default notificationApi
