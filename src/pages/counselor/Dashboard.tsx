import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, List, Button, Tag, Empty, Spin } from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

/**
 * 今日预约信息
 */
interface TodayAppointment {
  id: number
  userId: number
  userName: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  consultationType: 'ONLINE' | 'OFFLINE'
  notes?: string
}

/**
 * 工作台统计数据
 */
interface DashboardStats {
  pendingCount: number
  monthlyIncome: number
  monthlyConsultations: number
  todayAppointments: TodayAppointment[]
}

/**
 * 预约状态配置
 */
const STATUS_CONFIG: Record<
  TodayAppointment['status'],
  { text: string; color: string }
> = {
  PENDING: { text: '待确认', color: 'orange' },
  CONFIRMED: { text: '已确认', color: 'blue' },
  CANCELLED: { text: '已取消', color: 'red' },
  COMPLETED: { text: '已完成', color: 'green' },
}

/**
 * 咨询师工作台页面
 * 需求: 12.3, 12.7
 */
const CounselorDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    pendingCount: 0,
    monthlyIncome: 0,
    monthlyConsultations: 0,
    todayAppointments: [],
  })

  /**
   * 加载工作台数据
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // TODO: 替换为实际的 API 调用
        // const response = await counselorApi.getDashboardStats()
        // setStats(response.data)

        // 模拟数据
        setTimeout(() => {
          setStats({
            pendingCount: 3,
            monthlyIncome: 12500,
            monthlyConsultations: 28,
            todayAppointments: [
              {
                id: 1,
                userId: 101,
                userName: '张三',
                startTime: '09:00',
                endTime: '10:00',
                status: 'CONFIRMED',
                consultationType: 'ONLINE',
                notes: '焦虑情绪咨询',
              },
              {
                id: 2,
                userId: 102,
                userName: '李四',
                startTime: '14:00',
                endTime: '15:00',
                status: 'PENDING',
                consultationType: 'OFFLINE',
              },
              {
                id: 3,
                userId: 103,
                userName: '王五',
                startTime: '16:00',
                endTime: '17:00',
                status: 'CONFIRMED',
                consultationType: 'ONLINE',
                notes: '职业发展咨询',
              },
            ],
          })
          setLoading(false)
        }, 500)
      } catch (error) {
        console.error('加载工作台数据失败:', error)
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  /**
   * 渲染预约列表项
   */
  const renderAppointmentItem = (appointment: TodayAppointment) => {
    const statusConfig = STATUS_CONFIG[appointment.status]

    return (
      <List.Item
        actions={[
          <Button
            key="detail"
            type="link"
            size="small"
            onClick={() =>
              navigate(`/counselor/appointments/${appointment.id}`)
            }
          >
            查看详情
          </Button>,
        ]}
      >
        <List.Item.Meta
          avatar={
            <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full">
              <UserOutlined className="text-blue-500 text-xl" />
            </div>
          }
          title={
            <div className="flex items-center gap-2">
              <span className="font-semibold">{appointment.userName}</span>
              <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
              <Tag
                color={
                  appointment.consultationType === 'ONLINE' ? 'blue' : 'green'
                }
              >
                {appointment.consultationType === 'ONLINE' ? '在线' : '线下'}
              </Tag>
            </div>
          }
          description={
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-600">
                <ClockCircleOutlined />
                <span>
                  {appointment.startTime} - {appointment.endTime}
                </span>
              </div>
              {appointment.notes && (
                <div className="text-gray-500 text-sm">
                  备注：{appointment.notes}
                </div>
              )}
            </div>
          }
        />
      </List.Item>
    )
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
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">咨询师工作台</h1>
          <p className="text-gray-500 mt-1">
            {dayjs().format('YYYY年MM月DD日 dddd')}
          </p>
        </div>

        {/* 统计卡片 */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="待确认预约"
                value={stats.pendingCount}
                prefix={<ClockCircleOutlined />}
                suffix="个"
                valueStyle={{ color: '#faad14' }}
              />
              <Button
                type="link"
                size="small"
                className="mt-2 p-0"
                onClick={() =>
                  navigate('/counselor/appointments?status=PENDING')
                }
              >
                立即处理 →
              </Button>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="本月收入"
                value={stats.monthlyIncome}
                prefix={<DollarOutlined />}
                suffix="元"
                precision={2}
                valueStyle={{ color: '#52c41a' }}
              />
              <Button
                type="link"
                size="small"
                className="mt-2 p-0"
                onClick={() => navigate('/counselor/income')}
              >
                查看详情 →
              </Button>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="本月咨询次数"
                value={stats.monthlyConsultations}
                prefix={<CheckCircleOutlined />}
                suffix="次"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="今日预约"
                value={stats.todayAppointments.length}
                prefix={<CalendarOutlined />}
                suffix="个"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 今日预约列表 */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <CalendarOutlined />
              <span>今日预约</span>
            </div>
          }
          className="mb-6"
        >
          {stats.todayAppointments.length > 0 ? (
            <List
              dataSource={stats.todayAppointments}
              renderItem={renderAppointmentItem}
            />
          ) : (
            <Empty description="今日暂无预约" />
          )}
        </Card>

        {/* 快捷操作 */}
        <Card title="快捷操作">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Button
                type="primary"
                size="large"
                block
                icon={<CalendarOutlined />}
                onClick={() => navigate('/counselor/schedule')}
              >
                时间表管理
              </Button>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Button
                size="large"
                block
                icon={<ClockCircleOutlined />}
                onClick={() => navigate('/counselor/appointments')}
              >
                预约管理
              </Button>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Button
                size="large"
                block
                icon={<FileTextOutlined />}
                onClick={() => navigate('/counselor/records')}
              >
                咨询记录
              </Button>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  )
}

export default CounselorDashboard
