import { useEffect, useState } from 'react'
import {
  Card,
  Empty,
  Spin,
  Typography,
  Progress,
  Space,
  Button,
  message,
} from 'antd'
import { TrophyOutlined } from '@ant-design/icons'
import { interventionApi, InterventionPlan } from '@/api/intervention'
import PlanCard from '@/components/intervention/PlanCard'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

export default function Plans() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<InterventionPlan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

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

  const handleCreatePlan = async () => {
    try {
      setIsCreating(true)
      // 调用生成计划的 API
      await interventionApi.generatePlan()
      message.success('干预计划创建成功！')
      // 重新获取计划列表
      await fetchPlans()
    } catch (error: any) {
      console.error('创建干预计划失败:', error)
      const errorMsg =
        error?.response?.data?.message || '创建失败，请先完成心理评估'
      message.error(errorMsg)

      // 如果是因为没有评估结果，引导用户去评估
      if (errorMsg.includes('评估')) {
        setTimeout(() => {
          navigate('/assessment')
        }, 2000)
      }
    } finally {
      setIsCreating(false)
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
            description={
              <Space direction="vertical">
                <Text>暂无干预计划</Text>
                <Text type="secondary">
                  完成心理评估后可自动生成个性化干预计划
                </Text>
              </Space>
            }
            className="py-16"
          >
            <Space>
              <Button
                type="primary"
                onClick={handleCreatePlan}
                loading={isCreating}
              >
                创建计划
              </Button>
              <Button onClick={() => navigate('/assessment')}>去评估</Button>
            </Space>
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
