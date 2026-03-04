import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { authApi, LoginRequest } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const onFinish = async (values: LoginRequest) => {
    setLoading(true)
    try {
      const res = await authApi.login(values)
      const { user, accessToken, refreshToken } = res.data
      setAuth(user, accessToken, refreshToken)
      message.success('登录成功')
      navigate('/')
    } catch (error: any) {
      message.error(error.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-xl">
      <h2 className="text-2xl font-bold text-center mb-6">用户登录</h2>
      <Form name="login" onFinish={onFinish} size="large">
        <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
          <Input prefix={<UserOutlined />} placeholder="用户名" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="密码" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            登录
          </Button>
        </Form.Item>
        <div className="text-center">
          还没有账号？<Link to="/register" className="text-primary">立即注册</Link>
        </div>
      </Form>
    </Card>
  )
}
