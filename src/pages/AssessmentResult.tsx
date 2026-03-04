import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  Space,
  Typography,
  message,
  Result as AntResult,
} from 'antd'
import {
  DownloadOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { assessmentApi, type AssessmentResult } from '@/api/assessment'
import { Loading, ResultChart } from '@/components'
import { formatDate } from '@/utils'

const { Title, Paragraph } = Typography

/**
 * AssessmentResult 评估结果页面
 * 显示评估结果详情，包括总分、等级、建议和雷达图
 */
export default function AssessmentResult() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (id) {
      loadResult(Number(id))
    }
  }, [id])

  /**
   * 加载评估结果
   */
  const loadResult = async (assessmentId: number) => {
    try {
      setLoading(true)
      const response = await assessmentApi.getResult(assessmentId)
      setResult(response.data)
    } catch (error) {
      console.error('加载评估结果失败:', error)
      message.error('加载评估结果失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 下载报告
   */
  const handleDownloadReport = async () => {
    if (!result) return

    try {
      setDownloading(true)
      const response = await assessmentApi.getReport(result.id)

      // 创建下载链接
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `assessment-report-${result.id}-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      message.success('报告下载成功')
    } catch (error) {
      console.error('下载报告失败:', error)
      message.error('下载报告失败，请稍后重试')
    } finally {
      setDownloading(false)
    }
  }

  /**
   * 返回量表列表
   */
  const handleBackToList = () => {
    navigate('/assessment')
  }

  /**
   * 获取严重程度颜色
   */
  const getSeverityColor = (severity: string): string => {
    const lowerSeverity = severity?.toLowerCase() || ''
    if (
      lowerSeverity.includes('无') ||
      lowerSeverity.includes('正常') ||
      lowerSeverity.includes('minimal')
    ) {
      return '#52c41a'
    }
    if (lowerSeverity.includes('轻') || lowerSeverity.includes('mild')) {
      return '#1890ff'
    }
    if (lowerSeverity.includes('中') || lowerSeverity.includes('moderate')) {
      return '#faad14'
    }
    return '#ff4d4f'
  }

  // 加载中
  if (loading) {
    return <Loading fullscreen tip="加载评估结果..." />
  }

  // 结果不存在
  if (!result) {
    return (
      <AntResult
        status="404"
        title="评估结果不存在"
        subTitle="请返回选择其他评估"
        extra={
          <Button type="primary" onClick={handleBackToList}>
            返回量表列表
          </Button>
        }
      />
    )
  }

  const severityColor = getSeverityColor(result.severity)

  return (
    <div className="max-w-5xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <Title level={2} style={{ marginBottom: 8 }}>
          评估结果
        </Title>
        <Paragraph type="secondary">
          {result.scaleName} - {formatDate(result.createdAt)}
        </Paragraph>
      </div>

      {/* 成功提示 */}
      <AntResult
        status="success"
        icon={<CheckCircleOutlined style={{ color: severityColor }} />}
        title="评估完成"
        subTitle={`您的${result.scaleName}评估已完成`}
      />

      {/* 总分和等级 */}
      <Card className="mb-6">
        <div className="text-center">
          <Title level={2} style={{ color: severityColor, marginBottom: 8 }}>
            {result.totalScore} 分
          </Title>
          <Title level={4} style={{ color: severityColor, marginBottom: 0 }}>
            {result.severity}
          </Title>
        </div>
      </Card>

      {/* 严重程度描述 */}
      {result.interpretation && (
        <Card title="评估解读" className="mb-6">
          <Paragraph className="text-gray-700 mb-0">
            {result.interpretation}
          </Paragraph>
        </Card>
      )}

      {/* 专业建议 */}
      {result.suggestions && (
        <Card title="专业建议" className="mb-6">
          <Paragraph className="text-gray-700 mb-0">
            {result.suggestions}
          </Paragraph>
        </Card>
      )}

      {/* 各维度得分雷达图 */}
      {result.dimensionScores && result.dimensionScores.length > 0 && (
        <ResultChart
          dimensionScores={result.dimensionScores}
          className="mb-6"
        />
      )}

      {/* 操作按钮 */}
      <Card>
        <Space className="w-full justify-center" size="large">
          <Button
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={handleBackToList}
          >
            返回量表列表
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<DownloadOutlined />}
            onClick={handleDownloadReport}
            loading={downloading}
          >
            下载报告
          </Button>
        </Space>
      </Card>
    </div>
  )
}
