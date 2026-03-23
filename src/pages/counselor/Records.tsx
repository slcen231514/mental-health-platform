import React, { useEffect, useState } from 'react'
import {
  Table,
  Select,
  DatePicker,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Card,
  Space,
} from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import {
  counselorApi,
  ConsultationRecordDTO,
  CreateConsultationRecordRequest,
  UpdateConsultationRecordRequest,
} from '@/api/counselor'

const { RangePicker } = DatePicker
const { TextArea } = Input

/**
 * 咨询记录管理页面
 * 需求: 6.1, 6.2, 6.3, 6.7, 12.7
 */
const Records: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<ConsultationRecordDTO[]>([])
  const [userFilter, setUserFilter] = useState<number | undefined>(undefined)
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] =
    useState<ConsultationRecordDTO | null>(null)
  const [form] = Form.useForm()

  /**
   * 加载咨询记录列表
   */
  const loadRecords = async () => {
    setLoading(true)
    try {
      const startDate = dateRange?.[0]?.format('YYYY-MM-DD')
      const endDate = dateRange?.[1]?.format('YYYY-MM-DD')

      const response = await counselorApi.getConsultationRecords(
        userFilter,
        startDate,
        endDate
      )

      if (response.code === 200 && response.data) {
        setRecords(response.data)
      }
    } catch (error) {
      message.error('加载咨询记录失败')
      console.error('加载咨询记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [userFilter, dateRange])

  /**
   * 打开创建记录对话框
   */
  const handleOpenCreateModal = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  /**
   * 打开编辑记录对话框
   */
  const handleOpenEditModal = (record: ConsultationRecordDTO) => {
    setEditingRecord(record)
    form.setFieldsValue({
      summary: record.summary,
      followUpAdvice: record.followUpAdvice,
    })
    setModalVisible(true)
  }

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (editingRecord) {
        // 更新记录
        const updateRequest: UpdateConsultationRecordRequest = {
          summary: values.summary,
          followUpAdvice: values.followUpAdvice,
        }

        const response = await counselorApi.updateConsultationRecord(
          editingRecord.recordId,
          updateRequest
        )

        if (response.code === 200) {
          message.success('咨询记录更新成功')
          setModalVisible(false)
          await loadRecords()
        } else {
          message.error(response.message || '更新咨询记录失败')
        }
      } else {
        // 创建记录
        const createRequest: CreateConsultationRecordRequest = {
          appointmentId: values.appointmentId,
          consultationDate: values.consultationDate.format('YYYY-MM-DD'),
          duration: values.duration,
          summary: values.summary,
          followUpAdvice: values.followUpAdvice,
        }

        const response =
          await counselorApi.createConsultationRecord(createRequest)

        if (response.code === 200) {
          message.success('咨询记录创建成功')
          setModalVisible(false)
          await loadRecords()
        } else {
          message.error(response.message || '创建咨询记录失败')
        }
      }
    } catch (error: unknown) {
      if ((error as any).errorFields) {
        // 表单验证错误
        return
      }
      const errorMsg = (error as any).response?.data?.message || '操作失败'
      message.error(errorMsg)
      console.error('操作失败:', error)
    }
  }

  /**
   * 获取唯一用户列表（用于筛选）
   */
  const uniqueUsers = Array.from(
    new Map(
      records.map(r => [r.userId, { id: r.userId, name: r.userName }])
    ).values()
  )

  /**
   * 表格列定义
   */
  const columns: ColumnsType<ConsultationRecordDTO> = [
    {
      title: '用户姓名',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
    },
    {
      title: '咨询日期',
      dataIndex: 'consultationDate',
      key: 'consultationDate',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      render: (duration: number) => `${duration}分钟`,
    },
    {
      title: '咨询摘要',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
      render: (summary: string) => (
        <div className="max-w-md truncate" title={summary}>
          {summary}
        </div>
      ),
    },
    {
      title: '后续建议',
      dataIndex: 'followUpAdvice',
      key: 'followUpAdvice',
      ellipsis: true,
      render: (advice: string) => advice || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleOpenEditModal(record)}
        >
          编辑
        </Button>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">咨询记录管理</h1>
          <p className="text-gray-500 mt-1">记录和管理咨询内容</p>
        </div>

        {/* 筛选器和操作按钮 */}
        <Card className="mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <Space size="middle" wrap>
              <div>
                <span className="text-gray-700 mr-2">用户筛选:</span>
                <Select
                  style={{ width: 150 }}
                  placeholder="全部用户"
                  allowClear
                  value={userFilter}
                  onChange={setUserFilter}
                  options={uniqueUsers.map(u => ({
                    label: u.name,
                    value: u.id,
                  }))}
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

              <Button onClick={loadRecords}>刷新</Button>
            </Space>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateModal}
            >
              创建记录
            </Button>
          </div>
        </Card>

        {/* 咨询记录列表 */}
        <Card>
          <Table
            columns={columns}
            dataSource={records}
            rowKey="recordId"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: total => `共 ${total} 条记录`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* 创建/编辑记录对话框 */}
        <Modal
          title={editingRecord ? '编辑咨询记录' : '创建咨询记录'}
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          okText="确定"
          cancelText="取消"
          width={700}
          destroyOnClose
        >
          <Form form={form} layout="vertical" className="py-4" preserve={false}>
            {!editingRecord && (
              <>
                <Form.Item
                  label="预约ID"
                  name="appointmentId"
                  rules={[{ required: true, message: '请输入预约ID' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="请输入预约ID"
                    min={1}
                  />
                </Form.Item>

                <Form.Item
                  label="咨询日期"
                  name="consultationDate"
                  rules={[{ required: true, message: '请选择咨询日期' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD"
                    placeholder="选择咨询日期"
                  />
                </Form.Item>

                <Form.Item
                  label="咨询时长（分钟）"
                  name="duration"
                  rules={[
                    { required: true, message: '请输入咨询时长' },
                    { type: 'number', min: 1, message: '时长必须大于0' },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="请输入咨询时长"
                    min={1}
                  />
                </Form.Item>
              </>
            )}

            <Form.Item
              label="咨询摘要"
              name="summary"
              rules={[
                { required: true, message: '请输入咨询摘要' },
                { max: 2000, message: '咨询摘要不能超过2000字符' },
              ]}
            >
              <TextArea
                placeholder="请输入咨询摘要"
                rows={6}
                maxLength={2000}
                showCount
              />
            </Form.Item>

            <Form.Item
              label="后续建议"
              name="followUpAdvice"
              rules={[{ max: 1000, message: '后续建议不能超过1000字符' }]}
            >
              <TextArea
                placeholder="请输入后续建议（可选）"
                rows={4}
                maxLength={1000}
                showCount
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  )
}

export default Records
