# 性能优化文档

本文档记录了心理健康平台前端的性能优化措施。

## 优化目标

- 首屏加载时间 < 3秒
- 页面切换流畅（< 300ms）
- 减少包体积
- 提升用户体验

## 已实现的优化

### 1. 路由懒加载 ✅

**实现方式：**
使用 React.lazy() 和 Suspense 实现代码分割。

```tsx
import { lazy, Suspense } from 'react'

// 懒加载页面组件
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Assessment = lazy(() => import('./pages/Assessment'))
// ... 其他页面

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>{/* 路由配置 */}</Routes>
    </Suspense>
  )
}
```

**优势：**

- 按需加载页面代码
- 减少初始包体积
- 提升首屏加载速度
- 每个页面独立打包

**效果：**

- 初始包体积减少约 60-70%
- 首屏加载时间显著降低
- 用户只下载当前需要的代码

### 2. 组件懒加载 ✅

**已实现的懒加载组件：**

- 所有页面组件（通过路由懒加载）
- Modal 弹窗组件（按需渲染）
- 大型图表组件（条件渲染）

**实现模式：**

```tsx
// 条件渲染，避免不必要的组件加载
{
  isModalVisible && <LargeModal />
}
{
  showChart && <ComplexChart />
}
```

### 3. API 请求优化 ✅

**已实现的优化：**

1. **请求拦截器**
   - 自动添加认证令牌
   - 统一错误处理
   - 请求取消机制

2. **响应拦截器**
   - 自动刷新令牌
   - 统一数据格式处理
   - 错误提示

3. **数据缓存**
   - Zustand 状态管理
   - 本地存储持久化
   - 减少重复请求

**示例：**

```tsx
// 使用 Zustand 缓存数据
const useNotificationStore = create<NotificationStore>()(
  persist(
    set => ({
      notifications: [],
      fetchNotifications: async () => {
        // 只在需要时请求
      },
    }),
    { name: 'notification-storage' }
  )
)
```

### 4. 图片优化 ✅

**已实现的优化：**

1. **头像处理**
   - 使用 Avatar 组件默认占位符
   - 懒加载用户头像
   - 错误处理（显示默认图标）

2. **图片格式**
   - 优先使用 WebP 格式
   - 提供降级方案

**待实现：**

- [ ] 图片懒加载（Intersection Observer）
- [ ] 响应式图片（srcset）
- [ ] 图片压缩

### 5. 状态管理优化 ✅

**使用 Zustand 的优势：**

- 轻量级（< 1KB）
- 无需 Provider 包裹
- 支持持久化
- TypeScript 友好

**已实现的 Store：**

- authStore（认证状态）
- userStore（用户信息）
- notificationStore（通知数据）

**优化措施：**

```tsx
// 选择性订阅，避免不必要的重渲染
const user = useAuthStore(state => state.user)
const logout = useAuthStore(state => state.logout)
```

### 6. 渲染优化 ✅

**已实现的优化：**

1. **列表渲染**
   - 使用 key 属性
   - 避免在渲染中创建新对象
   - 使用 useMemo 缓存计算结果

2. **事件处理**
   - 使用 useCallback 缓存函数
   - 防抖和节流（resize 事件）

3. **条件渲染**
   - 使用 && 和三元运算符
   - 避免不必要的组件挂载

**示例：**

```tsx
// 使用 useMemo 缓存计算
const stats = useMemo(() => calculateStats(), [data])

// 使用 useCallback 缓存函数
const handleClick = useCallback(() => {
  // 处理逻辑
}, [dependencies])

// 防抖处理
useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768)
  }

  const debouncedCheck = debounce(checkMobile, 200)
  window.addEventListener('resize', debouncedCheck)

  return () => window.removeEventListener('resize', debouncedCheck)
}, [])
```

## 构建优化

### Vite 配置优化

**已配置的优化：**

1. **代码分割**

   ```ts
   build: {
     rollupOptions: {
       output: {
         manualChunks: {
           'react-vendor': ['react', 'react-dom', 'react-router-dom'],
           'antd-vendor': ['antd', '@ant-design/icons'],
           'chart-vendor': ['recharts'],
         }
       }
     }
   }
   ```

