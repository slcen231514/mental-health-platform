import React from 'react'
import { Card, Tag, Button, Space } from 'antd'
import { ClockCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import type { Scale } from '@/api/assessment'

/**
 * ScaleCard 组件属性
 */
export interface ScaleCardProps {
  /**
   * 量表数据
   */
  scale: Scale
  /**
   * 点击开始评估的回调
   */
  onStart?: (scaleCode: string) => void
  /**
   * 自定义类名
   */
  className?: string
}

/**
 * 量表标签映射
 */
const SCALE_TAGS_MAP: Record<string, string[]> = {
  'PHQ-9': ['抑郁', '情绪'],
  'GAD-7': ['焦虑', '紧张'],
  'DASS-21': ['抑郁', '焦虑', '压力'],
  'PSS-10': ['压力', '应对'],
  SAS: ['焦虑', '自评'],
  SDS: ['抑郁', '自评'],
}

/**
 * 估算完成时间
 * @param questionCount 题目数量
 * @returns 估算时间字符串
 */
const getEstimatedTime = (questionCount: number): string => {
  if (questionCount <= 7) return '2-4分钟'
  if (questionCount <= 10) return '3-5分钟'
  if (questionCount <= 21) return '5-10分钟'
  return '10-15分钟'
}

/**
 * ScaleCard 量表卡片组件
 * 用于显示量表信息和开始评估按钮
 */
const ScaleCard: React.FC<ScaleCardProps> = ({
  scale,
  onStart,
  className = '',
}) => {
  const handleStart = () => {
    onStart?.(scale.code)
  }

  // 获取量表标签
  const tags = SCALE_TAGS_MAP[scale.code] || ['心理健康']

  return (
    <Card
      hoverable
      className={`h-full transition-all duration-300 ${className}`}
      onClick={handleStart}
    >
      {/* 量表名称 */}
      <h3 className="text-lg font-semibold mb-2">{scale.name}</h3>

      {/* 量表描述 */}
      <p className="text-gray-500 mb-4 line-clamp-2">{scale.description}</p>

      {/* 题目数量和预计时间 */}
      <Space className="text-sm text-gray-400 mb-4">
        <span>
          <QuestionCircleOutlined /> {scale.questionCount}题
        </span>
        <span>
          <ClockCircleOutlined /> {getEstimatedTime(scale.questionCount)}
        </span>
      </Space>

      {/* 量表类型标签 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map(tag => (
          <Tag key={tag} color="blue">
            {tag}
          </Tag>
        ))}
      </div>

      {/* 开始评估按钮 */}
      <Button type="primary" block onClick={handleStart}>
        开始评估
      </Button>
    </Card>
  )
}

export default ScaleCard
