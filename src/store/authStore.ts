import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, LoginRequest, type User } from '@/api/auth'
import { message } from 'antd'
import request from '@/api/request'

interface AuthState {
  // 状态
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  activeRole: string | null // 当前活动角色
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  login: (data: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<void>
  switchRole: (role: string) => Promise<void>
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: User) => void
  setActiveRole: (role: string) => void
  clearAuth: () => void
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      accessToken: null,
      refreshToken: null,
      activeRole: null,
      isAuthenticated: false,
      isLoading: false,

      // 登录 action
      login: async (data: LoginRequest) => {
        try {
          set({ isLoading: true })
          const response = await authApi.login(data)
          const { user, accessToken, refreshToken } = response.data

          // 设置默认活动角色为用户的第一个角色
          const defaultRole =
            user.roles && user.roles.length > 0 ? user.roles[0] : null

          set({
            user,
            accessToken,
            refreshToken,
            activeRole: defaultRole,
            isAuthenticated: true,
            isLoading: false,
          })

          message.success('登录成功')
        } catch (error: any) {
          set({ isLoading: false })
          message.error(error?.message || '登录失败')
          throw error
        }
      },

      // 登出 action
      logout: async () => {
        try {
          set({ isLoading: true })
          await authApi.logout()

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            activeRole: null,
            isAuthenticated: false,
            isLoading: false,
          })

          message.success('已退出登录')
        } catch (error: any) {
          // 即使登出失败也清除本地状态
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            activeRole: null,
            isAuthenticated: false,
            isLoading: false,
          })

          console.error('登出失败:', error)
        }
      },

      // 刷新令牌 action
      refreshAccessToken: async () => {
        try {
          const currentRefreshToken = get().refreshToken
          if (!currentRefreshToken) {
            throw new Error('没有刷新令牌')
          }

          const response = await authApi.refreshToken(currentRefreshToken)
          const { accessToken, refreshToken, user } = response.data

          set({
            accessToken,
            refreshToken,
            user,
            isAuthenticated: true,
          })
        } catch (error: any) {
          // 刷新失败，清除认证状态
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            activeRole: null,
            isAuthenticated: false,
          })

          console.error('刷新令牌失败:', error)
          throw error
        }
      },

      // 切换角色 action
      switchRole: async (role: string) => {
        try {
          const { user } = get()
          if (!user) {
            throw new Error('用户未登录')
          }

          // 验证用户是否拥有该角色
          if (!user.roles.includes(role)) {
            throw new Error('用户没有该角色权限')
          }

          // 调用后端API切换角色
          const response = await request.post(`/users/${user.id}/switch-role`, {
            activeRole: role,
          })

          const { token: newAccessToken } = response.data

          // 更新活动角色和token
          set({
            activeRole: role,
            accessToken: newAccessToken,
          })

          message.success(`已切换到${getRoleDisplayName(role)}角色`)
        } catch (error: any) {
          message.error(error?.message || '角色切换失败')
          throw error
        }
      },

      // 设置认证信息
      setAuth: (user, accessToken, refreshToken) => {
        const defaultRole =
          user.roles && user.roles.length > 0 ? user.roles[0] : null
        set({
          user,
          accessToken,
          refreshToken,
          activeRole: defaultRole,
          isAuthenticated: true,
        })
      },

      // 设置令牌
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken })
      },

      // 设置用户信息
      setUser: user => {
        set({ user })
      },

      // 设置活动角色
      setActiveRole: role => {
        set({ activeRole: role })
      },

      // 清除认证信息
      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          activeRole: null,
          isAuthenticated: false,
        })
      },

      // 检查用户是否拥有指定角色
      hasRole: (role: string) => {
        const { user } = get()
        return user?.roles?.includes(role) || false
      },

      // 检查用户是否拥有任意一个指定角色
      hasAnyRole: (roles: string[]) => {
        const { user } = get()
        if (!user?.roles) return false
        return roles.some(role => user.roles.includes(role))
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: state => ({
        // 只持久化这些字段
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        activeRole: state.activeRole,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// 辅助函数：获取角色显示名称
function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    USER: '普通用户',
    COUNSELOR: '咨询师',
    ADMIN: '管理员',
  }
  return roleNames[role] || role
}

export default useAuthStore
