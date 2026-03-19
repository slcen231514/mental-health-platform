# 基于角色的访问控制 (RBAC) 实现文档

## 概述

本文档描述了前端项目中基于角色的访问控制系统的实现，包括路由守卫、状态管理和权限验证。

## 实现的功能

### 1. 路由配置和权限守卫 (任务 18.1)

#### 1.1 路由配置文件

- **文件**: `src/router/index.tsx`
- **功能**:
  - 集中管理所有路由配置
  - 支持基于角色的路由访问控制
  - 提供角色到首页路径的映射函数

#### 1.2 PrivateRoute 组件增强

- **文件**: `src/components/common/PrivateRoute/index.tsx`
- **功能**:
  - 验证用户认证状态
  - 验证用户角色权限
  - 未认证用户重定向到登录页
  - 无权限用户重定向到403页面
  - 支持 `requiredRoles` 属性指定所需角色列表

#### 1.3 403 Forbidden 页面

- **文件**: `src/pages/Forbidden.tsx`
- **功能**:
  - 显示无权限访问提示
  - 显示所需角色和当前角色信息
  - 提供返回首页和返回上一页按钮
  - 根据用户角色智能返回对应首页

### 2. Zustand 状态管理 (任务 18.3)

#### 2.1 AuthStore 增强

- **文件**: `src/store/authStore.ts`
- **新增状态**:
  - `activeRole`: 当前活动角色
- **新增方法**:
  - `switchRole(role: string)`: 切换用户角色
  - `setActiveRole(role: string)`: 设置活动角色
  - `hasRole(role: string)`: 检查用户是否拥有指定角色
  - `hasAnyRole(roles: string[])`: 检查用户是否拥有任意一个指定角色

- **功能改进**:
  - 登录时自动设置默认活动角色（用户的第一个角色）
  - 角色切换时调用后端API并刷新token
  - 持久化活动角色到localStorage

### 3. Axios 拦截器配置 (任务 18.4)

#### 3.1 请求拦截器

- **文件**: `src/api/request.ts`
- **功能**:
  - 自动添加JWT token到请求头
  - 添加用户ID到请求头
  - 添加请求时间戳

#### 3.2 响应拦截器

- **功能**:
  - **401 未授权处理**:
    - 自动刷新token
    - 请求队列管理，避免重复刷新
    - 刷新失败时清除认证状态并重定向到登录页
  - **403 权限不足处理**:
    - 显示错误提示
    - 重定向到403页面
  - **其他错误处理**:
    - 404: 资源不存在
    - 500: 服务器错误
    - 502/503/504: 服务不可用

### 4. 角色切换组件 (RoleSwitcher)

#### 4.1 组件功能

- **文件**: `src/components/common/RoleSwitcher/index.tsx`
- **功能**:
  - 显示用户当前活动角色
  - 下拉菜单显示所有可用角色
  - 点击角色进行切换
  - 切换成功后跳转到对应角色的首页
  - 单角色用户不显示切换按钮

#### 4.2 集成到布局

- **文件**: `src/layouts/MainLayout.tsx`
- **位置**: 顶部导航栏，通知图标左侧

### 5. 登录后角色重定向

#### 5.1 Login 页面增强

- **文件**: `src/pages/auth/Login.tsx`
- **功能**:
  - 登录成功后根据用户角色重定向到对应首页
  - 如果有来源页面，优先返回来源页面
  - 使用 `getDefaultHomePath()` 函数获取默认首页路径

## 角色定义

系统支持三种用户角色：

| 角色     | 代码      | 显示名称 | 默认首页             |
| -------- | --------- | -------- | -------------------- |
| 普通用户 | USER      | 普通用户 | /                    |
| 咨询师   | COUNSELOR | 咨询师   | /counselor/dashboard |
| 管理员   | ADMIN     | 管理员   | /admin/dashboard     |

## 使用示例

### 1. 保护需要特定角色的路由

```typescript
// 在 router/index.tsx 中配置
{
  path: '/counselor',
  element: (
    <PrivateRoute requiredRoles={['COUNSELOR']}>
      <CounselorLayout />
    </PrivateRoute>
  ),
  children: [
    {
      path: 'dashboard',
      element: <CounselorDashboard />,
    },
  ],
}
```

### 2. 在组件中检查用户角色

