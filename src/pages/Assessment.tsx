import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Tag, Button, Spin, message } from 'antd'
import { ClockCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { assessmentApi, Scale } from '../api/assessment'

// 量表标签映射
const scaleTagsMap: Record<string, string[]> = {
  'PHQ-9': ['抑郁', '情绪'],
  'GAD-7': ['焦虑', '紧张'],
  'DASS-21': ['抑郁', '焦虑', '压力'],
}

// 估算完成时间
const getEstimatedTime = (questionCount: number): string => {
  if (questionCount <= 7) return '2-4分钟'
  if (questionCount <= 10) return '3-5分钟'
  if (questionCount <= 21) return '5-10分钟'
  return '10-15分钟'
}

export default function Assessment() {
  const navigate = useNavigate()
  const [scales, setScales] = useState<Scale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadScales()
  }, [])

  const loadScales = async () => {
    try {
      setLoading(true)
      const response = await assessmentApi.getScales()
      setScales(response.data || [])
    } catch (error: any) {
      message.error(error.message || '加载量表失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">心理评估</h1>
      <p className="text-gray-500 mb-6">选择量表进行专业的心理健康评估</p>

      {scales.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          暂无可用量表
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {scales.map((scale) => (
            <Col xs={24} md={12} lg={8} key={scale.code}>
              <Card
                className="h-full card-hover transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/assessment/${scale.code}`)}
              >
                <h3 className="text-lg font-semibold mb-2">{scale.name}</h3>
                <p className="text-gray-500 mb-4">{scale.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span><QuestionCircleOutlined /> {scale.questionCount}题</span>
                  <span><ClockCircleOutlined /> {getEstimatedTime(scale.questionCount)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(scaleTagsMap[scale.code] || ['心理健康']).map((tag) => (
                    <Tag key={tag} color="blue">{tag}</Tag>
                  ))}
                </div>
                <Button type="primary" className="mt-4" block>
                  开始评估
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
