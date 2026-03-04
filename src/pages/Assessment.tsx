import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Typography, message } from 'antd'
import { assessmentApi, type Scale } from '@/api/assessment'
import { Loading, Empty, ScaleCard } from '@/components'

const { Title, Paragraph } = Typography

/**
 * Assessment 量表列表页面
 * 显示所有可用的心理评估量表
 */
export default function Assessment() {
  const navigate = useNavigate()
  const [scales, setScales] = useState<Scale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadScales()
  }, [])

  /**
   * 加载量表列表
   */
  const loadScales = async () => {
    try {
      setLoading(true)
      const response = await assessmentApi.getScales()
      setScales(response.data || [])
    } catch (error) {
      console.error('加载量表失败:', error)
      message.error('加载量表失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 开始评估
   * @param scaleCode 量表代码
   */
  const handleStartAssessment = (scaleCode: string) => {
    navigate(`/assessment/${scaleCode}`)
  }

  if (loading) {
    return <Loading fullscreen tip="加载量表列表..." />
  }

  return (
    <div className="assessment-list-container">
      {/* 页面标题 */}
      <div className="mb-6">
        <Title level={2} style={{ marginBottom: 8 }}>
          心理评估
        </Title>
        <Paragraph type="secondary">
          选择适合的量表进行专业的心理健康评估，了解您的心理状态
        </Paragraph>
      </div>

      {/* 量表卡片列表 */}
      {scales.length === 0 ? (
        <Empty description="暂无可用量表" />
      ) : (
        <Row gutter={[16, 16]}>
          {scales.map(scale => (
            <Col xs={24} sm={12} lg={8} key={scale.code}>
              <ScaleCard scale={scale} onStart={handleStartAssessment} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
