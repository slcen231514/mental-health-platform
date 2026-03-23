import React, { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Button,
  Select,
  Input,
  Modal,
  Form,
  message,
  Tag,
  Space,
  Drawer,
  Descriptions,
  Typography,
  Pagination,
} from 'antd'
import {
  EyeOutlined,
  StopOutlined,
  CheckCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { adminApi, UserDTO, UserDetailDTO } from '@/api/admin'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input
const { Title, Text } = Typography
const { Search } = Input

type CounselorAction = 'disable' | 'enable'

const UserManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<UserDTO[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined)
  const [keyword, setKeyword] = useState<string | undefined>(undefined)

  // 详情抽屉
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserDetailDTO | null>(null)

  // 操作弹窗
  const [actionModalVisible, setActionModalVisible] = useState(false)
  const [counselorAction, setCounselorAction] =
    useState<CounselorAction>('disable')
  const [actionForm] = Form.useForm()

  useEffect(() => {
    fetchUsers()
  }, [currentPage, pageSize, roleFilter, keyword])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await adminApi.getUsers(
        roleFilter,
        keyword,
        currentPage,
        pageSize
      )
      if (response.data) {
        setUsers(response.data.users)
        setTotal(response.data.total)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleFilterChange = (value: string | undefined) => {
    setRoleFilter(value)
    setCurrentPage(1)
  }

  const handleSearch = (value: string) => {
    setKeyword(value.trim() || undefined)
    setCurrentPage(1)
  }

  const handleViewDetail = async (record: UserDTO) => {
    setLoading(true)
    try {
      const response = await adminApi.getUserDetail(record.userId)
      if (response.data) {
        setSelectedUser(response.data)
        setDetailDrawerVisible(true)
      }
    } catch (error) {
      console.error('Failed to fetch user detail:', error)
      message.error('获取用户详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenActionModal = (
    user: UserDetailDTO,
    action: CounselorAction
  ) => {
    setSelectedUser(user)
    setCounselorAction(action)
    setActionModalVisible(true)
    actionForm.resetFields()
  }

  const handleActionSubmit = async () => {
    try {
      if (!selectedUser?.counselorInfo) {
        message.error('该用户不是咨询师')
        return
      }

      if (counselorAction === 'disable') {
        const values = await actionForm.validateFields()
        setLoading(true)
        await adminApi.disableCounselor(
          selectedUser.counselorInfo.counselorId,
          values.reason
        )
        message.success('咨询师已禁用')
      } else {
        setLoading(true)
        await adminApi.enableCounselor(selectedUser.counselorInfo.counselorId)
        message.success('咨询师已启用')
      }

      setActionModalVisible(false)
      actionForm.resetFields()

      // 刷新用户详情
      const response = await adminApi.getUserDetail(selectedUser.userId)
      if (response.data) {
        setSelectedUser(response.data)
      }

      // 刷新列表
      fetchUsers()
    } catch (error) {
      console.error('Action failed:', error)
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: 'green', text: '正常' },
      INACTIVE: { color: 'red', text: '禁用' },
      LOCKED: { color: 'orange', text: '锁定' },
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Tag color={config.color}>{config.text}</Tag>
  }

  const getRoleTag = (role: string) => {
    const roleConfig = {
      USER: { color: 'blue', text: '普通用户' },
      COUNSELOR: { color: 'green', text: '咨询师' },
      ADMIN: { color: 'red', text: '管理员' },
    }
    const config = roleConfig[role as keyof typeof roleConfig]
    return <Tag color={config.color}>{config.text}</Tag>
  }

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      width: 200,
      render: (roles: string[]) => (
        <Space size={[0, 4]} wrap>
          {roles.map((role, index) => (
            <span key={index}>{getRoleTag(role)}</span>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: UserDTO) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          查看详情
        </Button>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        用户管理
      </Title>

      <Card>
        <Space
          style={{ marginBottom: '16px', width: '100%' }}
          direction="vertical"
        >
          <Space wrap>
            <Text>角色筛选：</Text>
            <Select
              style={{ width: 200 }}
              placeholder="全部角色"
              allowClear
              value={roleFilter}
              onChange={handleRoleFilterChange}
            >
              <Option value="USER">普通用户</Option>
              <Option value="COUNSELOR">咨询师</Option>
              <Option value="ADMIN">管理员</Option>
            </Select>

            <Search
              placeholder="搜索用户名或邮箱"
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 300 }}
              onSearch={handleSearch}
            />
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="userId"
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
        title="用户详情"
        placement="right"
        width={720}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {selectedUser && (
          <div>
            <Title level={4}>基本信息</Title>
            <Descriptions column={1} bordered style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="用户ID">
                {selectedUser.userId}
              </Descriptions.Item>
              <Descriptions.Item label="用户名">
                {selectedUser.username}
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">
                {selectedUser.email}
              </Descriptions.Item>
              {selectedUser.phone && (
                <Descriptions.Item label="手机号">
                  {selectedUser.phone}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="角色">
                <Space size={[0, 4]} wrap>
                  {selectedUser.roles.map((role, index) => (
                    <span key={index}>{getRoleTag(role)}</span>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {getStatusTag(selectedUser.status)}
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                {dayjs(selectedUser.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>

            {selectedUser.counselorInfo && (
              <>
                <Title level={4}>咨询师信息</Title>
                <Descriptions
                  column={1}
                  bordered
                  style={{ marginBottom: '24px' }}
                >
                  <Descriptions.Item label="咨询师ID">
                    {selectedUser.counselorInfo.counselorId}
                  </Descriptions.Item>
                  <Descriptions.Item label="咨询师状态">
                    {selectedUser.counselorInfo.status === 'ACTIVE' ? (
                      <Tag color="green">启用</Tag>
                    ) : (
                      <Tag color="red">禁用</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="咨询次数">
                    {selectedUser.counselorInfo.consultationCount}
                  </Descriptions.Item>
                  <Descriptions.Item label="评分">
                    {selectedUser.counselorInfo.rating.toFixed(1)}
                  </Descriptions.Item>
                </Descriptions>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px',
                  }}
                >
                  {selectedUser.counselorInfo.status === 'ACTIVE' ? (
                    <Button
                      danger
                      icon={<StopOutlined />}
                      onClick={() =>
                        handleOpenActionModal(selectedUser, 'disable')
                      }
                    >
                      禁用咨询师
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() =>
                        handleOpenActionModal(selectedUser, 'enable')
                      }
                      style={{
                        backgroundColor: '#52c41a',
                        borderColor: '#52c41a',
                      }}
                    >
                      启用咨询师
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Drawer>

      {/* 操作弹窗 */}
      <Modal
        title={counselorAction === 'disable' ? '禁用咨询师' : '启用咨询师'}
        open={actionModalVisible}
        onOk={handleActionSubmit}
        onCancel={() => {
          setActionModalVisible(false)
          actionForm.resetFields()
        }}
        confirmLoading={loading}
        okText="确认"
        cancelText="取消"
      >
        {counselorAction === 'disable' ? (
          <Form form={actionForm} layout="vertical">
            <Form.Item
              name="reason"
              label="禁用原因"
              rules={[{ required: true, message: '请填写禁用原因' }]}
            >
              <TextArea
                rows={4}
                placeholder="请填写禁用原因，例如：违反平台规定"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        ) : (
          <Text>确认要启用该咨询师吗？启用后该咨询师将可以正常提供服务。</Text>
        )}
      </Modal>
    </div>
  )
}

export default UserManagement
