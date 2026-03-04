import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Form,
  Input,
  Button,
  Card,
  Checkbox,
  Progress,
  Space,
  Divider,
} from 'antd'
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store'
import { formRules, handleError, showSuccess } from '@/utils'
import { authApi, type RegisterRequest } from '@/api/auth'

/**
 * 注册表单数据
 */
interface RegisterFormData extends RegisterRequest {
  confirmPassword: string
  agreement: boolean
}

/**
 * 密码强度等级
 */
type PasswordStrength = 'weak' | 'medium' | 'strong'

/**
 * 注册页面组件
 */
const Register: React.FC = () => {
  const [form] = Form.useForm<RegisterFormData>()
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] =
    useState<PasswordStrength>('weak')
  const [passwordScore, setPasswordScore] = useState(0)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  /**
   * 计算密码强度
   */
  const calculatePasswordStrength = (password: string): void => {
    if (!password) {
      setPasswordStrength('weak')
      setPasswordScore(0)
      return
    }

    let score = 0

    // 长度检查
    if (password.length >= 8) score += 20
    if (password.length >= 12) score += 10

    // 包含小写字母
    if (/[a-z]/.test(password)) score += 20

    // 包含大写字母
    if (/[A-Z]/.test(password)) score += 20

    // 包含数字
    if (/\d/.test(password)) score += 20

    // 包含特殊字符
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10

    setPasswordScore(score)

    if (score < 40) {
      setPasswordStrength('weak')
    } else if (score < 70) {
      setPasswordStrength('medium')
    } else {
      setPasswordStrength('strong')
    }
  }

  /**
   * 获取密码强度颜色
   */
  const getPasswordStrengthColor = (): string => {
    switch (passwordStrength) {
      case 'weak':
        return '#ff4d4f'
      case 'medium':
        return '#faad14'
      case 'strong':
        return '#52c41a'
      default:
        return '#d9d9d9'
    }
  }

  /**
   * 获取密码强度文本
   */
  const getPasswordStrengthText = (): string => {
    switch (passwordStrength) {
      case 'weak':
        return '弱'
      case 'medium':
        return '中'
      case 'strong':
        return '强'
      default:
        return ''
    }
  }

  /**
   * 处理密码输入变化
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    calculatePasswordStrength(e.target.value)
  }

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: RegisterFormData) => {
    setLoading(true)

    try {
      // 调用注册 API
      const response = await authApi.register({
        username: values.username,
        email: values.email,
        password: values.password,
        phone: values.phone,
      })

      // 注册成功，自动登录
      const { user, accessToken, refreshToken } = response.data
      setAuth(user, accessToken, refreshToken)

      showSuccess('注册成功，欢迎加入！')

      // 跳转到仪表盘
      navigate('/', { replace: true })
    } catch (error: any) {
      // 错误处理
      handleError(error, {
        showMessage: true,
        customMessage: error?.response?.data?.message || '注册失败，请稍后重试',
      })
    } finally {
      setLoading(false)
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
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <SafetyOutlined className="text-3xl text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">创建账号</h1>
          <p className="text-gray-500">加入我们，开启心理健康之旅</p>
        </div>

        {/* 注册表单 */}
        <Form
          form={form}
          name="register"
          onFinish={handleSubmit}
          size="large"
          autoComplete="off"
          scrollToFirstError
        >
          {/* 用户名输入框 */}
          <Form.Item
            name="username"
            rules={[formRules.required('请输入用户名'), formRules.username()]}
            hasFeedback
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="请输入用户名（4-20位字母、数字、下划线）"
              autoComplete="username"
            />
          </Form.Item>

          {/* 密码输入框 */}
          <Form.Item
            name="password"
            rules={[formRules.required('请输入密码'), formRules.password()]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="请输入密码（至少8位，包含大小写字母和数字）"
              onChange={handlePasswordChange}
              autoComplete="new-password"
            />
          </Form.Item>

          {/* 密码强度指示器 */}
          {passwordScore > 0 && (
            <div className="mb-4 -mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">密码强度：</span>
                <span
                  className="text-xs font-medium"
                  style={{ color: getPasswordStrengthColor() }}
                >
                  {getPasswordStrengthText()}
                </span>
              </div>
              <Progress
                percent={passwordScore}
                strokeColor={getPasswordStrengthColor()}
                showInfo={false}
                size="small"
              />
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-1">
                  {/[a-z]/.test(form.getFieldValue('password')) ? (
                    <CheckCircleOutlined className="text-green-500" />
                  ) : (
                    <CloseCircleOutlined className="text-gray-300" />
                  )}
                  <span>包含小写字母</span>
                </div>
                <div className="flex items-center gap-1">
                  {/[A-Z]/.test(form.getFieldValue('password')) ? (
                    <CheckCircleOutlined className="text-green-500" />
                  ) : (
                    <CloseCircleOutlined className="text-gray-300" />
                  )}
                  <span>包含大写字母</span>
                </div>
                <div className="flex items-center gap-1">
                  {/\d/.test(form.getFieldValue('password')) ? (
                    <CheckCircleOutlined className="text-green-500" />
                  ) : (
                    <CloseCircleOutlined className="text-gray-300" />
                  )}
                  <span>包含数字</span>
                </div>
                <div className="flex items-center gap-1">
                  {form.getFieldValue('password')?.length >= 8 ? (
                    <CheckCircleOutlined className="text-green-500" />
                  ) : (
                    <CloseCircleOutlined className="text-gray-300" />
                  )}
                  <span>至少8个字符</span>
                </div>
              </div>
            </div>
          )}

          {/* 确认密码输入框 */}
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              formRules.required('请再次输入密码'),
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="请再次输入密码"
              autoComplete="new-password"
            />
          </Form.Item>

          {/* 邮箱输入框 */}
          <Form.Item
            name="email"
            rules={[formRules.required('请输入邮箱地址'), formRules.email()]}
            hasFeedback
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="请输入邮箱地址"
              autoComplete="email"
            />
          </Form.Item>

          {/* 手机号输入框 */}
          <Form.Item name="phone" rules={[formRules.phone()]} hasFeedback>
            <Input
              prefix={<PhoneOutlined className="text-gray-400" />}
              placeholder="请输入手机号（可选）"
              autoComplete="tel"
            />
          </Form.Item>

          {/* 用户协议 */}
          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error('请阅读并同意用户协议和隐私政策')
                      ),
              },
            ]}
          >
            <Checkbox>
              我已阅读并同意
              <Link
                to="/terms"
                className="text-blue-500 hover:text-blue-600 mx-1"
              >
                用户协议
              </Link>
              和
              <Link
                to="/privacy"
                className="text-blue-500 hover:text-blue-600 mx-1"
              >
                隐私政策
              </Link>
            </Checkbox>
          </Form.Item>

          {/* 注册按钮 */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="h-12 text-base font-medium"
            >
              {loading ? '注册中...' : '立即注册'}
            </Button>
          </Form.Item>

          {/* 分隔线 */}
          <Divider plain>
            <span className="text-gray-400 text-sm">其他注册方式</span>
          </Divider>

          {/* 第三方注册（预留） */}
          <div className="flex justify-center gap-4 mb-6">
            <Space size="large">
              <Button
                shape="circle"
                size="large"
                icon={<span className="text-xl">📱</span>}
                title="手机号注册"
                disabled
              />
              <Button
                shape="circle"
                size="large"
                icon={<span className="text-xl">💬</span>}
                title="微信注册"
                disabled
              />
              <Button
                shape="circle"
                size="large"
                icon={<span className="text-xl">📧</span>}
                title="邮箱注册"
                disabled
              />
            </Space>
          </div>

          {/* 登录链接 */}
          <div className="text-center text-gray-600">
            已有账号？
            <Link
              to="/login"
              className="text-blue-500 hover:text-blue-600 ml-1"
            >
              立即登录
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Register
