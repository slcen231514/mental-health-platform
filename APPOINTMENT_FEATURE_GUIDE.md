# 预约功能使用指南

## 功能概述

预约功能允许用户预约心理咨询师进行在线或线下咨询。该功能包括：

1. **预约创建** - 在咨询师详情页面创建预约
2. **预约管理** - 查看和管理所有预约记录
3. **预约取消** - 取消待确认或已确认的预约

## 功能组件

### 1. AppointmentModal 组件

**位置**: `src/components/counselor/AppointmentModal.tsx`

**功能**:

- 选择预约日期（不能选择过去的日期）
- 查看并选择可用时段
- 选择咨询方式（在线/线下）
- 填写备注信息
- 提交预约

**使用方式**:

```tsx
import { AppointmentModal } from '@/components/counselor'

;<AppointmentModal
  visible={appointmentModalVisible}
  counselorId={counselor.id}
  counselorName={counselor.name}
  onClose={() => setAppointmentModalVisible(false)}
  onSuccess={handleAppointmentSuccess}
/>
```

### 2. Appointments 页面

**位置**: `src/pages/Appointments.tsx`

**功能**:

- 查看所有预约记录
- 按状态筛选预约（全部/待确认/已确认/已完成/已取消）
- 查看预约详情
- 取消预约
- 跳转到咨询师详情页面

**路由**: `/appointments`

## API 接口

### 1. 获取可用时段

**接口**: `GET /counselor/{counselorId}/slots`

**参数**:

- `counselorId`: 咨询师ID
- `date`: 日期（YYYY-MM-DD格式）

**响应**:

```typescript
{
  code: 200,
  message: "success",
  data: [
    {
      startTime: "09:00",
      endTime: "10:00",
      available: true
    },
    {
      startTime: "10:00",
      endTime: "11:00",
      available: false
    }
  ]
}
```

### 2. 创建预约

**接口**: `POST /counselor/appointment`

**请求体**:

```typescript
{
  counselorId: number,
  date: string,           // YYYY-MM-DD
  startTime: string,      // HH:mm
  endTime: string,        // HH:mm
  consultationType: "ONLINE" | "OFFLINE",
  notes?: string
}
```

**响应**:

```typescript
{
  code: 200,
  message: "预约成功",
  data: {
    id: number,
    counselorId: number,
    counselorName: string,
    userId: number,
    date: string,
    startTime: string,
    endTime: string,
    status: "PENDING",
    consultationType: "ONLINE" | "OFFLINE",
    notes?: string,
    createdAt: string
  }
}
```

### 3. 获取用户预约列表

**接口**: `GET /counselor/appointments`

**参数**:

- `status?`: 预约状态（可选）

**响应**:

```typescript
{
  code: 200,
  message: "success",
  data: AppointmentDTO[]
}
```

### 4. 取消预约

**接口**: `PUT /counselor/appointment/{appointmentId}/cancel`

**参数**:

- `appointmentId`: 预约ID
- `reason`: 取消原因

**响应**:

```typescript
{
  code: 200,
  message: "预约已取消",
  data: null
}
```

## 使用流程

### 创建预约流程

1. 用户浏览咨询师列表，选择合适的咨询师
2. 点击"查看详情"进入咨询师详情页面
3. 点击"立即预约"按钮，打开预约模态框
4. 选择预约日期
5. 系统自动加载该日期的可用时段
6. 选择合适的时段
7. 选择咨询方式（在线/线下）
8. 填写备注信息（可选）
9. 点击"确认预约"提交
10. 预约成功后显示成功提示

### 管理预约流程

1. 用户访问 `/appointments` 页面
2. 查看所有预约记录
3. 可以按状态筛选预约
4. 对于待确认或已确认的预约，可以点击"取消预约"
5. 填写取消原因并确认
6. 预约状态更新为"已取消"

## 状态说明

- **PENDING** (待确认): 预约已创建，等待咨询师确认
- **CONFIRMED** (已确认): 咨询师已确认预约
- **CANCELLED** (已取消): 预约已被取消
- **COMPLETED** (已完成): 咨询已完成

## 注意事项

1. **日期限制**: 只能预约当前日期及之后的时段
2. **时段可用性**: 已被预约的时段会显示"已预约"标记，无法选择
3. **取消限制**: 只有待确认和已确认状态的预约可以取消
4. **取消原因**: 取消预约时必须填写取消原因
5. **咨询方式**:
   - 在线咨询：通过视频会议进行
   - 线下咨询：需要到咨询师指定地点

## 后端要求

为了使预约功能正常工作，后端需要实现以下接口：

1. `GET /counselor/{counselorId}/slots` - 获取咨询师可用时段
2. `POST /counselor/appointment` - 创建预约
3. `GET /counselor/appointments` - 获取用户预约列表
4. `PUT /counselor/appointment/{appointmentId}/cancel` - 取消预约

所有接口都需要JWT认证，并返回统一的响应格式。

## 测试建议

### 单元测试

1. 测试 AppointmentModal 组件的渲染
2. 测试日期选择功能
3. 测试时段选择功能
4. 测试表单验证
5. 测试预约提交

### 集成测试

1. 测试完整的预约创建流程
2. 测试预约列表加载
3. 测试预约取消流程
4. 测试不同状态的预约显示

### 端到端测试

1. 从咨询师列表到预约创建的完整流程
2. 预约管理页面的所有操作
3. 错误处理和边界情况

## 未来改进

1. 添加预约提醒功能
2. 支持预约改期
3. 添加视频会议集成
4. 支持预约评价功能
5. 添加预约统计和分析
