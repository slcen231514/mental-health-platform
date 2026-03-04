# 环境变量配置指南

## 概述

本项目使用 Vite 的环境变量管理功能，支持多环境配置。

## 环境变量文件

- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置
- `.env.local` - 本地覆盖配置（不提交到版本控制）
- `.env.example` - 配置模板文件

## 快速开始

1. 复制模板文件：
```bash
cp .env.example .env.local
```

2. 编辑 `.env.local` 文件，填入实际的配置值：
```env
VITE_GEMINI_API_KEY=your-actual-api-key
```

3. 启动开发服务器：
```bash
npm run dev
```

## 环境变量说明

### API 配置

- `VITE_API_BASE_URL` - API 基础 URL
  - 开发环境：`http://localhost:8080`
  - 生产环境：`https://api.mentalhealth.com`

- `VITE_WS_URL` - WebSocket 连接 URL
  - 开发环境：`ws://localhost:8080/ws`
  - 生产环境：`wss://api.mentalhealth.com/ws`

### 应用配置

- `VITE_APP_TITLE` - 应用标题
- `VITE_APP_VERSION` - 应用版本号
- `VITE_ENV` - 环境标识（development/production/test）

### 第三方服务

- `VITE_GEMINI_API_KEY` - Gemini API 密钥（敏感信息）

### 调试配置

- `VITE_DEBUG` - 是否启用调试模式（true/false）
- `VITE_LOG_LEVEL` - 日志级别（debug/info/warn/error）
- `VITE_ENABLE_MOCK` - 是否启用 Mock 数据（true/false）

## 在代码中使用

### 方式一：直接使用（不推荐）

```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

### 方式二：通过配置模块（推荐）

```typescript
import env from '@/config/env'

const apiUrl = env.apiBaseUrl
const isDebug = env.debug
```

## 环境切换

Vite 会根据运行命令自动加载对应的环境变量文件：

- `npm run dev` - 加载 `.env.development`
- `npm run build` - 加载 `.env.production`

本地配置文件 `.env.local` 会覆盖其他环境配置。

## 安全注意事项

1. **永远不要提交敏感信息**
   - `.env.local` 已添加到 `.gitignore`
   - 敏感的 API 密钥应该只存在于 `.env.local` 中

2. **环境变量命名规则**
   - 必须以 `VITE_` 开头才能在客户端代码中访问
   - 不以 `VITE_` 开头的变量只能在 Vite 配置文件中使用

3. **生产环境配置**
   - 生产环境的敏感配置应该通过 CI/CD 系统注入
   - 不要在代码仓库中存储生产环境的真实密钥

## 类型安全

项目已配置 TypeScript 类型定义（`src/vite-env.d.ts`），可以获得环境变量的类型提示和检查。

## 故障排查

### 环境变量未生效

1. 确认变量名以 `VITE_` 开头
2. 修改环境变量后需要重启开发服务器
3. 检查 `.env.local` 是否正确配置

### 类型错误

确保 `src/vite-env.d.ts` 文件包含了所有使用的环境变量定义。
