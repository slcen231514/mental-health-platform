import { useState } from 'react'
import {
  Card,
  Steps,
  Form,
  Input,
  Button,
  Slider,
  Space,
  Typography,
  message,
  Alert,
  Divider,
} from 'antd'
import {
  BulbOutlined,
  SearchOutlined,
  ExperimentOutlined,
  EditOutlined,
  SmileOutlined,
} from '@ant-design/icons'
import { interventionApi } from '@/api/intervention'
import { useNavigate } from 'react-router-dom'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

interface CBTFormData {
  situation: string
  automaticThought: string
  emotionBefore: number
  evidence: string
  cognitiveDistortion: string
  alternativeThought: string
  emotionAfter: number
}

export default function CBT() {
  const [form] = Form.useForm<CBTFormData>()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  // CBT 步骤定义
  const steps = [
    {
      title: '识别情境',
      icon: <SearchOutlined />,
      description: '描述触发负面情绪的具体情境',
    },
    {
      title: '捕捉自动思维',
      icon: <BulbOutlined />,
      description: '记录当时脑海中自动出现的想法',
    },
    {
      title: '评估证据',
      icon: <ExperimentOutlined />,
      description: '客观分析支持和反对这个想法的证据',
    },
    {
      title: '识别认知扭曲',
      icon: <EditOutlined />,
      description: '找出思维中的认知偏差',
    },
    {
      title: '形成替代思维',
      icon: <SmileOutlined />,
      description: '创建更平衡、更现实的想法',
    },
  ]

  // 认知扭曲类型
  const cognitiveDistortions = [
    '全或无思维（非黑即白）',
    '过度概括',
    '心理过滤（只看消极面）',
    '否定积极面',
    '妄下结论',
    '放大或缩小',
    '情绪化推理',
    '应该陈述',
    '贴标签',
    '个人化',
  ]

  const handleNext = async () => {
    try {
      // 验证当前步骤的字段
      const fieldsToValidate = getFieldsForStep(currentStep)
      await form.validateFields(fieldsToValidate)
      setCurrentStep(currentStep + 1)
    } catch (error) {
      console.error('验证失败:', error)
    }
  }

  const handlePrev = () => {
    setCurrentStep(currentStep - 1)
  }

  const getFieldsForStep = (step: number): (keyof CBTFormData)[] => {
    switch (step) {
      case 0:
        return ['situation']
      case 1:
        return ['automaticThought', 'emotionBefore']
      case 2:
        return ['evidence']
      case 3:
        return ['cognitiveDistortion']
      case 4:
        return ['alternativeThought', 'emotionAfter']
      default:
        return []
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const allFields: (keyof CBTFormData)[] = [
        'situation',
        'automaticThought',
        'emotionBefore',
        'evidence',
        'cognitiveDistortion',
        'alternativeThought',
        'emotionAfter',
      ]
      await form.validateFields(allFields)
      const values = form.getFieldsValue(true) as CBTFormData

      // 确保情绪值存在，如果不存在则使用默认值5
      const emotionBefore = values.emotionBefore ?? 5
      const emotionAfter = values.emotionAfter ?? 5

      await interventionApi.submitCbtSession({
        exerciseType: 'THOUGHT_RECORD',
        responses: {
          situation: values.situation,
          automaticThought: values.automaticThought,
          evidence: values.evidence,
          cognitiveDistortion: values.cognitiveDistortion,
          alternativeThought: values.alternativeThought,
          emotionBefore: emotionBefore.toString(),
          emotionAfter: emotionAfter.toString(),
        },
      })

      message.success('CBT练习提交成功！')

      // 计算情绪改善
      const improvement = emotionBefore - emotionAfter
      if (improvement > 0) {
        message.info(`您的情绪改善了 ${improvement} 分，继续保持！`)
      }

      // 跳转到历史记录页面
      setTimeout(() => {
        navigate('/cbt/history')
      }, 1500)
    } catch (error) {
      console.error('提交失败:', error)
      message.error('提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <Alert
              message="第一步：识别情境"
              description="请详细描述触发您负面情绪的具体情境。包括时间、地点、人物和发生的事情。"
              type="info"
              showIcon
              className="mb-4"
            />
            <Form.Item
              name="situation"
              label="情境描述"
              rules={[
                { required: true, message: '请描述具体情境' },
                { min: 10, message: '请至少输入10个字符' },
              ]}
            >
              <TextArea
                rows={6}
                placeholder="例如：今天下午在公司会议上，我提出的方案被领导否决了，当时会议室里有10个同事..."
                showCount
                maxLength={500}
              />
            </Form.Item>
          </div>
        )

      case 1:
        return (
          <div>
            <Alert
              message="第二步：捕捉自动思维"
              description="记录当时脑海中自动出现的想法，不要评判，只是如实记录。同时评估当时的情绪强度。"
              type="info"
              showIcon
              className="mb-4"
            />
            <Form.Item
              name="automaticThought"
              label="自动思维"
              rules={[
                { required: true, message: '请记录您的自动思维' },
                { min: 5, message: '请至少输入5个字符' },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="例如：我太失败了，我的想法总是不被认可，大家一定觉得我很无能..."
                showCount
                maxLength={300}
              />
            </Form.Item>
            <Form.Item
              name="emotionBefore"
              label="情绪强度（练习前）"
              rules={[{ required: true, message: '请评估情绪强度' }]}
              initialValue={5}
            >
              <Slider
                min={1}
                max={10}
                marks={{
                  1: '很轻微',
                  5: '中等',
                  10: '非常强烈',
                }}
              />
            </Form.Item>
          </div>
        )

      case 2:
        return (
          <div>
            <Alert
              message="第三步：评估证据"
              description="客观分析支持和反对这个想法的证据。尝试从旁观者的角度看待这件事。"
              type="info"
              showIcon
              className="mb-4"
            />
            <Form.Item
              name="evidence"
              label="证据分析"
              rules={[
                { required: true, message: '请分析相关证据' },
                { min: 20, message: '请至少输入20个字符' },
              ]}
              extra="请分别列出支持和反对这个想法的证据"
            >
              <TextArea
                rows={8}
                placeholder={`支持的证据：
- 这次方案确实被否决了
- ...

反对的证据：
- 之前也有方案被采纳过
- 领导提出了建设性的修改意见
- ...`}
                showCount
                maxLength={500}
              />
            </Form.Item>
          </div>
        )

      case 3:
        return (
          <div>
            <Alert
              message="第四步：识别认知扭曲"
              description="找出您的思维中可能存在的认知偏差或扭曲。"
              type="info"
              showIcon
              className="mb-4"
            />
            <Card size="small" className="mb-4">
              <Text strong>常见的认知扭曲类型：</Text>
              <ul className="mt-2 ml-4">
                {cognitiveDistortions.map((distortion, index) => (
                  <li key={index} className="text-gray-600">
                    {distortion}
                  </li>
                ))}
              </ul>
            </Card>
            <Form.Item
              name="cognitiveDistortion"
              label="认知扭曲分析"
              rules={[
                { required: true, message: '请识别认知扭曲' },
                { min: 10, message: '请至少输入10个字符' },
              ]}
            >
              <TextArea
                rows={5}
                placeholder="例如：我的思维存在'全或无思维'和'过度概括'。一次方案被否决，我就认为自己完全失败，总是不被认可..."
                showCount
                maxLength={300}
              />
            </Form.Item>
          </div>
        )

      case 4:
        return (
          <div>
            <Alert
              message="第五步：形成替代思维"
              description="基于证据分析，创建一个更平衡、更现实的想法。然后重新评估您的情绪。"
              type="info"
              showIcon
              className="mb-4"
            />
            <Form.Item
              name="alternativeThought"
              label="替代思维"
              rules={[
                { required: true, message: '请形成替代思维' },
                { min: 10, message: '请至少输入10个字符' },
              ]}
            >
              <TextArea
                rows={5}
                placeholder="例如：这次方案被否决不代表我完全失败。领导提出了修改意见，说明方案有可取之处。我可以根据反馈改进方案..."
                showCount
                maxLength={300}
              />
            </Form.Item>
            <Form.Item
              name="emotionAfter"
              label="情绪强度（练习后）"
              rules={[{ required: true, message: '请重新评估情绪强度' }]}
              initialValue={5}
            >
              <Slider
                min={1}
                max={10}
                marks={{
                  1: '很轻微',
                  5: '中等',
                  10: '非常强烈',
                }}
              />
            </Form.Item>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Title level={2} className="mb-2">
        <BulbOutlined className="mr-2" />
        认知行为疗法（CBT）练习
      </Title>
      <Paragraph type="secondary" className="mb-6">
        通过系统化的思维记录，识别和改变负面思维模式
      </Paragraph>

      <div className="mb-4">
        <Button onClick={() => navigate('/cbt/history')}>查看历史</Button>
      </div>

      <Card>
        <Steps current={currentStep} items={steps} className="mb-8" />

        <Divider />

        <Form form={form} layout="vertical">
          {renderStepContent()}

          <div className="flex justify-between mt-6">
            <Button onClick={handlePrev} disabled={currentStep === 0}>
              上一步
            </Button>
            <Space>
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={handleNext}>
                  下一步
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={isSubmitting}
                >
                  提交练习
                </Button>
              )}
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  )
}
