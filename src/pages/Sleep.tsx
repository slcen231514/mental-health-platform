import { useState, useEffect } from 'react'
import {
  Card,
  Form,
  TimePicker,
  Slider,
  Button,
  Space,
  Typography,
  message,
  Row,
  Col,
  Statistic,
  List,
  Tag,
  Empty,
  Spin,
} from 'antd'
import {
  FieldTimeOutlined,
  MoonOutlined,
  SunOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
} from '@ant-design/icons'
import { interventionApi, SleepRecord } from '@/api/intervention'
import dayjs, { Dayjs } from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

const { Title, Text, Paragraph } = Typography

// 睡眠质量描述
const qualityLabels: Record<number, { label: string; color: string }> = {
  1: { label: '很差', color: 'red' },
  2: { label: '较差', color: 'orange' },
  3: { label: '一般', color: 'default' },
  4: { label: '较好', color: 'blue' },
  5: { label: '很好', color: 'green' },
}

export default function Sleep() {
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [records, setRecords] = useState<SleepRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    setIsLoading(true)
    try {
      const response = await interventionApi.getSleepHistory({
        page: 0,
        size: 10,
      })
      setRecords(response.data.content)
    } catch (error) {
      console.error('获取睡眠记录失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (values: {
    sleepTime: Dayjs
    wakeTime: Dayjs
    quality: number
  }) => {
    try {
      setIsSubmitting(true)

      await interventionApi.saveSleepRecord({
        sleepTime: values.sleepTime.format('YYYY-MM-DD HH:mm:ss'),
        wakeTime: values.wakeTime.format('YYYY-MM-DD HH:mm:ss'),
        quality: values.quality,
      })

      message.success('睡眠记录保存成功！')
      form.resetFields()
      fetchRecords()
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 计算睡眠时长
  const calculateDuration = (sleepTime: string, wakeTime: string) => {
    const sleep = dayjs(sleepTime)
    const wake = dayjs(wakeTime)
    const diff = wake.diff(sleep, 'minute')
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60
    return `${hours}小时${minutes}分钟`
  }

  // 计算统计数据
  const calculateStats = () => {
    if (records.length === 0) {
      return {
        avgDuration: 0,
        avgQuality: 0,
        totalRecords: 0,
      }
    }

    const totalMinutes = records.reduce((sum, record) => {
      const sleep = dayjs(record.sleepTime)
      const wake = dayjs(record.wakeTime)
      return sum + wake.diff(sleep, 'minute')
    }, 0)

    const avgMinutes = totalMinutes / records.length
    const avgHours = (avgMinutes / 60).toFixed(1)

    const totalQuality = records.reduce(
      (sum, record) => sum + record.quality,
      0
    )
    const avgQuality = (totalQuality / records.length).toFixed(1)

    return {
      avgDuration: avgHours,
      avgQuality: avgQuality,
      totalRecords: records.length,
    }
  }

  const stats = calculateStats()

  return (
    <div className="max-w-6xl mx-auto">
      <Title level={2} className="mb-2">
        <FieldTimeOutlined className="mr-2" />
        睡眠管理
      </Title>
      <Paragraph type="secondary" className="mb-6">
        记录睡眠数据，追踪睡眠质量，获取改善建议
      </Paragraph>

      <Row gutter={[24, 24]}>
        {/* 左侧：记录表单 */}
        <Col xs={24} lg={10}>
          <Card title="记录今日睡眠">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                quality: 3,
              }}
            >
              <Form.Item
                name="sleepTime"
                label="入睡时间"
                rules={[{ required: true, message: '请选择入睡时间' }]}
              >
                <TimePicker
                  className="w-full"
                  format="HH:mm"
                  placeholder="选择入睡时间"
                  suffixIcon={<MoonOutlined />}
                />
              </Form.Item>

              <Form.Item
                name="wakeTime"
                label="起床时间"
                rules={[{ required: true, message: '请选择起床时间' }]}
              >
                <TimePicker
                  className="w-full"
                  format="HH:mm"
                  placeholder="选择起床时间"
                  suffixIcon={<SunOutlined />}
                />
              </Form.Item>

              <Form.Item
                name="quality"
                label="睡眠质量"
                rules={[{ required: true, message: '请评估睡眠质量' }]}
              >
                <Slider
                  min={1}
                  max={5}
                  marks={{
                    1: '很差',
                    2: '较差',
                    3: '一般',
                    4: '较好',
                    5: '很好',
                  }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  block
                  size="large"
                >
                  保存记录
                </Button>
              </Form.Item>
            </Form>

            {/* 睡眠建议 */}
            <Card size="small" className="bg-blue-50 border-blue-200 mt-4">
              <Space direction="vertical" size="small">
                <Text strong className="text-blue-700">
                  💡 睡眠小贴士
                </Text>
                <ul className="text-sm text-gray-600 ml-4 space-y-1">
                  <li>成年人建议每晚睡眠7-9小时</li>
                  <li>保持规律的作息时间</li>
                  <li>睡前避免使用电子设备</li>
                  <li>创造舒适的睡眠环境</li>
                </ul>
              </Space>
            </Card>
          </Card>
        </Col>

        {/* 右侧：统计和历史 */}
        <Col xs={24} lg={14}>
          {/* 统计卡片 */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="平均睡眠时长"
                  value={stats.avgDuration}
                  suffix="小时"
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="平均睡眠质量"
                  value={stats.avgQuality}
                  suffix="/ 5"
                  prefix={<LineChartOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="记录天数"
                  value={stats.totalRecords}
                  suffix="天"
                  prefix={<FieldTimeOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 历史记录 */}
          <Card title="最近记录">
            <Spin spinning={isLoading}>
              {records.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无睡眠记录"
                  className="py-8"
                />
              ) : (
                <List
                  dataSource={records}
                  renderItem={record => {
                    const qualityInfo = qualityLabels[record.quality]
                    return (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                              <MoonOutlined className="text-xl text-purple-500" />
                            </div>
                          }
                          title={
                            <Space>
                              <Text strong>
                                {dayjs(record.createdAt).format('YYYY-MM-DD')}
                              </Text>
                              <Tag color={qualityInfo.color}>
                                {qualityInfo.label}
                              </Tag>
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size="small">
                              <Space size="large">
                                <Text type="secondary" className="text-sm">
                                  <MoonOutlined className="mr-1" />
                                  入睡:{' '}
                                  {dayjs(record.sleepTime).format('HH:mm')}
                                </Text>
                                <Text type="secondary" className="text-sm">
                                  <SunOutlined className="mr-1" />
                                  起床: {dayjs(record.wakeTime).format('HH:mm')}
                                </Text>
                              </Space>
                              <Text type="secondary" className="text-sm">
                                <ClockCircleOutlined className="mr-1" />
                                睡眠时长:{' '}
                                {calculateDuration(
                                  record.sleepTime,
                                  record.wakeTime
                                )}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )
                  }}
                />
              )}
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
