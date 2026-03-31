import React, { useEffect, useState } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  List,
  Button,
  Tag,
  Empty,
  Spin,
  message,
} from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  UserOutlined,
  CheckCircleOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  AppointmentDTO,
  counselorApi,
  normalizeAppointment,
} from '@/api/counselor'

interface DashboardStats {
  pendingCount: number
  monthlyIncome: number
  monthlyConsultations: number
  todayAppointments: AppointmentDTO[]
}

const STATUS_CONFIG: Record<
  AppointmentDTO['status'],
  { text: string; color: string }
> = {
  PENDING: { text: '待确认', color: 'orange' },
  CONFIRMED: { text: '已确认', color: 'blue' },
  CANCELLED: { text: '已取消', color: 'red' },
  COMPLETED: { text: '已完成', color: 'green' },
}

const CounselorDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    pendingCount: 0,
    monthlyIncome: 0,
    monthlyConsultations: 0,
    todayAppointments: [],
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const now = dayjs()
        const [appointmentsResponse, incomeResponse] = await Promise.all([
          counselorApi.getCounselorAppointments(),
          counselorApi.getIncomeStatistics(now.year(), now.month() + 1),
        ])

        const rawAppointments = Array.isArray(appointmentsResponse.data)
          ? appointmentsResponse.data
          : ((appointmentsResponse.data as any)?.appointments ?? [])
        const appointments: AppointmentDTO[] = rawAppointments.map(
          (appointment: Partial<AppointmentDTO> & Record<string, any>) =>
            normalizeAppointment(appointment)
        )

        const todayAppointments = appointments
          .filter(
            (appointment: AppointmentDTO) =>
              appointment.date === now.format('YYYY-MM-DD')
          )
          .sort((first, second) => {
            const firstTime = dayjs(
              `${first.date} ${first.startTime || '00:00'}`,
              'YYYY-MM-DD HH:mm'
            )
            const secondTime = dayjs(
              `${second.date} ${second.startTime || '00:00'}`,
              'YYYY-MM-DD HH:mm'
            )
            return firstTime.valueOf() - secondTime.valueOf()
          })

        setStats({
          pendingCount: appointments.filter(
            (appointment: AppointmentDTO) => appointment.status === 'PENDING'
          ).length,
          monthlyIncome: Number(incomeResponse.data?.totalIncome ?? 0),
          monthlyConsultations: Number(
            incomeResponse.data?.consultationCount ?? 0
          ),
          todayAppointments,
        })
      } catch (error: any) {
        console.error('加载咨询师工作台数据失败:', error)
        message.error(
          error?.response?.data?.message ||
            error?.message ||
            '加载咨询师工作台数据失败'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleJoinConsultation = async (appointmentId: number) => {
    try {
      const response = await counselorApi.getVideoSession(appointmentId)
      const url = response.data?.sessionUrl || response.data?.roomUrl

      if (!url) {
        message.warning('当前预约暂未生成咨询入口')
        return
      }

      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || '进入咨询失败'
      )
    }
  }

  const renderAppointmentItem = (appointment: AppointmentDTO) => {
    const statusConfig = STATUS_CONFIG[appointment.status]

    return (
      <List.Item
        actions={[
          appointment.status === 'CONFIRMED' ? (
            <Button
              key="join"
              type="link"
              size="small"
              icon={<VideoCameraOutlined />}
              onClick={() => handleJoinConsultation(appointment.id)}
            >
              进入咨询
            </Button>
          ) : null,
          <Button
            key="manage"
            type="link"
            size="small"
            onClick={() => navigate('/counselor/appointments')}
          >
            前往管理
          </Button>,
        ].filter(Boolean)}
      >
        <List.Item.Meta
          avatar={
            <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full">
              <UserOutlined className="text-blue-500 text-xl" />
            </div>
          }
          title={
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {appointment.userName || `用户 #${appointment.userId}`}
              </span>
              <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
              <Tag
                color={
                  appointment.consultationType === 'ONLINE' ? 'blue' : 'green'
                }
              >
                {appointment.consultationType === 'ONLINE' ? '线上' : '线下'}
              </Tag>
            </div>
          }
          description={
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-600">
                <ClockCircleOutlined />
                <span>
                  {appointment.startTime || '--:--'} -{' '}
                  {appointment.endTime || '--:--'}
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">咨询师工作台</h1>
          <p className="text-gray-500 mt-1">
            {dayjs().format('YYYY年M月D日 dddd')}
          </p>
        </div>

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
                立即处理
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
                查看详情
              </Button>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="本月完成咨询"
                value={stats.monthlyConsultations}
                prefix={<CheckCircleOutlined />}
                suffix="次"
                valueStyle={{ color: '#1890ff' }}
              />
              <Button
                type="link"
                size="small"
                className="mt-2 p-0"
                onClick={() => navigate('/counselor/records')}
              >
                查看记录
              </Button>
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
              <Button
                type="link"
                size="small"
                className="mt-2 p-0"
                onClick={() => navigate('/counselor/appointments')}
              >
                查看全部
              </Button>
            </Card>
          </Col>
        </Row>

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
