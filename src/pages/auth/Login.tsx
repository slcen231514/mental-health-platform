import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, Checkbox, Card, Divider, Space } from 'antd'
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store'
import { formRules, handleError, showSuccess } from '@/utils'
import type { LoginRequest } from '@/api/auth'

/**
 * 登录表单数据
 */
interface LoginFormData extends LoginRequest {
  remember?: boolean
}

/**
 * 登录页面组件
 */
const Login: React.FC = () => {
  const [form] = Form.useForm<LoginFormData>()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()

  // 获取登录前的路径，登录成功后跳转回去
  const from = (location.state as any)?.from?.pathname || '/'

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: LoginFormData) => {
    setLoading(true)

    try {
      // 调用登录 API
      await login({
        username: values.username,
        password: values.password,
      })

      // 登录成功提示
      showSuccess('登录成功，欢迎回来！')

      // 跳转到目标页面
      navigate(from, { replace: true })
    } catch (error: any) {
      // 错误处理
      handleError(error, {
        showMessage: true,
        customMessage:
          error?.response?.data?.message || '登录失败，请检查用户名和密码',
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * 处理 Enter 键提交
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      form.submit()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card
        className="w-full max-w-md shadow-2xl"
        bordered={false}
        style={{ borderRadius: '12px' }}
      >
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <SafetyOutlined className="text-3xl text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            心理健康平台
          </h1>
          <p className="text-gray-500">欢迎回来，请登录您的账号</p>
        </div>

        {/* 登录表单 */}
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          size="large"
          autoComplete="off"
          initialValues={{ remember: true }}
        >
          {/* 用户名输入框 */}
          <Form.Item
            name="username"
            rules={[
              formRules.required('请输入用户名'),
              {
                min: 4,
                message: '用户名至少4个字符',
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="请输入用户名"
              onKeyPress={handleKeyPress}
              autoComplete="username"
            />
          </Form.Item>

          {/* 密码输入框 */}
          <Form.Item
            name="password"
            rules={[
              formRules.required('请输入密码'),
              {
                min: 6,
                message: '密码至少6个字符',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="请输入密码"
              onKeyPress={handleKeyPress}
              autoComplete="current-password"
            />
          </Form.Item>

          {/* 记住我和忘记密码 */}
          <Form.Item>
            <div className="flex justify-between items-center">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <Link
                to="/forgot-password"
                className="text-blue-500 hover:text-blue-600"
              >
                忘记密码？
              </Link>
            </div>
          </Form.Item>

          {/* 登录按钮 */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="h-12 text-base font-medium"
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>

          {/* 分隔线 */}
          <Divider plain>
            <span className="text-gray-400 text-sm">其他登录方式</span>
          </Divider>

          {/* 第三方登录（预留） */}
          <div className="flex justify-center gap-4 mb-6">
            <Space size="large">
              <Button
                shape="circle"
                size="large"
                icon={<span className="text-xl">📱</span>}
                title="手机号登录"
                disabled
              />
              <Button
                shape="circle"
                size="large"
                icon={<span className="text-xl">💬</span>}
                title="微信登录"
                disabled
              />
              <Button
                shape="circle"
                size="large"
                icon={<span className="text-xl">📧</span>}
                title="邮箱登录"
                disabled
              />
            </Space>
          </div>

          {/* 注册链接 */}
          <div className="text-center text-gray-600">
            还没有账号？
            <Link
              to="/register"
              className="text-blue-500 hover:text-blue-600 ml-1"
            >
              立即注册
            </Link>
          </div>
        </Form>

        {/* 底部提示 */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>登录即表示您同意我们的</p>
          <Space split="|" size="small">
            <Link to="/terms" className="hover:text-blue-500">
              服务条款
            </Link>
            <Link to="/privacy" className="hover:text-blue-500">
              隐私政策
            </Link>
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default Login
