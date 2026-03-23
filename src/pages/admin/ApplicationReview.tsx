import React, { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Button,
  Select,
  Modal,
  Form,
  Input,
  message,
  Tag,
  Space,
  Drawer,
  Descriptions,
  Image,
  Typography,
  Pagination,
} from 'antd'
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { adminApi, ApplicationDTO } from '@/api/admin'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input
const { Title, Text } = Typography

type ReviewAction = 'approve' | 'reject'

const ApplicationReview: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [applications, setApplications] = useState<ApplicationDTO[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  )

  // 详情抽屉
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationDTO | null>(null)

  // 审核弹窗
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [reviewAction, setReviewAction] = useState<ReviewAction>('approve')
  const [reviewForm] = Form.useForm()

  useEffect(() => {
    fetchApplications()
  }, [currentPage, pageSize, statusFilter])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const response = await adminApi.getCounselorApplications(
        statusFilter,
        currentPage,
        pageSize
      )
      if (response.data) {
        setApplications(response.data.applications)
        setTotal(response.data.total)
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      message.error('获取申请列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusFilterChange = (value: string | undefined) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleViewDetail = (record: ApplicationDTO) => {
    setSelectedApplication(record)
    setDetailDrawerVisible(true)
  }

  const handleOpenReviewModal = (
    record: ApplicationDTO,
    action: ReviewAction
  ) => {
    setSelectedApplication(record)
    setReviewAction(action)
    setReviewModalVisible(true)
    reviewForm.resetFields()
  }

  const handleReviewSubmit = async () => {
    try {
      const values = await reviewForm.validateFields()
      if (!selectedApplication) return

      setLoading(true)

      if (reviewAction === 'approve') {
        await adminApi.approveApplication(
          selectedApplication.applicationId,
          values.reviewComment
        )
        message.success('审核通过成功')
      } else {
        await adminApi.rejectApplication(
          selectedApplication.applicationId,
          values.reviewComment
        )
        message.success('审核拒绝成功')
      }

      setReviewModalVisible(false)
      reviewForm.resetFields()
      fetchApplications()
    } catch (error) {
      console.error('Review failed:', error)
      message.error('审核操作失败')
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'orange', text: '待审核' },
      APPROVED: { color: 'green', text: '已通过' },
      REJECTED: { color: 'red', text: '已拒绝' },
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Tag color={config.color}>{config.text}</Tag>
  }

  const columns = [
    {
      title: '申请ID',
      dataIndex: 'applicationId',
      key: 'applicationId',
      width: 100,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
    },
    {
      title: '执业证书编号',
      dataIndex: 'licenseNumber',
      key: 'licenseNumber',
      width: 150,
    },
    {
      title: '专长领域',
      dataIndex: 'specialties',
      key: 'specialties',
      width: 200,
      render: (specialties: string[]) => (
        <Space size={[0, 4]} wrap>
          {specialties.map((specialty, index) => (
            <Tag key={index} color="blue">
              {specialty}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '工作经验',
      dataIndex: 'yearsOfExperience',
      key: 'yearsOfExperience',
      width: 100,
      render: (years: number) => `${years}年`,
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: ApplicationDTO) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleOpenReviewModal(record, 'approve')}
                style={{ color: '#52c41a' }}
              >
                通过
              </Button>
              <Button
                type="link"
                icon={<CloseOutlined />}
                onClick={() => handleOpenReviewModal(record, 'reject')}
                danger
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        咨询师审核
      </Title>

      <Card>
        <Space
          style={{ marginBottom: '16px', width: '100%' }}
          direction="vertical"
        >
          <Space>
            <Text>申请状态：</Text>
            <Select
              style={{ width: 200 }}
              placeholder="全部状态"
              allowClear
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <Option value="PENDING">待审核</Option>
              <Option value="APPROVED">已通过</Option>
              <Option value="REJECTED">已拒绝</Option>
            </Select>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={applications}
          rowKey="applicationId"
          loading={loading}
          pagination={false}
          scroll={{ x: 1400 }}
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
            showTotal={total => `共 ${total} 条`}
            onChange={(page, size) => {
              setCurrentPage(page)
              setPageSize(size)
            }}
            pageSizeOptions={['10', '20', '50', '100']}
          />
        </div>
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title="申请详情"
        placement="right"
        width={720}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {selectedApplication && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="申请ID">
                {selectedApplication.applicationId}
              </Descriptions.Item>
              <Descriptions.Item label="姓名">
                {selectedApplication.name}
              </Descriptions.Item>
              <Descriptions.Item label="联系方式">
                {selectedApplication.phone}
              </Descriptions.Item>
              <Descriptions.Item label="执业证书编号">
                {selectedApplication.licenseNumber}
              </Descriptions.Item>
              <Descriptions.Item label="专长领域">
                <Space size={[0, 4]} wrap>
                  {selectedApplication.specialties.map((specialty, index) => (
                    <Tag key={index} color="blue">
                      {specialty}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="工作经验">
                {selectedApplication.yearsOfExperience}年
              </Descriptions.Item>
              <Descriptions.Item label="教育背景">
                {selectedApplication.education}
              </Descriptions.Item>
              <Descriptions.Item label="个人简介">
                {selectedApplication.bio}
              </Descriptions.Item>
              <Descriptions.Item label="提交时间">
                {dayjs(selectedApplication.submittedAt).format(
                  'YYYY-MM-DD HH:mm:ss'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="审核状态">
                {getStatusTag(selectedApplication.status)}
              </Descriptions.Item>
              {selectedApplication.reviewedAt && (
                <Descriptions.Item label="审核时间">
                  {dayjs(selectedApplication.reviewedAt).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )}
                </Descriptions.Item>
              )}
              {selectedApplication.reviewComment && (
                <Descriptions.Item label="审核意见">
                  {selectedApplication.reviewComment}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedApplication.qualificationFiles &&
              selectedApplication.qualificationFiles.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <Title level={5}>
                    <FileTextOutlined /> 资质文件
                  </Title>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {selectedApplication.qualificationFiles.map(
                      (file, index) => (
                        <Card key={index} size="small">
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Text strong>{file.fileName}</Text>
                            {file.fileName.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                              <Image
                                src={file.fileUrl}
                                alt={file.fileName}
                                style={{ maxWidth: '100%' }}
                              />
                            ) : (
                              <Button
                                type="link"
                                href={file.fileUrl}
                                target="_blank"
                                icon={<FileTextOutlined />}
                              >
                                查看/下载文件
                              </Button>
                            )}
                          </Space>
                        </Card>
                      )
                    )}
                  </Space>
                </div>
              )}

            {selectedApplication.status === 'PENDING' && (
              <div
                style={{
                  marginTop: '24px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                }}
              >
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() =>
                    handleOpenReviewModal(selectedApplication, 'approve')
                  }
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  审核通过
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() =>
                    handleOpenReviewModal(selectedApplication, 'reject')
                  }
                >
                  审核拒绝
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* 审核弹窗 */}
      <Modal
        title={reviewAction === 'approve' ? '审核通过' : '审核拒绝'}
        open={reviewModalVisible}
        onOk={handleReviewSubmit}
        onCancel={() => {
          setReviewModalVisible(false)
          reviewForm.resetFields()
        }}
        confirmLoading={loading}
        okText="确认"
        cancelText="取消"
      >
        <Form form={reviewForm} layout="vertical">
          <Form.Item
            name="reviewComment"
            label="审核意见"
            rules={[{ required: true, message: '请填写审核意见' }]}
          >
            <TextArea
              rows={4}
              placeholder={
                reviewAction === 'approve'
                  ? '请填写审核通过的意见，例如：资质审核通过，欢迎加入平台'
                  : '请填写审核拒绝的原因，例如：执业证书编号无效，请重新提交'
              }
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ApplicationReview
