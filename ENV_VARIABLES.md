# 环境变量配置说明
# Environment Variables Configuration Guide

## 概述 (Overview)

本项目使用 Vite 的环境变量管理系统。所有环境变量必须以 `VITE_` 前缀开头才能在客户端代码中访问。

This project uses Vite's environment variable management system. All environment variables must be prefixed with `VITE_` to be accessible in client-side code.

## 环境文件 (Environment Files)

### 1. `.env.development` - 开发环境
- **用途**: 本地开发时使用
- **加载时机**: 运行 `npm run dev` 时自动加载
- **版本控制**: ✅ 已提交到 Git
- **配置说明**:
  - `VITE_API_BASE_URL`: 指向本地后端服务 (http://localhost:8080)
  - `VITE_DEBUG`: 启用调试模式
  - `VITE_LOG_LEVEL`: 设置为 debug 以查看详细日志

### 2. `.env.production` - 生产环境
- **用途**: 生产环境部署时使用
- **加载时机**: 运行 `npm run build` 时自动加载
- **版本控制**: ✅ 已提交到 Git
- **配置说明**:
  - `VITE_API_BASE_URL`: 需要配置为实际的生产环境 API 地址
  - `VITE_DEBUG`: 关闭调试模式
  - `VITE_LOG_LEVEL`: 设置为 error 以减少日志输出

### 3. `.env.example` - 配置模板
- **用途**: 作为环境变量配置的参考模板
- **版本控制**: ✅ 已提交到 Git
- **使用方法**: 复制为 `.env.local` 并填入实际值

### 4. `.env.local` - 本地覆盖配置
- **用途**: 本地开发时覆盖默认配置
- **优先级**: 最高（会覆盖其他环境文件）
- **版本控制**: ❌ 不提交到 Git（已在 .gitignore 中排除）
- **使用场景**: 
  - 本地特殊配置
  - 敏感信息（API 密钥等）
  - 个人开发偏好设置

## 环境变量列表 (Environment Variables)

### API 配置

| 变量名 | 说明 | 开发环境默认值 | 生产环境默认值 |
|--------|------|---------------|---------------|
| `VITE_API_BASE_URL` | API 基础 URL | `http://localhost:8080` | `https://api.mentalhealth.com` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:8080/ws` | `wss://api.mentalhealth.com/ws` |

### 应用配置

| 变量名 | 说明 | 开发环境默认值 | 生产环境默认值 |
|--------|------|---------------|---------------|
| `VITE_APP_TITLE` | 应用标题 | `心理健康平台 - 开发环境` | `心理健康平台` |
| `VITE_APP_VERSION` | 应用版本 | `1.0.0` | `1.0.0` |
| `VITE_ENV` | 环境标识 | `development` | `production` |

### 第三方服务

| 变量名 | 说明 | 必需 | 获取方式 |
|--------|------|------|---------|
| `VITE_GEMINI_API_KEY` | Gemini AI API 密钥 | ✅ | [Google AI Studio](https://makersuite.google.com/app/apikey) |

### 调试配置

| 变量名 | 说明 | 可选值 | 默认值 |
|--------|------|--------|--------|
| `VITE_DEBUG` | 是否启用调试模式 | `true`, `false` | `true` (dev), `false` (prod) |
| `VITE_LOG_LEVEL` | 日志级别 | `debug`, `info`, `warn`, `error` | `debug` (dev), `error` (prod) |
| `VITE_ENABLE_MOCK` | 是否启用 Mock 数据 | `true`, `false` | `false` |

## 使用方法 (Usage)

### 在代码中访问环境变量

```typescript
// 方式 1: 直接使用 import.meta.env
const apiUrl = import.meta.env.VITE_API_BASE_URL

// 方式 2: 使用封装的 env 配置对象（推荐）
import env from '@/config/env'

const apiUrl = env.apiBaseUrl
const isDebug = env.debug
const isDev = env.isDevelopment
```

### TypeScript 类型支持

环境变量的类型定义在 `src/vite-env.d.ts` 中：

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENV: string
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_DEBUG: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_ENABLE_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## 配置步骤 (Setup Steps)

### 1. 开发环境配置

```bash
# 1. 复制示例文件（可选）
cp .env.example .env.local

# 2. 编辑 .env.local，填入实际的配置值
# 特别是 VITE_GEMINI_API_KEY

# 3. 启动开发服务器
npm run dev
```

### 2. 生产环境配置

```bash
# 1. 确保 .env.production 中的配置正确
# 特别是 VITE_API_BASE_URL 和 VITE_GEMINI_API_KEY

# 2. 构建生产版本
npm run build

# 3. 预览生产构建
npm run preview
```

### 3. Docker 部署配置

在 Docker 部署时，可以通过环境变量覆盖配置：

```dockerfile
# Dockerfile 中的构建参数
ARG VITE_API_BASE_URL=https://api.mentalhealth.com
ARG VITE_GEMINI_API_KEY

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
```

```bash
# Docker 构建时传入参数
docker build \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  --build-arg VITE_GEMINI_API_KEY=your-key \
  -t mental-health-frontend .
```

## 安全注意事项 (Security Notes)

### ⚠️ 重要提醒

1. **不要提交敏感信息到 Git**
   - `.env.local` 已被 .gitignore 排除
   - 敏感的 API 密钥应该放在 `.env.local` 中

2. **客户端可见性**
   - 所有 `VITE_` 前缀的变量都会被打包到客户端代码中
   - 不要在环境变量中存储真正的密钥（如数据库密码）
   - 对于敏感操作，应该通过后端 API 进行

3. **生产环境配置**
   - 生产环境的 API 密钥应该通过 CI/CD 系统注入
   - 不要在 `.env.production` 中硬编码真实的生产密钥

4. **环境变量验证**
   - `src/config/env.ts` 中包含必需环境变量的验证
   - 缺少必需变量时会在控制台输出错误

## 故障排查 (Troubleshooting)

### 问题 1: 环境变量未生效

**解决方案**:
1. 确保变量名以 `VITE_` 开头
2. 修改环境文件后需要重启开发服务器
3. 检查是否有 `.env.local` 覆盖了配置

### 问题 2: TypeScript 类型错误

**解决方案**:
1. 确保 `src/vite-env.d.ts` 中定义了新增的环境变量类型
2. 重启 TypeScript 服务器（VS Code: Ctrl+Shift+P -> "TypeScript: Restart TS Server"）

### 问题 3: 生产构建中环境变量不正确

**解决方案**:
1. 检查构建时使用的环境文件（默认是 `.env.production`）
2. 确认构建命令：`npm run build` 会自动使用 `.env.production`
3. 查看构建输出中的环境变量值

## 最佳实践 (Best Practices)

1. **使用 env 配置对象**
   ```typescript
   // ✅ 推荐
   import env from '@/config/env'
   const url = env.apiBaseUrl
   
   // ❌ 不推荐
   const url = import.meta.env.VITE_API_BASE_URL
   ```

2. **环境判断**
   ```typescript
   // ✅ 推荐
   if (env.isDevelopment) {
     console.log('开发模式')
   }
   
   // ❌ 不推荐
   if (import.meta.env.VITE_ENV === 'development') {
     console.log('开发模式')
   }
   ```

3. **添加新的环境变量**
   - 在所有环境文件中添加（.env.development, .env.production, .env.example）
   - 在 `src/vite-env.d.ts` 中添加类型定义
   - 在 `src/config/env.ts` 中添加导出
   - 如果是必需变量，添加到验证列表中

4. **文档更新**
   - 添加新环境变量时，更新本文档
   - 在 README.md 中说明配置步骤

## 参考资料 (References)

- [Vite 环境变量文档](https://vitejs.dev/guide/env-and-mode.html)
- [Vite 环境变量和模式](https://cn.vitejs.dev/guide/env-and-mode.html)
- [项目 README](./README.md)
