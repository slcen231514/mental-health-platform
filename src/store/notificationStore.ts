import { create } from 'zustand'
import {
  notificationApi,
  type Notification,
  type GetNotificationsRequest,
} from '@/api/notification'
import { message } from 'antd'

interface NotificationState {
  // 状态
  notifications: Notification[]
  unreadCount: number
  total: number
  page: number
  size: number
  isLoading: boolean
  error: string | null

  // Actions
  fetchNotifications: (params?: GetNotificationsRequest) => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: number) => Promise<void>
  setNotifications: (notifications: Notification[]) => void
  setUnreadCount: (count: number) => void
  clearNotifications: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // 初始状态
  notifications: [],
  unreadCount: 0,
  total: 0,
  page: 1,
  size: 20,
  isLoading: false,
  error: null,

  // 获取通知列表 action
  fetchNotifications: async (params: GetNotificationsRequest = {}) => {
    try {
      set({ isLoading: true, error: null })
      const response = await notificationApi.getNotifications(params)
      set({
        notifications: response.data.items,
        unreadCount: response.data.unreadCount,
        total: response.data.total,
        page: response.data.page,
        size: response.data.size,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error?.message || '获取通知失败',
        isLoading: false,
      })
      message.error(error?.message || '获取通知失败')
      throw error
    }
  },

  // 获取未读数量 action
  fetchUnreadCount: async () => {
    try {
      const response = await notificationApi.getUnreadCount()
      set({ unreadCount: response.data.count })
    } catch (error: any) {
      console.error('获取未读数量失败:', error)
    }
  },

  // 标记为已读 action
  markAsRead: async (id: number) => {
    try {
      await notificationApi.markAsRead(id)

      // 更新本地状态
      const notifications = get().notifications.map((n) =>
        n.id === id ? { ...n, status: 'READ' as const } : n
      )
      const unreadCount = Math.max(0, get().unreadCount - 1)

      set({ notifications, unreadCount })
      message.success('已标记为已读')
    } catch (error: any) {
      message.error(error?.message || '操作失败')
      throw error
    }
  },

  // 全部标记为已读 action
  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead()

      // 更新本地状态
      const notifications = get().notifications.map((n) => ({
        ...n,
        status: 'READ' as const,
      }))

      set({ notifications, unreadCount: 0 })
      message.success('已全部标记为已读')
    } catch (error: any) {
      message.error(error?.message || '操作失败')
      throw error
    }
  },

  // 删除通知 action
  deleteNotification: async (id: number) => {
    try {
      await notificationApi.deleteNotification(id)

      // 更新本地状态
      const notification = get().notifications.find((n) => n.id === id)
      const notifications = get().notifications.filter((n) => n.id !== id)
      const unreadCount =
        notification?.status === 'UNREAD'
          ? Math.max(0, get().unreadCount - 1)
          : get().unreadCount

      set({
        notifications,
        unreadCount,
        total: Math.max(0, get().total - 1),
      })

      message.success('删除成功')
    } catch (error: any) {
      message.error(error?.message || '删除失败')
      throw error
    }
  },

  // 设置通知列表
  setNotifications: (notifications) => {
    set({ notifications })
  },

  // 设置未读数量
  setUnreadCount: (count) => {
    set({ unreadCount: count })
  },

  // 清除通知
  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
      total: 0,
      error: null,
    })
  },
}))

export default useNotificationStore
