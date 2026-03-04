import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Radio, Button, Progress, Result, Space, Spin, message } from 'antd'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { assessmentApi, ScaleDetail, AssessmentResult } from '../api/assessment'

export default function AssessmentDetail() {
  const { scaleCode } = useParams<{ scaleCode: string }>()
  const navigate = useNavigate()
  const [scale, setScale] = useState<ScaleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({}) // questionNumber -> score
  const [result, setResult] = useState<AssessmentResult | null>(null)

  useEffect(() => {
    if (scaleCode) {
      loadScaleDetail(scaleCode)
    }
  }, [scaleCode])

  const loadScaleDetail = async (code: string) => {
    try {
      setLoading(true)
      const response = await assessmentApi.getScaleDetail(code)
      setScale(response.data)
    } catch (error: any) {
      message.error(error.message || '加载量表失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="加载量表..." />
      </div>
    )
  }

  if (!scale || !scale.questions || scale.questions.length === 0) {
    return (
      <Result 
        status="404" 
        title="量表不存在" 
        subTitle="请返回选择其他量表"
        extra={<Button onClick={() => navigate('/assessment')}>返回量表列表</Button>}
      />
    )
  }

  const questions = scale.questions
  const currentQuestion = questions[currentIndex]
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100)

  const handleAnswer = (questionNumber: number, score: number) => {
    setAnswers({ ...answers, [questionNumber]: score })
  }

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // 提交评估
      await submitAssessment()
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const submitAssessment = async () => {
    try {
      setSubmitting(true)
      const response = await assessmentApi.submitAssessment({
        scaleCode: scale.code,
        answers: answers,
      })
      setResult(response.data)
    } catch (error: any) {
      message.error(error.message || '提交评估失败')
    } finally {
      setSubmitting(false)
    }
  }

  const getSeverityColor = (severity: string): string => {
    const lowerSeverity = severity?.toLowerCase() || ''
    if (lowerSeverity.includes('无') || lowerSeverity.includes('正常') || lowerSeverity.includes('minimal')) {
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

  // 显示结果页面
  if (result) {
    const severityColor = getSeverityColor(result.severity)
    return (
      <div className="max-w-2xl mx-auto">
        <Result
          status="success"
          title="评估完成"
          subTitle={`您的${scale.name}评估已完成`}
          extra={[
            <Card key="result" className="text-left mb-4">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2" style={{ color: severityColor }}>
                  {result.totalScore} 分
                </div>
                <div className="text-lg mb-4" style={{ color: severityColor }}>
                  {result.severity}
                </div>
                {result.interpretation && (
                  <div className="text-gray-600 text-sm mt-4 p-4 bg-gray-50 rounded">
                    {result.interpretation}
                  </div>
                )}
              </div>
            </Card>,
            <Space key="buttons">
              <Button onClick={() => navigate('/assessment')}>返回量表列表</Button>
              <Button type="primary" onClick={() => navigate('/intervention')}>查看干预建议</Button>
            </Space>,
          ]}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">{scale.name}</h1>
      <Progress percent={progress} className="mb-6" />
      
      <Card className="mb-4">
        <div className="text-gray-500 mb-2">问题 {currentIndex + 1} / {questions.length}</div>
        <div className="text-lg font-medium mb-6">
          在过去两周内，您有多少时候受到以下问题的困扰？
        </div>
        <div className="text-lg mb-6 p-4 bg-gray-50 rounded">
          {currentQuestion.content}
        </div>
        <Radio.Group
          value={answers[currentQuestion.questionNumber]}
          onChange={(e) => handleAnswer(currentQuestion.questionNumber, e.target.value)}
          className="w-full"
        >
          <Space direction="vertical" className="w-full">
            {currentQuestion.options.map((opt) => (
              <Radio 
                key={opt.id} 
                value={opt.score} 
                className="w-full p-3 border rounded hover:bg-gray-50"
              >
                {opt.content}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </Card>

      <div className="flex justify-between">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
        >
          上一题
        </Button>
        <Button
          type="primary"
          icon={<ArrowRightOutlined />}
          onClick={handleNext}
          disabled={answers[currentQuestion.questionNumber] === undefined}
          loading={submitting}
        >
          {currentIndex === questions.length - 1 ? '提交' : '下一题'}
        </Button>
      </div>
    </div>
  )
}
