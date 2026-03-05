import { Card, Row, Col, Button } from 'antd'
import {
  BulbOutlined,
  AudioOutlined,
  EditOutlined,
  FieldTimeOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const tools = [
  {
    key: 'plans',
    title: '干预计划',
    description: '查看和管理您的个性化干预计划',
    icon: <CalendarOutlined className="text-4xl text-orange-500" />,
    path: '/plans',
  },
  {
    key: 'cbt',
    title: 'CBT认知重构',
    description: '通过认知行为疗法技术，识别和改变消极思维模式',
    icon: <BulbOutlined className="text-4xl text-yellow-500" />,
    path: '/cbt',
  },
  {
    key: 'meditation',
    title: '正念冥想',
    description: '引导式冥想练习，帮助放松身心，减轻压力',
    icon: <AudioOutlined className="text-4xl text-green-500" />,
    path: '/meditation',
  },
  {
    key: 'diary',
    title: '情绪日记',
    description: '记录每日情绪变化，追踪情绪模式',
    icon: <EditOutlined className="text-4xl text-blue-500" />,
    path: '/diary',
  },
  {
    key: 'sleep',
    title: '睡眠管理',
    description: '记录睡眠数据，获取改善建议',
    icon: <FieldTimeOutlined className="text-4xl text-purple-500" />,
    path: '/sleep',
  },
]

export default function Intervention() {
  const navigate = useNavigate()

  const handleToolClick = (path: string) => {
    navigate(path)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">干预工具</h1>
      <p className="text-gray-500 mb-6">使用循证疗法工具进行自我调节</p>

      <Row gutter={[16, 16]}>
        {tools.map(tool => (
          <Col xs={24} sm={12} lg={6} key={tool.key}>
            <Card
              className="h-full text-center card-hover transition-all duration-300 cursor-pointer hover:shadow-lg"
              onClick={() => handleToolClick(tool.path)}
            >
              <div className="mb-4">{tool.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{tool.title}</h3>
              <p className="text-gray-500 text-sm mb-4">{tool.description}</p>
              <Button type="primary">开始练习</Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
