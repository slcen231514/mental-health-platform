import React, { useEffect, useState } from 'react'
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
  CreateAppointmentRequest,
  TimeSlotDTO,
} from '@/api/counselor'

const { TextArea } = Input

interface AppointmentModalProps {
  visible: boolean
  counselorId: number
  counselorName: string
  onClose: () => void
  onSuccess: () => void
}

interface BookableSlotOption {
  key: string
  startTime: string
  endTime: string
}

const DURATION_OPTIONS = [30, 60, 90, 120]
const SLOT_STEP_MINUTES = 30
const API_DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss'

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
  const [selectedSlot, setSelectedSlot] = useState<BookableSlotOption | null>(
    null
  )
  const selectedDuration = Form.useWatch('duration', form) ?? 60

  useEffect(() => {
    if (!visible) {
      return
    }

    form.resetFields()
    form.setFieldsValue({
      consultationType: 'ONLINE',
      duration: 60,
    })
    setSelectedDate(null)
    setAvailableSlots([])
    setSelectedSlot(null)
  }, [visible, form])

  const fetchAvailableSlots = async (date: Dayjs) => {
    setSlotsLoading(true)
    try {
      const response = await counselorApi.getAvailableSlots(
        counselorId,
        date.format('YYYY-MM-DD')
      )

      if (
        ((response as any).success || response.code === 200) &&
        response.data
      ) {
        setAvailableSlots(response.data)
      } else {
        message.error(response.message || '获取可预约时段失败')
        setAvailableSlots([])
      }
    } catch (error) {
      console.error('获取可预约时段失败:', error)
      message.error('获取可预约时段失败，请稍后重试')
      setAvailableSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    form.setFieldValue('timeSlot', undefined)

    if (date) {
      fetchAvailableSlots(date)
      return
    }

    setAvailableSlots([])
  }

  const handleDurationChange = () => {
    setSelectedSlot(null)
    form.setFieldValue('timeSlot', undefined)
  }

  const formatSlotTime = (time: string) => dayjs(time).format('HH:mm')

  const buildBookableOptions = (
    slots: TimeSlotDTO[],
    duration: number
  ): BookableSlotOption[] => {
    return slots.flatMap(slot => {
      const options: BookableSlotOption[] = []
      const slotStart = dayjs(slot.startTime)
      const slotEnd = dayjs(slot.endTime)

      if (!slot.available || !slotStart.isValid() || !slotEnd.isValid()) {
        return options
      }

      let currentStart = slotStart
      while (
        currentStart.add(duration, 'minute').isBefore(slotEnd) ||
        currentStart.add(duration, 'minute').isSame(slotEnd)
      ) {
        const currentEnd = currentStart.add(duration, 'minute')
        options.push({
          key: `${currentStart.format(API_DATETIME_FORMAT)}-${duration}`,
          startTime: currentStart.format(API_DATETIME_FORMAT),
          endTime: currentEnd.format(API_DATETIME_FORMAT),
        })
        currentStart = currentStart.add(SLOT_STEP_MINUTES, 'minute')
      }

      return options
    })
  }

  const bookableSlotOptions = buildBookableOptions(
    availableSlots,
    Number(selectedDuration)
  )

  const handleSlotSelect = (slot: BookableSlotOption) => {
    setSelectedSlot(slot)
    form.setFieldValue(
      'timeSlot',
      `${formatSlotTime(slot.startTime)}-${formatSlotTime(slot.endTime)}`
    )
  }

  const disabledDate = (current: Dayjs) =>
    Boolean(current && current < dayjs().startOf('day'))

  const handleSubmit = async () => {
    try {
      await form.validateFields()

      if (!selectedDate || !selectedSlot) {
        message.warning('请选择预约日期、时长和具体时间段')
        return
      }

      setLoading(true)

      const appointmentRequest: CreateAppointmentRequest = {
        counselorId,
        appointmentTime: selectedSlot.startTime,
        duration: Number(selectedDuration),
      }

      const response = await counselorApi.createAppointment(appointmentRequest)

      if ((response as any).success || response.code === 200) {
        message.success('预约成功')
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
      <Form form={form} layout="vertical">
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

        <Form.Item
          name="duration"
          label="咨询时长"
          rules={[{ required: true, message: '请选择咨询时长' }]}
        >
          <Radio.Group onChange={handleDurationChange}>
            {DURATION_OPTIONS.map(duration => (
              <Radio.Button key={duration} value={duration}>
                {duration} 分钟
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="timeSlot"
          label={
            <Space>
              <ClockCircleOutlined />
              <span>选择具体时间段</span>
            </Space>
          }
          rules={[{ required: true, message: '请选择预约时间段' }]}
        >
          <div>
            {slotsLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin tip="加载可预约时段..." />
              </div>
            ) : bookableSlotOptions.length > 0 ? (
              <Space wrap size="small">
                {bookableSlotOptions.map(slot => (
                  <Tag
                    key={slot.key}
                    color={selectedSlot?.key === slot.key ? 'blue' : 'default'}
                    style={{
                      cursor: 'pointer',
                      padding: '8px 16px',
                      fontSize: '14px',
                    }}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    {formatSlotTime(slot.startTime)} -{' '}
                    {formatSlotTime(slot.endTime)}
                  </Tag>
                ))}
              </Space>
            ) : selectedDate && availableSlots.length > 0 ? (
              <div
                style={{ textAlign: 'center', color: '#999', padding: '20px' }}
              >
                当前时长下没有可预约的具体时间段，请尝试缩短时长
              </div>
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
