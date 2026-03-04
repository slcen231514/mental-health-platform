import request from './request'

export interface Scale {
  id: number
  code: string
  name: string
  description: string
  questionCount: number
  minScore: number
  maxScore: number
  type: string
}

export interface Option {
  id: number
  content: string
  score: number
}

export interface Question {
  id: number
  questionNumber: number
  content: string
  options: Option[]
}

export interface ScaleDetail extends Scale {
  questions: Question[]
}

export interface DimensionScore {
  dimension: string
  score: number
  maxScore: number
}

export interface AssessmentResult {
  id: number
  userId: number
  scaleCode: string
  scaleName: string
  totalScore: number
  severity: string
  interpretation: string
  suggestions?: string
  dimensionScores?: DimensionScore[]
  createdAt: string
}

export interface SubmitAssessmentRequest {
  scaleCode: string
  answers: Record<number, number> // questionNumber -> score
}

export const assessmentApi = {
  // 获取所有可用量表
  getScales: () => request.get<any, { data: Scale[] }>('/assessments/scales'),

  // 获取量表详情（包含题目）
  getScaleDetail: (scaleCode: string) =>
    request.get<any, { data: ScaleDetail }>(`/assessments/scales/${scaleCode}`),

  // 提交评估答案
  submitAssessment: (data: SubmitAssessmentRequest) =>
    request.post<any, { data: AssessmentResult }>('/assessments/submit', data),

  // 获取评估历史
  getHistory: (params?: { page?: number; size?: number }) =>
    request.get<
      any,
      { data: { content: AssessmentResult[]; totalElements: number } }
    >('/assessments/history', { params }),

  // 获取评估结果详情
  getResult: (assessmentId: number) =>
    request.get<any, { data: AssessmentResult }>(
      `/assessments/results/${assessmentId}`
    ),

  // 获取评估报告
  getReport: (assessmentId: number) =>
    request.get<any, { data: any }>(`/assessments/report/${assessmentId}`),
}
