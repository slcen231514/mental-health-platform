import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import Loading from '../Loading'

/**
 * PrivateRoute 组件属性
 */
export interface PrivateRouteProps {
  /**
   * 子组件
   */
  children: React.ReactNode
  /**
   * 未登录时重定向的路径
   */
  redirectTo?: string
  /**
   * 是否需要特定权限
   */
  requiredPermission?: string
}

/**
 * PrivateRoute 路由守卫组件
 * 用于保护需要登录才能访问的路由
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  redirectTo = '/login',
  requiredPermission,
}) => {
  const location = useLocation()
  const { isAuthenticated, user, isLoading } = useAuthStore()

  // 如果正在加载认证状态，显示加载中
  if (isLoading) {
    return <Loading fullscreen tip="验证登录状态..." />
  }

  // 如果未登录，重定向到登录页
  if (!isAuthenticated) {
    // 保存当前路径，登录后可以返回
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // 如果需要特定权限，检查用户是否有该权限
  if (requiredPermission && user) {
    // 这里可以根据实际的权限系统进行检查
    // 示例：检查用户角色或权限列表
    const hasPermission = checkUserPermission(user, requiredPermission)
    if (!hasPermission) {
      return (
        <Navigate to="/403" state={{ from: location, requiredPermission }} replace />
      )
    }
  }

  // 已登录且有权限，渲染子组件
  return <>{children}</>
}

/**
 * 检查用户权限（示例实现）
 * 实际项目中需要根据具体的权限系统实现
 */
function checkUserPermission(user: any, permission: string): boolean {
  // 示例：检查用户角色
  if (user.role === 'admin') {
    return true
  }

  // 示例：检查用户权限列表
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.includes(permission)
  }

  return false
}

export default PrivateRoute
