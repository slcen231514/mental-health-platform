import React, { useState } from 'react'
import {
  Form,
  Input,
  InputNumber,
  Select,
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
import request from '@/api/request'
import { useAuthStore } from '@/store/authStore'

const { Title, Paragraph } = Typography
const { TextArea } = Input
const { Step } = Steps

/**
 * 咨询师注册申请表单数据
 */
interface ApplicationFormData {
  name: string
  phone: string
  licenseNumber: string
  specialties: string[]
  yearsOfExperience: number
  education: string
  bio?: string
}

/**
 * 咨询师注册申请页面
 * 需求: 1.1, 1.2, 1.3, 1.6, 1.7, 1.8
 */
const CounselorApply: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [qualificationFiles, setQualificationFiles] = useState<UploadFile[]>([])

  // 从 authStore 获取认证信息
  const { accessToken, user, hasRole } = useAuthStore()

  // 如果用户已经是咨询师，直接跳转
  React.useEffect(() => {
    if (hasRole('COUNSELOR')) {
      message.info('您已经是认证咨询师')
      navigate('/counselor/application-status')
    }
  }, [hasRole, navigate])

  // 获取认证 headers
  const getAuthHeaders = () => {
    return {
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
      'X-User-Id': user?.id?.toString() || '1',
    }
  }

  // 从localStorage恢复状态
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('counselor_apply_step')
    return saved ? parseInt(saved, 10) : 0
  })

  const [applicationId, setApplicationId] = useState<number | null>(() => {
    const saved = localStorage.getItem('counselor_apply_id')
    return saved ? parseInt(saved, 10) : null
  })

  // 检查是否有待审核或已通过的申请
  React.useEffect(() => {
    // 如果已经是咨询师，不需要检查申请
    if (hasRole('COUNSELOR')) {
      return
    }

    const checkExistingApplication = async () => {
      try {
        // 调用API检查申请状态（request已有/api前缀，不需要再加）
        const response = await request.get<any>(
          '/counselor/applications/my-application'
        )
        const result = response as any
        if (result.success && result.data) {
          const application = result.data
          // 如果申请已通过，显示提示并跳转
          if (application.status === 'APPROVED') {
            message.success('您的申请已通过审核')
            clearProgress() // 清除保存的进度
            setTimeout(() => {
              navigate('/counselor/application-status')
            }, 1500)
            return
          }
          // 如果有待审核的申请，直接进入第二步
          if (application.status === 'PENDING') {
            setApplicationId(application.applicationId)
            setCurrentStep(1)
            saveProgress(1, application.applicationId)
            message.info('检测到您有待审核的申请，可以继续上传资质文件')
          }
        }
      } catch (error) {
        // 如果没有申请或出错，保持在第一步
        console.log('No existing application found')
      }
    }

    // 每次进入页面都检查
    checkExistingApplication()
  }, [hasRole, navigate])

  // 保存进度到localStorage
  const saveProgress = (step: number, appId: number | null) => {
    localStorage.setItem('counselor_apply_step', step.toString())
    if (appId) {
      localStorage.setItem('counselor_apply_id', appId.toString())
    }
  }

  // 清除进度
  const clearProgress = () => {
    localStorage.removeItem('counselor_apply_step')
    localStorage.removeItem('counselor_apply_id')
  }

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
      const response = await request.post<any>(
        '/counselor/applications',
        values
      )
      const result = response as any
      const { data } = result

      setApplicationId(data.applicationId)
      setCurrentStep(1)
      saveProgress(1, data.applicationId)
      message.success('基本信息提交成功')
    } catch (error: any) {
      // 如果提示已有待审核申请，尝试获取申请ID并进入第二步
      if (error?.message?.includes('待审核的申请')) {
        message.warning(
          '检测到您已有待审核的申请，正在为您跳转到上传资质文件页面...'
        )
        try {
          const response = await request.get<any>(
            '/counselor/applications/my-application'
          )
          const result = response as any
          if (result.success && result.data) {
            setApplicationId(result.data.applicationId)
            setCurrentStep(1)
            saveProgress(1, result.data.applicationId)
          }
        } catch (err) {
          message.error('获取申请信息失败，请稍后重试')
        }
      } else {
        const err = error as { response?: { data?: { message?: string } } }
        message.error(
          err.response?.data?.message || error?.message || '提交失败，请重试'
        )
      }
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
      message.warning('资质文件上传是可选的，您可以稍后在申请状态页面补充')
    }

    clearProgress()
    message.success('申请提交成功！我们将在1-3个工作日内完成审核')
    navigate('/counselor/application-status')
  }

  /**
   * 上一步
   */
  const handlePrevStep = () => {
    const newStep = currentStep - 1
    setCurrentStep(newStep)
    saveProgress(newStep, applicationId)
  }

  /**
   * 跳过文件上传
   */
  const handleSkipFileUpload = () => {
    clearProgress()
    message.info('您可以稍后在申请状态页面补充资质文件')
    navigate('/counselor/application-status')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <Title level={2} className="text-center mb-2">
            咨询师注册申请
          </Title>
          <Paragraph className="text-center text-gray-500 mb-8">
            请填写真实信息，我们将在1-3个工作日内完成审核
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
                rules={[{ required: true, message: '请选择专长领域' }]}
                extra="可选择1-10个专长领域"
              >
                <Select
                  mode="tags"
                  placeholder="请选择或输入专长领域"
                  maxCount={10}
                  options={[
                    { label: '焦虑症', value: '焦虑症' },
                    { label: '抑郁症', value: '抑郁症' },
                    { label: '强迫症', value: '强迫症' },
                    { label: '婚姻家庭', value: '婚姻家庭' },
                    { label: '亲子关系', value: '亲子关系' },
                    { label: '职业发展', value: '职业发展' },
                    { label: '人际关系', value: '人际关系' },
                    { label: '情绪管理', value: '情绪管理' },
                    { label: '创伤治疗', value: '创伤治疗' },
                    { label: '成瘾问题', value: '成瘾问题' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="工作经验年限"
                name="yearsOfExperience"
                rules={[{ required: true, message: '请输入工作经验年限' }]}
              >
                <InputNumber
                  min={0}
                  max={50}
                  placeholder="请输入从业年限"
                  style={{ width: '100%' }}
                  addonAfter="年"
                />
              </Form.Item>

              <Form.Item
                label="教育背景"
                name="education"
                rules={[
                  { required: true, message: '请输入教育背景' },
                  { max: 200, message: '教育背景不能超过200字符' },
                ]}
              >
                <Input placeholder="例如：北京大学心理学硕士" maxLength={200} />
              </Form.Item>

              <Form.Item
                label="个人简介"
                name="bio"
                rules={[{ max: 1000, message: '个人简介不能超过1000字符' }]}
              >
                <TextArea
                  rows={6}
                  placeholder="请介绍您的咨询理念、擅长的咨询方法等（选填，不超过1000字）"
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
          {currentStep === 1 && (
            <div>
              {applicationId ? (
                <>
                  <Paragraph className="mb-4">
                    请上传您的资质证明文件（PDF格式），包括但不限于：
                  </Paragraph>
                  <ul className="list-disc list-inside mb-6 text-gray-600">
                    <li>心理咨询师执业证书</li>
                    <li>学历证书</li>
                    <li>专业培训证书</li>
                    <li>其他相关资质证明</li>
                  </ul>

                  <Paragraph type="secondary" className="mb-4">
                    支持格式：PDF，单个文件不超过10MB，可上传多个文件
                  </Paragraph>

                  <div className="mb-6">
                    <FileUpload
                      accept=".pdf"
                      maxSize={10}
                      multiple={true}
                      action={`/api/counselor/applications/${applicationId}/files`}
                      headers={getAuthHeaders}
                      onSuccess={handleFileUploadSuccess}
                      onError={handleFileUploadError}
                      onChange={handleFileListChange}
                    />
                  </div>

                  <Space
                    className="mt-6 w-full"
                    style={{ justifyContent: 'space-between' }}
                  >
                    <Button onClick={handlePrevStep}>上一步</Button>
                    <Space>
                      <Button onClick={handleSkipFileUpload}>稍后上传</Button>
                      <Button type="primary" onClick={handleFinishApplication}>
                        完成申请
                      </Button>
                    </Space>
                  </Space>
                </>
              ) : (
                <div className="text-center py-8">
                  <Paragraph type="secondary">
                    未找到申请记录，请重新填写基本信息
                  </Paragraph>
                  <Button
                    type="primary"
                    onClick={() => {
                      setCurrentStep(0)
                      clearProgress()
                    }}
                  >
                    返回第一步
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* 步骤3: 完成 */}
          {currentStep === 2 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✓</div>
              <Title level={3}>申请提交成功！</Title>
              <Paragraph className="text-gray-500 mb-6">
                我们将在1-3个工作日内完成审核，请耐心等待
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
