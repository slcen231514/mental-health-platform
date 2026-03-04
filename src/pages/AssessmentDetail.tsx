import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Progress, Result, message, Modal, Typography } from 'antd'
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { assessmentApi, type ScaleDetail } from '@/api/assessment'
import { Loading, QuestionItem } from '@/components'

const { Title } = Typography

/**
 * AssessmentDetail 评估问卷页面
 * 显示量表题目并收集用户答案
 */
export default function AssessmentDetail() {
  const { scaleCode } = useParams<{ scaleCode: string }>()
  const navigate = useNavigate()

  const [scale, setScale] = useState<ScaleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({}) // questionNumber -> score

  useEffect(() => {
    if (scaleCode) {
      loadScaleDetail(scaleCode)
    }
  }, [scaleCode])

  /**
   * 加载量表详情
   */
  const loadScaleDetail = async (code: string) => {
    try {
      setLoading(true)
      const response = await assessmentApi.getScaleDetail(code)
      setScale(response.data)
    } catch (error) {
      console.error('加载量表失败:', error)
      message.error('加载量表失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 处理答案改变
   */
  const handleAnswer = (questionNumber: number, score: number) => {
    setAnswers({ ...answers, [questionNumber]: score })
  }

  /**
   * 下一题或提交
   */
  const handleNext = async () => {
    if (!scale || !scale.questions) return

    if (currentIndex < scale.questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // 最后一题，提交评估
      await handleSubmit()
    }
  }

  /**
   * 上一题
   */
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  /**
   * 提交评估
   */
  const handleSubmit = async () => {
    if (!scale) return

    // 验证是否所有题目都已回答
    const unansweredQuestions = scale.questions.filter(
      q => answers[q.questionNumber] === undefined
    )

    if (unansweredQuestions.length > 0) {
      Modal.confirm({
        title: '提示',
        icon: <ExclamationCircleOutlined />,
        content: `还有 ${unansweredQuestions.length} 道题目未回答，确定要提交吗？`,
        okText: '继续答题',
        cancelText: '直接提交',
        onCancel: () => submitAssessment(),
      })
      return
    }

    await submitAssessment()
  }

  /**
   * 提交评估到服务器
   */
  const submitAssessment = async () => {
    if (!scale) return

    try {
      setSubmitting(true)
      const response = await assessmentApi.submitAssessment({
        scaleCode: scale.code,
        answers: answers,
      })
      message.success('评估提交成功')
      // 跳转到结果页面
      navigate(`/assessment/result/${response.data.id}`)
    } catch (error) {
      console.error('提交评估失败:', error)
      message.error('提交评估失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  // 加载中
  if (loading) {
    return <Loading fullscreen tip="加载量表..." />
  }

  // 量表不存在
  if (!scale || !scale.questions || scale.questions.length === 0) {
    return (
      <Result
        status="404"
        title="量表不存在"
        subTitle="请返回选择其他量表"
        extra={
          <Button type="primary" onClick={() => navigate('/assessment')}>
            返回量表列表
          </Button>
        }
      />
    )
  }

  const questions = scale.questions
  const currentQuestion = questions[currentIndex]
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100)
  const isLastQuestion = currentIndex === questions.length - 1
  const isAnswered = answers[currentQuestion.questionNumber] !== undefined

  // 问卷页面
  return (
    <div className="max-w-3xl mx-auto">
      {/* 页面标题 */}
      <Title level={3} className="mb-4">
        {scale.name}
      </Title>

      {/* 进度条 */}
      <Progress percent={progress} className="mb-6" />

      {/* 题目 */}
      <QuestionItem
        question={currentQuestion}
        currentIndex={currentIndex}
        totalCount={questions.length}
        selectedScore={answers[currentQuestion.questionNumber]}
        onChange={handleAnswer}
        className="mb-6"
      />

      {/* 导航按钮 */}
      <div className="flex justify-between">
        <Button
          size="large"
          icon={<ArrowLeftOutlined />}
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          上一题
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<ArrowRightOutlined />}
          onClick={handleNext}
          disabled={!isAnswered}
          loading={submitting}
        >
          {isLastQuestion ? '提交评估' : '下一题'}
        </Button>
      </div>
    </div>
  )
}
