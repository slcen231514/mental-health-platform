# 个人信息页面修复说明

## 问题分析

### 1. 后端API缺失

**问题**: `GET /api/users/profile` 返回 500 错误
**原因**: 后端 `UserController` 没有实现 `/profile` 端点

### 2. Spin组件警告

**问题**: `tip` 属性在非嵌套模式下使用
**原因**: Spin组件的 `tip` 属性只在嵌套或全屏模式下有效

### 3. TypeScript类型错误

**问题**: User类型缺少 `avatar` 和 `bio` 字段
**原因**: auth.ts中的User接口定义不完整

## 修复方案

### 1. 前端修复（已完成）

#### a. 修改Profile.tsx

- 移除对 `userStore` 的依赖
- 直接使用 `authStore` 中的用户信息
- 移除 `fetchUserProfile` 调用（后端API不存在）
- 修复Spin组件，移除 `tip` 属性
- 添加独立的loading状态管理

#### b. 扩展User类型

在 `web-frontend/src/api/auth.ts` 中添加：

```typescript
export interface User {
  id: number
  username: string
  email: string
  phone?: string
  gender?: string
  avatar?: string // 新增
  bio?: string // 新增
  status: string
  roles: string[]
}
```

### 2. 后端修复（待实现）

需要在 `user-service` 的 `UserController.java` 中添加以下端点：

```java
/**
 * 获取当前用户信息
 */
@GetMapping("/profile")
public Result<UserResponse> getCurrentUserProfile() {
    // 从SecurityContext获取当前用户ID
    Long userId = SecurityUtils.getCurrentUserId();
    UserResponse user = userService.getUserById(userId);
    return Result.success(user);
}

/**
 * 更新当前用户信息
 */
@PutMapping("/profile")
public Result<UserResponse> updateCurrentUserProfile(
    @Valid @RequestBody UpdateProfileRequest request
) {
    Long userId = SecurityUtils.getCurrentUserId();
    UserResponse user = userService.updateUserProfile(userId, request);
    return Result.success(user);
}

/**
 * 修改密码
 */
@PutMapping("/password")
public Result<Void> changePassword(
    @Valid @RequestBody ChangePasswordRequest request
) {
    Long userId = SecurityUtils.getCurrentUserId();
    userService.changePassword(userId, request);
    return Result.success();
}

/**
 * 上传头像
 */
@PostMapping("/avatar")
public Result<Map<String, String>> uploadAvatar(
    @RequestParam("file") MultipartFile file
) {
    Long userId = SecurityUtils.getCurrentUserId();
    String avatarUrl = userService.uploadAvatar(userId, file);
    return Result.success(Map.of("url", avatarUrl));
}
```

## 当前功能状态

### ✅ 已实现

- 个人信息展示（使用authStore中的数据）
- 编辑模式切换
- 表单验证
- 修改密码模态框
- 头像上传UI
- TypeScript类型安全

### ⚠️ 部分功能

- 信息更新（前端已实现，等待后端API）
- 头像上传（前端已实现，等待后端API）
- 密码修改（前端已实现，等待后端API）

### ❌ 待实现

- 后端 `/profile` 端点
- 后端 `/password` 端点
- 后端 `/avatar` 端点
- 文件上传服务集成

## 临时解决方案

当前页面使用 `authStore` 中登录时获取的用户信息，可以正常显示：

- 用户名
- 邮箱
- 手机号（如果有）
- 性别（如果有）
- 个人简介（如果有）
- 头像（如果有）

编辑功能的API调用已实现，但会因为后端端点缺失而失败。

## 下一步

1. **优先级高**: 实现后端 `/profile` 相关端点
2. **优先级中**: 集成文件上传服务（MinIO/OSS）
3. **优先级低**: 添加更多个人信息字段（生日、地址等）

## 测试建议

### 前端测试

```bash
cd web-frontend
npm run dev
```

访问 http://localhost:3001/profile

### 后端测试（待实现后）

```bash
# 获取个人信息
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# 更新个人信息
curl -X PUT http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","gender":"MALE","bio":"测试简介"}'

# 修改密码
curl -X PUT http://localhost:8080/api/users/password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"old123","newPassword":"new123","confirmPassword":"new123"}'
```

## 相关文件

### 前端

- `web-frontend/src/pages/Profile.tsx` - 个人信息页面
- `web-frontend/src/api/user.ts` - 用户API
- `web-frontend/src/api/auth.ts` - 认证API和User类型
- `web-frontend/src/store/authStore.ts` - 认证状态管理

### 后端（待修改）

- `user-service/src/main/java/com/mentalhealth/user/controller/UserController.java`
- `user-service/src/main/java/com/mentalhealth/user/service/UserService.java`
- `user-service/src/main/java/com/mentalhealth/user/dto/UpdateProfileRequest.java` (新建)
- `user-service/src/main/java/com/mentalhealth/user/dto/ChangePasswordRequest.java` (新建)
