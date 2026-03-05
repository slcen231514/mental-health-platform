import { useEffect, useState } from 'react'
import {
  Card,
  List,
  Empty,
  Spin,
  Typography,
  Tag,
  Space,
  Button,
  Statistic,
  Row,
  Col,
} from 'antd'
import {
  SoundOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import { interventionApi, MeditationRecord } from '@/api/intervention'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

// 冥想类型映射
const meditationTypeMap: Record<string, { label: string; color: string }> = {
  BREATHING: { label: '呼吸冥想', color: 'blue' },
  BODY_SCAN: { label: '身体扫描', color: 'purple' },
  MINDFULNESS: { label: '正念冥想', color: 'green' },
  LOVING_KINDNESS: { label: '慈心冥想', color: 'orange' },
}

export default function MeditationHistory() {
  const [records, setRecords] = useState<MeditationRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const response = await interventionApi.getMeditationHistory()
      setRecords(response.data.content)
    } catch (error) {
      console.error('获取冥想历史失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 计算统计数据
  const calculateStats = () => {
    const totalSessions = records.length
    const totalMinutes = records.reduce(
      (sum, record) => sum + record.duration,
      0
    )
    const avgDuration =
      totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0

    // 本周练习次数
    const weekStart = dayjs().startOf('week')
    const thisWeekSessions = records.filter(record =>
      dayjs(record.createdAt).isAfter(weekStart)
    ).length

    return {
      totalSessions,
      totalMinutes,
      avgDuration,
      thisWeekSessions,
    }
  }

  const stats = calculateStats()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="!mb-2">
            <SoundOutlined className="mr-2" />
            冥想历史
          </Title>
          <Text type="secondary">查看您的冥想练习记录和统计</Text>
        </div>
        <Button type="primary" onClick={() => navigate('/meditation')}>
          开始冥想
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总练习次数"
              value={stats.totalSessions}
              suffix="次"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总练习时长"
              value={stats.totalMinutes}
              suffix="分钟"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均时长"
              value={stats.avgDuration}
              suffix="分钟"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本周练习"
              value={stats.thisWeekSessions}
              suffix="次"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 历史记录列表 */}
      <Card title="练习记录">
        <Spin spinning={isLoading}>
          {records.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无冥想记录"
              className="py-16"
            >
              <Button type="primary" onClick={() => navigate('/meditation')}>
                开始第一次冥想
              </Button>
            </Empty>
          ) : (
            <List
              dataSource={records}
              renderItem={record => {
                const typeInfo = meditationTypeMap[record.type] || {
                  label: record.type,
                  color: 'default',
                }

                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <SoundOutlined className="text-xl text-blue-500" />
                        </div>
                      }
                      title={
                        <Space>
                          <Text strong>{typeInfo.label}</Text>
                          <Tag color={typeInfo.color}>
                            {record.duration} 分钟
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space size="large">
                          <Text type="secondary" className="text-sm">
                            <CalendarOutlined className="mr-1" />
                            {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm')}
                          </Text>
                          <Text type="secondary" className="text-sm">
                            {dayjs(record.createdAt).fromNow()}
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
    </div>
  )
}
