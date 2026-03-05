# 评估历史页面功能说明

## 功能概述

评估历史页面允许用户查看所有历史评估记录，支持筛选、排序和趋势分析。

## 访问路径

- URL: `/assessment/history`
- 需要登录后才能访问

## 主要功能

### 1. 历史记录列表

- 显示所有评估记录
- 包含以下信息：
  - 评估时间
  - 量表名称
  - 得分
  - 等级（带颜色标签）
  - 查看详情按钮

### 2. 筛选功能

- **按量表类型筛选**: 可以选择查看特定量表的评估记录
  - 全部量表
  - PHQ-9（抑郁症筛查）
  - GAD-7（焦虑症筛查）
  - DASS-21（抑郁焦虑压力量表）

- **按时间排序**:
  - 最新优先（默认）
  - 最早优先

### 3. 趋势图表

- 使用 Recharts 绘制折线图
- 显示不同量表的分数变化趋势
- 支持多条折线对比
- 交互式图表，鼠标悬停显示详细数据

### 4. 分页功能

- 每页显示 10 条记录
- 支持切换每页显示数量
- 显示总记录数

## 技术实现

### 组件结构

```
AssessmentHistory.tsx
├── 页面标题
├── 趋势图表卡片
│   └── Recharts LineChart
└── 历史记录列表卡片
    ├── 筛选器（量表类型、时间排序）
    └── Ant Design Table
```

### 使用的技术

- **React Hooks**: useState, useEffect
- **React Router**: useNavigate
- **Ant Design**: Card, Table, Select, Tag, Button
- **Recharts**: LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
- **API**: assessmentApi.getHistory()

### 数据流

1. 组件挂载时调用 `loadHistory()` 获取评估历史
2. 根据筛选条件和排序方式过滤数据
3. 将数据转换为图表所需格式
4. 渲染趋势图表和列表

## 颜色方案

- **无/正常**: 绿色 (success)
- **轻度**: 蓝色 (processing)
- **中度**: 橙色 (warning)
- **重度**: 红色 (error)

## 使用示例

### 从仪表盘访问

```typescript
navigate('/assessment/history')
```

### 从评估结果页访问

可以在评估结果页添加"查看历史"按钮：

```typescript
<Button onClick={() => navigate('/assessment/history')}>
  查看历史记录
</Button>
```

## API 依赖

- `GET /assessments/history?page=0&size=100`
  - 返回分页的评估历史记录
  - 包含 content 数组和 totalElements 总数

## 未来改进建议

1. 添加日期范围筛选
2. 支持导出历史数据
3. 添加对比功能（选择两次评估对比）
4. 添加统计分析（平均分、最高分、最低分等）
5. 支持删除历史记录
6. 添加备注功能

## 相关文件

- 页面组件: `web-frontend/src/pages/AssessmentHistory.tsx`
- 路由配置: `web-frontend/src/App.tsx`
- API 接口: `web-frontend/src/api/assessment.ts`
- 类型定义: `web-frontend/src/api/assessment.ts` (AssessmentResult)
