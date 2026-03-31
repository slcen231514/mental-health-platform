import React, { useEffect, useState } from 'react'
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import {
  AppointmentDTO,
  counselorApi,
  CreateConsultationRecordRequest,
  normalizeAppointment,
} from '@/api/counselor'

const { RangePicker } = DatePicker
const { TextArea } = Input

const STATUS_CONFIG: Record<
  AppointmentDTO['status'],
  { text: string; color: string }
> = {
  PENDING: { text: '待确认', color: 'orange' },
  CONFIRMED: { text: '已确认', color: 'blue' },
  CANCELLED: { text: '已取消', color: 'red' },
  COMPLETED: { text: '已完成', color: 'green' },
}

const Appointments: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([])
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentDTO | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [recordModalVisible, setRecordModalVisible] = useState(false)
  const [recordForm] = Form.useForm()

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const response = await counselorApi.getCounselorAppointments(
        statusFilter,
        dateRange?.[0]?.format('YYYY-MM-DD'),
        dateRange?.[1]?.format('YYYY-MM-DD')
      )

      if (
        ((response as any).success || response.code === 200) &&
        response.data
      ) {
        const rawAppointments = ((response.data as any).appointments ||
          []) as any[]
        setAppointments(rawAppointments.map(normalizeAppointment))
      } else {
        message.error(response.message || '加载预约列表失败')
      }
    } catch (error) {
      console.error('加载预约列表失败:', error)
      message.error('加载预约列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [statusFilter, dateRange])

  const handleConfirm = async (appointmentId: number) => {
    try {
      const response = await counselorApi.confirmAppointment(appointmentId)
      if ((response as any).success || response.code === 200) {
        message.success('预约确认成功')
        await loadAppointments()
      } else {
        message.error(response.message || '确认预约失败')
      }
    } catch (error: any) {
      message.error(
        error?.message || error?.response?.data?.message || '确认预约失败'
      )
    }
  }

  const handleOpenRejectModal = (appointment: AppointmentDTO) => {
    setSelectedAppointment(appointment)
    setRejectReason('')
    setRejectModalVisible(true)
  }

  const handleReject = async () => {
    if (!selectedAppointment || !rejectReason.trim()) {
      message.warning('请填写拒绝原因')
      return
    }

    try {
      const response = await counselorApi.rejectAppointment(
        selectedAppointment.id,
        rejectReason
      )
      if ((response as any).success || response.code === 200) {
        message.success('预约已拒绝')
        setRejectModalVisible(false)
        await loadAppointments()
      } else {
        message.error(response.message || '拒绝预约失败')
      }
    } catch (error: any) {
      message.error(
        error?.message || error?.response?.data?.message || '拒绝预约失败'
      )
    }
  }

  const handleJoinConsultation = async (appointmentId: number) => {
    try {
      const response = await counselorApi.getVideoSession(appointmentId)
      const session = response.data
      const url = session?.sessionUrl || session?.roomUrl
      if (!url) {
        message.warning('当前预约暂未生成咨询入口')
        return
      }

      window.open(url, '_blank', 'noopener,noreferrer')
      message.success('已打开咨询入口')
    } catch (error: any) {
      message.error(
        error?.message || error?.response?.data?.message || '进入咨询失败'
      )
    }
  }

  const handleOpenCompleteModal = (appointment: AppointmentDTO) => {
    setSelectedAppointment(appointment)
    recordForm.setFieldsValue({
      consultationDate: appointment.date ? dayjs(appointment.date) : dayjs(),
      duration: appointment.duration || 60,
      summary: '',
      followUpAdvice: '',
    })
    setRecordModalVisible(true)
  }

  const handleCompleteConsultation = async () => {
    if (!selectedAppointment) {
      return
    }

    try {
      const values = await recordForm.validateFields()
      const payload: CreateConsultationRecordRequest = {
        appointmentId: selectedAppointment.id,
        consultationDate: values.consultationDate.format('YYYY-MM-DD'),
        duration: values.duration,
        summary: values.summary,
        followUpAdvice: values.followUpAdvice,
      }

      const response = await counselorApi.createConsultationRecord(payload)
      if ((response as any).success || response.code === 200) {
        message.success('咨询已完成，记录已保存')
        setRecordModalVisible(false)
        await loadAppointments()
      } else {
        message.error(response.message || '完成咨询失败')
      }
    } catch (error: any) {
      if (error?.errorFields) {
        return
      }
      message.error(
        error?.message || error?.response?.data?.message || '完成咨询失败'
      )
    }
  }

  const columns: ColumnsType<AppointmentDTO> = [
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
      render: value => value || '-',
    },
    {
      title: '预约时间',
      key: 'appointmentTime',
      width: 180,
      render: (_, record) => (
        <div>
          <div>
            {record.date ? dayjs(record.date).format('YYYY-MM-DD') : '-'}
          </div>
          <div className="text-gray-500 text-sm">
            {record.startTime && record.endTime
              ? `${record.startTime} - ${record.endTime}`
              : '-'}
          </div>
        </div>
      ),
    },
    {
      title: '时长',
      key: 'duration',
      width: 90,
      render: (_, record) => `${record.duration || 0}分钟`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: AppointmentDTO['status']) => {
        const config = STATUS_CONFIG[status]
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '备注',
      key: 'response',
      ellipsis: true,
      render: (_, record) =>
        record.consultationRecord ||
        record.prescription ||
        record.cancelReason ||
        '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 320,
      fixed: 'right',
      render: (_, record) => {
        if (record.status === 'PENDING') {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleConfirm(record.id)}
              >
                确认
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleOpenRejectModal(record)}
              >
                拒绝
              </Button>
            </Space>
          )
        }

        if (record.status === 'CONFIRMED') {
          return (
            <Space>
              <Button
                size="small"
                icon={<VideoCameraOutlined />}
                onClick={() => handleJoinConsultation(record.id)}
              >
                进入咨询
              </Button>
              <Button
                type="primary"
                size="small"
                icon={<FileTextOutlined />}
                onClick={() => handleOpenCompleteModal(record)}
              >
                完成咨询
              </Button>
            </Space>
          )
        }

        return <span className="text-gray-400">-</span>
      },
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">预约管理</h1>
          <p className="text-gray-500 mt-1">确认预约、进入咨询并完成咨询记录</p>
        </div>

        <Card className="mb-6">
          <Space size="middle" wrap>
            <div>
              <span className="text-gray-700 mr-2">预约状态</span>
              <Select
                style={{ width: 150 }}
                placeholder="全部状态"
                allowClear
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { label: '待确认', value: 'PENDING' },
                  { label: '已确认', value: 'CONFIRMED' },
                  { label: '已完成', value: 'COMPLETED' },
                  { label: '已取消', value: 'CANCELLED' },
                ]}
              />
            </div>

            <div>
              <span className="text-gray-700 mr-2">日期范围</span>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="YYYY-MM-DD"
              />
            </div>

            <Button onClick={loadAppointments}>刷新</Button>
          </Space>
        </Card>

        <Card>
          <Table
            columns={columns}
            dataSource={appointments}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: total => `共 ${total} 条记录`,
            }}
            scroll={{ x: 1100 }}
          />
        </Card>

        <Modal
          title="拒绝预约"
          open={rejectModalVisible}
          onOk={handleReject}
          onCancel={() => setRejectModalVisible(false)}
          okText="确定"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <TextArea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            rows={4}
            maxLength={200}
            showCount
            placeholder="请填写拒绝原因"
          />
        </Modal>

        <Modal
          title="完成咨询"
          open={recordModalVisible}
          onOk={handleCompleteConsultation}
          onCancel={() => setRecordModalVisible(false)}
          okText="保存并完成"
          cancelText="取消"
          width={700}
          destroyOnClose
        >
          <Form
            form={recordForm}
            layout="vertical"
            preserve={false}
            className="py-4"
          >
            <Form.Item
              label="咨询日期"
              name="consultationDate"
              rules={[{ required: true, message: '请选择咨询日期' }]}
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item
              label="咨询时长（分钟）"
              name="duration"
              rules={[
                { required: true, message: '请输入咨询时长' },
                { type: 'number', min: 1, message: '时长必须大于0' },
              ]}
            >
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>

            <Form.Item
              label="咨询摘要"
              name="summary"
              rules={[{ required: true, message: '请输入咨询摘要' }]}
            >
              <TextArea rows={6} maxLength={2000} showCount />
            </Form.Item>

            <Form.Item label="后续建议" name="followUpAdvice">
              <TextArea rows={4} maxLength={1000} showCount />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  )
}

export default Appointments
