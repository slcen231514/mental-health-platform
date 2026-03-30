import React, { useEffect, useState } from 'react'
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Empty,
  Input,
  List,
  message,
  Modal,
  Space,
  Spin,
  Tabs,
  Tag,
} from 'antd'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  AppointmentDTO,
  counselorApi,
  normalizeAppointment,
} from '@/api/counselor'

const { TextArea } = Input

const Appointments: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([])
  const [activeTab, setActiveTab] = useState('ALL')
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentDTO | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)

  const loadAppointments = async (status?: string) => {
    try {
      setLoading(true)
      const response = await counselorApi.getUserAppointments(status)

      if (
        ((response as any).success || response.code === 200) &&
        response.data
      ) {
        setAppointments(
          (((response.data as any) || []) as any[]).map(normalizeAppointment)
        )
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

  useEffect(() => {
    loadAppointments()
  }, [])

  const handleTabChange = (key: string) => {
    setActiveTab(key)
    loadAppointments(key === 'ALL' ? undefined : key)
  }

  const handleCancelClick = (appointment: AppointmentDTO) => {
    setSelectedAppointment(appointment)
    setCancelReason('')
    setCancelModalVisible(true)
  }

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

      if ((response as any).success || response.code === 200) {
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

  const handleViewCounselor = (counselorId: number) => {
    navigate(`/counselor/${counselorId}`)
  }

  const getStatusTag = (status: AppointmentDTO['status']) => {
    const config: Record<
      AppointmentDTO['status'],
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

    return (
      <Tag color={config[status].color} icon={config[status].icon}>
        {config[status].text}
      </Tag>
    )
  }

  const filteredAppointments =
    activeTab === 'ALL'
      ? appointments
      : appointments.filter(appointment => appointment.status === activeTab)

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
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            { key: 'ALL', label: '全部' },
            { key: 'PENDING', label: '待确认' },
            { key: 'CONFIRMED', label: '已确认' },
            { key: 'COMPLETED', label: '已完成' },
            { key: 'CANCELLED', label: '已取消' },
          ]}
        />

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
                    avatar={
                      <Avatar
                        size={64}
                        src={appointment.counselorAvatarUrl}
                        icon={<UserOutlined />}
                      />
                    }
                    title={
                      <Space wrap>
                        <span className="text-lg font-semibold">
                          {appointment.counselorName || '咨询师'}
                        </span>
                        {getStatusTag(appointment.status)}
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
                            {appointment.date
                              ? dayjs(appointment.date).format('YYYY年MM月DD日')
                              : '-'}
                          </Descriptions.Item>
                          <Descriptions.Item
                            label={
                              <Space>
                                <ClockCircleOutlined />
                                <span>预约时间</span>
                              </Space>
                            }
                          >
                            {appointment.startTime && appointment.endTime
                              ? `${appointment.startTime} - ${appointment.endTime}`
                              : '-'}
                          </Descriptions.Item>
                          {appointment.notes && (
                            <Descriptions.Item label="备注信息">
                              {appointment.notes}
                            </Descriptions.Item>
                          )}
                          {appointment.consultationRecord && (
                            <Descriptions.Item label="咨询反馈">
                              {appointment.consultationRecord}
                            </Descriptions.Item>
                          )}
                          {appointment.prescription && (
                            <Descriptions.Item label="后续建议">
                              {appointment.prescription}
                            </Descriptions.Item>
                          )}
                          {appointment.cancelReason && (
                            <Descriptions.Item label="取消原因">
                              {appointment.cancelReason}
                            </Descriptions.Item>
                          )}
                          <Descriptions.Item label="创建时间">
                            {appointment.createdAt
                              ? dayjs(appointment.createdAt).format(
                                  'YYYY-MM-DD HH:mm:ss'
                                )
                              : '-'}
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
                activeTab === 'ALL'
                  ? '暂无预约记录'
                  : `暂无${getStatusTag(activeTab as AppointmentDTO['status']).props.children}`
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Spin>
      </Card>

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
            {selectedAppointment
              ? `${dayjs(selectedAppointment.date).format('YYYY-MM-DD')} ${selectedAppointment.startTime} - ${selectedAppointment.endTime}`
              : '-'}
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
