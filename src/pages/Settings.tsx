import { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Switch,
  Checkbox,
  TimePicker,
  Button,
  Select,
  message,
  Spin,
  Divider,
  Space,
} from 'antd'
import {
  BellOutlined,
  DownloadOutlined,
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  notificationApi,
  NotificationChannel,
  NotificationType,
} from '@/api/notification'

const { RangePicker } = TimePicker

export default function Settings() {
  const [notificationForm] = Form.useForm()
  const [exportForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false)

  // 加载通知偏好设置
  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      setLoading(true)
      const response = await notificationApi.getPreferences()
      const preferences = response.data

      // 设置表单值
      notificationForm.setFieldsValue({
        channels: preferences.channels || [],
        types: preferences.types || [],
        enableQuietHours: preferences.enableQuietHours || false,
        quietHours:
          preferences.quietHoursStart && preferences.quietHoursEnd
            ? [
                dayjs(preferences.quietHoursStart, 'HH:mm'),
                dayjs(preferences.quietHoursEnd, 'HH:mm'),
              ]
            : undefined,
      })

      setQuietHoursEnabled(preferences.enableQuietHours || false)
    } catch (error: any) {
      message.error(error?.message || '加载设置失败')
    } finally {
      setLoading(false)
    }
  }

  // 保存通知设置
  const handleSaveNotificationSettings = async (values: any) => {
    try {
      setSaveLoading(true)

      const quietHoursStart = values.quietHours?.[0]
        ? values.quietHours[0].format('HH:mm')
        : undefined
      const quietHoursEnd = values.quietHours?.[1]
        ? values.quietHours[1].format('HH:mm')
        : undefined

      await notificationApi.updatePreferences({
        channels: values.channels || [],
        types: values.types || [],
        enableQuietHours: values.enableQuietHours || false,
        quietHoursStart,
        quietHoursEnd,
      })

      message.success('通知设置保存成功')
    } catch (error: any) {
      message.error(error?.message || '保存设置失败')
    } finally {
      setSaveLoading(false)
    }
  }

  // 重置通知设置
  const handleResetNotificationSettings = () => {
    loadPreferences()
    message.info('已重置为上次保存的设置')
  }

  // 处理数据导出
  const handleExportData = async (values: any) => {
    try {
      setExportLoading(true)

      const { dataTypes, format } = values

      if (!dataTypes || dataTypes.length === 0) {
        message.warning('请选择要导出的数据类型')
        return
      }

      if (!format) {
        message.warning('请选择导出格式')
        return
      }

      // TODO: 调用后端导出API
      // 这里需要根据实际后端API实现
      // const response = await exportApi.exportData({ dataTypes, format })

      // 模拟导出功能
      message.success(`正在导出 ${dataTypes.join(', ')} 为 ${format} 格式...`)

      // 实际实现中应该触发文件下载
      // const blob = new Blob([response.data], { type: 'application/octet-stream' })
      // const url = window.URL.createObjectURL(blob)
      // const link = document.createElement('a')
      // link.href = url
      // link.download = `export_${Date.now()}.${format.toLowerCase()}`
      // link.click()
      // window.URL.revokeObjectURL(url)
    } catch (error: any) {
      message.error(error?.message || '导出失败')
    } finally {
      setExportLoading(false)
    }
  }

  // 通知渠道选项
  const channelOptions = [
    { label: '邮件通知', value: NotificationChannel.EMAIL },
    { label: '短信通知', value: NotificationChannel.SMS },
    { label: '站内信', value: NotificationChannel.IN_APP },
    { label: '推送通知', value: NotificationChannel.PUSH },
  ]

  // 通知类型选项
  const typeOptions = [
    { label: '系统通知', value: NotificationType.SYSTEM },
    { label: '评估通知', value: NotificationType.ASSESSMENT },
    { label: '预约通知', value: NotificationType.APPOINTMENT },
    { label: '对话通知', value: NotificationType.DIALOGUE },
    { label: '干预通知', value: NotificationType.INTERVENTION },
    { label: '提醒通知', value: NotificationType.REMINDER },
  ]

  // 数据类型选项
  const dataTypeOptions = [
    { label: '评估记录', value: 'assessment' },
    { label: '对话记录', value: 'dialogue' },
    { label: '干预记录', value: 'intervention' },
    { label: '预约记录', value: 'appointment' },
    { label: '个人信息', value: 'profile' },
  ]

  // 导出格式选项
  const formatOptions = [
    { label: 'Excel (.xlsx)', value: 'EXCEL' },
    { label: 'PDF (.pdf)', value: 'PDF' },
    { label: 'JSON (.json)', value: 'JSON' },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">设置</h1>

      {/* 通知设置 */}
      <Card
        title={
          <Space>
            <BellOutlined />
            <span>通知设置</span>
          </Space>
        }
        className="mb-6"
      >
        <Form
          form={notificationForm}
          layout="vertical"
          onFinish={handleSaveNotificationSettings}
        >
          <Form.Item
            label="通知渠道"
            name="channels"
            tooltip="选择接收通知的渠道"
          >
            <Checkbox.Group options={channelOptions} />
          </Form.Item>

          <Form.Item
            label="通知类型"
            name="types"
            tooltip="选择要接收的通知类型"
          >
            <Checkbox.Group options={typeOptions} />
          </Form.Item>

          <Divider />

          <Form.Item
            label="免打扰模式"
            name="enableQuietHours"
            valuePropName="checked"
            tooltip="开启后，在设定的时间段内不会收到通知"
          >
            <Switch
              checkedChildren="开启"
              unCheckedChildren="关闭"
              onChange={setQuietHoursEnabled}
            />
          </Form.Item>

          <Form.Item
            label="免打扰时间段"
            name="quietHours"
            rules={[
              {
                required: quietHoursEnabled,
                message: '请选择免打扰时间段',
              },
            ]}
          >
            <RangePicker
              format="HH:mm"
              disabled={!quietHoursEnabled}
              placeholder={['开始时间', '结束时间']}
              className="w-full"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                htmlType="submit"
                loading={saveLoading}
              >
                保存设置
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetNotificationSettings}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 数据导出 */}
      <Card
        title={
          <Space>
            <DownloadOutlined />
            <span>数据导出</span>
          </Space>
        }
      >
        <Form form={exportForm} layout="vertical" onFinish={handleExportData}>
          <Form.Item
            label="选择数据类型"
            name="dataTypes"
            rules={[{ required: true, message: '请选择要导出的数据类型' }]}
            tooltip="可以选择多个数据类型一起导出"
          >
            <Checkbox.Group options={dataTypeOptions} />
          </Form.Item>

          <Form.Item
            label="导出格式"
            name="format"
            rules={[{ required: true, message: '请选择导出格式' }]}
          >
            <Select placeholder="请选择导出格式" options={formatOptions} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              htmlType="submit"
              loading={exportLoading}
            >
              导出数据
            </Button>
          </Form.Item>

          <div className="text-gray-500 text-sm mt-4">
            <p>注意事项：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>导出的数据包含您在平台上的所有相关记录</li>
              <li>Excel格式适合数据分析和统计</li>
              <li>PDF格式适合打印和存档</li>
              <li>JSON格式适合数据迁移和备份</li>
              <li>导出过程可能需要一些时间，请耐心等待</li>
            </ul>
          </div>
        </Form>
      </Card>
    </div>
  )
}
