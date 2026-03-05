import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from '@/components'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Assessment from './pages/Assessment'
import AssessmentDetail from './pages/AssessmentDetail'
import AssessmentResult from './pages/AssessmentResult'
import AssessmentHistory from './pages/AssessmentHistory'
import Dialogue from './pages/Dialogue'
import Intervention from './pages/Intervention'
import Plans from './pages/Plans'
import CounselorList from './pages/CounselorList'
import CounselorDetail from './pages/CounselorDetail'
import Appointments from './pages/Appointments'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/assessment/:scaleCode" element={<AssessmentDetail />} />
          <Route path="/assessment/result/:id" element={<AssessmentResult />} />
          <Route path="/assessment/history" element={<AssessmentHistory />} />
          <Route path="/dialogue" element={<Dialogue />} />
          <Route path="/intervention" element={<Intervention />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/counselor" element={<CounselorList />} />
          <Route path="/counselor/:id" element={<CounselorDetail />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
