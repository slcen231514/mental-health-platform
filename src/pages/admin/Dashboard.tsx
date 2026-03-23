import React, { useEffect, useState } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Badge,
  Table,
  Spin,
  message,
  Typography,
} from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { adminApi, DashboardStatisticsDTO } from '@/api/admin'

const { Title } = Typography

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [statistics, setStatistics] = useState<DashboardStatisticsDTO | null>(
    null
  )

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await adminApi.getDashboardStatistics()
      if (response.data) {
        setStatistics(response.data)
      } else {
        message.error('获取统计数据失败')
      }
    } catch (error) {
      console.error('Failed to fetch dashboard statistics:', error)
      message.error('获取统计数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const topCounselorsColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: '咨询师姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '预约数量',
      dataIndex: 'appointmentCount',
      key: 'appointmentCount',
      sorter: (a: any, b: any) => a.appointmentCount - b.appointmentCount,
    },
  ]

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!statistics) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <Typography.Text type="secondary">暂无数据</Typography.Text>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        管理员仪表板
      </Title>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={statistics.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总咨询师数"
              value={statistics.totalCounselors}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃咨询师数"
              value={statistics.activeCounselors}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Badge
              count={statistics.pendingApplications}
              offset={[10, 0]}
              style={{ backgroundColor: '#ff4d4f' }}
            >
              <Statistic
                title="待审核申请"
                value={statistics.pendingApplications}
                prefix={<FileTextOutlined />}
                valueStyle={{
                  color:
                    statistics.pendingApplications > 0 ? '#ff4d4f' : '#8c8c8c',
                }}
              />
            </Badge>
          </Card>
        </Col>
      </Row>

      {/* 当月预约统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="当月总预约数"
              value={statistics.monthlyAppointments.total}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="已完成预约"
              value={statistics.monthlyAppointments.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="已取消预约"
              value={statistics.monthlyAppointments.cancelled}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 趋势图表 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="每日新增用户趋势（最近30天）">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statistics.dailyUserTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="新增用户数"
                  stroke="#1890ff"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="每日预约数趋势（最近30天）">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statistics.dailyAppointmentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="预约数"
                  stroke="#52c41a"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 咨询师排行榜 */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="咨询师排行榜（前10名）">
            <Table
              columns={topCounselorsColumns}
              dataSource={statistics.counselorRankings}
              rowKey="counselorId"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminDashboard
