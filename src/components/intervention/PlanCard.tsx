import { Card, Progress, Tag, List, Button, Space, Typography } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  CheckOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import { InterventionPlan } from '@/api/intervention'
import dayjs from 'dayjs'

const { Text, Paragraph } = Typography

interface PlanCardProps {
  plan: InterventionPlan
  onTaskComplete: (planId: number, taskId: number) => void
}

const taskTypeMap: Record<string, { label: string; color: string }> = {
  CBT: { label: 'CBT练习', color: 'blue' },
  MEDITATION: { label: '冥想', color: 'purple' },
  DIARY: { label: '情绪日记', color: 'orange' },
  SLEEP: { label: '睡眠记录', color: 'cyan' },
  EXERCISE: { label: '运动', color: 'green' },
}

const planStatusMap: Record<
  string,
  { label: string; color: string; icon: ReactNode }
> = {
  ACTIVE: {
    label: '进行中',
    color: 'processing',
    icon: <ClockCircleOutlined />,
  },
  PAUSED: { label: '已暂停', color: 'warning', icon: <ClockCircleOutlined /> },
  COMPLETED: {
    label: '已完成',
    color: 'success',
    icon: <CheckCircleOutlined />,
  },
}

const taskStatusMap: Record<
  string,
  { label: string; color: string; icon: ReactNode }
> = {
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

const fallbackStatus = (status?: string) => ({
  label: status || '未知状态',
  color: 'default',
  icon: <ClockCircleOutlined />,
})

export default function PlanCard({ plan, onTaskComplete }: PlanCardProps) {
  const completedTasks = plan.tasks.filter(
    task => task.status === 'COMPLETED'
  ).length
  const totalTasks = plan.tasks.length
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const daysRemaining = dayjs(plan.endDate).diff(dayjs(), 'day')
  const planStatus = planStatusMap[plan.status] || fallbackStatus(plan.status)

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <Space>
            <CalendarOutlined />
            <span>干预计划</span>
            <Tag color={planStatus.color}>
              {planStatus.icon}
              <span className="ml-1">{planStatus.label}</span>
            </Tag>
          </Space>
          <Text type="secondary" className="text-sm font-normal">
            {dayjs(plan.startDate).format('YYYY-MM-DD')} 至{' '}
            {dayjs(plan.endDate).format('YYYY-MM-DD')}
          </Text>
        </div>
      }
    >
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
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
          <Text type="secondary" className="mt-1 text-xs">
            剩余 {daysRemaining} 天
          </Text>
        )}
      </div>

      <List
        dataSource={plan.tasks}
        renderItem={task => {
          const taskType = taskTypeMap[task.type] || {
            label: task.type,
            color: 'default',
          }
          const taskStatus =
            taskStatusMap[task.status] || fallbackStatus(task.status)
          const isCompleted = task.status === 'COMPLETED'
          const isOverdue =
            !isCompleted && dayjs(task.dueDate).isBefore(dayjs())

          return (
            <List.Item
              className={isCompleted ? 'opacity-60' : ''}
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
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
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
                    <Tag color={taskStatus.color}>{taskStatus.label}</Tag>
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
                          完成于{' '}
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
