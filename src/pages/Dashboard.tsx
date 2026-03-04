import { Card, Row, Col, Statistic, Progress, List, Tag } from 'antd'
import {
  HeartOutlined,
  SmileOutlined,
  CalendarOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuthStore } from '../store/authStore'

const mockTrendData = [
  { date: '12/01', score: 65 },
  { date: '12/08', score: 58 },
  { date: '12/15', score: 72 },
  { date: '12/22', score: 68 },
  { date: '12/29', score: 75 },
]

const mockTasks = [
  { id: 1, title: '完成每日冥想', status: 'done' },
  { id: 2, title: '记录情绪日记', status: 'pending' },
  { id: 3, title: 'CBT练习：认知重构', status: 'pending' },
]

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">欢迎回来，{user?.username}</h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover transition-all duration-300">
            <Statistic
              title="心理健康指数"
              value={75}
              suffix="/ 100"
              prefix={<HeartOutlined className="text-red-500" />}
            />
            <Progress percent={75} showInfo={false} strokeColor="#52c41a" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover transition-all duration-300">
            <Statistic
              title="本周情绪评分"
              value={4.2}
              suffix="/ 5"
              prefix={<SmileOutlined className="text-yellow-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover transition-all duration-300">
            <Statistic
              title="连续打卡天数"
              value={7}
              suffix="天"
              prefix={<CalendarOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover transition-all duration-300">
            <Statistic
              title="完成干预任务"
              value={12}
              suffix="个"
              prefix={<TrophyOutlined className="text-orange-500" />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={16}>
          <Card title="心理健康趋势" className="h-80">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mockTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#1890ff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="今日任务" className="h-80">
            <List
              dataSource={mockTasks}
              renderItem={(item) => (
                <List.Item>
                  <span>{item.title}</span>
                  <Tag color={item.status === 'done' ? 'success' : 'default'}>
                    {item.status === 'done' ? '已完成' : '待完成'}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
