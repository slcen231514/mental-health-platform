import React, { useEffect, useState } from 'react'
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Upload,
  message,
  Avatar,
  Spin,
  Space,
} from 'antd'
import {
  UserOutlined,
  CameraOutlined,
  SaveOutlined,
  EditOutlined,
} from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { counselorApi, type CounselorDetailDTO } from '@/api/counselor'

const { TextArea } = Input

/**
 * 咨询师个人资料页面
 * 需求: 3.1, 3.2, 3.3, 3.4, 3.6, 12.7
 */
const CounselorProfile: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState<CounselorDetailDTO | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  /**
   * 加载咨询师资料
   */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await counselorApi.getProfile()
        const profileData = response.data

        setProfile(profileData)
        setAvatarUrl(profileData.avatar || '')

        // 设置表单初始值
        form.setFieldsValue({
          name: profileData.name,
          qualification: profileData.qualification,
          specialties: profileData.specialties?.join('、') || '',
          introduction: profileData.introduction,
          price: profileData.price,
          education: profileData.education,
          experience: profileData.experience,
        })
      } catch (error) {
        console.error('加载资料失败:', error)
        message.error('加载资料失败，请重试')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [form])

  /**
   * 头像上传前验证
   */
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('只能上传图片格式的文件！')
      return Upload.LIST_IGNORE
    }

    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB！')
      return Upload.LIST_IGNORE
    }

    return true
  }

  /**
   * 头像上传处理
   */
  const handleAvatarUpload: UploadProps['customRequest'] = async options => {
    const { file, onSuccess, onError } = options

    setUploading(true)
    try {
      const response = await counselorApi.uploadAvatar(file as File)
      const newAvatarUrl = response.data.avatarUrl

      setAvatarUrl(newAvatarUrl)
      message.success('头像上传成功')
      onSuccess?.(response)
    } catch (error) {
      console.error('头像上传失败:', error)
      message.error('头像上传失败，请重试')
      onError?.(error as Error)
    } finally {
      setUploading(false)
    }
  }

  /**
   * 保存资料
   */
  const handleSave = async () => {
    try {
      const values = await form.validateFields()

      setSaving(true)

      // 将专长领域字符串转换为数组
      const specialties = values.specialties
        ? values.specialties.split(/[、,，]/).map((s: string) => s.trim())
        : []

      await counselorApi.updateProfile({
        introduction: values.introduction,
        specialties,
        price: values.price,
      })

      message.success('资料保存成功')
      setEditing(false)

      // 重新加载资料
      const response = await counselorApi.getProfile()
      setProfile(response.data)
    } catch (error) {
      console.error('保存资料失败:', error)
      message.error('保存资料失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  /**
   * 取消编辑
   */
  const handleCancel = () => {
    // 恢复表单初始值
    if (profile) {
      form.setFieldsValue({
        specialties: profile.specialties?.join('、') || '',
        introduction: profile.introduction,
        price: profile.price,
      })
    }
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">个人资料</h1>
          <p className="text-gray-500 mt-1">管理您的咨询师个人资料信息</p>
        </div>

        {/* 头像卡片 */}
        <Card className="mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar
                size={120}
                src={avatarUrl}
                icon={<UserOutlined />}
                className="border-4 border-gray-100"
              />
              <Upload
                showUploadList={false}
                beforeUpload={beforeUpload}
                customRequest={handleAvatarUpload}
                accept="image/*"
              >
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CameraOutlined />}
                  loading={uploading}
                  className="absolute bottom-0 right-0"
                  title="更换头像"
                />
              </Upload>
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">{profile?.name}</h2>
              <div className="space-y-2 text-gray-600">
                <div>资质：{profile?.qualification}</div>
                <div className="flex items-center gap-2">
                  <span>评分：</span>
                  <span className="text-yellow-500 font-semibold">
                    {profile?.rating?.toFixed(1) || '暂无'}
                  </span>
                  <span className="text-gray-400">
                    ({profile?.consultationCount || 0} 次咨询)
                  </span>
                </div>
              </div>
            </div>

            {!editing && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setEditing(true)}
              >
                编辑资料
              </Button>
            )}
          </div>
        </Card>

        {/* 资料表单 */}
        <Card title="基本信息">
          <Form form={form} layout="vertical" disabled={!editing}>
            {/* 只读字段 */}
            <Form.Item label="姓名" name="name">
              <Input disabled />
            </Form.Item>

            <Form.Item label="资质证书" name="qualification">
              <Input disabled />
            </Form.Item>

            <Form.Item label="教育背景" name="education">
              <TextArea rows={2} disabled />
            </Form.Item>

            <Form.Item label="工作经验" name="experience">
              <TextArea rows={3} disabled />
            </Form.Item>

            {/* 可编辑字段 */}
            <Form.Item
              label="专长领域"
              name="specialties"
              rules={[{ required: true, message: '请输入专长领域' }]}
              extra="多个领域请用顿号（、）或逗号分隔"
            >
              <Input
                placeholder="例如：焦虑症、抑郁症、婚姻家庭咨询"
                disabled={!editing}
              />
            </Form.Item>

            <Form.Item
              label="个人简介"
              name="introduction"
              rules={[
                { required: true, message: '请输入个人简介' },
                { max: 1000, message: '个人简介不能超过1000字符' },
              ]}
              extra={editing ? '请介绍您的咨询理念、擅长的咨询方法等' : ''}
            >
              <TextArea
                rows={6}
                placeholder="请介绍您的咨询理念、擅长的咨询方法等（不超过1000字）"
                showCount={editing}
                maxLength={1000}
                disabled={!editing}
              />
            </Form.Item>

            <Form.Item
              label="咨询价格（元/小时）"
              name="price"
              rules={[
                { required: true, message: '请输入咨询价格' },
                {
                  type: 'number',
                  min: 0.01,
                  message: '咨询价格必须为正数',
                },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入咨询价格"
                precision={2}
                min={0.01}
                disabled={!editing}
                addonAfter="元/小时"
              />
            </Form.Item>

            {editing && (
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={saving}
                  >
                    保存
                  </Button>
                  <Button onClick={handleCancel}>取消</Button>
                </Space>
              </Form.Item>
            )}
          </Form>
        </Card>

        {/* 统计信息 */}
        {profile && (
          <Card title="服务统计" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">
                  {profile.consultationCount || 0}
                </div>
                <div className="text-gray-500 mt-2">累计咨询次数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">
                  {profile.rating?.toFixed(1) || '暂无'}
                </div>
                <div className="text-gray-500 mt-2">平均评分</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">
                  {profile.price?.toFixed(0) || 0}
                </div>
                <div className="text-gray-500 mt-2">咨询价格（元/小时）</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default CounselorProfile
