import { useState, useEffect, useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Button, Badge, Drawer } from 'antd'
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
  DashboardOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DollarOutlined,
  IdcardOutlined,
  AuditOutlined,
  UsergroupAddOutlined,
  FileSearchOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import RoleSwitcher from '../components/common/RoleSwitcher'
import NotificationCenter from '../components/common/NotificationCenter'

const { Header, Sider, Content } = Layout

// 用户角色导航菜单
const userMenuItems = [
  { key: '/', icon: <HomeOutlined />, label: '首页' },
  { key: '/assessment', icon: <FormOutlined />, label: '心理评估' },
  { key: '/dialogue', icon: <MessageOutlined />, label: 'AI对话' },
  { key: '/intervention', icon: <HeartOutlined />, label: '干预工具' },
  { key: '/counselor', icon: <TeamOutlined />, label: '咨询师' },
]

// 咨询师角色导航菜单
const counselorMenuItems = [
  { key: '/counselor/dashboard', icon: <DashboardOutlined />, label: '工作台' },
  {
    key: '/counselor/appointments',
    icon: <CalendarOutlined />,
    label: '我的预约',
  },
  { key: '/counselor/schedule', icon: <CalendarOutlined />, label: '时间表' },
  { key: '/counselor/records', icon: <FileTextOutlined />, label: '咨询记录' },
  { key: '/counselor/income', icon: <DollarOutlined />, label: '收入统计' },
  { key: '/counselor/profile', icon: <IdcardOutlined />, label: '个人资料' },
]

// 管理员角色导航菜单
const adminMenuItems = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '仪表板' },
  { key: '/admin/users', icon: <UsergroupAddOutlined />, label: '用户管理' },
  { key: '/admin/applications', icon: <AuditOutlined />, label: '咨询师审核' },
  { key: '/admin/logs', icon: <FileSearchOutlined />, label: '系统日志' },
]

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [notificationVisible, setNotificationVisible] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, activeRole, logout } = useAuthStore()
  const { unreadCount, fetchUnreadCount } = useNotificationStore()

  // 根据当前活动角色选择导航菜单
  const menuItems = useMemo(() => {
    switch (activeRole) {
      case 'ADMIN':
        return adminMenuItems
      case 'COUNSELOR':
        return counselorMenuItems
      case 'USER':
      default:
        return userMenuItems
    }
  }, [activeRole])

  // 检测屏幕尺寸
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  const handleMenuClick = (key: string) => {
    navigate(key)
    if (isMobile) {
      setMobileDrawerVisible(false)
    }
  }

  // 侧边栏内容
  const sidebarContent = (
    <>
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
        onClick={({ key }) => handleMenuClick(key)}
        className="border-r-0"
      />
    </>
  )

  return (
    <Layout className="min-h-screen">
      {/* 桌面端侧边栏 */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="light"
          className="shadow-md"
        >
          {sidebarContent}
        </Sider>
      )}

      {/* 移动端抽屉 */}
      {isMobile && (
        <Drawer
          placement="left"
          onClose={() => setMobileDrawerVisible(false)}
          open={mobileDrawerVisible}
          bodyStyle={{ padding: 0 }}
          width={250}
        >
          {sidebarContent}
        </Drawer>
      )}

      <Layout className="overflow-hidden">
        <Header className="bg-white px-4 flex items-center justify-between shadow-sm">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => {
              if (isMobile) {
                setMobileDrawerVisible(!mobileDrawerVisible)
              } else {
                setCollapsed(!collapsed)
              }
            }}
          />
          <div className="flex items-center gap-2 md:gap-4">
            {/* 角色切换组件 */}
            <RoleSwitcher />

            {/* 通知中心按钮 */}
            <Badge count={unreadCount} offset={[-5, 5]}>
              <Button
                type="text"
                icon={<BellOutlined className="text-lg" />}
                onClick={() => setNotificationVisible(true)}
                className="flex items-center justify-center"
              />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center cursor-pointer hover:bg-gray-100 px-2 md:px-3 py-1 rounded">
                <Avatar
                  size={isMobile ? 'small' : 'default'}
                  icon={<UserOutlined />}
                  src={getAvatarUrl(user?.avatar)}
                  className="bg-primary"
                />
                <span className="ml-2 hidden sm:inline">{user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          className="m-2 md:m-4 p-3 md:p-6 bg-white rounded-lg overflow-y-auto"
          style={{ height: 'calc(100vh - 112px)' }}
        >
          <Outlet />
        </Content>
      </Layout>

      {/* 通知中心抽屉 */}
      <NotificationCenter
        visible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
      />
    </Layout>
  )
}
