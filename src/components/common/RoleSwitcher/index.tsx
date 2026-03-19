import React, { useState } from 'react'
import { Dropdown, Button, Space, Tag, Modal } from 'antd'
import {
  SwapOutlined,
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAuthStore } from '@/store'
import { useNavigate } from 'react-router-dom'
import { getDefaultHomePath, ROLE_DISPLAY_NAMES } from '@/router'

/**
 * 角色图标映射
 */
const ROLE_ICONS: Record<string, React.ReactNode> = {
  USER: <UserOutlined />,
  COUNSELOR: <TeamOutlined />,
  ADMIN: <CrownOutlined />,
}

/**
 * 角色颜色映射
 */
const ROLE_COLORS: Record<string, string> = {
  USER: 'blue',
  COUNSELOR: 'green',
  ADMIN: 'red',
}

/**
 * 角色切换组件
 * 用于拥有多个角色的用户在不同角色之间切换
 */
const RoleSwitcher: React.FC = () => {
  const { user, activeRole, switchRole } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // 如果用户未登录或只有一个角色，不显示切换按钮
  if (!user || !user.roles || user.roles.length <= 1) {
    return null
  }

  /**
   * 处理角色切换
   */
  const handleRoleSwitch = async (role: string) => {
    if (role === activeRole) {
      return
    }

    Modal.confirm({
      title: '确认切换角色',
      content: `确定要切换到 ${ROLE_DISPLAY_NAMES[role] || role} 角色吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        setLoading(true)
        try {
          await switchRole(role)

          // 切换成功后跳转到对应角色的首页
          const homePath = getDefaultHomePath(role)
          navigate(homePath)
        } catch (error) {
          console.error('角色切换失败:', error)
        } finally {
          setLoading(false)
        }
      },
    })
  }

  /**
   * 构建下拉菜单项
   */
  const menuItems: MenuProps['items'] = user.roles.map(role => ({
    key: role,
    label: (
      <Space>
        {ROLE_ICONS[role]}
        <span>{ROLE_DISPLAY_NAMES[role] || role}</span>
        {role === activeRole && (
          <Tag color={ROLE_COLORS[role]} style={{ marginLeft: 8 }}>
            当前
          </Tag>
        )}
      </Space>
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
        type="text"
        loading={loading}
        icon={<SwapOutlined />}
        className="flex items-center"
      >
        <Space>
          <span className="hidden sm:inline">
            {ROLE_DISPLAY_NAMES[activeRole || ''] || '切换角色'}
          </span>
          <Tag color={ROLE_COLORS[activeRole || '']} className="m-0">
            {activeRole}
          </Tag>
        </Space>
      </Button>
    </Dropdown>
  )
}

export default RoleSwitcher
