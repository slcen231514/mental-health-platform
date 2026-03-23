import React, { useState } from 'react'
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Space,
  Typography,
  Steps,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { FileUpload } from '@/components'
import type { UploadFile } from 'antd'
import axios from 'axios'

const { Title, Paragraph } = Typography
const { TextArea } = Input
const { Step } = Steps

/**
 * 咨询师注册申请表单数据
 */
interface ApplicationFormData {
  name: string
  phone: string
  email: string
  licenseNumber: string
  specialties: string
  experience: string
  education: string
  introduction: string
}

/**
 * 咨询师注册申请页面
 * 需求: 1.1, 1.2, 1.3, 1.6, 1.7, 1.8
 */
const CounselorApply: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [qualificationFiles, setQualificationFiles] = useState<UploadFile[]>([])
  const [applicationId, setApplicationId] = useState<number | null>(null)

  /**
   * 验证执业证书编号格式（PSY + 8位数字）
   */
  const validateLicenseNumber = (_: unknown, value: string) => {
    if (!value) {
      return Promise.reject(new Error('请输入执业证书编号'))
    }
    const pattern = /^PSY\d{8}$/
    if (!pattern.test(value)) {
      return Promise.reject(
        new Error('执业证书编号格式不正确，应为 PSY + 8位数字')
      )
    }
    return Promise.resolve()
  }

  /**
   * 提交基本信息
   */
  const handleSubmitBasicInfo = async (values: ApplicationFormData) => {
    setLoading(true)
    try {
      const response = await axios.post('/api/counselor/applications', values)
      const { data } = response.data

      setApplicationId(data.id)
      message.success('基本信息提交成功')
      setCurrentStep(1)
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      message.error(err.response?.data?.message || '提交失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 文件上传成功回调
   */
  const handleFileUploadSuccess = (
    file: UploadFile,
    _response: Record<string, unknown>
  ) => {
    message.success(`${file.name} 上传成功`)
  }

  /**
   * 文件上传失败回调
   */
  const handleFileUploadError = (file: UploadFile, _error: Error) => {
    message.error(`${file.name} 上传失败`)
  }

  /**
   * 文件列表变化回调
   */
  const handleFileListChange = (fileList: UploadFile[]) => {
    setQualificationFiles(fileList)
  }

  /**
   * 完成申请
   */
  const handleFinishApplication = () => {
    if (qualificationFiles.length === 0) {
      message.warning('请至少上传一个资质文件')
      return
    }

    message.success('申请提交成功！我们将在3-5个工作日内完成审核')
    navigate('/counselor/application-status')
  }

  /**
   * 上一步
   */
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <Title level={2} className="text-center mb-2">
            咨询师注册申请
          </Title>
          <Paragraph className="text-center text-gray-500 mb-8">
            请填写真实信息，我们将在3-5个工作日内完成审核
          </Paragraph>

          <Steps current={currentStep} className="mb-8">
            <Step title="基本信息" description="填写个人信息" />
            <Step title="资质文件" description="上传资质证明" />
            <Step title="完成" description="提交申请" />
          </Steps>

          {/* 步骤1: 基本信息 */}
          {currentStep === 0 && (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmitBasicInfo}
              autoComplete="off"
            >
              <Form.Item
                label="姓名"
                name="name"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入您的真实姓名" />
              </Form.Item>

              <Form.Item
                label="联系电话"
                name="phone"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  {
                    pattern: /^1[3-9]\d{9}$/,
                    message: '请输入有效的手机号码',
                  },
                ]}
              >
                <Input placeholder="请输入11位手机号码" />
              </Form.Item>

              <Form.Item
                label="电子邮箱"
                name="email"
                rules={[
                  { required: true, message: '请输入电子邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input placeholder="请输入您的邮箱地址" />
              </Form.Item>

              <Form.Item
                label="执业证书编号"
                name="licenseNumber"
                rules={[{ validator: validateLicenseNumber }]}
                extra="格式：PSY + 8位数字，例如：PSY12345678"
              >
                <Input placeholder="PSY12345678" />
              </Form.Item>

              <Form.Item
                label="专长领域"
                name="specialties"
                rules={[{ required: true, message: '请输入专长领域' }]}
              >
                <Input placeholder="例如：焦虑症、抑郁症、婚姻家庭咨询" />
              </Form.Item>

              <Form.Item
                label="工作经验"
                name="experience"
                rules={[{ required: true, message: '请输入工作经验' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="请简要描述您的工作经验，包括从业年限、服务案例数等"
                />
              </Form.Item>

              <Form.Item
                label="教育背景"
                name="education"
                rules={[{ required: true, message: '请输入教育背景' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="请填写您的教育背景，包括学历、毕业院校、专业等"
                />
              </Form.Item>

              <Form.Item
                label="个人简介"
                name="introduction"
                rules={[
                  { required: true, message: '请输入个人简介' },
                  { max: 1000, message: '个人简介不能超过1000字符' },
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="请介绍您的咨询理念、擅长的咨询方法等（不超过1000字）"
                  showCount
                  maxLength={1000}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  下一步
                </Button>
              </Form.Item>
            </Form>
          )}

          {/* 步骤2: 资质文件上传 */}
          {currentStep === 1 && applicationId && (
            <div>
              <Paragraph className="mb-4">
                请上传您的资质证明文件，包括但不限于：
              </Paragraph>
              <ul className="list-disc list-inside mb-6 text-gray-600">
                <li>心理咨询师执业证书</li>
                <li>学历证书</li>
                <li>专业培训证书</li>
                <li>其他相关资质证明</li>
              </ul>

              <FileUpload
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={10}
                multiple
                action={`/api/counselor/applications/${applicationId}/files`}
                onSuccess={handleFileUploadSuccess}
                onError={handleFileUploadError}
                onChange={handleFileListChange}
              />

              <Space className="mt-6 w-full justify-between">
                <Button onClick={handlePrevStep}>上一步</Button>
                <Button
                  type="primary"
                  onClick={handleFinishApplication}
                  disabled={qualificationFiles.length === 0}
                >
                  完成申请
                </Button>
              </Space>
            </div>
          )}

          {/* 步骤3: 完成 */}
          {currentStep === 2 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✓</div>
              <Title level={3}>申请提交成功！</Title>
              <Paragraph className="text-gray-500 mb-6">
                我们将在3-5个工作日内完成审核，请耐心等待
              </Paragraph>
              <Space>
                <Button
                  onClick={() => navigate('/counselor/application-status')}
                >
                  查看申请状态
                </Button>
                <Button type="primary" onClick={() => navigate('/')}>
                  返回首页
                </Button>
              </Space>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default CounselorApply