```typescript
import { useAuthStore } from '@/store'

function MyComponent() {
  const { hasRole, hasAnyRole } = useAuthStore()

  // 检查单个角色
  if (hasRole('ADMIN')) {
    // 显示管理员功能
  }

  // 检查多个角色
  if (hasAnyRole(['COUNSELOR', 'ADMIN'])) {
    // 显示咨询师或管理员功能
  }
}
```

### 3. 切换用户角色

```typescript
import { useAuthStore } from '@/store'

function MyComponent() {
  const { switchRole } = useAuthStore()

  const handleSwitchToCounselor = async () => {
    try {
      await switchRole('COUNSELOR')
      // 切换成功，会自动跳转到咨询师首页
    } catch (error) {
      // 处理错误
    }
  }
}
```

## API 接口

### 1. 角色切换接口

```
POST /api/users/{userId}/switch-role
Content-Type: application/json

Request Body:
{
  "activeRole": "COUNSELOR"
}

Response:
{
  "code": 200,
  "message": "角色切换成功",
  "data": {
    "userId": 1,
    "activeRole": "COUNSELOR",
    "token": "new_jwt_token_with_active_role"
  }
}
```

### 2. Token 刷新接口

```
POST /api/users/refresh?refreshToken={refreshToken}

Response:
{
  "code": 200,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token",
    "user": {
      "id": 1,
      "username": "user",
      "roles": ["USER", "COUNSELOR"]
    }
  }
}
```

## 安全考虑

1. **Token 管理**:
   - Access token 和 refresh token 分离
   - Token 过期自动刷新
   - 刷新失败自动登出

2. **权限验证**:
   - 前端路由守卫验证
   - 后端API接口验证（双重验证）
   - 403错误统一处理

3. **状态持久化**:
   - 使用 localStorage 持久化认证状态
   - 页面刷新后保持登录状态
   - 敏感信息加密存储

## 后续任务

以下功能将在后续任务中实现：

1. **咨询师路由和页面** (任务 20-26):
   - 咨询师工作台
   - 时间表管理
   - 预约管理
   - 咨询记录管理
   - 收入统计
   - 个人资料管理

2. **管理员路由和页面** (任务 27-30):
   - 管理员仪表板
   - 咨询师审核
   - 用户管理
   - 系统日志

3. **单元测试** (任务 18.2):
   - 路由守卫测试
   - 角色切换测试
   - 权限验证测试

4. **属性测试** (任务 18.3):
   - 登录后角色路由重定向
   - 无权限路由访问保护

## 文件清单

### 新增文件

- `src/router/index.tsx` - 路由配置
- `src/pages/Forbidden.tsx` - 403页面
- `src/components/common/RoleSwitcher/index.tsx` - 角色切换组件
- `web-frontend/ROLE_BASED_ACCESS_CONTROL.md` - 本文档

### 修改文件

- `src/store/authStore.ts` - 增强角色管理功能
- `src/api/request.ts` - 改进错误处理和token刷新
- `src/components/common/PrivateRoute/index.tsx` - 支持角色验证
- `src/components/common/index.ts` - 导出RoleSwitcher
- `src/App.tsx` - 使用新的路由配置
- `src/pages/auth/Login.tsx` - 角色重定向
- `src/layouts/MainLayout.tsx` - 集成RoleSwitcher

## 测试建议

1. **功能测试**:
   - 测试不同角色用户登录后的重定向
   - 测试角色切换功能
   - 测试无权限访问的拦截
   - 测试token过期后的自动刷新

2. **边界测试**:
   - 测试单角色用户（不显示切换按钮）
   - 测试多角色用户（显示切换按钮）
   - 测试未登录用户访问受保护路由
   - 测试token刷新失败的处理

3. **安全测试**:
   - 测试前端路由守卫
   - 测试后端API权限验证
   - 测试token篡改检测

## 总结

本次实现完成了前端基于角色的访问控制系统的核心功能，包括：

✅ 路由配置和权限守卫
✅ Zustand状态管理增强
✅ Axios拦截器配置
✅ 角色切换组件
✅ 403页面
✅ 登录后角色重定向

系统现在支持三种用户角色（USER、COUNSELOR、ADMIN），并提供了完整的权限验证和角色切换功能。后续任务将基于此基础实现具体的角色页面和功能。
