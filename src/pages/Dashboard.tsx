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
import {
  dashboardApi,
  type DashboardStats,
  type RecentAssessment,
  type RecommendedContent,
} from '@/api/dashboard'
import { Loading, Empty } from '@/components'
import { formatDate, getGreeting } from '@/utils'

const { Title, Text, Paragraph } = Typography

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentAssessments, setRecentAssessments] = useState<
    RecentAssessment[]
  >([])
  const [recommendations, setRecommendations] = useState<RecommendedContent[]>(
    []
  )

  // 获取仪表盘数据
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsRes, assessmentsRes, recommendationsRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentAssessments(5),
        dashboardApi.getRecommendedContent(6),
      ])

      setStats(statsRes.data)
      setRecentAssessments(assessmentsRes.data)
      setRecommendations(recommendationsRes.data)
    } catch (error) {
      console.error('获取仪表盘数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取推荐内容图标
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
      {/* 用户欢迎区域 */}
      <Card className="welcome-card mb-6">
        <Space size="large" align="center">
          <Avatar size={64} icon={<UserOutlined />} />
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {getGreeting()}，{user?.username || '用户'}
            </Title>
            <Text type="secondary">
              欢迎回到心理健康平台，祝您今天心情愉快！
            </Text>
          </div>
        </Space>
      </Card>

      {/* 统计卡片 */}
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
              title="完成任务"
              value={stats?.interventionTaskCount || 0}
              suffix="个"
              prefix={<BookOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 最近评估列表 */}
        <Col xs={24} lg={12}>
          <Card
            title="最近评估"
            extra={
              <Button type="link" onClick={() => navigate('/assessment')}>
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
                          navigate(`/assessment/${item.scaleCode}`)
                        }
                      >
                        查看详情
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={item.scaleName}
                      description={
                        <Space>
                          <Text>得分: {item.score}</Text>
                          <Text type="secondary">|</Text>
                          <Text>等级: {item.level}</Text>
                          <Text type="secondary">|</Text>
                          <Text type="secondary">
                            {formatDate(item.completedAt)}
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

        {/* 快捷操作区域 */}
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

      {/* 推荐内容区域 */}
      <Card title="为您推荐" className="mt-6">
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
                    }
                  }}
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
