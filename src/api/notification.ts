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
  USER_REGISTERED = 'USER_REGISTERED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED',
  APPLICATION_APPROVED = 'APPLICATION_APPROVED',
  APPLICATION_REJECTED = 'APPLICATION_REJECTED',
  COUNSELOR_STATUS_CHANGED = 'COUNSELOR_STATUS_CHANGED',
  APPOINTMENT_CREATED = 'APPOINTMENT_CREATED',
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_COMPLETED = 'APPOINTMENT_COMPLETED',
  APPOINTMENT_FEEDBACK = 'APPOINTMENT_FEEDBACK',
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
  type: NotificationType | string
  title: string
  content: string
  status: NotificationStatus
  relatedId?: number
  relatedType?: string
  createdAt: string
  readAt?: string
}

const normalizeDateTime = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
  }
  if (Array.isArray(value) && value.length >= 6) {
    const year = Number(value[0])
    const month = Number(value[1])
    const day = Number(value[2])
    const hour = Number(value[3])
    const minute = Number(value[4])
    const second = Number(value[5])
    const nano = value.length >= 7 ? Number(value[6]) : 0
    const ms = Math.floor(nano / 1_000_000)
    const dt = new Date(year, month - 1, day, hour, minute, second, ms)
    return dt.toISOString()
  }
  return new Date().toISOString()
}

export interface NotificationPreferences {
  id?: number
  userId: number
  channels: NotificationChannel[]
  types: NotificationType[]
  quietHoursStart?: string
  quietHoursEnd?: string
  enableQuietHours: boolean
  createdAt?: string
  updatedAt?: string
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
    return request.get('/notifications', { params }).then((res: any) => {
      const data = res?.data || {}
      const items = Array.isArray(data.items)
        ? data.items.map((item: any) => ({
            ...item,
            createdAt: normalizeDateTime(item.createdAt),
            readAt: item.readAt ? normalizeDateTime(item.readAt) : undefined,
          }))
        : []
      return {
        ...res,
        data: {
          ...data,
          items,
        },
      }
    })
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
    return request.get('/notifications/preferences').then((res: any) => {
      const raw = res.data || {}
      const channels: NotificationChannel[] = []
      if (raw.enableInApp) channels.push(NotificationChannel.IN_APP)
      if (raw.enableEmail) channels.push(NotificationChannel.EMAIL)
      if (raw.enableSms) channels.push(NotificationChannel.SMS)

      const types: NotificationType[] = [NotificationType.SYSTEM]
      if (raw.enableAppointmentReminder) {
        types.push(NotificationType.APPOINTMENT, NotificationType.REMINDER)
      }
      if (raw.enableTaskReminder) {
        types.push(NotificationType.INTERVENTION, NotificationType.REMINDER)
      }
      if (raw.enableAssessmentNotification) {
        types.push(NotificationType.ASSESSMENT)
      }

      return {
        ...res,
        data: {
          userId: Number(raw.userId ?? 0),
          channels,
          types,
          enableQuietHours: false,
          quietHoursStart: undefined,
          quietHoursEnd: undefined,
        } as NotificationPreferences,
      }
    })
  },

  /**
   * 更新通知偏好设置
   * @param data 偏好设置
   * @returns 更新后的偏好设置
   */
  updatePreferences: (
    data: UpdatePreferencesRequest
  ): Promise<ApiResponse<NotificationPreferences>> => {
    const channels = data.channels || []
    const types = data.types || []

    const payload = {
      enableInApp: channels.includes(NotificationChannel.IN_APP),
      enableEmail: channels.includes(NotificationChannel.EMAIL),
      enableSms: channels.includes(NotificationChannel.SMS),
      enableAppointmentReminder:
        types.includes(NotificationType.APPOINTMENT) ||
        types.includes(NotificationType.REMINDER),
      enableTaskReminder:
        types.includes(NotificationType.INTERVENTION) ||
        types.includes(NotificationType.REMINDER),
      enableAssessmentNotification: types.includes(NotificationType.ASSESSMENT),
    }

    return request.put('/notifications/preferences', payload).then(() => {
      return notificationApi.getPreferences()
    })
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
