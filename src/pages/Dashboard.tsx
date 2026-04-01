import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Row,
  Col,
  Statistic,
  List,
  Button,
  Avatar,
  Typography,
  Space,
} from 'antd'
import {
  UserOutlined,
  FormOutlined,
  MessageOutlined,
  TeamOutlined,
  RightOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  BookOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store'
import { assessmentApi, type AssessmentResult } from '@/api/assessment'
import {
  counselorApi,
  type AppointmentDTO,
  normalizeAppointment,
} from '@/api/counselor'
import { interventionApi } from '@/api/intervention'
import request from '@/api/request'
import { Loading, Empty } from '@/components'
import { formatDate, getGreeting } from '@/utils'

const { Title, Text, Paragraph } = Typography

interface DashboardStats {
  assessmentCount: number
  dialogueCount: number
  appointmentCount: number
  interventionTaskCount: number
}

interface RecommendedContent {
  id: number
  type: 'article' | 'video' | 'exercise' | 'counselor'
  title: string
  description: string
  thumbnail?: string
  url?: string
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentAssessments, setRecentAssessments] = useState<
    AssessmentResult[]
  >([])
  const [recommendations, setRecommendations] = useState<RecommendedContent[]>(
    []
  )

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const [
        assessmentHistoryRes,
        conversationsRes,
        appointmentsRes,
        cbtHistoryRes,
        meditationHistoryRes,
        recommendationsRes,
      ] = await Promise.allSettled([
        assessmentApi.getHistory({ page: 0, size: 5 }),
        request.get<unknown, { data: Array<{ id: number }> }>(
          '/dialogue/conversations'
        ),
        counselorApi.getUserAppointments(),
        interventionApi.getCbtHistory({ page: 0, size: 1 }),
        interventionApi.getMeditationHistory({ page: 0, size: 1 }),
        request.get<unknown, { data: RecommendedContent[] }>(
          '/dashboard/recommendations',
          {
            params: { limit: 6 },
          }
        ),
      ])

      const assessmentPage =
        assessmentHistoryRes.status === 'fulfilled'
          ? (assessmentHistoryRes.value.data as any) || null
          : null
      const conversations =
        conversationsRes.status === 'fulfilled'
          ? conversationsRes.value.data || []
          : []
      const rawAppointments =
        appointmentsRes.status === 'fulfilled'
          ? appointmentsRes.value.data || []
          : []
      const cbtPage =
        cbtHistoryRes.status === 'fulfilled' ? cbtHistoryRes.value.data : null
      const meditationPage =
        meditationHistoryRes.status === 'fulfilled'
          ? meditationHistoryRes.value.data
          : null
      const recommendedContent =
        recommendationsRes.status === 'fulfilled'
          ? recommendationsRes.value.data || []
          : []

      const appointments: AppointmentDTO[] = (rawAppointments as any[]).map(
        normalizeAppointment
      )
      const recentAssessmentRecords = (assessmentPage?.records ||
        []) as AssessmentResult[]

      setStats({
        assessmentCount: Number(assessmentPage?.total || 0),
        dialogueCount: Array.isArray(conversations) ? conversations.length : 0,
        appointmentCount: appointments.length,
        interventionTaskCount:
          Number(cbtPage?.total || 0) + Number(meditationPage?.total || 0),
      })
      setRecentAssessments(recentAssessmentRecords)
      setRecommendations(
        Array.isArray(recommendedContent) ? recommendedContent : []
      )
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationIcon = (type: RecommendedContent['type']) => {
    switch (type) {
      case 'article':
        return <FileTextOutlined />
      case 'video':
        return <PlayCircleOutlined />
      case 'exercise':
        return <BookOutlined />
      case 'counselor':
        return <TeamOutlined />
      default:
        return <FileTextOutlined />
    }
  }

  if (loading) {
    return <Loading fullscreen tip="加载中..." />
  }

  return (
    <div className="dashboard-container">
      <Card className="welcome-card mb-6">
        <Space size="large" align="center">
          <Avatar size={64} icon={<UserOutlined />} />
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {getGreeting()}，{user?.username || '用户'}
            </Title>
            <Text type="secondary">
              欢迎回到心理健康平台，愿你今天也能稳稳地照顾好自己。
            </Text>
          </div>
        </Space>
      </Card>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="评估次数"
              value={stats?.assessmentCount || 0}
              suffix="次"
              prefix={<FormOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="对话次数"
              value={stats?.dialogueCount || 0}
              suffix="次"
              prefix={<MessageOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="预约次数"
              value={stats?.appointmentCount || 0}
              suffix="次"
              prefix={<TeamOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="完成干预"
              value={stats?.interventionTaskCount || 0}
              suffix="项"
              prefix={<BookOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="最近评估"
            extra={
              <Button
                type="link"
                onClick={() => navigate('/assessment/history')}
              >
                查看全部 <RightOutlined />
              </Button>
            }
          >
            {recentAssessments.length > 0 ? (
              <List
                dataSource={recentAssessments}
                renderItem={item => (
                  <List.Item
                    key={item.id}
                    actions={[
                      <Button
                        key="detail"
                        type="link"
                        onClick={() =>
                          navigate(`/assessment/result/${item.id}`)
                        }
                      >
                        查看详情
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={item.scaleName}
                      description={
                        <Space wrap>
                          <Text>得分: {item.totalScore}</Text>
                          <Text type="secondary">|</Text>
                          <Text>等级: {item.severity}</Text>
                          <Text type="secondary">|</Text>
                          <Text type="secondary">
                            {formatDate(item.createdAt)}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无评估记录" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="快捷操作">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button
                type="primary"
                size="large"
                block
                icon={<FormOutlined />}
                onClick={() => navigate('/assessment')}
              >
                开始评估
              </Button>
              <Button
                size="large"
                block
                icon={<MessageOutlined />}
                onClick={() => navigate('/dialogue')}
              >
                开始对话
              </Button>
              <Button
                size="large"
                block
                icon={<TeamOutlined />}
                onClick={() => navigate('/counselor')}
              >
                查看咨询师
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="为你推荐" className="mt-6">
        {recommendations.length > 0 ? (
          <Row gutter={[16, 16]}>
            {recommendations.map(item => (
              <Col xs={24} sm={12} lg={8} key={item.id}>
                <Card
                  hoverable
                  cover={
                    item.thumbnail ? (
                      <img
                        alt={item.title}
                        src={item.thumbnail}
                        style={{ height: 160, objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          height: 160,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f0f0f0',
                          fontSize: 48,
                          color: '#bfbfbf',
                        }}
                      >
                        {getRecommendationIcon(item.type)}
                      </div>
                    )
                  }
                  onClick={() => {
                    if (item.url) {
                      window.open(item.url, '_blank')
                    } else {
                      navigate(`/content/${item.id}`)
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Meta
                    title={
                      <Space>
                        {getRecommendationIcon(item.type)}
                        <Text ellipsis>{item.title}</Text>
                      </Space>
                    }
                    description={
                      <Paragraph
                        ellipsis={{ rows: 2 }}
                        style={{ marginBottom: 0 }}
                      >
                        {item.description}
                      </Paragraph>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无推荐内容" />
        )}
      </Card>
    </div>
  )
}
