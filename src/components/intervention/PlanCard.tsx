import { Card, Progress, Tag, List, Button, Space, Typography } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  CheckOutlined,
} from '@ant-design/icons'
import { InterventionPlan } from '@/api/intervention'
import dayjs from 'dayjs'

const { Text, Paragraph } = Typography

interface PlanCardProps {
  plan: InterventionPlan
  onTaskComplete: (planId: number, taskId: number) => void
}

// 任务类型映射
const taskTypeMap: Record<string, { label: string; color: string }> = {
  CBT: { label: 'CBT练习', color: 'blue' },
  MEDITATION: { label: '冥想', color: 'purple' },
  DIARY: { label: '情绪日记', color: 'orange' },
  SLEEP: { label: '睡眠记录', color: 'cyan' },
  EXERCISE: { label: '运动', color: 'green' },
}

// 状态映射
const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: '待开始', color: 'default', icon: <ClockCircleOutlined /> },
  IN_PROGRESS: {
    label: '进行中',
    color: 'processing',
    icon: <ClockCircleOutlined />,
  },
  COMPLETED: {
    label: '已完成',
    color: 'success',
    icon: <CheckCircleOutlined />,
  },
}

export default function PlanCard({ plan, onTaskComplete }: PlanCardProps) {
  // 计算计划进度
  const completedTasks = plan.tasks.filter(
    task => task.status === 'COMPLETED'
  ).length
  const totalTasks = plan.tasks.length
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // 计算剩余天数
  const daysRemaining = dayjs(plan.endDate).diff(dayjs(), 'day')

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <Space>
            <CalendarOutlined />
            <span>干预计划</span>
            <Tag color={statusMap[plan.status].color}>
              {statusMap[plan.status].icon}
              <span className="ml-1">{statusMap[plan.status].label}</span>
            </Tag>
          </Space>
          <Text type="secondary" className="text-sm font-normal">
            {dayjs(plan.startDate).format('YYYY-MM-DD')} 至{' '}
            {dayjs(plan.endDate).format('YYYY-MM-DD')}
          </Text>
        </div>
      }
    >
      {/* 进度条 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <Text strong>完成进度</Text>
          <Text type="secondary">
            {completedTasks} / {totalTasks} 个任务
          </Text>
        </div>
        <Progress
          percent={progress}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          status={progress === 100 ? 'success' : 'active'}
        />
        {daysRemaining > 0 && (
          <Text type="secondary" className="text-xs mt-1">
            剩余 {daysRemaining} 天
          </Text>
        )}
      </div>

      {/* 任务列表 */}
      <List
        dataSource={plan.tasks}
        renderItem={task => {
          const taskType = taskTypeMap[task.type] || {
            label: task.type,
            color: 'default',
          }
          const taskStatus = statusMap[task.status]
          const isCompleted = task.status === 'COMPLETED'
          const isOverdue =
            !isCompleted && dayjs(task.dueDate).isBefore(dayjs())

          return (
            <List.Item
              className={`${isCompleted ? 'opacity-60' : ''}`}
              actions={[
                !isCompleted && (
                  <Button
                    key="complete"
                    type="primary"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() => onTaskComplete(plan.id, task.id)}
                  >
                    完成
                  </Button>
                ),
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-100' : 'bg-blue-100'
                    }`}
                  >
                    {taskStatus.icon}
                  </div>
                }
                title={
                  <Space>
                    <Text strong={!isCompleted} delete={isCompleted}>
                      {task.title}
                    </Text>
                    <Tag color={taskType.color}>{taskType.label}</Tag>
                    {isOverdue && <Tag color="red">已逾期</Tag>}
                  </Space>
                }
                description={
                  <div>
                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      className="!mb-1 text-gray-600"
                    >
                      {task.description}
                    </Paragraph>
                    <Space size="small" className="text-xs">
                      <Text type="secondary">
                        截止: {dayjs(task.dueDate).format('YYYY-MM-DD HH:mm')}
                      </Text>
                      {task.completedAt && (
                        <Text type="success">
                          完成于:{' '}
                          {dayjs(task.completedAt).format('YYYY-MM-DD HH:mm')}
                        </Text>
                      )}
                    </Space>
                  </div>
                }
              />
            </List.Item>
          )
        }}
      />
    </Card>
  )
}
