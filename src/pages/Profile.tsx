import { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Upload,
  Avatar,
  message,
  Modal,
  Spin,
} from 'antd'
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CameraOutlined,
  LockOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store/authStore'
import { userApi } from '@/api/user'

export default function Profile() {
  const { user, setUser } = useAuthStore()
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [editMode, setEditMode] = useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)

  // 当user更新时，更新表单值
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        gender: user.gender || '',
        bio: user.bio || '',
      })
    }
  }, [user, form])

  // 处理头像上传
  const handleAvatarUpload = async (file: File) => {
    try {
      setAvatarLoading(true)
      const response = await userApi.uploadAvatar(file)
      const avatarUrl = response.data.url

      // 更新用户头像到authStore
      if (user) {
        setUser({ ...user, avatar: avatarUrl })
      }

      message.success('头像上传成功')
    } catch (error: any) {
      message.error(error?.message || '头像上传失败')
    } finally {
      setAvatarLoading(false)
    }
    return false // 阻止默认上传行为
  }

  // 处理信息保存
  const handleSaveProfile = async (values: any) => {
    try {
      setUpdateLoading(true)
      const response = await userApi.updateUserProfile({
        phone: values.phone,
        gender: values.gender,
        bio: values.bio,
      })

      // 更新用户信息到authStore
      if (user) {
        setUser({
          ...user,
          phone: values.phone,
          gender: values.gender,
          bio: values.bio,
        })
      }

      message.success('更新成功')
      setEditMode(false)
    } catch (error: any) {
      message.error(error?.message || '更新失败')
    } finally {
      setUpdateLoading(false)
    }
  }

  // 处理密码修改
  const handleChangePassword = async (values: any) => {
    try {
      setPasswordLoading(true)
      await userApi.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      })
      message.success('密码修改成功')
      setPasswordModalVisible(false)
      passwordForm.resetFields()
    } catch (error: any) {
      message.error(error?.message || '密码修改失败')
    } finally {
      setPasswordLoading(false)
    }
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setEditMode(false)
    form.resetFields()
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    )
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

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">个人信息</h1>

      <Card>
        {/* 头像部分 */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Avatar
              size={120}
              icon={<UserOutlined />}
              src={getAvatarUrl(user?.avatar)}
              className="border-4 border-gray-200"
            />
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleAvatarUpload}
            >
              <Button
                type="primary"
                shape="circle"
                icon={<CameraOutlined />}
                loading={avatarLoading}
                className="absolute bottom-0 right-0"
                title="上传头像"
              />
            </Upload>
          </div>
        </div>

        {/* 基本信息表单 */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveProfile}
          disabled={!editMode}
        >
          <Form.Item label="用户名" name="username">
            <Input prefix={<UserOutlined />} disabled />
          </Form.Item>

          <Form.Item label="邮箱" name="email">
            <Input prefix={<MailOutlined />} disabled />
          </Form.Item>

          <Form.Item
            label="手机号"
            name="phone"
            rules={[
              {
                pattern: /^1[3-9]\d{9}$/,
                message: '请输入有效的手机号',
              },
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item label="性别" name="gender">
            <Select placeholder="请选择性别">
              <Select.Option value="MALE">男</Select.Option>
              <Select.Option value="FEMALE">女</Select.Option>
              <Select.Option value="OTHER">其他</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="个人简介" name="bio">
            <Input.TextArea
              rows={4}
              placeholder="介绍一下自己..."
              maxLength={200}
              showCount
            />
          </Form.Item>

          {/* 操作按钮 */}
          <Form.Item>
            <div className="flex gap-4">
              {!editMode ? (
                <>
                  <Button type="primary" onClick={() => setEditMode(true)}>
                    编辑信息
                  </Button>
                  <Button
                    icon={<LockOutlined />}
                    onClick={() => setPasswordModalVisible(true)}
                  >
                    修改密码
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updateLoading}
                  >
                    保存修改
                  </Button>
                  <Button onClick={handleCancelEdit}>取消</Button>
                </>
              )}
            </div>
          </Form.Item>
        </Form>
      </Card>

      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false)
          passwordForm.resetFields()
        }}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            label="旧密码"
            name="oldPassword"
            rules={[{ required: true, message: '请输入旧密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入旧密码"
            />
          </Form.Item>

          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 8, message: '密码至少8个字符' },
              {
                pattern:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
                message: '密码必须包含大小写字母和数字',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入新密码"
            />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入新密码"
            />
          </Form.Item>

          <Form.Item>
            <div className="flex gap-4 justify-end">
              <Button
                onClick={() => {
                  setPasswordModalVisible(false)
                  passwordForm.resetFields()
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={passwordLoading}
              >
                确认修改
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
