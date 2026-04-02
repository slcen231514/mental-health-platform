import { useState, useEffect } from 'react'
import {
  Drawer,
  List,
  Badge,
  Button,
  Empty,
  Spin,
  Tag,
  Typography,
  Space,
  Divider,
} from 'antd'
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useNotificationStore } from '@/store/notificationStore'
import { NotificationStatus, NotificationType } from '@/api/notification'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const { Text, Title } = Typography

interface NotificationCenterProps {
  visible: boolean
  onClose: () => void
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  visible,
  onClose,
}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore()

  const [showAll, setShowAll] = useState(false)

  // 加载通知列表
  useEffect(() => {
    if (visible) {
      fetchNotifications({ page: 1, size: 50 })
    }
  }, [visible, fetchNotifications])

  // 获取通知类型标签颜色
  const getTypeColor = (type: NotificationType | string) => {
    switch (type) {
      case NotificationType.SYSTEM:
        return 'blue'
      case NotificationType.ASSESSMENT:
        return 'green'
      case NotificationType.APPOINTMENT:
        return 'orange'
      case NotificationType.DIALOGUE:
        return 'purple'
      case NotificationType.INTERVENTION:
        return 'cyan'
      case NotificationType.REMINDER:
        return 'red'
      default:
        return 'default'
    }
  }

  // 获取通知类型显示名称
  const getTypeLabel = (type: NotificationType | string) => {
    switch (type) {
      case NotificationType.SYSTEM:
        return '系统'
      case NotificationType.ASSESSMENT:
        return '评估'
      case NotificationType.APPOINTMENT:
        return '预约'
      case NotificationType.DIALOGUE:
        return '对话'
      case NotificationType.INTERVENTION:
        return '干预'
      case NotificationType.REMINDER:
        return '提醒'
      default:
        return '通知'
    }
  }

  // 处理标记为已读
  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id)
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  // 处理全部标记为已读
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
    } catch (error) {
      console.error('全部标记已读失败:', error)
    }
  }

  // 处理删除通知
  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id)
    } catch (error) {
      console.error('删除通知失败:', error)
    }
  }

  // 过滤通知（显示全部或仅未读）
  const displayedNotifications = showAll
    ? notifications
    : notifications.filter(n => n.status === NotificationStatus.UNREAD)

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <Space>
            <BellOutlined />
            <span>通知中心</span>
            {unreadCount > 0 && (
              <Badge
                count={unreadCount}
                style={{ backgroundColor: '#52c41a' }}
              />
            )}
          </Space>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
      extra={
        <Space>
          <Button type="text" size="small" onClick={() => setShowAll(!showAll)}>
            {showAll ? '仅未读' : '全部'}
          </Button>
          {unreadCount > 0 && (
            <Button
              type="text"
              size="small"
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
            >
              全部已读
            </Button>
          )}
        </Space>
      }
    >
      <Spin spinning={isLoading}>
        {displayedNotifications.length > 0 ? (
          <List
            dataSource={displayedNotifications}
            renderItem={item => (
              <List.Item
                key={item.id}
                className={`${
                  item.status === NotificationStatus.UNREAD
                    ? 'bg-blue-50'
                    : 'bg-white'
                } hover:bg-gray-50 transition-colors`}
                style={{ padding: '12px 0' }}
              >
                <div className="w-full">
                  <div className="flex items-start justify-between mb-2">
                    <Space>
                      <Tag color={getTypeColor(item.type)}>
                        {getTypeLabel(item.type)}
                      </Tag>
                      {item.status === NotificationStatus.UNREAD && (
                        <Badge status="processing" />
                      )}
                    </Space>
                    <Space size="small">
                      {item.status === NotificationStatus.UNREAD && (
                        <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handleMarkAsRead(item.id)}
                          title="标记为已读"
                        />
                      )}
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(item.id)}
                        title="删除"
                      />
                    </Space>
                  </div>

                  <Title level={5} className="mb-1">
                    {item.title}
                  </Title>

                  <Text type="secondary" className="text-sm">
                    {item.content}
                  </Text>

                  <div className="mt-2">
                    <Text type="secondary" className="text-xs">
                      {dayjs(item.createdAt).fromNow()}
                    </Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={showAll ? '暂无通知' : '暂无未读通知'}
          />
        )}
      </Spin>

      {displayedNotifications.length > 0 && (
        <>
          <Divider />
          <div className="text-center">
            <Button type="link" onClick={() => setShowAll(!showAll)}>
              {showAll ? '收起' : '查看所有通知历史'}
            </Button>
          </div>
        </>
      )}
    </Drawer>
  )
}

export default NotificationCenter
