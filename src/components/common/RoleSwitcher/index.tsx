import { useState } from 'react'
import { Dropdown, Button, Tag } from 'antd'
import {
  SwapOutlined,
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { getDefaultHomePath, ROLE_DISPLAY_NAMES } from '@/router'
import type { MenuProps } from 'antd'

const RoleSwitcher: React.FC = () => {
  const { user, activeRole, switchRole } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // 如果用户未登录或只有一个角色，不显示切换器
  if (!user || !user.roles || user.roles.length <= 1) {
    return null
  }

  // 角色图标映射
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'USER':
        return <UserOutlined />
      case 'COUNSELOR':
        return <TeamOutlined />
      case 'ADMIN':
        return <CrownOutlined />
      default:
        return <UserOutlined />
    }
  }

  // 处理角色切换
  const handleRoleSwitch = async (role: string) => {
    if (role === activeRole) return

    try {
      setLoading(true)
      await switchRole(role)

      // 切换成功后跳转到对应角色的首页
      const homePath = getDefaultHomePath(role)
      navigate(homePath)
    } catch (error) {
      console.error('角色切换失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 构建下拉菜单项
  const menuItems: MenuProps['items'] = user.roles.map(role => ({
    key: role,
    label: (
      <div className="flex items-center justify-between min-w-[120px]">
        <span className="flex items-center gap-2">
          {getRoleIcon(role)}
          {ROLE_DISPLAY_NAMES[role] || role}
        </span>
        {role === activeRole && (
          <Tag color="blue" className="ml-2">
            当前
          </Tag>
        )}
      </div>
    ),
    onClick: () => handleRoleSwitch(role),
  }))

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button
        icon={<SwapOutlined />}
        loading={loading}
        className="flex items-center gap-1"
      >
        <span className="hidden sm:inline">
          {ROLE_DISPLAY_NAMES[activeRole || 'USER']}
        </span>
      </Button>
    </Dropdown>
  )
}

export default RoleSwitcher
