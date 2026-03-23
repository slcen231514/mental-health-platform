import React, { useEffect, useState } from 'react'
import {
  Calendar,
  Badge,
  Modal,
  TimePicker,
  Button,
  message,
  Card,
  List,
  Tag,
  Popconfirm,
  Spin,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { counselorApi, AvailabilityDTO } from '@/api/counselor'

/**
 * 咨询师时间表管理页面
 * 需求: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */
const Schedule: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [availabilities, setAvailabilities] = useState<AvailabilityDTO[]>([])
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [startTime, setStartTime] = useState<Dayjs | null>(null)
  const [endTime, setEndTime] = useState<Dayjs | null>(null)

  /**
   * 加载时间表数据
   */
  const loadAvailabilities = async () => {
    setLoading(true)
    try {
      const startDate = dayjs().format('YYYY-MM-DD')
      const endDate = dayjs().add(30, 'day').format('YYYY-MM-DD')

      const response = await counselorApi.getAvailability(startDate, endDate)
      if (response.code === 200 && response.data) {
        setAvailabilities(response.data)
      }
    } catch (error) {
      message.error('加载时间表失败')
      console.error('加载时间表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAvailabilities()
  }, [])

  /**
   * 获取指定日期的时段列表
   */
  const getDateAvailabilities = (date: Dayjs): AvailabilityDTO[] => {
    const dateStr = date.format('YYYY-MM-DD')
    return availabilities
      .filter(a => a.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  /**
   * 日历单元格渲染
   */
  const dateCellRender = (value: Dayjs) => {
    const dateAvailabilities = getDateAvailabilities(value)
    if (dateAvailabilities.length === 0) return null

    const bookedCount = dateAvailabilities.filter(a => a.isBooked).length
    const availableCount = dateAvailabilities.length - bookedCount

    return (
      <div className="space-y-1">
        {availableCount > 0 && (
          <Badge
            status="success"
            text={`可预约 ${availableCount}`}
            className="text-xs"
          />
        )}
        {bookedCount > 0 && (
          <Badge
            status="default"
            text={`已预约 ${bookedCount}`}
            className="text-xs"
          />
        )}
      </div>
    )
  }

  /**
   * 日期选择处理
   */
  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date)
  }

  /**
   * 打开添加时段对话框
   */
  const handleAddSlot = () => {
    setStartTime(null)
    setEndTime(null)
    setIsModalVisible(true)
  }

  /**
   * 验证时间
   */
  const validateTime = (): boolean => {
    if (!startTime || !endTime) {
      message.error('请选择开始时间和结束时间')
      return false
    }

    // 验证: 开始时间早于结束时间 (需求 4.3)
    if (!startTime.isBefore(endTime)) {
      message.error('开始时间必须早于结束时间')
      return false
    }

    // 验证: 时段不与已有时段重叠 (需求 4.4)
    const dateStr = selectedDate.format('YYYY-MM-DD')
    const newStart = startTime.format('HH:mm')
    const newEnd = endTime.format('HH:mm')

    const dateAvailabilities = availabilities.filter(a => a.date === dateStr)
    const hasOverlap = dateAvailabilities.some(a => {
      return (
        (newStart >= a.startTime && newStart < a.endTime) ||
        (newEnd > a.startTime && newEnd <= a.endTime) ||
        (newStart <= a.startTime && newEnd >= a.endTime)
      )
    })

    if (hasOverlap) {
      message.error('时段与已有时段重叠，请重新选择')
      return false
    }

    return true
  }

  /**
   * 添加时段
   */
  const handleConfirmAdd = async () => {
    if (!validateTime()) return

    setLoading(true)
    try {
      const response = await counselorApi.addAvailability({
        date: selectedDate.format('YYYY-MM-DD'),
        startTime: startTime!.format('HH:mm'),
        endTime: endTime!.format('HH:mm'),
      })

      if (response.code === 200) {
        message.success('时段添加成功')
        setIsModalVisible(false)
        await loadAvailabilities()
      } else {
        message.error(response.message || '添加时段失败')
      }
    } catch (error: unknown) {
      const errorMsg = (error as any).response?.data?.message || '添加时段失败'
      message.error(errorMsg)
      console.error('添加时段失败:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 删除时段
   */
  const handleDeleteSlot = async (
    availabilityId: number,
    isBooked: boolean
  ) => {
    // 验证: 已预约的时段不能删除 (需求 4.8)
    if (isBooked) {
      message.error('已预约的时段不能删除')
      return
    }

    setLoading(true)
    try {
      const response = await counselorApi.deleteAvailability(availabilityId)
      if (response.code === 200) {
        message.success('时段删除成功')
        await loadAvailabilities()
      } else {
        message.error(response.message || '删除时段失败')
      }
    } catch (error: unknown) {
      const errorMsg = (error as any).response?.data?.message || '删除时段失败'
      message.error(errorMsg)
      console.error('删除时段失败:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 禁用过去的日期
   */
  const disabledDate = (current: Dayjs) => {
    return current && current.isBefore(dayjs(), 'day')
  }

  const selectedDateAvailabilities = getDateAvailabilities(selectedDate)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">时间表管理</h1>
          <p className="text-gray-500 mt-1">管理未来30天的可预约时段</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 日历视图 */}
          <Card className="lg:col-span-2">
            <Spin spinning={loading}>
              <Calendar
                value={selectedDate}
                onSelect={handleDateSelect}
                cellRender={dateCellRender}
                disabledDate={disabledDate}
                fullscreen={false}
              />
            </Spin>
          </Card>

          {/* 选中日期的时段列表 */}
          <Card
            title={
              <div className="flex items-center justify-between">
                <span>{selectedDate.format('YYYY年MM月DD日')} 的时段</span>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="small"
                  onClick={handleAddSlot}
                  disabled={selectedDate.isBefore(dayjs(), 'day')}
                >
                  添加时段
                </Button>
              </div>
            }
          >
            {selectedDateAvailabilities.length > 0 ? (
              <List
                dataSource={selectedDateAvailabilities}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Popconfirm
                        key="delete"
                        title="确定删除此时段？"
                        onConfirm={() =>
                          handleDeleteSlot(item.availabilityId, item.isBooked)
                        }
                        okText="确定"
                        cancelText="取消"
                        disabled={item.isBooked}
                      >
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          disabled={item.isBooked}
                        >
                          删除
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<ClockCircleOutlined className="text-lg" />}
                      title={
                        <div className="flex items-center gap-2">
                          <span>
                            {item.startTime} - {item.endTime}
                          </span>
                          <Tag color={item.isBooked ? 'default' : 'success'}>
                            {item.isBooked ? '已预约' : '可预约'}
                          </Tag>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center text-gray-400 py-8">
                暂无时段，点击&ldquo;添加时段&rdquo;按钮创建
              </div>
            )}
          </Card>
        </div>

        {/* 添加时段对话框 */}
        <Modal
          title={`添加时段 - ${selectedDate.format('YYYY年MM月DD日')}`}
          open={isModalVisible}
          onOk={handleConfirmAdd}
          onCancel={() => setIsModalVisible(false)}
          okText="确定"
          cancelText="取消"
          confirmLoading={loading}
        >
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                开始时间
              </label>
              <TimePicker
                value={startTime}
                onChange={setStartTime}
                format="HH:mm"
                minuteStep={30}
                className="w-full"
                placeholder="选择开始时间"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                结束时间
              </label>
              <TimePicker
                value={endTime}
                onChange={setEndTime}
                format="HH:mm"
                minuteStep={30}
                className="w-full"
                placeholder="选择结束时间"
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default Schedule
