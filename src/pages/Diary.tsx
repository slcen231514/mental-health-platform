import { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Select,
  Slider,
  Button,
  Space,
  Typography,
  message,
  List,
  Tag,
  Empty,
  Spin,
  Modal,
  Row,
  Col,
  Statistic,
} from 'antd'
import {
  EditOutlined,
  SmileOutlined,
  FrownOutlined,
  MehOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { interventionApi, Diary as DiaryRecord } from '@/api/intervention'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

// 情绪类型
const emotionTypes = [
  { value: 'HAPPY', label: '开心', icon: <SmileOutlined />, color: 'gold' },
  { value: 'SAD', label: '悲伤', icon: <FrownOutlined />, color: 'blue' },
  {
    value: 'ANGRY',
    label: '愤怒',
    icon: <ThunderboltOutlined />,
    color: 'red',
  },
  { value: 'ANXIOUS', label: '焦虑', icon: <HeartOutlined />, color: 'orange' },
  { value: 'CALM', label: '平静', icon: <MehOutlined />, color: 'green' },
  {
    value: 'EXCITED',
    label: '兴奋',
    icon: <ThunderboltOutlined />,
    color: 'purple',
  },
]

export default function Diary() {
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [diaries, setDiaries] = useState<DiaryRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDiary, setSelectedDiary] = useState<DiaryRecord | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    fetchDiaries()
  }, [])

  const fetchDiaries = async () => {
    setIsLoading(true)
    try {
      const response = await interventionApi.getDiaryHistory({
        page: 0,
        size: 20,
      })
      // 后端返回的是 PageResult，包含 records 字段
      setDiaries(response.data.records || [])
    } catch (error) {
      console.error('获取日记失败:', error)
      setDiaries([]) // 确保出错时也设置为空数组
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (values: {
    emotionType: string
    emotionLevel: number
    content: string
  }) => {
    try {
      setIsSubmitting(true)

      await interventionApi.saveDiary({
        emotionType: values.emotionType,
        emotionLevel: values.emotionLevel,
        content: values.content,
      })

      message.success('日记保存成功！')
      form.resetFields()
      fetchDiaries()
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewDetail = (diary: DiaryRecord) => {
    setSelectedDiary(diary)
    setDetailModalVisible(true)
  }

  const getEmotionInfo = (type: string) => {
    return emotionTypes.find(e => e.value === type) || emotionTypes[0]
  }

  // 计算统计数据
  const calculateStats = () => {
    const totalDiaries = diaries.length

    // 本周日记数
    const weekStart = dayjs().startOf('week')
    const thisWeekDiaries = diaries.filter(diary =>
      dayjs(diary.createdAt).isAfter(weekStart)
    ).length

    // 平均情绪水平
    const totalLevel = diaries.reduce(
      (sum, diary) => sum + diary.emotionLevel,
      0
    )
    const avgLevel =
      totalDiaries > 0 ? (totalLevel / totalDiaries).toFixed(1) : 0

    return {
      totalDiaries,
      thisWeekDiaries,
      avgLevel,
    }
  }

  const stats = calculateStats()

  // 过滤日记
  const filteredDiaries = diaries.filter(diary =>
    diary.content.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto">
      <Title level={2} className="mb-2">
        <EditOutlined className="mr-2" />
        情绪日记
      </Title>
      <Paragraph type="secondary" className="mb-6">
        记录每日情绪变化，追踪情绪模式，促进自我觉察
      </Paragraph>

      <Row gutter={[24, 24]}>
        {/* 左侧：编辑器 */}
        <Col xs={24} lg={10}>
          <Card title="写日记">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                emotionLevel: 5,
              }}
            >
              <Form.Item
                name="emotionType"
                label="今天的主要情绪"
                rules={[{ required: true, message: '请选择情绪类型' }]}
              >
                <Select
                  placeholder="选择情绪类型"
                  size="large"
                  options={emotionTypes.map(type => ({
                    value: type.value,
                    label: (
                      <Space>
                        {type.icon}
                        <span>{type.label}</span>
                      </Space>
                    ),
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="emotionLevel"
                label="情绪强度"
                rules={[{ required: true, message: '请评估情绪强度' }]}
              >
                <Slider
                  min={1}
                  max={10}
                  marks={{
                    1: '很弱',
                    5: '中等',
                    10: '很强',
                  }}
                />
              </Form.Item>

              <Form.Item
                name="content"
                label="日记内容"
                rules={[
                  { required: true, message: '请输入日记内容' },
                  { min: 10, message: '请至少输入10个字符' },
                ]}
              >
                <TextArea
                  rows={10}
                  placeholder="今天发生了什么？你的感受是什么？&#10;&#10;可以记录：&#10;- 触发情绪的事件&#10;- 当时的想法和感受&#10;- 身体的反应&#10;- 你的应对方式"
                  showCount
                  maxLength={2000}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  block
                  size="large"
                  icon={<EditOutlined />}
                >
                  保存日记
                </Button>
              </Form.Item>
            </Form>

            {/* 写作提示 */}
            <Card size="small" className="bg-blue-50 border-blue-200 mt-4">
              <Space direction="vertical" size="small">
                <Text strong className="text-blue-700">
                  ✍️ 写作提示
                </Text>
                <ul className="text-sm text-gray-600 ml-4 space-y-1">
                  <li>诚实地表达自己的感受</li>
                  <li>不要评判自己的情绪</li>
                  <li>记录具体的事件和细节</li>
                  <li>反思情绪背后的需求</li>
                </ul>
              </Space>
            </Card>
          </Card>
        </Col>

        {/* 右侧：日记列表 */}
        <Col xs={24} lg={14}>
          {/* 统计卡片 */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="总日记数"
                  value={stats.totalDiaries}
                  suffix="篇"
                  prefix={<EditOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="本周日记"
                  value={stats.thisWeekDiaries}
                  suffix="篇"
                  prefix={<EditOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="平均情绪"
                  value={stats.avgLevel}
                  suffix="/ 10"
                  prefix={<SmileOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 搜索和列表 */}
          <Card
            title="我的日记"
            extra={
              <Input
                placeholder="搜索日记内容"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />
            }
          >
            <Spin spinning={isLoading}>
              {filteredDiaries.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={searchText ? '没有找到相关日记' : '暂无日记记录'}
                  className="py-8"
                />
              ) : (
                <List
                  dataSource={filteredDiaries}
                  renderItem={diary => {
                    const emotionInfo = getEmotionInfo(diary.emotionType)
                    return (
                      <List.Item
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleViewDetail(diary)}
                        actions={[
                          <Button
                            key="view"
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={e => {
                              e.stopPropagation()
                              handleViewDetail(diary)
                            }}
                          >
                            查看
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <div
                              className={`w-12 h-12 rounded-full bg-${emotionInfo.color}-100 flex items-center justify-center`}
                            >
                              <span className="text-xl">
                                {emotionInfo.icon}
                              </span>
                            </div>
                          }
                          title={
                            <Space>
                              <Text strong>
                                {dayjs(diary.createdAt).format('YYYY-MM-DD')}
                              </Text>
                              <Tag color={emotionInfo.color}>
                                {emotionInfo.label}
                              </Tag>
                              <Tag>强度: {diary.emotionLevel}/10</Tag>
                            </Space>
                          }
                          description={
                            <Paragraph
                              ellipsis={{ rows: 2 }}
                              className="!mb-0 text-gray-600"
                            >
                              {diary.content}
                            </Paragraph>
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

      {/* 详情弹窗 */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            <span>日记详情</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          setSelectedDiary(null)
        }}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => {
              setDetailModalVisible(false)
              setSelectedDiary(null)
            }}
          >
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedDiary && (
          <div className="py-4">
            <Space direction="vertical" size="large" className="w-full">
              <div>
                <Text type="secondary" className="text-sm">
                  {dayjs(selectedDiary.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </Text>
              </div>

              <div>
                <Space size="middle">
                  {(() => {
                    const emotionInfo = getEmotionInfo(
                      selectedDiary.emotionType
                    )
                    return (
                      <>
                        <Tag
                          color={emotionInfo.color}
                          className="text-base px-3 py-1"
                        >
                          {emotionInfo.icon}
                          <span className="ml-2">{emotionInfo.label}</span>
                        </Tag>
                        <Tag className="text-base px-3 py-1">
                          情绪强度: {selectedDiary.emotionLevel}/10
                        </Tag>
                      </>
                    )
                  })()}
                </Space>
              </div>

              <Card className="bg-gray-50">
                <Paragraph className="text-base whitespace-pre-wrap !mb-0">
                  {selectedDiary.content}
                </Paragraph>
              </Card>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  )
}
