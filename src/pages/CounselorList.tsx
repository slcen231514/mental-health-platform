import React, { useState, useEffect } from 'react'
import {
  Row,
  Col,
  Input,
  Select,
  Slider,
  Switch,
  Button,
  Empty,
  Spin,
  message,
  Card,
  Pagination,
} from 'antd'
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { CounselorCard } from '@/components/counselor'
import {
  counselorApi,
  CounselorDTO,
  MatchCounselorRequest,
} from '@/api/counselor'

const { Option } = Select

const CounselorList: React.FC = () => {
  const [counselors, setCounselors] = useState<CounselorDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(12)
  const [filters, setFilters] = useState<MatchCounselorRequest>({
    specialties: [],
    minRating: 0,
    maxPrice: 1000,
    isOnline: undefined,
  })

  // 专长选项
  const specialtyOptions = [
    '焦虑症',
    '抑郁症',
    '强迫症',
    '创伤后应激障碍',
    '婚姻家庭',
    '亲子关系',
    '职场压力',
    '情绪管理',
    '人际关系',
    '自我成长',
  ]

  // 加载咨询师列表
  const loadCounselors = async () => {
    try {
      setLoading(true)
      const response = await counselorApi.matchCounselors(filters)
      // 只显示ACTIVE和APPROVED的咨询师（后端应该已经过滤）
      setCounselors(response.data)
    } catch (error) {
      message.error('加载咨询师列表失败')
      console.error('Load counselors error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadCounselors()
  }, [])

  // 处理搜索
  const handleSearch = () => {
    loadCounselors()
  }

  // 处理筛选变化
  const handleFilterChange = (key: keyof MatchCounselorRequest, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  // 重置筛选
  const handleReset = () => {
    setFilters({
      specialties: [],
      minRating: 0,
      maxPrice: 1000,
      isOnline: undefined,
    })
    setSearchText('')
    setCurrentPage(1)
  }

  // 应用筛选
  const handleApplyFilters = () => {
    setCurrentPage(1)
    loadCounselors()
  }

  // 过滤咨询师（本地搜索 - 按姓名）
  const filteredCounselors = counselors.filter(counselor => {
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      return (
        counselor.name?.toLowerCase().includes(searchLower) ||
        counselor.specialties?.some(s =>
          s?.toLowerCase().includes(searchLower)
        ) ||
        counselor.introduction?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  // 分页数据
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedCounselors = filteredCounselors.slice(startIndex, endIndex)

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="counselor-list-page p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">咨询师列表</h1>
        <p className="text-gray-600">找到适合您的专业心理咨询师</p>
      </div>

      {/* 搜索和筛选区域 */}
      <Card className="mb-6">
        <div className="space-y-4">
          {/* 搜索框 - 咨询师姓名搜索 */}
          <div>
            <Input
              size="large"
              placeholder="搜索咨询师姓名..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </div>

          {/* 筛选条件 */}
          <Row gutter={[16, 16]}>
            {/* 专长领域筛选 */}
            <Col xs={24} sm={12} md={8}>
              <div className="space-y-2">
                <label className="text-sm font-medium">专长领域</label>
                <Select
                  mode="multiple"
                  placeholder="选择专长领域"
                  value={filters.specialties}
                  onChange={value => handleFilterChange('specialties', value)}
                  style={{ width: '100%' }}
                  maxTagCount={2}
                >
                  {specialtyOptions.map(specialty => (
                    <Option key={specialty} value={specialty}>
                      {specialty}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>

            {/* 评分筛选 */}
            <Col xs={24} sm={12} md={8}>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  最低评分: {filters.minRating}分
                </label>
                <Slider
                  min={0}
                  max={5}
                  step={0.5}
                  value={filters.minRating}
                  onChange={value => handleFilterChange('minRating', value)}
                  marks={{
                    0: '0',
                    2.5: '2.5',
                    5: '5',
                  }}
                />
              </div>
            </Col>

            {/* 价格范围筛选 */}
            <Col xs={24} sm={12} md={8}>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  最高价格: ¥{filters.maxPrice}
                </label>
                <Slider
                  min={0}
                  max={2000}
                  step={100}
                  value={filters.maxPrice}
                  onChange={value => handleFilterChange('maxPrice', value)}
                  marks={{
                    0: '¥0',
                    1000: '¥1000',
                    2000: '¥2000',
                  }}
                />
              </div>
            </Col>

            {/* 在线状态 */}
            <Col xs={24} sm={12} md={8}>
              <div className="space-y-2">
                <label className="text-sm font-medium">仅显示在线</label>
                <div>
                  <Switch
                    checked={filters.isOnline}
                    onChange={checked =>
                      handleFilterChange('isOnline', checked || undefined)
                    }
                  />
                </div>
              </div>
            </Col>
          </Row>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-2">
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={handleApplyFilters}
            >
              应用筛选
            </Button>
          </div>
        </div>
      </Card>

      {/* 咨询师列表 */}
      <Spin spinning={loading}>
        {filteredCounselors.length > 0 ? (
          <>
            <div className="mb-4 text-gray-600">
              找到 {filteredCounselors.length} 位咨询师
            </div>
            <Row gutter={[16, 16]}>
              {paginatedCounselors.map(counselor => (
                <Col key={counselor.id} xs={24} sm={12} lg={8} xl={6}>
                  <CounselorCard counselor={counselor} />
                </Col>
              ))}
            </Row>

            {/* 分页 - 每页12名咨询师 */}
            {filteredCounselors.length > pageSize && (
              <div className="flex justify-center mt-8">
                <Pagination
                  current={currentPage}
                  total={filteredCounselors.length}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showTotal={total => `共 ${total} 位咨询师`}
                />
              </div>
            )}
          </>
        ) : (
          <Empty
            description="暂无符合条件的咨询师"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={handleReset}>
              重置筛选条件
            </Button>
          </Empty>
        )}
      </Spin>
    </div>
  )
}

export default CounselorList
