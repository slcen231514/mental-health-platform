import { lazy } from 'react'
import { RouteObject } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import { PrivateRoute } from '@/components'

// 懒加载页面组件
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Assessment = lazy(() => import('@/pages/Assessment'))
const AssessmentDetail = lazy(() => import('@/pages/AssessmentDetail'))
const AssessmentResult = lazy(() => import('@/pages/AssessmentResult'))
const AssessmentHistory = lazy(() => import('@/pages/AssessmentHistory'))
const Dialogue = lazy(() => import('@/pages/Dialogue'))
const Intervention = lazy(() => import('@/pages/Intervention'))
const Plans = lazy(() => import('@/pages/Plans'))
const CBT = lazy(() => import('@/pages/CBT'))
const CBTHistory = lazy(() => import('@/pages/CBTHistory'))
const Meditation = lazy(() => import('@/pages/Meditation'))
const MeditationHistory = lazy(() => import('@/pages/MeditationHistory'))
const Sleep = lazy(() => import('@/pages/Sleep'))
const Diary = lazy(() => import('@/pages/Diary'))
const CounselorList = lazy(() => import('@/pages/CounselorList'))
const CounselorDetail = lazy(() => import('@/pages/CounselorDetail'))
const Appointments = lazy(() => import('@/pages/Appointments'))
const Profile = lazy(() => import('@/pages/Profile'))
const Notifications = lazy(() => import('@/pages/Notifications'))
const Settings = lazy(() => import('@/pages/Settings'))
const Forbidden = lazy(() => import('@/pages/Forbidden'))

// 咨询师页面
const CounselorDashboard = lazy(() => import('@/pages/counselor/Dashboard'))
const CounselorApply = lazy(() => import('@/pages/counselor/Apply'))
const CounselorApplicationStatus = lazy(
  () => import('@/pages/counselor/ApplicationStatus')
)
const CounselorSchedule = lazy(() => import('@/pages/counselor/Schedule'))
const CounselorAppointments = lazy(
  () => import('@/pages/counselor/Appointments')
)
const CounselorRecords = lazy(() => import('@/pages/counselor/Records'))
const CounselorIncome = lazy(() => import('@/pages/counselor/Income'))
const CounselorProfile = lazy(() => import('@/pages/counselor/Profile'))

// 管理员页面
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))

/**
 * 路由配置
 *
 * 角色说明:
 * - USER: 普通用户
 * - COUNSELOR: 咨询师
 * - ADMIN: 管理员
 *
 * 如果路由没有指定 requiredRoles，则所有已登录用户都可以访问
 */
export const routes: RouteObject[] = [
  // 认证相关路由（无需登录）
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
    ],
  },

  // 主应用路由（需要登录）
  {
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      // 用户路由（所有角色都可以访问）
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/assessment',
        element: <Assessment />,
      },
      {
        path: '/assessment/:scaleCode',
        element: <AssessmentDetail />,
      },
      {
        path: '/assessment/result/:id',
        element: <AssessmentResult />,
      },
      {
        path: '/assessment/history',
        element: <AssessmentHistory />,
      },
      {
        path: '/dialogue',
        element: <Dialogue />,
      },
      {
        path: '/intervention',
        element: <Intervention />,
      },
      {
        path: '/plans',
        element: <Plans />,
      },
      {
        path: '/cbt',
        element: <CBT />,
      },
      {
        path: '/cbt/history',
        element: <CBTHistory />,
      },
      {
        path: '/meditation',
        element: <Meditation />,
      },
      {
        path: '/meditation/history',
        element: <MeditationHistory />,
      },
      {
        path: '/sleep',
        element: <Sleep />,
      },
      {
        path: '/diary',
        element: <Diary />,
      },
      {
        path: '/counselor',
        element: <CounselorList />,
      },
      {
        path: '/counselor/:id',
        element: <CounselorDetail />,
      },
      {
        path: '/appointments',
        element: <Appointments />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
      {
        path: '/notifications',
        element: <Notifications />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
    ],
  },

  // 咨询师路由（需要 COUNSELOR 角色）
  {
    element: (
      <PrivateRoute requiredRoles={['COUNSELOR']}>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: '/counselor/dashboard',
        element: <CounselorDashboard />,
      },
      {
        path: '/counselor/apply',
        element: <CounselorApply />,
      },
      {
        path: '/counselor/application-status',
        element: <CounselorApplicationStatus />,
      },
      {
        path: '/counselor/schedule',
        element: <CounselorSchedule />,
      },
      {
        path: '/counselor/appointments',
        element: <CounselorAppointments />,
      },
      {
        path: '/counselor/records',
        element: <CounselorRecords />,
      },
      {
        path: '/counselor/income',
        element: <CounselorIncome />,
      },
      {
        path: '/counselor/profile',
        element: <CounselorProfile />,
      },
      // TODO: 在后续任务中添加其他咨询师页面
      // {
      //   path: '/counselor/profile',
      //   element: <CounselorProfile />,
      // },
    ],
  },

  // 管理员路由（需要 ADMIN 角色）
  {
    element: (
      <PrivateRoute requiredRoles={['ADMIN']}>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: '/admin/dashboard',
        element: <AdminDashboard />,
      },
      // TODO: 在后续任务中添加其他管理员页面
      // {
      //   path: '/admin/users',
      //   element: <UserManagement />,
      // },
      // {
      //   path: '/admin/applications',
      //   element: <ApplicationReview />,
      // },
      // {
      //   path: '/admin/logs',
      //   element: <SystemLogs />,
      // },
    ],
  },

  // 403 禁止访问页面
  {
    path: '/403',
    element: <Forbidden />,
  },

  // 404 页面 - 重定向到首页
  {
    path: '*',
    element: <Dashboard />,
  },
]

/**
 * 根据用户角色获取默认首页路径
 * 用于登录后的重定向
 */
export function getDefaultHomePath(activeRole: string | null): string {
  switch (activeRole) {
    case 'ADMIN':
      return '/admin/dashboard'
    case 'COUNSELOR':
      return '/counselor/dashboard'
    case 'USER':
    default:
      return '/'
  }
}

/**
 * 角色显示名称映射
 */
export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  USER: '普通用户',
  COUNSELOR: '咨询师',
  ADMIN: '管理员',
}

export default routes
