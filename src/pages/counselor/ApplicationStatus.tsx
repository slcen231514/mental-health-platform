import React, { useEffect, useState } from 'react'
import {
  Card,
  Descriptions,
  Tag,
  Timeline,
  Spin,
  Button,
  Empty,
  Typography,
  Alert,
  Space,
} from 'antd'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import request from '@/api/request'
import dayjs from 'dayjs'
import { useAuthStore } from '@/store/authStore'

const { Title, Paragraph } = Typography

/**
 * 申请状态类型
 */
type ApplicationStatusType = 'PENDING' | 'APPROVED' | 'REJECTED'

/**
 * 申请状态显示配置
 */
const STATUS_CONFIG: Record<
  ApplicationStatusType,
  {
    text: string
    color: string
    icon: React.ReactNode
  }
> = {
  PENDING: {
    text: '待审核',
    color: 'processing',
    icon: <ClockCircleOutlined />,
  },
  APPROVED: {
    text: '已通过',
    color: 'success',
    icon: <CheckCircleOutlined />,
  },
  REJECTED: {
    text: '已拒绝',
    color: 'error',
    icon: <CloseCircleOutlined />,
  },
}

/**
 * 申请信息接口
 */
interface ApplicationInfo {
  applicationId: number
  name: string
  phone: string
  licenseNumber: string
  specialties: string[]
  yearsOfExperience: number
  education: string
  bio?: string
  status: ApplicationStatusType
  reviewComment?: string
  submittedAt: string
  reviewedAt?: string
}

/**
 * 咨询师申请状态查询页面
 * 需求: 1.4, 2.9
 */
