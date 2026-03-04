import { create } from 'zustand'
import { userApi, type UserProfile, type UpdateUserProfileRequest } from '@/api/user'
import { message } from 'antd'

interface UserState {
  // 状态
  profile: UserProfile | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchUserProfile: () => Promise<void>
  updateUserProfile: (data: UpdateUserProfileRequest) => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
  setProfile: (profile: UserProfile) => void
  clearProfile: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  // 初始状态
  profile: null,
  isLoading: false,
  error: null,

  // 获取用户信息 action
  fetchUserProfile: async () => {
    try {
      set({ isLoading: true, error: null })
      const response = await userApi.getUserProfile()
      set({
        profile: response.data,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error?.message || '获取用户信息失败',
        isLoading: false,
      })
      message.error(error?.message || '获取用户信息失败')
      throw error
    }
  },

  // 更新用户信息 action
  updateUserProfile: async (data: UpdateUserProfileRequest) => {
    try {
      set({ isLoading: true, error: null })
      const response = await userApi.updateUserProfile(data)
      set({
        profile: response.data,
        isLoading: false,
      })
      message.success('更新成功')
    } catch (error: any) {
      set({
        error: error?.message || '更新失败',
        isLoading: false,
      })
      message.error(error?.message || '更新失败')
      throw error
    }
  },

  // 上传头像 action
  uploadAvatar: async (file: File) => {
    try {
      set({ isLoading: true, error: null })
      const response = await userApi.uploadAvatar(file)
      const avatarUrl = response.data.url

      // 更新 profile 中的头像
      const currentProfile = get().profile
      if (currentProfile) {
        set({
          profile: { ...currentProfile, avatar: avatarUrl },
          isLoading: false,
        })
      }

      message.success('头像上传成功')
    } catch (error: any) {
      set({
        error: error?.message || '头像上传失败',
        isLoading: false,
      })
      message.error(error?.message || '头像上传失败')
      throw error
    }
  },

  // 设置用户信息
  setProfile: (profile) => {
    set({ profile })
  },

  // 清除用户信息
  clearProfile: () => {
    set({ profile: null, error: null })
  },
}))

export default useUserStore
