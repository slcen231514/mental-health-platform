import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Avatar,
  Tag,
  Rate,
  Button,
  Divider,
  List,
  Empty,
  Spin,
  message,
  Row,
  Col,
} from 'antd'
import {
  UserOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { counselorApi, CounselorDetailDTO, ReviewDTO } from '@/api/counselor'
import AppointmentModal from '@/components/counselor/AppointmentModal'
import dayjs from 'dayjs'

const CounselorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [counselor, setCounselor] = useState<CounselorDetailDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false)

  // 加载咨询师详情
  useEffect(() => {
    if (id) {
      loadCounselorDetail(Number(id))
    }
  }, [id])

  const loadCounselorDetail = async (counselorId: number) => {
    try {
      setLoading(true)
      const response = await counselorApi.getCounselorDetail(counselorId)
      setCounselor(response.data)
    } catch (error) {
      message.error('加载咨询师详情失败')
      console.error('Load counselor detail error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/counselor')
  }

  const handleBookAppointment = () => {
    setAppointmentModalVisible(true)
  }

  const handleAppointmentSuccess = () => {
    message.success('预约成功！您可以在"我的预约"中查看详情')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    )
  }

  if (!counselor) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Empty description="咨询师信息不存在" />
      </div>
    )
  }

  return (
    <div className="counselor-detail-page p-6 max-w-7xl mx-auto">
      {/* 返回按钮 */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        className="mb-4"
      >
        返回列表
      </Button>

      <Row gutter={[24, 24]}>
        {/* 左侧：基本信息 */}
        <Col xs={24} lg={8}>
          <Card>
            {/* 头像和基本信息 */}
            <div className="text-center mb-6">
              <Avatar
                size={120}
                src={counselor.avatarUrl}
                icon={<UserOutlined />}
                className="mb-4"
              />
              <h2 className="text-2xl font-bold mb-2">{counselor.name}</h2>
              <div className="text-gray-600 mb-3">
                {counselor.qualification}
              </div>

              {/* 在线状态 */}
              {counselor.isOnline && (
                <Tag color="green" className="mb-3">
                  在线
                </Tag>
              )}

              {/* 评分 */}
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Rate disabled value={counselor.rating} allowHalf />
                <span className="text-lg font-semibold">
                  {counselor.rating.toFixed(1)}
                </span>
              </div>

              {/* 咨询次数 */}
              <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
                <TeamOutlined />
                <span>已咨询 {counselor.consultationCount} 次</span>
              </div>

              {/* 价格 */}
              <div className="text-center py-4 bg-blue-50 rounded-lg mb-4">
                <div className="text-sm text-gray-600 mb-1">咨询费用</div>
                <div className="text-3xl font-bold text-primary">
                  ¥{counselor.price}
                  <span className="text-base text-gray-600 font-normal">
                    /小时
                  </span>
                </div>
              </div>

              {/* 预约按钮 */}
              <Button
                type="primary"
                size="large"
                block
                icon={<CalendarOutlined />}
                onClick={handleBookAppointment}
              >
                立即预约
              </Button>
            </div>

            <Divider />

            {/* 专长领域 */}
            <div className="mb-4">
              <h3 className="text-base font-semibold mb-3">专长领域</h3>
              <div className="flex flex-wrap gap-2">
                {counselor.specialties.map((specialty, index) => (
                  <Tag key={index} color="blue">
                    {specialty}
                  </Tag>
                ))}
              </div>
            </div>

            {/* 语言 */}
            {counselor.languages && counselor.languages.length > 0 && (
              <>
                <Divider />
                <div className="mb-4">
                  <h3 className="text-base font-semibold mb-3 flex items-center">
                    <GlobalOutlined className="mr-2" />
                    语言能力
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {counselor.languages.map((language, index) => (
                      <Tag key={index}>{language}</Tag>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 工作时间 */}
            {counselor.workingHours && (
              <>
                <Divider />
                <div>
                  <h3 className="text-base font-semibold mb-3 flex items-center">
                    <ClockCircleOutlined className="mr-2" />
                    工作时间
                  </h3>
                  <div className="text-gray-600">{counselor.workingHours}</div>
                </div>
              </>
            )}
          </Card>
        </Col>

        {/* 右侧：详细信息 */}
        <Col xs={24} lg={16}>
          {/* 个人简介 */}
          <Card title="个人简介" className="mb-6">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {counselor.introduction}
            </p>
          </Card>

          {/* 教育背景 */}
          {counselor.education && (
            <Card title="教育背景" className="mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">
                {counselor.education}
              </p>
            </Card>
          )}

          {/* 工作经验 */}
          {counselor.experience && (
            <Card title="工作经验" className="mb-6">
              <p className="text-gray-700">从业 {counselor.experience} 年</p>
            </Card>
          )}

          {/* 资质认证 */}
          {counselor.certifications && counselor.certifications.length > 0 && (
            <Card
              title={
                <span>
                  <SafetyCertificateOutlined className="mr-2" />
                  资质认证
                </span>
              }
              className="mb-6"
            >
              <List
                dataSource={counselor.certifications}
                renderItem={cert => (
                  <List.Item>
                    <div className="flex items-center">
                      <SafetyCertificateOutlined className="text-blue-500 mr-2" />
                      <span>{cert}</span>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* 用户评价 */}
          <Card title="用户评价" className="mb-6">
            {counselor.reviews && counselor.reviews.length > 0 ? (
              <List
                dataSource={counselor.reviews}
                renderItem={(review: ReviewDTO) => (
                  <List.Item>
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Avatar size="small" icon={<UserOutlined />} />
                          <span className="font-medium">{review.username}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Rate disabled value={review.rating} />
                          <span className="text-sm text-gray-500">
                            {dayjs(review.createdAt).format('YYYY-MM-DD')}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      {review.tags && review.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {review.tags.map((tag, index) => (
                            <Tag key={index} color="blue">
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                description="暂无评价"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* 预约模态框 */}
      {counselor && (
        <AppointmentModal
          visible={appointmentModalVisible}
          counselorId={counselor.id}
          counselorName={counselor.name}
          onClose={() => setAppointmentModalVisible(false)}
          onSuccess={handleAppointmentSuccess}
        />
      )}
    </div>
  )
}

export default CounselorDetail
