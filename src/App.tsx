import { Suspense } from 'react'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import { Spin } from 'antd'
import { routes } from '@/router'

// 加载中组件
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Spin size="large" tip="加载中..." />
  </div>
)

// 路由组件
function AppRoutes() {
  const element = useRoutes(routes)
  return element
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  )
}

export default App
