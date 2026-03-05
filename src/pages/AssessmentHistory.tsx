import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Table,
  Button,
  Select,
  Space,
  Typography,
  message,
  Tag,
} from 'antd'
import {
  EyeOutlined,
  LineChartOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { assessmentApi, type AssessmentResult } from '@/api/assessment'
import { Loading } from '@/components'
import { formatDate } from '@/utils'

const { Title } = Typography
const { Option } = Select

/**
 * AssessmentHistory 评估历史页面
 * 显示用户的评估历史记录，支持筛选和趋势图表
 */
export default function AssessmentHistory() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [historyList, setHistoryList] = useState<AssessmentResult[]>([])
  const [filteredList, setFilteredList] = useState<AssessmentResult[]>([])
  const [selectedScaleType, setSelectedScaleType] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    filterAndSortData()
  }, [historyList, selectedScaleType, sortOrder])

  /**
   * 加载评估历史
   */
  const loadHistory = async () => {
    try {
      setLoading(true)
      const response = await assessmentApi.getHistory({ page: 0, size: 100 })
      setHistoryList(response.data.content || [])
    } catch (error) {
      console.error('加载评估历史失败:', error)
      message.error('加载评估历史失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 筛选和排序数据
   */
  const filterAndSortData = () => {
    let filtered = [...historyList]

    // 按量表类型筛选
    if (selectedScaleType !== 'all') {
      filtered = filtered.filter(item => item.scaleCode === selectedScaleType)
    }

    // 按时间排序
    filtered.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
    })

    setFilteredList(filtered)
  }

  /**
   * 查看详情
   */
  const handleViewDetail = (id: number) => {
    navigate(`/assessment/result/${id}`)
  }

  /**
   * 获取量表类型列表
   */
  const getScaleTypes = () => {
    const types = new Set(historyList.map(item => item.scaleCode))
    return Array.from(types)
  }

  /**
   * 获取严重程度颜色
   */
  const getSeverityColor = (severity: string): string => {
    const lowerSeverity = severity?.toLowerCase() || ''
    if (
      lowerSeverity.includes('无') ||
      lowerSeverity.includes('正常') ||
      lowerSeverity.includes('minimal')
    ) {
      return 'success'
    }
    if (lowerSeverity.includes('轻') || lowerSeverity.includes('mild')) {
      return 'processing'
    }
    if (lowerSeverity.includes('中') || lowerSeverity.includes('moderate')) {
      return 'warning'
    }
    return 'error'
  }

  /**
   * 准备趋势图表数据
   */
  const getTrendChartData = () => {
    const scaleTypes = getScaleTypes()

    // 按时间排序（升序）
    const sortedList = [...historyList].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    // 按量表类型分组
    const dataByScale: Record<string, AssessmentResult[]> = {}
    scaleTypes.forEach(type => {
      dataByScale[type] = sortedList.filter(item => item.scaleCode === type)
    })

    // 构建图表数据
    const chartData: any[] = []
    sortedList.forEach(item => {
      const existingPoint = chartData.find(
        point => point.date === formatDate(item.createdAt, 'YYYY-MM-DD')
      )

      if (existingPoint) {
        existingPoint[item.scaleName] = item.totalScore
      } else {
        chartData.push({
          date: formatDate(item.createdAt, 'YYYY-MM-DD'),
          [item.scaleName]: item.totalScore,
        })
      }
    })

    return {
      chartData,
      scaleNames: Array.from(new Set(historyList.map(item => item.scaleName))),
    }
  }

  const { chartData, scaleNames } = getTrendChartData()

  // 表格列定义
  const columns = [
    {
      title: '评估时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => formatDate(text),
      width: 180,
    },
    {
      title: '量表名称',
      dataIndex: 'scaleName',
      key: 'scaleName',
    },
    {
      title: '得分',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 100,
      render: (score: number) => (
        <span className="font-semibold text-lg">{score}</span>
      ),
    },
    {
      title: '等级',
      dataIndex: 'severity',
      key: 'severity',
      width: 150,
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>{severity}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: AssessmentResult) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record.id)}
        >
          查看详情
        </Button>
      ),
    },
  ]

  // 图表颜色
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1']

  if (loading) {
    return <Loading fullscreen tip="加载评估历史..." />
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <Title level={2}>评估历史</Title>
      </div>

      {/* 趋势图表 */}
      {chartData.length > 0 && (
        <Card
          title={
            <Space>
              <LineChartOutlined />
              <span>分数变化趋势</span>
            </Space>
          }
          className="mb-6"
        >
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {scaleNames.map((name, index) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* 历史记录列表 */}
      <Card
        title="历史记录"
        extra={
          <Space>
            <FilterOutlined />
            <Select
              value={selectedScaleType}
              onChange={setSelectedScaleType}
              style={{ width: 150 }}
            >
              <Option value="all">全部量表</Option>
              {getScaleTypes().map(type => (
                <Option key={type} value={type}>
                  {historyList.find(item => item.scaleCode === type)?.scaleName}
                </Option>
              ))}
            </Select>
            <Select
              value={sortOrder}
              onChange={setSortOrder}
              style={{ width: 120 }}
            >
              <Option value="desc">最新优先</Option>
              <Option value="asc">最早优先</Option>
            </Select>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredList}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: total => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  )
}
