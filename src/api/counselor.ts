import request from './request'

export interface Counselor {
  id: number
  name: string
  qualification: string
  specialties: string[]
  introduction: string
  rating: number
  consultationCount: number
  price: number
  isOnline: boolean
}

export interface Appointment {
  id: number
  userId: number
  counselorId: number
  counselorName: string
  appointmentTime: string
  duration: number
  status: string
}

export const counselorApi = {
  getCounselors: (params?: { specialty?: string }) =>
    request.get<any, { data: Counselor[] }>('/counselors', { params }),
  
  getCounselorDetail: (id: number) =>
    request.get<any, { data: Counselor }>(`/counselors/${id}`),
  
  getAvailableSlots: (counselorId: number, date: string) =>
    request.get<any, { data: string[] }>(`/counselors/${counselorId}/slots`, { params: { date } }),
  
  createAppointment: (data: { counselorId: number; appointmentTime: string }) =>
    request.post<any, { data: Appointment }>('/appointments', data),
  
  getMyAppointments: () =>
    request.get<any, { data: Appointment[] }>('/appointments/my'),
  
  cancelAppointment: (id: number, reason: string) =>
    request.post(`/appointments/${id}/cancel`, { reason }),
}