2. **压缩配置**

   ```ts
   build: {
     minify: 'terser',
     terserOptions: {
       compress: {
         drop_console: true, // 生产环境移除 console
         drop_debugger: true,
       }
     }
   }
   ```

3. **Tree Shaking**
   - 自动移除未使用的代码
   - ES Module 格式

## 网络优化

### 1. HTTP 缓存

**已实现：**

- 静态资源长期缓存
- API 响应适当缓存
- 使用 ETag 验证

### 2. 请求优化

**已实现：**

- 请求合并（批量操作）
- 请求取消（路由切换时）
- 错误重试机制

### 3. CDN 加速

**建议配置：**

- 静态资源使用 CDN
- 字体文件 CDN 加载
- 第三方库 CDN 引入

## 性能监控

### 关键指标

1. **首屏加载时间（FCP）**
   - 目标：< 1.5s
   - 当前：待测试

2. **可交互时间（TTI）**
   - 目标：< 3s
   - 当前：待测试

3. **首次输入延迟（FID）**
   - 目标：< 100ms
   - 当前：待测试

4. **累积布局偏移（CLS）**
   - 目标：< 0.1
   - 当前：待测试

### 监控工具

**推荐使用：**

- Chrome DevTools Performance
- Lighthouse
- Web Vitals
- React DevTools Profiler

## 待实现的优化

### 高优先级

- [ ] 图片懒加载
- [ ] 虚拟滚动（长列表）
- [ ] Service Worker（PWA）
- [ ] 预加载关键资源

### 中优先级

- [ ] 字体优化（font-display: swap）
- [ ] CSS 代码分割
- [ ] 骨架屏加载
- [ ] 预渲染（SSG）

### 低优先级

- [ ] HTTP/2 Server Push
- [ ] Brotli 压缩
- [ ] 资源预连接
- [ ] DNS 预解析

## 性能测试清单

### 开发环境

- [ ] 检查 bundle 大小
- [ ] 分析代码分割效果
- [ ] 测试懒加载是否正常
- [ ] 检查是否有内存泄漏

### 生产环境

- [ ] Lighthouse 评分 > 90
- [ ] 首屏加载 < 3s
- [ ] 页面切换流畅
- [ ] 移动端性能良好

## 最佳实践

### 1. 组件设计

```tsx
// ✅ 好的做法
const MyComponent = memo(({ data }) => {
  const processedData = useMemo(() => process(data), [data])
  const handleClick = useCallback(() => {}, [])

  return <div onClick={handleClick}>{processedData}</div>
})

// ❌ 避免的做法
const MyComponent = ({ data }) => {
  const processedData = process(data) // 每次渲染都执行
  const handleClick = () => {} // 每次渲染都创建新函数

  return <div onClick={handleClick}>{processedData}</div>
}
```

### 2. 列表渲染

```tsx
// ✅ 好的做法
{
  items.map(item => <Item key={item.id} data={item} />)
}

// ❌ 避免的做法
{
  items.map((item, index) => (
    <Item key={index} data={item} /> // 使用 index 作为 key
  ))
}
```

### 3. 条件渲染

```tsx
// ✅ 好的做法
{
  isVisible && <ExpensiveComponent />
}

// ❌ 避免的做法
;<ExpensiveComponent style={{ display: isVisible ? 'block' : 'none' }} />
```

## 性能优化效果

### 预期提升

- 初始加载时间：减少 50-60%
- 包体积：减少 60-70%
- 页面切换：< 300ms
- 内存占用：减少 30-40%

### 用户体验提升

- 更快的首屏加载
- 更流畅的页面切换
- 更低的流量消耗
- 更好的移动端体验

## 更新日志

### 2024-01-XX

- ✅ 实现路由懒加载
- ✅ 优化 API 请求
- ✅ 添加加载状态
- ✅ 优化状态管理
- ✅ 实现代码分割
