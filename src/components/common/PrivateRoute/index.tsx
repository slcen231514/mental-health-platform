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
   * 需要的角色列表（满足任意一个即可）
   */
  requiredRoles?: string[]
}

/**
 * PrivateRoute 路由守卫组件
 * 用于保护需要登录才能访问的路由
 * 支持基于角色的访问控制
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  redirectTo = '/login',
  requiredRoles,
}) => {
  const location = useLocation()
  const { isAuthenticated, user, activeRole, isLoading } = useAuthStore()

  // 如果正在加载认证状态，显示加载中
  if (isLoading) {
    return <Loading fullscreen tip="验证登录状态..." />
  }

  // 如果未登录，重定向到登录页
  if (!isAuthenticated) {
    // 保存当前路径，登录后可以返回
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // 如果需要特定角色，检查用户是否有该角色
  if (requiredRoles && requiredRoles.length > 0 && user) {
    // 检查用户是否拥有任意一个所需角色
    const hasRequiredRole = requiredRoles.some(role =>
      user.roles?.includes(role)
    )

    if (!hasRequiredRole) {
      // 用户没有所需角色，重定向到403页面
      return (
        <Navigate
          to="/403"
          state={{
            from: location,
            requiredRole: requiredRoles.join(' 或 '),
            currentRole: activeRole,
          }}
          replace
        />
      )
    }
  }

  // 已登录且有权限，渲染子组件
  return <>{children}</>
}

export default PrivateRoute
