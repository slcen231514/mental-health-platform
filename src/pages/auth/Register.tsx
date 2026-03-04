import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Select, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { authApi, RegisterRequest } from '../../api/auth'

export default function Register() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values: RegisterRequest & { confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }
    setLoading(true)
    try {
      await authApi.register(values)
      message.success('注册成功，请登录')
      navigate('/login')
    } catch (error: any) {
      message.error(error.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-xl">
      <h2 className="text-2xl font-bold text-center mb-6">用户注册</h2>
      <Form name="register" onFinish={onFinish} size="large">
        <Form.Item name="username" rules={[
          { required: true, message: '请输入用户名' },
          { min: 3, max: 50, message: '用户名长度3-50个字符' },
          { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线' }
        ]}>
          <Input prefix={<UserOutlined />} placeholder="用户名" />
        </Form.Item>
        <Form.Item name="email" rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '邮箱格式不正确' }
        ]}>
          <Input prefix={<MailOutlined />} placeholder="邮箱" />
        </Form.Item>
        <Form.Item name="password" rules={[
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码至少8个字符' },
          { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, message: '需包含大小写字母和数字' }
        ]}>
          <Input.Password prefix={<LockOutlined />} placeholder="密码" />
        </Form.Item>
        <Form.Item name="confirmPassword" rules={[{ required: true, message: '请确认密码' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
        </Form.Item>
        <Form.Item name="phone">
          <Input prefix={<PhoneOutlined />} placeholder="手机号（选填）" />
        </Form.Item>
        <Form.Item name="gender">
          <Select placeholder="性别（选填）" allowClear>
            <Select.Option value="MALE">男</Select.Option>
            <Select.Option value="FEMALE">女</Select.Option>
            <Select.Option value="OTHER">其他</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            注册
          </Button>
        </Form.Item>
        <div className="text-center">
          已有账号？<Link to="/login" className="text-primary">立即登录</Link>
        </div>
      </Form>
    </Card>
  )
}
