import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd'
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
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'

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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心', onClick: () => navigate('/profile') },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
  ]

  return (
    <Layout className="min-h-screen">
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light" className="shadow-md">
        <div className="h-16 flex items-center justify-center border-b">
          <span className={`font-bold text-primary ${collapsed ? 'text-lg' : 'text-xl'}`}>
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
      <Layout>
        <Header className="bg-white px-4 flex items-center justify-between shadow-sm">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center cursor-pointer hover:bg-gray-100 px-3 py-1 rounded">
              <Avatar icon={<UserOutlined />} className="bg-primary" />
              <span className="ml-2">{user?.username}</span>
            </div>
          </Dropdown>
        </Header>
        <Content className="m-4 p-6 bg-white rounded-lg min-h-[calc(100vh-112px)]">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
