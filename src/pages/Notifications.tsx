import { useEffect, useState } from 'react'
import {
  List,
  Badge,
  Button,
  Empty,
  Spin,
  Tag,
  Space,
  Modal,
  Typography,
} from 'antd'
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { useNotificationStore } from '@/store/notificationStore'
import {
  Notification,
  NotificationStatus,
  NotificationType,
} from '@/api/notification'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const { Title, Text, Paragraph } = Typography
const { confirm } = Modal

// 通知类型映射
const notificationTypeMap: Record<
  NotificationType,
  { label: string; color: string }
> = {
  [NotificationType.SYSTEM]: { label: '系统', color: 'blue' },
  [NotificationType.ASSESSMENT]: { label: '评估', color: 'green' },
  [NotificationType.APPOINTMENT]: { label: '预约', color: 'orange' },
  [NotificationType.DIALOGUE]: { label: '对话', color: 'purple' },
  [NotificationType.INTERVENTION]: { label: '干预', color: 'cyan' },
  [NotificationType.REMINDER]: { label: '提醒', color: 'red' },
}

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    total,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore()

  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // 处理标记已读
  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.status === NotificationStatus.UNREAD) {
      await markAsRead(notification.id)
    }
  }

  // 处理全部标记已读
  const handleMarkAllAsRead = () => {
    confirm({
      title: '确认操作',
      icon: <ExclamationCircleOutlined />,
      content: '确定要将所有通知标记为已读吗？',
      onOk: async () => {
        await markAllAsRead()
      },
    })
  }

  // 处理删除通知
  const handleDelete = (id: number) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这条通知吗？',
      onOk: async () => {
        await deleteNotification(id)
      },
    })
  }

  // 处理查看详情
  const handleViewDetail = (notification: Notification) => {
    setSelectedNotification(notification)
    setDetailModalVisible(true)
    handleMarkAsRead(notification)
  }

  // 格式化时间
  const formatTime = (time: string) => {
    const date = dayjs(time)
    const now = dayjs()
    const diffDays = now.diff(date, 'day')

    if (diffDays === 0) {
      return date.fromNow()
    } else if (diffDays === 1) {
      return '昨天 ' + date.format('HH:mm')
    } else if (diffDays < 7) {
      return date.format('MM-DD HH:mm')
    } else {
      return date.format('YYYY-MM-DD HH:mm')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 页面标题和操作栏 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="!mb-2">
            <BellOutlined className="mr-2" />
            通知中心
          </Title>
          <Text type="secondary">
            共 {total} 条通知，{unreadCount} 条未读
          </Text>
        </div>
        {unreadCount > 0 && (
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleMarkAllAsRead}
          >
            全部标记已读
          </Button>
        )}
      </div>

      {/* 通知列表 */}
      <Spin spinning={isLoading}>
        {notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无通知"
            className="py-16"
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={item => {
              const isUnread = item.status === NotificationStatus.UNREAD
              const typeInfo = notificationTypeMap[item.type]

              return (
                <List.Item
                  className={`cursor-pointer transition-all hover:bg-gray-50 px-4 py-3 rounded-lg mb-2 ${
                    isUnread ? 'bg-blue-50' : 'bg-white'
                  }`}
                  onClick={() => handleViewDetail(item)}
                  actions={[
                    <Button
                      key="delete"
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={e => {
                        e.stopPropagation()
                        handleDelete(item.id)
                      }}
                      danger
                    >
                      删除
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot={isUnread} offset={[-5, 5]}>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isUnread ? 'bg-blue-100' : 'bg-gray-100'
                          }`}
                        >
                          <BellOutlined
                            className={`text-lg ${
                              isUnread ? 'text-blue-500' : 'text-gray-400'
                            }`}
                          />
                        </div>
                      </Badge>
                    }
                    title={
                      <Space>
                        <Text strong={isUnread}>{item.title}</Text>
                        <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          className="!mb-1 text-gray-600"
                        >
                          {item.content}
                        </Paragraph>
                        <Text type="secondary" className="text-xs">
                          {formatTime(item.createdAt)}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )
            }}
          />
        )}
      </Spin>

      {/* 通知详情弹窗 */}
      <Modal
        title={
          <Space>
            <BellOutlined />
            <span>通知详情</span>
            {selectedNotification && (
              <Tag color={notificationTypeMap[selectedNotification.type].color}>
                {notificationTypeMap[selectedNotification.type].label}
              </Tag>
            )}
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          setSelectedNotification(null)
        }}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => {
              setDetailModalVisible(false)
              setSelectedNotification(null)
            }}
          >
            关闭
          </Button>,
        ]}
        width={600}
      >
        {selectedNotification && (
          <div className="py-4">
            <Title level={4} className="!mb-4">
              {selectedNotification.title}
            </Title>
            <Paragraph className="text-base whitespace-pre-wrap">
              {selectedNotification.content}
            </Paragraph>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Space direction="vertical" size="small">
                <Text type="secondary">
                  发送时间:{' '}
                  {dayjs(selectedNotification.createdAt).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )}
                </Text>
                {selectedNotification.readAt && (
                  <Text type="secondary">
                    阅读时间:{' '}
                    {dayjs(selectedNotification.readAt).format(
                      'YYYY-MM-DD HH:mm:ss'
                    )}
                  </Text>
                )}
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
