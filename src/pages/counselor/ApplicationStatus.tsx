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
} from 'antd'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import dayjs from 'dayjs'

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
  id: number
  name: string
  phone: string
  email: string
  licenseNumber: string
  specialties: string
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

  /**
   * 加载申请信息
   */
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await axios.get('/api/counselor/applications/my')
        setApplication(response.data.data)
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <Title level={2} className="mb-2">
            申请状态
          </Title>
          <Paragraph className="text-gray-500 mb-6">
            申请编号：{application.id}
          </Paragraph>

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
                  <div className="text-lg font-semibold">3-5个工作日</div>
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
            <Descriptions.Item label="电子邮箱">
              {application.email}
            </Descriptions.Item>
            <Descriptions.Item label="执业证书编号">
              {application.licenseNumber}
            </Descriptions.Item>
            <Descriptions.Item label="专长领域" span={2}>
              {application.specialties}
            </Descriptions.Item>
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
              <Button
                type="primary"
                size="large"
                onClick={() => navigate('/counselor/dashboard')}
              >
                进入咨询师工作台
              </Button>
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
