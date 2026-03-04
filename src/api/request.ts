import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { message } from 'antd'
import { useAuthStore } from '@/store/authStore'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 是否正在刷新 token
let isRefreshing = false
// 重试队列
let requests: Array<(token: string) => void> = []

// 请求拦截器 - 令牌注入
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 获取 token
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加用户ID头(用于dialogue API等)
    const user = useAuthStore.getState().user
    if (user?.id) {
      config.headers['X-User-Id'] = user.id.toString()
    } else {
      // 如果没有登录,使用默认用户ID(仅用于开发/测试)
      config.headers['X-User-Id'] = '1'
    }

    // 添加请求时间戳
    config.headers['X-Request-Time'] = Date.now().toString()

    return config
  },
  (error: AxiosError) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 错误处理和令牌刷新
request.interceptors.response.use(
  (response) => {
    // 直接返回 data 部分
    return response.data
  },
  async (error: AxiosError<{ code: string; message: string }>) => {
    const { response, config } = error

    // 网络错误
    if (!response) {
      message.error('网络连接失败，请检查网络设置')
      return Promise.reject(error)
    }

    const { status, data } = response

    // 处理不同的错误状态码
    switch (status) {
      case 401: {
        // 未授权 - 尝试刷新 token
        const refreshToken = useAuthStore.getState().refreshToken

        if (!refreshToken) {
          // 没有 refresh token，直接登出
          useAuthStore.getState().logout()
          window.location.href = '/login'
          message.error('登录已过期，请重新登录')
          return Promise.reject(error)
        }

        // 如果正在刷新 token，将请求加入队列
        if (isRefreshing) {
          return new Promise((resolve) => {
            requests.push((token: string) => {
              if (config) {
                config.headers.Authorization = `Bearer ${token}`
                resolve(request(config))
              }
            })
          })
        }

        isRefreshing = true

        try {
          // 调用刷新 token 接口
          const { data: tokenData } = await axios.post('/api/users/refresh', null, {
            params: { refreshToken },
          })

          const newAccessToken = tokenData.data.accessToken
          const newRefreshToken = tokenData.data.refreshToken

          // 更新 store 中的 token
          useAuthStore.getState().setTokens(newAccessToken, newRefreshToken)

          // 重试队列中的请求
          requests.forEach((cb) => cb(newAccessToken))
          requests = []

          // 重试当前请求
          if (config) {
            config.headers.Authorization = `Bearer ${newAccessToken}`
            return request(config)
          }
        } catch (refreshError) {
          // 刷新 token 失败，登出
          useAuthStore.getState().logout()
          window.location.href = '/login'
          message.error('登录已过期，请重新登录')
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
        break
      }

      case 403:
        message.error('没有权限访问该资源')
        break

      case 404:
        message.error('请求的资源不存在')
        break

      case 500:
        message.error('服务器错误，请稍后重试')
        break

      case 502:
      case 503:
      case 504:
        message.error('服务暂时不可用，请稍后重试')
        break

      default:
        // 显示后端返回的错误信息
        if (data?.message) {
          message.error(data.message)
        } else {
          message.error(`请求失败: ${status}`)
        }
    }

    return Promise.reject(error.response?.data || error)
  }
)

export default request
