import { Card } from 'antd'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { DimensionScore } from '@/api/assessment'

interface ResultChartProps {
  dimensionScores: DimensionScore[]
  className?: string
}

/**
 * ResultChart 评估结果雷达图组件
 * 使用 Recharts 绘制各维度得分的雷达图
 */
export default function ResultChart({
  dimensionScores,
  className,
}: ResultChartProps) {
  // 转换数据格式为 Recharts 需要的格式
  const chartData = dimensionScores.map(item => ({
    dimension: item.dimension,
    score: item.score,
    fullMark: item.maxScore,
  }))

  return (
    <Card title="各维度得分" className={className}>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" />
          <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
          <Radar
            name="得分"
            dataKey="score"
            stroke="#1890ff"
            fill="#1890ff"
            fillOpacity={0.6}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  )
}
