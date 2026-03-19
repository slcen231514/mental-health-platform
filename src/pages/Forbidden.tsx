import React from 'react'
import { Button, Result } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'

/**
 * 403 Forbidden 页面
 * 当用户尝试访问无权限的资源时显示
 */
const Forbidden: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, activeRole } = useAuthStore()

  // 获取尝试访问的路径和所需权限
  const from = (location.state as any)?.from?.pathname || '/'
  const requiredRole = (location.state as any)?.requiredRole

  const handleBackHome = () => {
    // 根据用户角色返回对应的首页
    if (activeRole === 'ADMIN') {
      navigate('/admin/dashboard')
    } else if (activeRole === 'COUNSELOR') {
      navigate('/counselor/dashboard')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Result
        status="403"
        title="403"
        subTitle={
          <div className="space-y-2">
            <p>抱歉，您没有权限访问此页面。</p>
            {requiredRole && (
              <p className="text-sm text-gray-500">
                此页面需要 <span className="font-semibold">{requiredRole}</span>{' '}
                角色权限
              </p>
            )}
            {user && (
              <p className="text-sm text-gray-500">
                当前角色:{' '}
                <span className="font-semibold">{activeRole || '未设置'}</span>
              </p>
            )}
          </div>
        }
        extra={
          <div className="space-x-2">
            <Button type="primary" onClick={handleBackHome}>
              返回首页
            </Button>
            <Button onClick={() => navigate(-1)}>返回上一页</Button>
          </div>
        }
      />
    </div>
  )
}

export default Forbidden