const ApplicationStatus: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState<ApplicationInfo | null>(null)
  const { hasRole, switchRole, activeRole } = useAuthStore()

  /**
   * 加载申请信息
   */
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await request.get<any>(
          '/counselor/applications/my-application'
        )
        const result = response as any
        if (result.success && result.data) {
          setApplication(result.data)
        }
      } catch (error) {
        console.error('加载申请信息失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplication()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <Empty
              description="您还没有提交咨询师申请"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                type="primary"
                onClick={() => navigate('/counselor/apply')}
              >
                立即申请
              </Button>
            </Empty>
          </Card>
        </div>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[application.status]

  // 检查用户是否已有咨询师角色但未激活
  const hasCounselorRole = hasRole('COUNSELOR')
  const isCounselorActive = activeRole === 'COUNSELOR'
  const showRoleSwitchAlert =
    application.status === 'APPROVED' && hasCounselorRole && !isCounselorActive

  // 处理角色切换
  const handleSwitchToCounselor = async () => {
    try {
      await switchRole('COUNSELOR')
      navigate('/counselor/dashboard')
    } catch (error) {
      console.error('切换角色失败:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <Title level={2} className="mb-2">
            申请状态
          </Title>
          <Paragraph className="text-gray-500 mb-6">
            申请编号：{application.applicationId}
          </Paragraph>

          {/* 角色切换提示 */}
          {showRoleSwitchAlert && (
            <Alert
              message="恭喜！您已成为认证咨询师"
              description={
                <Space direction="vertical" size="small">
                  <div>
                    您的咨询师申请已通过审核，现在可以切换到咨询师角色开始工作。
                  </div>
                  <Button
                    type="primary"
                    icon={<SwapOutlined />}
                    onClick={handleSwitchToCounselor}
                  >
                    切换到咨询师角色
                  </Button>
                </Space>
              }
              type="success"
              showIcon
              className="mb-6"
            />
          )}

          {/* 申请状态 */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 mb-2">当前状态</div>
                <Tag
                  color={statusConfig.color}
                  icon={statusConfig.icon}
                  className="text-lg px-4 py-2"
                >
                  {statusConfig.text}
                </Tag>
              </div>
              {application.status === 'PENDING' && (
                <div className="text-right">
                  <div className="text-gray-600 mb-2">预计审核时间</div>
                  <div className="text-lg font-semibold">1-3个工作日</div>
                </div>
              )}
            </div>
          </div>

          {/* 申请信息 */}
          <Descriptions title="申请信息" bordered column={2} className="mb-8">
            <Descriptions.Item label="姓名">
              {application.name}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话">
              {application.phone}
            </Descriptions.Item>
            <Descriptions.Item label="执业证书编号" span={2}>
              {application.licenseNumber}
            </Descriptions.Item>
            <Descriptions.Item label="工作经验">
              {application.yearsOfExperience} 年
            </Descriptions.Item>
            <Descriptions.Item label="教育背景">
              {application.education}
            </Descriptions.Item>
            <Descriptions.Item label="专长领域" span={2}>
              {Array.isArray(application.specialties)
                ? application.specialties.join('、')
                : application.specialties}
            </Descriptions.Item>
            {application.bio && (
              <Descriptions.Item label="个人简介" span={2}>
                {application.bio}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="提交时间" span={2}>
              {dayjs(application.submittedAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>

          {/* 审核意见 */}
          {application.reviewComment && (
            <Card
              title="审核意见"
              className="mb-8"
              styles={{
                header: {
                  backgroundColor:
                    application.status === 'APPROVED' ? '#f6ffed' : '#fff2e8',
                },
              }}
            >
              <Paragraph>{application.reviewComment}</Paragraph>
              {application.reviewedAt && (
                <Paragraph className="text-gray-500 text-sm mb-0">
                  审核时间：
                  {dayjs(application.reviewedAt).format('YYYY-MM-DD HH:mm:ss')}
                </Paragraph>
              )}
            </Card>
          )}

          {/* 申请流程时间线 */}
          <Card title="申请流程" className="mb-8">
            <Timeline>
              <Timeline.Item color="green">
                <div className="font-semibold">提交申请</div>
                <div className="text-gray-500 text-sm">
                  {dayjs(application.submittedAt).format('YYYY-MM-DD HH:mm:ss')}
                </div>
              </Timeline.Item>

              {application.status === 'PENDING' && (
                <Timeline.Item color="blue">
                  <div className="font-semibold">审核中</div>
                  <div className="text-gray-500 text-sm">
                    预计3-5个工作日完成审核
                  </div>
                </Timeline.Item>
              )}

              {application.status === 'APPROVED' && (
                <>
                  <Timeline.Item color="green">
                    <div className="font-semibold">审核通过</div>
                    <div className="text-gray-500 text-sm">
                      {application.reviewedAt &&
                        dayjs(application.reviewedAt).format(
                          'YYYY-MM-DD HH:mm:ss'
                        )}
                    </div>
                  </Timeline.Item>
                  <Timeline.Item color="green">
                    <div className="font-semibold">账户已激活</div>
                    <div className="text-gray-500 text-sm">
                      您现在可以使用咨询师功能
                    </div>
                  </Timeline.Item>
                </>
              )}

              {application.status === 'REJECTED' && (
                <Timeline.Item color="red">
                  <div className="font-semibold">审核未通过</div>
                  <div className="text-gray-500 text-sm">
                    {application.reviewedAt &&
                      dayjs(application.reviewedAt).format(
                        'YYYY-MM-DD HH:mm:ss'
                      )}
                  </div>
                </Timeline.Item>
              )}
            </Timeline>
          </Card>

          {/* 操作按钮 */}
          <div className="text-center">
            {application.status === 'APPROVED' && (
              <Space size="large">
                {!isCounselorActive && (
                  <Button
                    type="primary"
                    size="large"
                    icon={<SwapOutlined />}
                    onClick={handleSwitchToCounselor}
                  >
                    切换到咨询师角色
                  </Button>
                )}
                {isCounselorActive && (
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => navigate('/counselor/dashboard')}
                  >
                    进入咨询师工作台
                  </Button>
                )}
              </Space>
            )}
            {application.status === 'REJECTED' && (
              <Button
                type="primary"
                size="large"
                onClick={() => navigate('/counselor/apply')}
              >
                重新申请
              </Button>
            )}
            {application.status === 'PENDING' && (
              <Button size="large" onClick={() => navigate('/')}>
                返回首页
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ApplicationStatus
