import React from 'react'
import { Radio, Space, Card } from 'antd'
import type { Question } from '@/api/assessment'

/**
 * QuestionItem 组件属性
 */
export interface QuestionItemProps {
  /**
   * 题目数据
   */
  question: Question
  /**
   * 当前题目索引（从 0 开始）
   */
  currentIndex: number
  /**
   * 总题目数量
   */
  totalCount: number
  /**
   * 当前选中的答案分数
   */
  selectedScore?: number
  /**
   * 答案改变的回调
   */
  onChange?: (questionNumber: number, score: number) => void
  /**
   * 自定义类名
   */
  className?: string
}

/**
 * QuestionItem 题目组件
 * 用于显示单个题目和选项列表
 */
const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  currentIndex,
  totalCount,
  selectedScore,
  onChange,
  className = '',
}) => {
  const handleChange = (score: number) => {
    onChange?.(question.questionNumber, score)
  }

  return (
    <Card className={className}>
      {/* 题目序号 */}
      <div className="text-gray-500 mb-2">
        问题 {currentIndex + 1} / {totalCount}
      </div>

      {/* 题目内容 */}
      <div className="text-lg mb-6 p-4 bg-gray-50 rounded">
        {question.content}
      </div>

      {/* 选项列表 */}
      <Radio.Group
        value={selectedScore}
        onChange={e => handleChange(e.target.value)}
        className="w-full"
      >
        <Space direction="vertical" className="w-full">
          {question.options.map(option => (
            <Radio
              key={option.id}
              value={option.score}
              className="w-full p-3 border rounded hover:bg-gray-50 transition-colors"
            >
              {option.content}
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    </Card>
  )
}

export default QuestionItem
