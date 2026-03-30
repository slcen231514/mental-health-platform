import request from './request'
import { ApiResponse } from './auth'

// ==================== 请求类型 ====================

export interface ApplicationReviewRequest {
  reviewComment: string
}

export interface UpdateCounselorStatusRequest {
  reason?: string
}

// ==================== 响应类型 ====================

export interface DashboardStatisticsDTO {
  totalUsers: number
  totalCounselors: number
  activeCounselors: number
  pendingApplications: number
  monthlyAppointments: {
    total: number
    completed: number
    cancelled: number
  }
  dailyUserTrend: Array<{
    date: string
    count: number
  }>
  dailyAppointmentTrend: Array<{
    date: string
    count: number
  }>
  counselorRankings: Array<{
    counselorId: number
    name: string
    appointmentCount: number
    rating?: number
  }>
}

export interface ApplicationDTO {
  applicationId: number
  userId: number
  name: string
  phone: string
  licenseNumber: string
  specialties: string[]
  yearsOfExperience: number
  education: string
  bio: string
  qualificationFiles: Array<{
    fileId: string
    fileName: string
    fileUrl: string
  }>
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  submittedAt: string
  reviewedAt?: string
  reviewComment?: string
}

export interface UserDTO {
  userId: number
  username: string
  email: string
  roles: string[]
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED'
  createdAt: string
}

export interface UserDetailDTO extends UserDTO {
  phone?: string
  counselorInfo?: {
    counselorId: number
    status: 'ACTIVE' | 'INACTIVE'
    consultationCount: number
    rating: number
  }
}

export interface SystemLogDTO {
  logId: number
  operationType: string
  operator: string
  operatorId: number
  operationDetails: string
  ipAddress: string
  operationTime: string
}

// ==================== Admin API ====================

export const adminApi = {
  // ==================== 数据统计 API ====================

  /**
   * 查询平台统计数据
   * @returns 仪表板统计数据
   */
  getDashboardStatistics: (): Promise<ApiResponse<DashboardStatisticsDTO>> => {
    return request.get('/admin/statistics/dashboard')
  },

  /**
   * 导出统计数据
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param format 导出格式
   * @returns CSV文件
   */
  exportStatistics: (
    startDate: string,
    endDate: string,
    format: string = 'CSV'
  ): Promise<Blob> => {
    return request.get('/admin/statistics/export', {
      params: { startDate, endDate, format },
      responseType: 'blob',
    })
  },

  // ==================== 咨询师审核 API ====================

  /**
   * 查询待审核申请列表
   * @param status 审核状态
   * @param page 页码（前端从1开始，后端从0开始）
   * @param size 每页数量
   * @returns 申请列表
   */
  getCounselorApplications: (
    status?: string,
    page: number = 1,
    size: number = 20
  ): Promise<
    ApiResponse<{
      total: number
      applications: ApplicationDTO[]
    }>
  > => {
    return request.get('/admin/counselor-applications', {
      params: { status, page: page - 1, size },
    })
  },

  /**
   * 审核通过申请
   * @param applicationId 申请ID
   * @param reviewComment 审核意见
   * @returns 审核结果
   */
  approveApplication: (
    applicationId: number,
    reviewComment: string
  ): Promise<ApiResponse<void>> => {
    return request.post(
      `/admin/counselor-applications/${applicationId}/approve`,
      { reviewComment }
    )
  },

  /**
   * 审核拒绝申请
   * @param applicationId 申请ID
   * @param reviewComment 审核意见
   * @returns 审核结果
   */
  rejectApplication: (
    applicationId: number,
    reviewComment: string
  ): Promise<ApiResponse<void>> => {
    return request.post(
      `/admin/counselor-applications/${applicationId}/reject`,
      { reviewComment }
    )
  },

  // ==================== 用户管理 API ====================

  /**
   * 查询用户列表
   * @param role 角色筛选
   * @param keyword 关键词搜索
   * @param page 页码
   * @param size 每页数量
   * @returns 用户列表
   */
  getUsers: (
    role?: string,
    keyword?: string,
    page: number = 1,
    size: number = 20
  ): Promise<
    ApiResponse<{
      total: number
      users: UserDTO[]
    }>
  > => {
    return request.get('/admin/users', {
      params: { role, keyword, page, size },
    })
  },

  /**
   * 查询用户详情
   * @param userId 用户ID
   * @returns 用户详细信息
   */
  getUserDetail: (userId: number): Promise<ApiResponse<UserDetailDTO>> => {
    return request.get(`/admin/users/${userId}`)
  },

  /**
   * 禁用咨询师
   * @param counselorId 咨询师ID
   * @param reason 禁用原因
   * @returns 禁用结果
   */
  disableCounselor: (
    counselorId: number,
    reason: string
  ): Promise<ApiResponse<void>> => {
    return request.post(`/admin/counselors/${counselorId}/disable`, {
      reason,
    })
  },

  /**
   * 启用咨询师
   * @param counselorId 咨询师ID
   * @returns 启用结果
   */
  enableCounselor: (counselorId: number): Promise<ApiResponse<void>> => {
    return request.post(`/admin/counselors/${counselorId}/enable`)
  },

  // ==================== 系统日志 API ====================

  /**
   * 查询系统日志
   * @param operationType 操作类型
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param operator 操作人
   * @param page 页码
   * @param size 每页数量
   * @returns 日志列表
   */
  getSystemLogs: (
    operationType?: string,
    startDate?: string,
    endDate?: string,
    operator?: string,
    page: number = 1,
    size: number = 50
  ): Promise<
    ApiResponse<{
      total: number
      logs: SystemLogDTO[]
    }>
  > => {
    return request.get('/admin/logs', {
      params: { operationType, startDate, endDate, operator, page, size },
    })
  },
}

export default adminApi
