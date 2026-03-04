import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, LoginRequest, type User } from '@/api/auth'
import { message } from 'antd'

interface AuthState {
  // 状态
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  login: (data: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: User) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // 登录 action
      login: async (data: LoginRequest) => {
        try {
          set({ isLoading: true })
          const response = await authApi.login(data)
          const { user, accessToken, refreshToken } = response.data

          set({
            user,
            accessToken,
            refreshToken,
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
            isAuthenticated: false,
            isLoading: false,
          })

          console.error('登出失败:', error)
        }
      },

      // 刷新令牌 action
      refreshToken: async () => {
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
            isAuthenticated: false,
          })

          console.error('刷新令牌失败:', error)
          throw error
        }
      },

      // 设置认证信息
      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        })
      },

      // 设置令牌
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken })
      },

      // 设置用户信息
      setUser: (user) => {
        set({ user })
      },

      // 清除认证信息
      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        // 只持久化这些字段
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
