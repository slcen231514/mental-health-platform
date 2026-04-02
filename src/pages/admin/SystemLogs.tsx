import React, { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Select,
  Input,
  DatePicker,
  Space,
  Typography,
  Pagination,
  Tag,
} from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { adminApi, SystemLogDTO } from '@/api/admin'
import dayjs, { Dayjs } from 'dayjs'

const { Option } = Select
const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Search } = Input

const SystemLogs: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<SystemLogDTO[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [operationType, setOperationType] = useState<string | undefined>(
    undefined
  )
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null)
  const [operator, setOperator] = useState<string | undefined>(undefined)

  useEffect(() => {
    void fetchLogs()
  }, [currentPage, pageSize, operationType, dateRange, operator])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const startDate = dateRange?.[0]?.format('YYYY-MM-DD')
      const endDate = dateRange?.[1]?.format('YYYY-MM-DD')

      const response = await adminApi.getSystemLogs(
        operationType,
        startDate,
        endDate,
        operator,
        currentPage,
        pageSize
      )
      if (response.data) {
        setLogs(response.data.logs)
        setTotal(response.data.total)
      }
    } catch (error) {
      console.error('Failed to fetch system logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOperationTypeChange = (value: string | undefined) => {
    setOperationType(value)
    setCurrentPage(1)
  }

  const handleDateRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null
  ) => {
    setDateRange(dates)
    setCurrentPage(1)
  }

  const handleOperatorSearch = (value: string) => {
    setOperator(value.trim() || undefined)
    setCurrentPage(1)
  }

  const getOperationTypeTag = (type: string) => {
    const typeConfig: Record<string, { color: string; text: string }> = {
      USER_LOGIN: { color: 'blue', text: '用户登录' },
      USER_LOGOUT: { color: 'default', text: '用户登出' },
      APPLICATION_REVIEW: { color: 'orange', text: '申请审核' },
      USER_STATUS_CHANGE: { color: 'purple', text: '用户状态变更' },
      COUNSELOR_STATUS_CHANGE: { color: 'magenta', text: '咨询师状态变更' },
      APPOINTMENT_CREATE: { color: 'green', text: '预约创建' },
      APPOINTMENT_UPDATE: { color: 'cyan', text: '预约更新' },
    }
    const config = typeConfig[type] || { color: 'default', text: type }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  const columns = [
    {
      title: '操作时间',
      dataIndex: 'operationTime',
      key: 'operationTime',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 150,
    },
    {
      title: '操作类型',
      dataIndex: 'operationType',
      key: 'operationType',
      width: 150,
      render: (type: string) => getOperationTypeTag(type),
    },
    {
      title: '操作详情',
      dataIndex: 'operationDetails',
      key: 'operationDetails',
      ellipsis: true,
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 150,
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        系统日志
      </Title>

      <Card>
        <Space
          style={{ marginBottom: '16px', width: '100%' }}
          direction="vertical"
          size="middle"
        >
          <Space wrap>
            <Text>操作类型：</Text>
            <Select
              style={{ width: 200 }}
              placeholder="全部类型"
              allowClear
              value={operationType}
              onChange={handleOperationTypeChange}
            >
              <Option value="USER_LOGIN">用户登录</Option>
              <Option value="USER_LOGOUT">用户登出</Option>
              <Option value="APPLICATION_REVIEW">申请审核</Option>
              <Option value="USER_STATUS_CHANGE">用户状态变更</Option>
              <Option value="COUNSELOR_STATUS_CHANGE">咨询师状态变更</Option>
              <Option value="APPOINTMENT_CREATE">预约创建</Option>
              <Option value="APPOINTMENT_UPDATE">预约更新</Option>
            </Select>

            <Text>日期范围：</Text>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              format="YYYY-MM-DD"
              placeholder={['开始日期', '结束日期']}
            />

            <Search
              placeholder="搜索操作人"
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 250 }}
              onSearch={handleOperatorSearch}
            />
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={logs}
          rowKey="logId"
          loading={loading}
          pagination={false}
          scroll={{ x: 1200 }}
        />

        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            showQuickJumper
            showTotal={count => `共 ${count} 条`}
            onChange={(page, size) => {
              setCurrentPage(page)
              setPageSize(size)
            }}
            pageSizeOptions={['20', '50', '100']}
          />
        </div>
      </Card>
    </div>
  )
}

export default SystemLogs
