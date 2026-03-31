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
  Rate,
  Select,
  Space,
  Table,
  Tag,
} from 'antd'
import { EditOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import {
  ConsultationRecordDTO,
  CreateConsultationRecordRequest,
  counselorApi,
  normalizeConsultationRecord,
  UpdateConsultationRecordRequest,
} from '@/api/counselor'

const { RangePicker } = DatePicker
const { TextArea } = Input

const Records: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<ConsultationRecordDTO[]>([])
  const [userFilter, setUserFilter] = useState<number | undefined>()
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] =
    useState<ConsultationRecordDTO | null>(null)
  const [form] = Form.useForm()

  const loadRecords = async () => {
    setLoading(true)
    try {
      const response = await counselorApi.getConsultationRecords(
        userFilter,
        dateRange?.[0]?.format('YYYY-MM-DD'),
        dateRange?.[1]?.format('YYYY-MM-DD')
      )

      if (
        ((response as any).success || response.code === 200) &&
        response.data
      ) {
        setRecords((response.data as any[]).map(normalizeConsultationRecord))
      } else {
        message.error(response.message || '加载咨询记录失败')
      }
    } catch (error) {
      console.error('加载咨询记录失败:', error)
      message.error('加载咨询记录失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [userFilter, dateRange])

  const handleOpenCreateModal = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleOpenEditModal = (record: ConsultationRecordDTO) => {
    setEditingRecord(record)
    form.setFieldsValue({
      consultationDate: record.consultationDate
        ? dayjs(record.consultationDate)
        : undefined,
      duration: record.duration,
      summary: record.summary,
      followUpAdvice: record.followUpAdvice,
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (editingRecord) {
        const updateRequest: UpdateConsultationRecordRequest = {
          consultationDate: values.consultationDate?.format('YYYY-MM-DD'),
          duration: values.duration,
          summary: values.summary,
          followUpAdvice: values.followUpAdvice,
        }

        const response = await counselorApi.updateConsultationRecord(
          editingRecord.recordId,
          updateRequest
        )

        if ((response as any).success || response.code === 200) {
          message.success('咨询记录更新成功')
          setModalVisible(false)
          await loadRecords()
        } else {
          message.error(response.message || '更新咨询记录失败')
        }
      } else {
        const createRequest: CreateConsultationRecordRequest = {
          appointmentId: values.appointmentId,
          consultationDate: values.consultationDate.format('YYYY-MM-DD'),
          duration: values.duration,
          summary: values.summary,
          followUpAdvice: values.followUpAdvice,
        }

        const response =
          await counselorApi.createConsultationRecord(createRequest)

        if ((response as any).success || response.code === 200) {
          message.success('咨询记录创建成功')
          setModalVisible(false)
          await loadRecords()
        } else {
          message.error(response.message || '创建咨询记录失败')
        }
      }
    } catch (error: any) {
      if (error?.errorFields) {
        return
      }
      message.error(
        error?.message || error?.response?.data?.message || '操作失败'
      )
    }
  }

  const uniqueUsers = Array.from(
    new Map(
      records.map(record => [
        record.userId,
        { id: record.userId, name: record.userName || String(record.userId) },
      ])
    ).values()
  )

  const columns: ColumnsType<ConsultationRecordDTO> = [
    { title: '用户姓名', dataIndex: 'userName', key: 'userName', width: 120 },
    {
      title: '咨询日期',
      dataIndex: 'consultationDate',
      key: 'consultationDate',
      width: 120,
      render: value => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 90,
      render: value => `${value} 分钟`,
    },
    {
      title: '咨询摘要',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
      render: value => <div title={value}>{value}</div>,
    },
    {
      title: '后续建议',
      dataIndex: 'followUpAdvice',
      key: 'followUpAdvice',
      ellipsis: true,
      render: value => value || '-',
    },
    {
      title: '用户评价',
      key: 'feedback',
      width: 220,
      render: (_, record) => {
        if (typeof record.userFeedbackRating !== 'number') {
          return <Tag color="default">未评价</Tag>
        }

        return (
          <div>
            <Rate
              disabled
              value={record.userFeedbackRating}
              className="text-sm"
            />
            <div className="text-gray-700 mt-1">
              {record.userFeedbackRating} 分
            </div>
            {record.userFeedbackComment && (
              <div
                className="text-gray-500 text-sm mt-1"
                title={record.userFeedbackComment}
              >
                {record.userFeedbackComment}
              </div>
            )}
          </div>
        )
      },
    },
    {
      title: '评价时间',
      dataIndex: 'userFeedbackCreatedAt',
      key: 'userFeedbackCreatedAt',
      width: 160,
      render: value => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: value => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">咨询记录管理</h1>
          <p className="text-gray-500 mt-1">
            查看、补录、编辑咨询记录和对应用户评价
          </p>
        </div>

        <Card className="mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <Space size="middle" wrap>
              <div>
                <span className="text-gray-700 mr-2">用户筛选</span>
                <Select
                  style={{ width: 180 }}
                  placeholder="全部用户"
                  allowClear
                  value={userFilter}
                  onChange={setUserFilter}
                  options={uniqueUsers.map(user => ({
                    label: user.name,
                    value: user.id,
                  }))}
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

              <Button onClick={loadRecords}>刷新</Button>
            </Space>

            <Button type="primary" onClick={handleOpenCreateModal}>
              补录记录
            </Button>
          </div>
        </Card>

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
            scroll={{ x: 1400 }}
          />
        </Card>

        <Modal
          title={editingRecord ? '编辑咨询记录' : '补录咨询记录'}
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          okText="确定"
          cancelText="取消"
          width={700}
          destroyOnClose
        >
          <Form form={form} layout="vertical" preserve={false} className="py-4">
            {!editingRecord && (
              <Form.Item
                label="预约 ID"
                name="appointmentId"
                rules={[{ required: true, message: '请输入预约 ID' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            )}

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
                { type: 'number', min: 1, message: '时长必须大于 0' },
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

export default Records
