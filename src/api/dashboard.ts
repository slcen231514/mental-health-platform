import request from './request'

/**
 * 仪表盘统计数据
 */
export interface DashboardStats {
  assessmentCount: number // 评估次数
  dialogueCount: number // 对话次数
  appointmentCount: number // 预约次数
  interventionTaskCount: number // 干预任务完成数
}

/**
 * 最近评估记录
 */
export interface RecentAssessment {
  id: number
  scaleCode: string
  scaleName: string
  score: number
  level: string
  completedAt: string
}

/**
 * 推荐内容
 */
export interface RecommendedContent {
  id: number
  type: 'article' | 'video' | 'exercise' | 'counselor'
  title: string
  description: string
  thumbnail?: string
  url?: string
}

/**
 * 仪表盘 API
 */
export const dashboardApi = {
  /**
   * 获取仪表盘统计数据
   */
  getStats: () => {
    return request<DashboardStats>({
      url: '/api/dashboard/stats',
      method: 'GET',
    })
  },

  /**
   * 获取最近评估列表
   * @param limit 返回数量限制
   */
  getRecentAssessments: (limit: number = 5) => {
    return request<RecentAssessment[]>({
      url: '/api/dashboard/recent-assessments',
      method: 'GET',
      params: { limit },
    })
  },

  /**
   * 获取推荐内容
   * @param limit 返回数量限制
   */
  getRecommendedContent: (limit: number = 6) => {
    return request<RecommendedContent[]>({
      url: '/api/dashboard/recommendations',
      method: 'GET',
      params: { limit },
    })
  },
}
