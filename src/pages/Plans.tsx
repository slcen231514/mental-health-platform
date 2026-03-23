import { useEffect, useState } from 'react'
import { Card, Empty, Spin, Typography, Progress, Space, Button } from 'antd'
import { TrophyOutlined } from '@ant-design/icons'
import { interventionApi, InterventionPlan } from '@/api/intervention'
import PlanCard from '@/components/intervention/PlanCard'

const { Title, Text } = Typography

export default function Plans() {
  const [plans, setPlans] = useState<InterventionPlan[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    setIsLoading(true)
    try {
      const response = await interventionApi.getPlans()
      setPlans(response.data)
    } catch (error) {
      console.error('获取干预计划失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTaskComplete = async (planId: number, taskId: number) => {
    try {
      await interventionApi.completeTask(planId, taskId)
      // 重新获取计划列表
      fetchPlans()
    } catch (error) {
      console.error('标记任务完成失败:', error)
    }
  }

  // 计算总体进度
  const calculateOverallProgress = () => {
    if (plans.length === 0) return 0

    const totalTasks = plans.reduce((sum, plan) => sum + plan.tasks.length, 0)
    const completedTasks = plans.reduce(
      (sum, plan) =>
        sum + plan.tasks.filter(task => task.status === 'COMPLETED').length,
      0
    )

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }

  const overallProgress = calculateOverallProgress()

  return (
    <div className="max-w-6xl mx-auto">
      {/* 页面标题和统计 */}
      <div className="mb-6">
        <Title level={2} className="!mb-2">
          <TrophyOutlined className="mr-2" />
          我的干预计划
        </Title>
        <Text type="secondary">坚持完成任务，改善心理健康</Text>
      </div>

      {/* 总体进度卡片 */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Text strong className="text-lg">
              总体进度
            </Text>
            <div className="mt-2">
              <Progress
                percent={overallProgress}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                status={overallProgress === 100 ? 'success' : 'active'}
              />
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-500">
              {overallProgress}%
            </div>
            <Text type="secondary">完成度</Text>
          </div>
        </div>
      </Card>

      {/* 计划列表 */}
      <Spin spinning={isLoading}>
        {plans.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无干预计划"
            className="py-16"
          >
            <Button type="primary">创建计划</Button>
          </Empty>
        ) : (
          <Space direction="vertical" size="large" className="w-full">
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onTaskComplete={handleTaskComplete}
              />
            ))}
          </Space>
        )}
      </Spin>
    </div>
  )
}
