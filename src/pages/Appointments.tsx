import React, { useState, useEffect } from 'react'
import {
  Card,
  List,
  Tag,
  Button,
  Empty,
  Spin,
  message,
  Modal,
  Input,
  Tabs,
  Space,
  Avatar,
  Descriptions,
} from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { counselorApi, AppointmentDTO } from '@/api/counselor'
import dayjs from 'dayjs'

const { TextArea } = Input
const { TabPane } = Tabs

/**
 * 预约管理页面
 */
const Appointments: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([])
  const [activeTab, setActiveTab] = useState<string>('ALL')
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentDTO | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)

  // 加载预约列表
  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async (status?: string) => {
    try {
      setLoading(true)
      const response = await counselorApi.getUserAppointments(status)

      if (response.code === 200 && response.data) {
        setAppointments(response.data)
      } else {
        message.error(response.message || '加载预约列表失败')
      }
    } catch (error) {
      console.error('加载预约列表失败:', error)
      message.error('加载预约列表失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 切换标签页
  const handleTabChange = (key: string) => {
    setActiveTab(key)
    const status = key === 'ALL' ? undefined : key
    loadAppointments(status)
  }

  // 打开取消预约对话框
  const handleCancelClick = (appointment: AppointmentDTO) => {
    setSelectedAppointment(appointment)
    setCancelReason('')
    setCancelModalVisible(true)
  }

  // 确认取消预约
  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return

    if (!cancelReason.trim()) {
      message.warning('请填写取消原因')
      return
    }

    try {
      setCancelLoading(true)
      const response = await counselorApi.cancelAppointment(
        selectedAppointment.id,
        cancelReason
      )

      if (response.code === 200) {
        message.success('预约已取消')
        setCancelModalVisible(false)
        loadAppointments(activeTab === 'ALL' ? undefined : activeTab)
      } else {
        message.error(response.message || '取消预约失败')
      }
    } catch (error) {
      console.error('取消预约失败:', error)
      message.error('取消预约失败，请稍后重试')
    } finally {
      setCancelLoading(false)
    }
  }

  // 查看咨询师详情
  const handleViewCounselor = (counselorId: number) => {
    navigate(`/counselor/${counselorId}`)
  }

  // 获取状态标签
  const getStatusTag = (status: string) => {
    const statusConfig: Record<
      string,
      { color: string; icon: React.ReactNode; text: string }
    > = {
      PENDING: {
        color: 'orange',
        icon: <ExclamationCircleOutlined />,
        text: '待确认',
      },
      CONFIRMED: {
        color: 'blue',
        icon: <CheckCircleOutlined />,
        text: '已确认',
      },
      CANCELLED: {
        color: 'red',
        icon: <CloseCircleOutlined />,
        text: '已取消',
      },
      COMPLETED: {
        color: 'green',
        icon: <CheckCircleOutlined />,
        text: '已完成',
      },
    }

    const config = statusConfig[status] || statusConfig.PENDING

    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    )
  }

  // 获取咨询方式标签
  const getConsultationTypeTag = (type: string) => {
    return type === 'ONLINE' ? (
      <Tag color="blue">在线咨询</Tag>
    ) : (
      <Tag color="green">线下咨询</Tag>
    )
  }

  // 过滤预约列表
  const filteredAppointments =
    activeTab === 'ALL'
      ? appointments
      : appointments.filter(apt => apt.status === activeTab)

  return (
    <div className="appointments-page p-6 max-w-7xl mx-auto">
      <Card
        title={
          <Space>
            <CalendarOutlined />
            <span>我的预约</span>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="全部" key="ALL" />
          <TabPane tab="待确认" key="PENDING" />
          <TabPane tab="已确认" key="CONFIRMED" />
          <TabPane tab="已完成" key="COMPLETED" />
          <TabPane tab="已取消" key="CANCELLED" />
        </Tabs>

        <Spin spinning={loading}>
          {filteredAppointments.length > 0 ? (
            <List
              dataSource={filteredAppointments}
              renderItem={appointment => (
                <List.Item
                  actions={[
                    <Button
                      key="view"
                      type="link"
                      onClick={() =>
                        handleViewCounselor(appointment.counselorId)
                      }
                    >
                      查看咨询师
                    </Button>,
                    appointment.status === 'PENDING' ||
                    appointment.status === 'CONFIRMED' ? (
                      <Button
                        key="cancel"
                        type="link"
                        danger
                        onClick={() => handleCancelClick(appointment)}
                      >
                        取消预约
                      </Button>
                    ) : null,
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={<Avatar size={64} icon={<UserOutlined />} />}
                    title={
                      <Space>
                        <span className="text-lg font-semibold">
                          {appointment.counselorName}
                        </span>
                        {getStatusTag(appointment.status)}
                        {getConsultationTypeTag(appointment.consultationType)}
                      </Space>
                    }
                    description={
                      <div className="mt-2">
                        <Descriptions column={1} size="small">
                          <Descriptions.Item
                            label={
                              <Space>
                                <CalendarOutlined />
                                <span>预约日期</span>
                              </Space>
                            }
                          >
                            {dayjs(appointment.date).format('YYYY年MM月DD日')}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <Space>
                                <ClockCircleOutlined />
                                <span>预约时间</span>
                              </Space>
                            }
                          >
                            {appointment.startTime} - {appointment.endTime}
                          </Descriptions.Item>
                          {appointment.notes && (
                            <Descriptions.Item label="备注信息">
                              {appointment.notes}
                            </Descriptions.Item>
                          )}
                          <Descriptions.Item label="创建时间">
                            {dayjs(appointment.createdAt).format(
                              'YYYY-MM-DD HH:mm:ss'
                            )}
                          </Descriptions.Item>
                        </Descriptions>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              description={
                activeTab === 'ALL' ? '暂无预约记录' : `暂无${activeTab}的预约`
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Spin>
      </Card>

      {/* 取消预约对话框 */}
      <Modal
        title="取消预约"
        open={cancelModalVisible}
        onCancel={() => setCancelModalVisible(false)}
        onOk={handleConfirmCancel}
        confirmLoading={cancelLoading}
        okText="确认取消"
        cancelText="返回"
        okButtonProps={{ danger: true }}
      >
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            确定要取消与 <strong>{selectedAppointment?.counselorName}</strong>{' '}
            的预约吗？
          </p>
          <p className="text-sm text-gray-500">
            预约时间：
            {selectedAppointment &&
              `${dayjs(selectedAppointment.date).format('YYYY-MM-DD')} ${
                selectedAppointment.startTime
              } - ${selectedAppointment.endTime}`}
          </p>
        </div>
        <TextArea
          rows={4}
          placeholder="请填写取消原因（必填）"
          value={cancelReason}
          onChange={e => setCancelReason(e.target.value)}
          maxLength={200}
          showCount
        />
      </Modal>
    </div>
  )
}

export default Appointments
