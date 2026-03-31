import React, { useEffect, useState } from 'react'
import {
  Card,
  Col,
  DatePicker,
  Empty,
  Row,
  Statistic,
  Table,
  message,
} from 'antd'
import {
  CheckCircleOutlined,
  DollarOutlined,
  LineChartOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  counselorApi,
  IncomeDetailDTO,
  IncomeStatisticsDTO,
  IncomeTrendDTO,
} from '@/api/counselor'

const { RangePicker } = DatePicker

type TrendPoint = {
  key: string
  monthLabel: string
  income: number
  consultationCount: number
}

const Income: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [trendLoading, setTrendLoading] = useState(false)
  const [statistics, setStatistics] = useState<IncomeStatisticsDTO | null>(null)
  const [details, setDetails] = useState<IncomeDetailDTO[]>([])
  const [trend, setTrend] = useState<TrendPoint[]>([])
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null)

  const loadStatistics = async () => {
    setLoading(true)
    try {
      const now = dayjs()
      const response = await counselorApi.getIncomeStatistics(
        now.year(),
        now.month() + 1
      )

      if (
        ((response as any).success || response.code === 200) &&
        response.data
      ) {
        setStatistics(response.data)
      } else {
        message.error(response.message || '加载收入统计失败')
      }
    } catch (error) {
      console.error('加载收入统计失败:', error)
      message.error('加载收入统计失败')
    } finally {
      setLoading(false)
    }
  }

  const loadTrend = async () => {
    setTrendLoading(true)
    try {
      const response = await counselorApi.getIncomeTrend()
      if (
        ((response as any).success || response.code === 200) &&
        response.data
      ) {
        const points = (response.data as IncomeTrendDTO[]).map(item => ({
          key: `${item.year}-${item.month}`,
          monthLabel: `${item.year}-${String(item.month).padStart(2, '0')}`,
          income: Number(item.income ?? 0),
          consultationCount: Number(item.consultationCount ?? 0),
        }))
        setTrend(points)
      } else {
        message.error(response.message || '加载收入趋势失败')
      }
    } catch (error) {
      console.error('加载收入趋势失败:', error)
      message.error('加载收入趋势失败')
    } finally {
      setTrendLoading(false)
    }
  }

  const loadDetails = async () => {
    setDetailsLoading(true)
    try {
      const startDate = dateRange?.[0]?.format('YYYY-MM-DD')
      const endDate = dateRange?.[1]?.format('YYYY-MM-DD')
      const response = await counselorApi.getIncomeDetails(startDate, endDate)

      if (
        ((response as any).success || response.code === 200) &&
        response.data
      ) {
        setDetails(
          (response.data as any[]).map(item => ({
            recordId: Number(item.recordId ?? 0),
            userId: Number(item.userId ?? 0),
            userName: item.userName || String(item.userId ?? ''),
            consultationDate: item.consultationDate || '',
            duration: Number(item.duration ?? 0),
            income: Number(item.income ?? item.amount ?? 0),
          }))
        )
      } else {
        message.error(response.message || '加载收入明细失败')
      }
    } catch (error) {
      console.error('加载收入明细失败:', error)
      message.error('加载收入明细失败')
    } finally {
      setDetailsLoading(false)
    }
  }

  useEffect(() => {
    loadStatistics()
    loadTrend()
    loadDetails()
  }, [])

  useEffect(() => {
    loadDetails()
  }, [dateRange])

  const columns: ColumnsType<IncomeDetailDTO> = [
    {
      title: '用户姓名',
      dataIndex: 'userName',
      key: 'userName',
      width: 140,
      render: value => value || '-',
    },
    {
      title: '咨询日期',
      dataIndex: 'consultationDate',
      key: 'consultationDate',
      width: 140,
      render: value => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: value => `${value} 分钟`,
    },
    {
      title: '金额',
      dataIndex: 'income',
      key: 'income',
      width: 140,
      render: value => (
        <span className="text-green-600 font-semibold">
          ¥{Number(value).toFixed(2)}
        </span>
      ),
    },
  ]

  const totalIncome = details.reduce((sum, record) => sum + record.income, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">收入统计</h1>
          <p className="text-gray-500 mt-1">
            查看当前月收入、近 12 个月趋势和收入明细
          </p>
        </div>

        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <Card loading={loading}>
              <Statistic
                title="本月总收入"
                value={statistics?.totalIncome || 0}
                prefix={<DollarOutlined />}
                suffix="元"
                precision={2}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card loading={loading}>
              <Statistic
                title="咨询次数"
                value={statistics?.consultationCount || 0}
                prefix={<CheckCircleOutlined />}
                suffix="次"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card loading={loading}>
              <Statistic
                title="平均收入"
                value={statistics?.averageIncome || 0}
                prefix={<LineChartOutlined />}
                suffix="元/次"
                precision={2}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Card
          title="近 12 个月收入趋势"
          className="mb-6"
          loading={trendLoading}
        >
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthLabel" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [
                    `¥${Number(value).toFixed(2)}`,
                    '收入',
                  ]}
                  labelFormatter={label => `月份: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#52c41a"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Empty
              description="暂无趋势数据"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>

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
            rowKey="recordId"
            loading={detailsLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: total => `共 ${total} 条记录`,
            }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <strong>合计</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong className="text-green-600">
                      ¥{totalIncome.toFixed(2)}
                    </strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>
      </div>
    </div>
  )
}

export default Income
