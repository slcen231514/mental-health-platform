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
  Modal,
  Divider,
} from 'antd'
import {
  BulbOutlined,
  EyeOutlined,
  SmileOutlined,
  FrownOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons'
import { interventionApi, CBTSession } from '@/api/intervention'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'

const { Title, Text, Paragraph } = Typography

export default function CBTHistory() {
  const [sessions, setSessions] = useState<CBTSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSession, setSelectedSession] = useState<CBTSession | null>(
    null
  )
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const response = await interventionApi.getCbtHistory()
      setSessions(response.data.content)
    } catch (error) {
      console.error('获取CBT历史失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetail = (session: CBTSession) => {
    setSelectedSession(session)
    setDetailModalVisible(true)
  }

  const renderEmotionChange = (before: number, after: number) => {
    const change = before - after
    if (change > 0) {
      return (
        <Tag color="success" icon={<ArrowDownOutlined />}>
          改善 {change} 分
        </Tag>
      )
    } else if (change < 0) {
      return (
        <Tag color="error" icon={<ArrowUpOutlined />}>
          上升 {Math.abs(change)} 分
        </Tag>
      )
    } else {
      return <Tag color="default">无变化</Tag>
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="!mb-2">
            <BulbOutlined className="mr-2" />
            CBT练习历史
          </Title>
          <Text type="secondary">查看您的认知行为疗法练习记录</Text>
        </div>
        <Button type="primary" onClick={() => navigate('/cbt')}>
          开始新练习
        </Button>
      </div>

      <Spin spinning={isLoading}>
        {sessions.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无练习记录"
            className="py-16"
          >
            <Button type="primary" onClick={() => navigate('/cbt')}>
              开始第一次练习
            </Button>
          </Empty>
        ) : (
          <List
            dataSource={sessions}
            renderItem={session => (
              <Card className="mb-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Space direction="vertical" size="small" className="w-full">
                      <div className="flex items-center gap-2">
                        <Text strong className="text-lg">
                          思维记录练习
                        </Text>
                        <Tag color="blue">已完成</Tag>
                      </div>

                      <Text type="secondary" className="text-sm">
                        {dayjs(session.createdAt).format('YYYY-MM-DD HH:mm')}
                      </Text>

                      {session.responses && (
                        <div className="mt-2">
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            className="!mb-2 text-gray-600"
                          >
                            情境：{session.responses.situation}
                          </Paragraph>

                          <Space size="middle">
                            <Space size="small">
                              <FrownOutlined className="text-orange-500" />
                              <Text type="secondary">
                                练习前: {session.responses.emotionBefore}
                              </Text>
                            </Space>
                            <Space size="small">
                              <SmileOutlined className="text-green-500" />
                              <Text type="secondary">
                                练习后: {session.responses.emotionAfter}
                              </Text>
                            </Space>
                            {renderEmotionChange(
                              parseInt(session.responses.emotionBefore),
                              parseInt(session.responses.emotionAfter)
                            )}
                          </Space>
                        </div>
                      )}
                    </Space>
                  </div>

                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(session)}
                  >
                    查看详情
                  </Button>
                </div>
              </Card>
            )}
          />
        )}
      </Spin>

      {/* 详情弹窗 */}
      <Modal
        title={
          <Space>
            <BulbOutlined />
            <span>CBT练习详情</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          setSelectedSession(null)
        }}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => {
              setDetailModalVisible(false)
              setSelectedSession(null)
            }}
          >
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedSession && selectedSession.responses && (
          <div className="py-4">
            <Space direction="vertical" size="large" className="w-full">
              <div>
                <Text strong className="text-base">
                  1. 情境描述
                </Text>
                <Paragraph className="mt-2 text-gray-700">
                  {selectedSession.responses.situation}
                </Paragraph>
              </div>

              <Divider className="!my-2" />

              <div>
                <Text strong className="text-base">
                  2. 自动思维
                </Text>
                <Paragraph className="mt-2 text-gray-700">
                  {selectedSession.responses.automaticThought}
                </Paragraph>
                <Space size="middle" className="mt-2">
                  <Tag color="orange" icon={<FrownOutlined />}>
                    情绪强度: {selectedSession.responses.emotionBefore}/10
                  </Tag>
                </Space>
              </div>

              <Divider className="!my-2" />

              <div>
                <Text strong className="text-base">
                  3. 证据分析
                </Text>
                <Paragraph className="mt-2 text-gray-700 whitespace-pre-wrap">
                  {selectedSession.responses.evidence}
                </Paragraph>
              </div>

              <Divider className="!my-2" />

              <div>
                <Text strong className="text-base">
                  4. 认知扭曲
                </Text>
                <Paragraph className="mt-2 text-gray-700">
                  {selectedSession.responses.cognitiveDistortion}
                </Paragraph>
              </div>

              <Divider className="!my-2" />

              <div>
                <Text strong className="text-base">
                  5. 替代思维
                </Text>
                <Paragraph className="mt-2 text-gray-700">
                  {selectedSession.responses.alternativeThought}
                </Paragraph>
                <Space size="middle" className="mt-2">
                  <Tag color="green" icon={<SmileOutlined />}>
                    情绪强度: {selectedSession.responses.emotionAfter}/10
                  </Tag>
                  {renderEmotionChange(
                    parseInt(selectedSession.responses.emotionBefore),
                    parseInt(selectedSession.responses.emotionAfter)
                  )}
                </Space>
              </div>

              <Divider className="!my-2" />

              <div className="bg-blue-50 p-4 rounded">
                <Text type="secondary" className="text-sm">
                  练习时间:{' '}
                  {dayjs(selectedSession.createdAt).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )}
                </Text>
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  )
}
