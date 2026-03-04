import { useState } from 'react'
import { Card, Form, Input, Button, Select, DatePicker, Tabs, List, Tag, message } from 'antd'
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'

const mockAssessmentHistory = [
  { id: 1, scale: 'PHQ-9', score: 8, severity: '轻度抑郁', date: '2024-01-05' },
  { id: 2, scale: 'GAD-7', score: 5, severity: '轻度焦虑', date: '2024-01-03' },
  { id: 3, scale: 'PHQ-9', score: 12, severity: '中度抑郁', date: '2023-12-28' },
]

const mockAppointments = [
  { id: 1, counselor: '张医生', date: '2024-01-10 14:00', status: 'upcoming' },
  { id: 2, counselor: '李医生', date: '2024-01-03 10:00', status: 'completed' },
]

export default function Profile() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const handleUpdateProfile = async () => {
    setLoading(true)
    // 模拟API调用
    setTimeout(() => {
      message.success('个人信息更新成功')
      setLoading(false)
    }, 1000)
  }

  const tabItems = [
    {
      key: 'profile',
      label: '基本信息',
      children: (
        <Card>
          <Form
            layout="vertical"
            initialValues={{
              username: user?.username,
              email: user?.email,
              phone: user?.phone,
              gender: user?.gender,
            }}
            onFinish={handleUpdateProfile}
          >
            <Form.Item label="用户名" name="username">
              <Input prefix={<UserOutlined />} disabled />
            </Form.Item>
            <Form.Item label="邮箱" name="email">
              <Input prefix={<MailOutlined />} disabled />
            </Form.Item>
            <Form.Item label="手机号" name="phone">
              <Input prefix={<PhoneOutlined />} />
            </Form.Item>
            <Form.Item label="性别" name="gender">
              <Select>
                <Select.Option value="MALE">男</Select.Option>
                <Select.Option value="FEMALE">女</Select.Option>
                <Select.Option value="OTHER">其他</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="出生日期" name="birthDate">
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'assessments',
      label: '评估记录',
      children: (
        <Card>
          <List
            dataSource={mockAssessmentHistory}
            renderItem={(item) => (
              <List.Item>
                <div className="flex-1">
                  <span className="font-medium">{item.scale}</span>
                  <span className="ml-4 text-gray-500">{item.date}</span>
                </div>
                <div>
                  <span className="mr-4">得分: {item.score}</span>
                  <Tag color={item.severity.includes('轻度') ? 'blue' : 'orange'}>
                    {item.severity}
                  </Tag>
                </div>
              </List.Item>
            )}
          />
        </Card>
      ),
    },
    {
      key: 'appointments',
      label: '预约记录',
      children: (
        <Card>
          <List
            dataSource={mockAppointments}
            renderItem={(item) => (
              <List.Item>
                <div className="flex-1">
                  <span className="font-medium">{item.counselor}</span>
                  <span className="ml-4 text-gray-500">{item.date}</span>
                </div>
                <Tag color={item.status === 'upcoming' ? 'processing' : 'success'}>
                  {item.status === 'upcoming' ? '即将开始' : '已完成'}
                </Tag>
              </List.Item>
            )}
          />
        </Card>
      ),
    },
    {
      key: 'security',
      label: '安全设置',
      children: (
        <Card>
          <Form layout="vertical" onFinish={() => message.success('密码修改成功')}>
            <Form.Item
              label="当前密码"
              name="currentPassword"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="新密码"
              name="newPassword"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 8, message: '密码至少8个字符' },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="确认新密码"
              name="confirmPassword"
              rules={[{ required: true, message: '请确认新密码' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">个人中心</h1>
      <Tabs items={tabItems} />
    </div>
  )
}
