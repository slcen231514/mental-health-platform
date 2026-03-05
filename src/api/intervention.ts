import request from './request'

export interface InterventionTask {
  id: number
  title: string
  description: string
  type: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  dueDate: string
  completedAt?: string
}

export interface InterventionPlan {
  id: number
  userId: number
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED'
  tasks: InterventionTask[]
  startDate: string
  endDate: string
  createdAt: string
}

export interface CBTSession {
  id: number
  userId: number
  exerciseType: string
  status: string
  currentStep: number
  stepDescription: string
  createdAt: string
  responses?: {
    situation: string
    automaticThought: string
    emotionBefore: string
    evidence: string
    cognitiveDistortion: string
    alternativeThought: string
    emotionAfter: string
  }
}

export interface Diary {
  id: number
  userId: number
  content: string
  emotionType: string
  emotionLevel: number
  createdAt: string
}

export interface SleepRecord {
  id: number
  userId: number
  sleepTime: string
  wakeTime: string
  quality: number
  createdAt: string
}

export interface MeditationRecord {
  id: number
  userId: number
  type: string
  duration: number
  createdAt: string
}

export const interventionApi = {
  // 干预计划
  getPlans: () =>
    request.get<any, { data: InterventionPlan[] }>('/interventions/plans'),

  getPlanById: (id: number) =>
    request.get<any, { data: InterventionPlan }>(`/interventions/plans/${id}`),

  completeTask: (planId: number, taskId: number) =>
    request.post(`/interventions/plans/${planId}/tasks/${taskId}/complete`),

  // 情绪日记
  saveDiary: (data: {
    content: string
    emotionType: string
    emotionLevel: number
  }) => request.post<any, { data: Diary }>('/interventions/diary', data),

  getDiaryHistory: (params?: { page?: number; size?: number }) =>
    request.get<any, { data: { content: Diary[]; totalElements: number } }>(
      '/interventions/diary',
      { params }
    ),

  // 睡眠记录
  saveSleepRecord: (data: {
    sleepTime: string
    wakeTime: string
    quality: number
  }) => request.post<any, { data: SleepRecord }>('/interventions/sleep', data),

  getSleepHistory: (params?: { page?: number; size?: number }) =>
    request.get<
      any,
      { data: { content: SleepRecord[]; totalElements: number } }
    >('/interventions/sleep', { params }),

  // CBT练习
  submitCbtSession: (data: {
    exerciseType: string
    responses: Record<string, string>
  }) => request.post<any, { data: CBTSession }>('/interventions/cbt', data),

  getCbtHistory: (params?: { page?: number; size?: number }) =>
    request.get<
      any,
      { data: { content: CBTSession[]; totalElements: number } }
    >('/interventions/cbt/history', { params }),

  // 冥想记录
  recordMeditation: (data: { type: string; duration: number }) =>
    request.post<any, { data: MeditationRecord }>(
      '/interventions/meditation',
      data
    ),

  getMeditationHistory: (params?: { page?: number; size?: number }) =>
    request.get<
      any,
      { data: { content: MeditationRecord[]; totalElements: number } }
    >('/interventions/meditation/history', { params }),
}
