import request from './request'
import { ApiResponse } from './auth'

// ==================== 请求类型 ====================

export interface MatchCounselorRequest {
  specialties?: string[]
  minRating?: number
  maxPrice?: number
  isOnline?: boolean
}

export interface CreateAppointmentRequest {
  counselorId: number
  date: string
  startTime: string
  endTime: string
  consultationType: 'ONLINE' | 'OFFLINE'
  notes?: string
}

export interface FeedbackRequest {
  rating: number
  comment: string
  tags?: string[]
}

// ==================== 响应类型 ====================

export interface CounselorDTO {
  id: number
  name: string
  qualification: string
  specialties: string[]
  introduction: string
  rating: number
  consultationCount: number
  price: number
  isOnline: boolean
  avatar?: string
}

export interface CounselorDetailDTO extends CounselorDTO {
  education?: string
  experience?: string
  certifications?: string[]
  workingHours?: string
  languages?: string[]
  reviews?: ReviewDTO[]
}

export interface ReviewDTO {
  id: number
  userId: number
  username: string
  rating: number
  comment: string
  tags?: string[]
  createdAt: string
}

export interface TimeSlotDTO {
  startTime: string
  endTime: string
  available: boolean
}

export interface AppointmentDTO {
  id: number
  counselorId: number
  counselorName: string
  userId: number
  userName: string
  date: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  consultationType: 'ONLINE' | 'OFFLINE'
  notes?: string
  createdAt: string
}

export interface VideoSessionDTO {
  sessionId: string
  roomUrl: string
  token: string
  expiresAt: string
}

// ==================== 咨询师时间表管理类型 ====================

export interface AvailabilityDTO {
  availabilityId: number
  date: string
  startTime: string
  endTime: string
  isBooked: boolean
}

export interface AddAvailabilityRequest {
  date: string
  startTime: string
  endTime: string
}

// ==================== 咨询记录管理类型 ====================

export interface ConsultationRecordDTO {
  recordId: number
  appointmentId: number
  userId: number
  userName: string
  consultationDate: string
  duration: number
  summary: string
  followUpAdvice?: string
  createdAt: string
  updatedAt: string
}

export interface CreateConsultationRecordRequest {
  appointmentId: number
  consultationDate: string
  duration: number
  summary: string
  followUpAdvice?: string
}

export interface UpdateConsultationRecordRequest {
  summary: string
  followUpAdvice?: string
}

// ==================== Counselor API ====================

