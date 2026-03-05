import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Button, Badge } from 'antd'
import {
  HomeOutlined,
  FormOutlined,
  MessageOutlined,
  HeartOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/', icon: <HomeOutlined />, label: '首页' },
  { key: '/assessment', icon: <FormOutlined />, label: '心理评估' },
  { key: '/dialogue', icon: <MessageOutlined />, label: 'AI对话' },
  { key: '/intervention', icon: <HeartOutlined />, label: '干预工具' },
  { key: '/counselor', icon: <TeamOutlined />, label: '咨询师' },
]

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { unreadCount, fetchUnreadCount } = useNotificationStore()

  // 定期获取未读通知数量
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000) // 每30秒刷新一次
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // 获取完整的头像URL
  const getAvatarUrl = (avatar?: string) => {
    if (!avatar) return undefined
    // 如果已经是完整URL，直接返回
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar
    }
    // 否则拼接API base URL
    return `${import.meta.env.VITE_API_BASE_URL}${avatar}`
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: user?.avatar ? (
        <Avatar size={16} src={getAvatarUrl(user.avatar)} />
      ) : (
        <UserOutlined />
      ),
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        className="shadow-md"
      >
        <div className="h-16 flex items-center justify-center border-b">
          <span
            className={`font-bold text-primary ${collapsed ? 'text-lg' : 'text-xl'}`}
          >
            {collapsed ? '心理' : '心理健康平台'}
          </span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="border-r-0"
        />
      </Sider>
      <Layout className="overflow-hidden">
        <Header className="bg-white px-4 flex items-center justify-between shadow-sm">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div className="flex items-center gap-4">
            <Badge count={unreadCount} offset={[-5, 5]}>
              <Button
                type="text"
                icon={<BellOutlined className="text-lg" />}
                onClick={() => navigate('/notifications')}
                className="flex items-center justify-center"
              />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center cursor-pointer hover:bg-gray-100 px-3 py-1 rounded">
                <Avatar
                  icon={<UserOutlined />}
                  src={getAvatarUrl(user?.avatar)}
                  className="bg-primary"
                />
                <span className="ml-2">{user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          className="m-4 p-6 bg-white rounded-lg overflow-y-auto"
          style={{ height: 'calc(100vh - 112px)' }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
