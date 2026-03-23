import React, { useEffect, useState } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  DatePicker,
  message,
  Spin,
} from 'antd'
import {
  DollarOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  counselorApi,
  IncomeStatisticsDTO,
  IncomeDetailDTO,
} from '@/api/counselor'

const { RangePicker } = DatePicker

/**
 * 咨询师收入统计页面
 * 需求: 7.1, 7.2, 7.3, 7.4, 7.5, 12.7
 */
const Income: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [statistics, setStatistics] = useState<IncomeStatisticsDTO | null>(null)
  const [details, setDetails] = useState<IncomeDetailDTO[]>([])
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null)

  /**
   * 加载收入统计数据
   */
  const loadStatistics = async () => {
    setLoading(true)
    try {
      const now = dayjs()
      const response = await counselorApi.getIncomeStatistics(
        now.year(),
        now.month() + 1
      )

      if (response.code === 200 && response.data) {
        setStatistics(response.data)
      }
    } catch (error) {
      message.error('加载收入统计失败')
      console.error('加载收入统计失败:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 加载收入明细
   */
  const loadDetails = async () => {
    setDetailsLoading(true)
    try {
      const startDate = dateRange?.[0]?.format('YYYY-MM-DD')
      const endDate = dateRange?.[1]?.format('YYYY-MM-DD')

      const response = await counselorApi.getIncomeDetails(startDate, endDate)

      if (response.code === 200 && response.data) {
        setDetails(response.data)
      }
    } catch (error) {
      message.error('加载收入明细失败')
      console.error('加载收入明细失败:', error)
    } finally {
      setDetailsLoading(false)
    }
  }

  useEffect(() => {
    loadStatistics()
    loadDetails()
  }, [])

  useEffect(() => {
    loadDetails()
  }, [dateRange])

  /**
   * 自定义Tooltip格式化
   */
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="text-gray-600 mb-1">{payload[0].payload.month}</p>
          <p className="text-green-600 font-semibold">
            收入: ¥{payload[0].value.toFixed(2)}
          </p>
          <p className="text-blue-600">
            咨询次数: {payload[0].payload.count}次
          </p>
        </div>
      )
    }
    return null
  }

  /**
   * 收入明细表格列定义
   */
  const columns: ColumnsType<IncomeDetailDTO> = [
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
      width: 100,
      render: (duration: number) => `${duration}分钟`,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => (
        <span className="text-green-600 font-semibold">
          ¥{amount.toFixed(2)}
        </span>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">收入统计</h1>
          <p className="text-gray-500 mt-1">查看您的收入情况和趋势</p>
        </div>

        {/* 统计卡片 */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="当月总收入"
                value={statistics?.currentMonth.totalIncome || 0}
                prefix={<DollarOutlined />}
                suffix="元"
                precision={2}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="咨询次数"
                value={statistics?.currentMonth.consultationCount || 0}
                prefix={<CheckCircleOutlined />}
                suffix="次"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="平均收入"
                value={statistics?.currentMonth.averageIncome || 0}
                prefix={<LineChartOutlined />}
                suffix="元/次"
                precision={2}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 收入趋势图表 */}
        <Card
          title="最近12个月收入趋势"
          className="mb-6"
          styles={{ body: { padding: '24px' } }}
        >
          {statistics?.monthlyTrend && statistics.monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statistics.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#52c41a"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-400 py-12">暂无数据</div>
          )}
        </Card>

        {/* 收入明细 */}
        <Card
          title="收入明细"
          extra={
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="YYYY-MM-DD"
              placeholder={['开始日期', '结束日期']}
            />
          }
        >
          <Table
            columns={columns}
            dataSource={details}
            rowKey="appointmentId"
            loading={detailsLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: total => `共 ${total} 条记录`,
            }}
            summary={pageData => {
              const total = pageData.reduce(
                (sum, record) => sum + record.amount,
                0
              )
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <strong>合计</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <strong className="text-green-600">
                        ¥{total.toFixed(2)}
                      </strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )
            }}
          />
        </Card>
      </div>
    </div>
  )
}

export default Income
