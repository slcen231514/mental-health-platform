# 响应式设计文档

本文档记录了心理健康平台前端的响应式设计实现。

## 设计原则

1. **移动优先** - 从移动端开始设计，逐步增强到桌面端
2. **断点系统** - 使用 Ant Design 的标准断点
3. **灵活布局** - 使用 Grid 和 Flexbox 实现自适应布局
4. **触摸友好** - 移动端增大点击区域，优化触摸体验

## 断点定义

使用 Ant Design 的响应式断点：

- `xs`: < 576px (手机)
- `sm`: ≥ 576px (大手机)
- `md`: ≥ 768px (平板)
- `lg`: ≥ 992px (桌面)
- `xl`: ≥ 1200px (大桌面)
- `xxl`: ≥ 1600px (超大桌面)

## 已实现的响应式特性

### 1. 主布局 (MainLayout)

**移动端优化：**

- 侧边栏改为抽屉式导航
- 自动检测屏幕尺寸 (< 768px 为移动端)
- 头部用户名在小屏幕隐藏
- 头像尺寸自适应
- 内容区域边距自适应 (移动端 8px，桌面端 16px)

**实现方式：**

```tsx
const [isMobile, setIsMobile] = useState(false)

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768)
  }
  checkMobile()
  window.addEventListener('resize', checkMobile)
  return () => window.removeEventListener('resize', checkMobile)
}, [])
```

### 2. 页面布局

所有主要页面都使用了 Ant Design 的 Grid 系统：

#### 干预计划页面 (Plans)

- 使用 `Row` 和 `Col` 组件
- 响应式列宽：`xs={24} sm={12} lg={6}`

#### CBT 练习页面 (CBT)

- 步骤式表单，移动端垂直堆叠
- 按钮组自适应排列

#### 冥想页面 (Meditation)

- 左右分栏布局：`xs={24} lg={12}`
- 移动端垂直堆叠，桌面端并排显示

#### 睡眠记录页面 (Sleep)

- 表单和列表分栏：`xs={24} lg={10}` 和 `xs={24} lg={14}`
- 统计卡片：`xs={24} sm={8}`

#### 情绪日记页面 (Diary)

- 编辑器和列表分栏：`xs={24} lg={10}` 和 `xs={24} lg={14}`
- 统计卡片：`xs={24} sm={8}`

### 3. 组件响应式

#### 卡片组件

- 使用 `className` 配合 Tailwind CSS 响应式类
- 示例：`gap-2 md:gap-4`（移动端 8px，桌面端 16px）

#### 按钮组

- 使用 `Space` 组件自动换行
- 移动端增大按钮尺寸

#### 表单

- 标签位置自适应（移动端垂直，桌面端水平）
- 输入框宽度 100%

#### 模态框

- 宽度自适应：移动端 90%，桌面端固定宽度
- 内容区域滚动

### 4. 文字和间距

使用 Tailwind CSS 响应式类：

```tsx
// 文字大小
className = 'text-sm md:text-base lg:text-lg'

// 间距
className = 'p-2 md:p-4 lg:p-6'
className = 'm-2 md:m-4'
className = 'gap-2 md:gap-4'

// 显示/隐藏
className = 'hidden sm:inline' // 小屏幕隐藏
className = 'block md:hidden' // 大屏幕隐藏
```

## 测试建议

### 移动端测试 (< 768px)

- [ ] 侧边栏显示为抽屉
- [ ] 所有卡片垂直堆叠
- [ ] 按钮和输入框易于点击
- [ ] 文字大小适中，易于阅读
- [ ] 图片和图表自适应宽度

### 平板端测试 (768px - 992px)

- [ ] 侧边栏正常显示
- [ ] 两列布局正常工作
- [ ] 统计卡片合理排列
- [ ] 表单布局舒适

### 桌面端测试 (> 992px)

- [ ] 多列布局充分利用空间
- [ ] 侧边栏可折叠
- [ ] 所有功能正常
- [ ] 视觉层次清晰

## 常见响应式模式

### 1. 两列布局

```tsx
<Row gutter={[24, 24]}>
  <Col xs={24} lg={10}>
    {/* 左侧内容 */}
  </Col>
  <Col xs={24} lg={14}>
    {/* 右侧内容 */}
  </Col>
</Row>
```

### 2. 卡片网格

```tsx
<Row gutter={[16, 16]}>
  <Col xs={24} sm={12} lg={6}>
    <Card>...</Card>
  </Col>
  {/* 更多卡片 */}
</Row>
```

### 3. 统计卡片

```tsx
<Row gutter={[16, 16]}>
  <Col xs={24} sm={8}>
    <Statistic ... />
  </Col>
  {/* 更多统计 */}
</Row>
```

### 4. 条件渲染

```tsx
{
  isMobile ? <Drawer>...</Drawer> : <Sider>...</Sider>
}
```

## 优化建议

### 已实现

✅ 主布局移动端适配
✅ 所有页面使用响应式 Grid
✅ 统计卡片响应式排列
✅ 表单自适应布局

### 待优化

- [ ] 图片懒加载
- [ ] 虚拟滚动（长列表）
- [ ] 触摸手势支持
- [ ] 横屏适配
- [ ] PWA 支持

## 性能考虑

1. **避免过度渲染**
   - 使用 `useEffect` 监听 resize 事件
   - 添加防抖处理

2. **CSS 优先**
   - 优先使用 CSS 媒体查询
   - 减少 JavaScript 计算

3. **图片优化**
   - 使用响应式图片
   - 实现懒加载

## 浏览器兼容性

- Chrome/Edge: ✅ 完全支持
- Firefox: ✅ 完全支持
- Safari: ✅ 完全支持
- 移动浏览器: ✅ 完全支持

## 更新日志

### 2024-01-XX

- ✅ 实现主布局移动端适配
- ✅ 添加抽屉式导航
- ✅ 优化所有页面响应式布局
- ✅ 统一使用 Ant Design Grid 系统
