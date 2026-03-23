import React, { useEffect, useState } from 'react'
import {
  Table,
  Select,
  DatePicker,
  Button,
  Tag,
  Modal,
  Input,
  message,
  Card,
  Space,
} from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { counselorApi, AppointmentDTO } from '@/api/counselor'

const { RangePicker } = DatePicker
const { TextArea } = Input

/**
 * 预约状态配置
 */
const STATUS_CONFIG: Record<
  AppointmentDTO['status'],
  { text: string; color: string }
> = {
  PENDING: { text: '待确认', color: 'orange' },
  CONFIRMED: { text: '已确认', color: 'blue' },
  CANCELLED: { text: '已取消', color: 'red' },
  COMPLETED: { text: '已完成', color: 'green' },
}

/**
 * 咨询师预约管理页面
 * 需求: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7, 5.8, 12.7
 */
const Appointments: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([])
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  )
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentDTO | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  /**
   * 加载预约列表
   */
  const loadAppointments = async () => {
    setLoading(true)
    try {
      const startDate = dateRange?.[0]?.format('YYYY-MM-DD')
      const endDate = dateRange?.[1]?.format('YYYY-MM-DD')

      const response = await counselorApi.getCounselorAppointments(
        statusFilter,
        startDate,
        endDate
      )

      if (response.code === 200 && response.data) {
        setAppointments(response.data)
      }
    } catch (error) {
      message.error('加载预约列表失败')
      console.error('加载预约列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [statusFilter, dateRange])

  /**
   * 确认预约
   */
  const handleConfirm = async (appointmentId: number) => {
    try {
      const response = await counselorApi.confirmAppointment(appointmentId)
      if (response.code === 200) {
        message.success('预约确认成功')
        await loadAppointments()
      } else {
        message.error(response.message || '确认预约失败')
      }
    } catch (error: unknown) {
      const errorMsg = (error as any).response?.data?.message || '确认预约失败'
      message.error(errorMsg)
      console.error('确认预约失败:', error)
    }
  }

  /**
   * 打开拒绝预约对话框
   */
  const handleOpenRejectModal = (appointment: AppointmentDTO) => {
    setSelectedAppointment(appointment)
    setRejectReason('')
    setRejectModalVisible(true)
  }

  /**
   * 拒绝预约
   */
  const handleReject = async () => {
    if (!selectedAppointment) return

    if (!rejectReason.trim()) {
      message.error('请填写拒绝原因')
      return
    }

    try {
      const response = await counselorApi.rejectAppointment(
        selectedAppointment.id,
        rejectReason
      )

      if (response.code === 200) {
        message.success('预约已拒绝')
        setRejectModalVisible(false)
        await loadAppointments()
      } else {
        message.error(response.message || '拒绝预约失败')
      }
    } catch (error: unknown) {
      const errorMsg = (error as any).response?.data?.message || '拒绝预约失败'
      message.error(errorMsg)
      console.error('拒绝预约失败:', error)
    }
  }

  /**
   * 表格列定义
   */
  const columns: ColumnsType<AppointmentDTO> = [
    {
      title: '用户姓名',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
    },
    {
      title: '预约时间',
      key: 'appointmentTime',
      width: 180,
      render: (_, record) => (
        <div>
          <div>{dayjs(record.date).format('YYYY-MM-DD')}</div>
          <div className="text-gray-500 text-sm">
            {record.startTime} - {record.endTime}
          </div>
        </div>
      ),
    },
    {
      title: '时长',
      key: 'duration',
      width: 80,
      render: (_, record) => {
        const start = dayjs(`2000-01-01 ${record.startTime}`)
        const end = dayjs(`2000-01-01 ${record.endTime}`)
        const duration = end.diff(start, 'minute')
        return `${duration}分钟`
      },
    },
    {
      title: '咨询方式',
      dataIndex: 'consultationType',
      key: 'consultationType',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'ONLINE' ? 'blue' : 'green'}>
          {type === 'ONLINE' ? '在线' : '线下'}
        </Tag>
      ),
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
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (notes: string) => notes || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => {
        if (record.status !== 'PENDING') {
          return <span className="text-gray-400">-</span>
        }

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
      },
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">预约管理</h1>
          <p className="text-gray-500 mt-1">查看和管理用户的预约请求</p>
        </div>

        {/* 筛选器 */}
        <Card className="mb-6">
          <Space size="middle" wrap>
            <div>
              <span className="text-gray-700 mr-2">预约状态:</span>
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
              <span className="text-gray-700 mr-2">日期范围:</span>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="YYYY-MM-DD"
                placeholder={['开始日期', '结束日期']}
              />
            </div>

            <Button onClick={loadAppointments}>刷新</Button>
          </Space>
        </Card>

        {/* 预约列表 */}
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
            scroll={{ x: 1000 }}
          />
        </Card>

        {/* 拒绝预约对话框 */}
        <Modal
          title="拒绝预约"
          open={rejectModalVisible}
          onOk={handleReject}
          onCancel={() => setRejectModalVisible(false)}
          okText="确定"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <div className="py-4">
            <p className="mb-4 text-gray-600">
              您确定要拒绝{' '}
              <span className="font-semibold">
                {selectedAppointment?.userName}
              </span>{' '}
              的预约吗？
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                拒绝原因 <span className="text-red-500">*</span>
              </label>
              <TextArea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="请填写拒绝原因，将发送给用户"
                rows={4}
                maxLength={200}
                showCount
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default Appointments