export const counselorApi = {
  /**
   * 匹配咨询师
   * @param matchRequest 匹配条件
   * @returns 咨询师列表
   */
  matchCounselors: (
    matchRequest: MatchCounselorRequest
  ): Promise<ApiResponse<CounselorDTO[]>> => {
    return request.post('/counselor/match', matchRequest)
  },

  /**
   * 获取咨询师详情
   * @param counselorId 咨询师ID
   * @returns 咨询师详细信息
   */
  getCounselorDetail: (
    counselorId: number
  ): Promise<ApiResponse<CounselorDetailDTO>> => {
    return request.get(`/counselor/${counselorId}`)
  },

  /**
   * 获取可用时段
   * @param counselorId 咨询师ID
   * @param date 日期
   * @returns 可用时段列表
   */
  getAvailableSlots: (
    counselorId: number,
    date: string
  ): Promise<ApiResponse<TimeSlotDTO[]>> => {
    return request.get(`/counselor/${counselorId}/slots`, {
      params: { date },
    })
  },

  /**
   * 创建预约
   * @param appointmentRequest 预约信息
   * @returns 预约详情
   */
  createAppointment: (
    appointmentRequest: CreateAppointmentRequest
  ): Promise<ApiResponse<AppointmentDTO>> => {
    return request.post('/counselor/appointment', appointmentRequest)
  },

  /**
   * 取消预约
   * @param appointmentId 预约ID
   * @param reason 取消原因
   * @returns 取消结果
   */
  cancelAppointment: (
    appointmentId: number,
    reason: string
  ): Promise<ApiResponse<void>> => {
    return request.put(`/counselor/appointment/${appointmentId}/cancel`, null, {
      params: { reason },
    })
  },

  /**
   * 获取视频会话信息
   * @param appointmentId 预约ID
   * @returns 视频会话信息
   */
  getVideoSession: (
    appointmentId: number
  ): Promise<ApiResponse<VideoSessionDTO>> => {
    return request.get(`/counselor/appointment/${appointmentId}/video`)
  },

  /**
   * 提交反馈
   * @param appointmentId 预约ID
   * @param feedback 反馈信息
   * @returns 提交结果
   */
  submitFeedback: (
    appointmentId: number,
    feedback: FeedbackRequest
  ): Promise<ApiResponse<void>> => {
    return request.post(
      `/counselor/appointment/${appointmentId}/feedback`,
      feedback
    )
  },

  /**
   * 获取用户预约列表
   * @param status 预约状态
   * @returns 预约列表
   */
  getUserAppointments: (
    status?: string
  ): Promise<ApiResponse<AppointmentDTO[]>> => {
    return request.get('/counselor/appointments', {
      params: { status },
    })
  },

  // ==================== 咨询师时间表管理 API ====================

  /**
   * 添加可预约时段
   * @param availabilityRequest 时段信息
   * @returns 添加结果
   */
  addAvailability: (
    availabilityRequest: AddAvailabilityRequest
  ): Promise<ApiResponse<AvailabilityDTO>> => {
    return request.post('/counselor/availability', availabilityRequest)
  },

  /**
   * 删除可预约时段
   * @param availabilityId 时段ID
   * @returns 删除结果
   */
  deleteAvailability: (availabilityId: number): Promise<ApiResponse<void>> => {
    return request.delete(`/counselor/availability/${availabilityId}`)
  },

  /**
   * 查询时间表
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 时段列表
   */
  getAvailability: (
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<AvailabilityDTO[]>> => {
    return request.get('/counselor/availability', {
      params: { startDate, endDate },
    })
  },

  // ==================== 咨询师预约管理 API ====================

  /**
   * 查询咨询师预约列表
   * @param status 预约状态
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 预约列表
   */
  getCounselorAppointments: (
    status?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<AppointmentDTO[]>> => {
    return request.get('/counselor/appointments', {
      params: { status, startDate, endDate },
    })
  },

  /**
   * 确认预约
   * @param appointmentId 预约ID
   * @returns 确认结果
   */
  confirmAppointment: (appointmentId: number): Promise<ApiResponse<void>> => {
    return request.post(`/counselor/appointments/${appointmentId}/confirm`)
  },

  /**
   * 拒绝预约
   * @param appointmentId 预约ID
   * @param reason 拒绝原因
   * @returns 拒绝结果
   */
  rejectAppointment: (
    appointmentId: number,
    reason: string
  ): Promise<ApiResponse<void>> => {
    return request.post(`/counselor/appointments/${appointmentId}/reject`, {
      reason,
    })
  },

  // ==================== 咨询记录管理 API ====================

  /**
   * 创建咨询记录
   * @param recordRequest 咨询记录信息
   * @returns 创建结果
   */
  createConsultationRecord: (
    recordRequest: CreateConsultationRecordRequest
  ): Promise<ApiResponse<ConsultationRecordDTO>> => {
    return request.post('/counselor/consultation-records', recordRequest)
  },

  /**
   * 更新咨询记录
   * @param recordId 记录ID
   * @param recordRequest 咨询记录信息
   * @returns 更新结果
   */
  updateConsultationRecord: (
    recordId: number,
    recordRequest: UpdateConsultationRecordRequest
  ): Promise<ApiResponse<void>> => {
    return request.put(
      `/counselor/consultation-records/${recordId}`,
      recordRequest
    )
  },

  /**
   * 查询咨询记录列表
   * @param userId 用户ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 咨询记录列表
   */
  getConsultationRecords: (
    userId?: number,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<ConsultationRecordDTO[]>> => {
    return request.get('/counselor/consultation-records', {
      params: { userId, startDate, endDate },
    })
  },
}

export default counselorApi
