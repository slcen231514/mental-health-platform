import React, { useState, useEffect } from 'react'
import {
  Modal,
  Form,
  DatePicker,
  Input,
  Radio,
  message,
  Space,
  Tag,
  Spin,
} from 'antd'
import { ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import {
  counselorApi,
  TimeSlotDTO,
  CreateAppointmentRequest,
} from '@/api/counselor'

const { TextArea } = Input

interface AppointmentModalProps {
  visible: boolean
  counselorId: number
  counselorName: string
  onClose: () => void
  onSuccess: () => void
}

/**
 * 预约模态框组件
 */
const AppointmentModal: React.FC<AppointmentModalProps> = ({
  visible,
  counselorId,
  counselorName,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlotDTO[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotDTO | null>(null)

  // 重置表单
  useEffect(() => {
    if (visible) {
      form.resetFields()
      setSelectedDate(null)
      setAvailableSlots([])
      setSelectedSlot(null)
    }
  }, [visible, form])

  // 获取可用时段
  const fetchAvailableSlots = async (date: Dayjs) => {
    setSlotsLoading(true)
    try {
      const dateStr = date.format('YYYY-MM-DD')
      const response = await counselorApi.getAvailableSlots(
        counselorId,
        dateStr
      )

      if (response.code === 200 && response.data) {
        setAvailableSlots(response.data)
      } else {
        message.error(response.message || '获取可用时段失败')
        setAvailableSlots([])
      }
    } catch (error) {
      console.error('获取可用时段失败:', error)
      message.error('获取可用时段失败，请稍后重试')
      setAvailableSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }

  // 日期选择处理
  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    form.setFieldValue('timeSlot', undefined)

    if (date) {
      fetchAvailableSlots(date)
    } else {
      setAvailableSlots([])
    }
  }

  // 时段选择处理
  const handleSlotSelect = (slot: TimeSlotDTO) => {
    setSelectedSlot(slot)
    form.setFieldValue('timeSlot', `${slot.startTime}-${slot.endTime}`)
  }

  // 禁用过去的日期
  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day')
  }

  // 提交预约
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (!selectedDate || !selectedSlot) {
        message.warning('请选择预约日期和时间')
        return
      }

      setLoading(true)

      const appointmentRequest: CreateAppointmentRequest = {
        counselorId,
        date: selectedDate.format('YYYY-MM-DD'),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        consultationType: values.consultationType,
        notes: values.notes,
      }

      const response = await counselorApi.createAppointment(appointmentRequest)

      if (response.code === 200) {
        message.success('预约成功！')
        form.resetFields()
        onSuccess()
        onClose()
      } else {
        message.error(response.message || '预约失败，请稍后重试')
      }
    } catch (error: unknown) {
      const err = error as { errorFields?: unknown }
      if (err.errorFields) {
        message.warning('请完善预约信息')
      } else {
        console.error('预约失败:', error)
        message.error('预约失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={`预约咨询师 - ${counselorName}`}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      okText="确认预约"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          consultationType: 'ONLINE',
        }}
      >
        {/* 选择日期 */}
        <Form.Item
          label={
            <Space>
              <CalendarOutlined />
              <span>选择日期</span>
            </Space>
          }
          required
        >
          <DatePicker
            style={{ width: '100%' }}
            placeholder="请选择预约日期"
            disabledDate={disabledDate}
            value={selectedDate}
            onChange={handleDateChange}
            format="YYYY-MM-DD"
          />
        </Form.Item>

        {/* 选择时间段 */}
        <Form.Item
          name="timeSlot"
          label={
            <Space>
              <ClockCircleOutlined />
              <span>选择时间段</span>
            </Space>
          }
          rules={[{ required: true, message: '请选择预约时间段' }]}
        >
          <div>
            {slotsLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin tip="加载可用时段..." />
              </div>
            ) : availableSlots.length > 0 ? (
              <Space wrap size="small">
                {availableSlots.map((slot, index) => (
                  <Tag
                    key={index}
                    color={
                      selectedSlot === slot
                        ? 'blue'
                        : slot.available
                          ? 'default'
                          : 'red'
                    }
                    style={{
                      cursor: slot.available ? 'pointer' : 'not-allowed',
                      padding: '8px 16px',
                      fontSize: '14px',
                    }}
                    onClick={() => slot.available && handleSlotSelect(slot)}
                  >
                    {slot.startTime} - {slot.endTime}
                    {!slot.available && ' (已预约)'}
                  </Tag>
                ))}
              </Space>
            ) : selectedDate ? (
              <div
                style={{ textAlign: 'center', color: '#999', padding: '20px' }}
              >
                该日期暂无可用时段
              </div>
            ) : (
              <div
                style={{ textAlign: 'center', color: '#999', padding: '20px' }}
              >
                请先选择日期
              </div>
            )}
          </div>
        </Form.Item>

        {/* 咨询方式 */}
        <Form.Item
          name="consultationType"
          label="咨询方式"
          rules={[{ required: true, message: '请选择咨询方式' }]}
        >
          <Radio.Group>
            <Radio value="ONLINE">在线咨询</Radio>
            <Radio value="OFFLINE">线下咨询</Radio>
          </Radio.Group>
        </Form.Item>

        {/* 备注信息 */}
        <Form.Item name="notes" label="备注信息">
          <TextArea
            rows={4}
            placeholder="请简要描述您的咨询需求或其他需要说明的信息（选填）"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AppointmentModal
