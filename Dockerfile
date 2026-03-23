# ========= 构建阶段 =========
FROM node:18-alpine AS build
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm install --legacy-peer-deps

# 复制源代码
COPY . .

# 构建参数
ARG VITE_GEMINI_API_KEY
ARG VITE_API_BASE_URL

# 创建 .env.production 文件
RUN echo "VITE_API_BASE_URL=${VITE_API_BASE_URL}" > .env.production && \
    echo "VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}" >> .env.production && \
    echo "VITE_APP_TITLE=心理健康平台" >> .env.production && \
    echo "VITE_APP_VERSION=1.0.0" >> .env.production && \
    echo "VITE_ENV=production" >> .env.production && \
    echo "VITE_WS_URL=ws://gateway:8080/ws" >> .env.production && \
    echo "VITE_DEBUG=false" >> .env.production && \
    echo "VITE_LOG_LEVEL=error" >> .env.production && \
    echo "VITE_ENABLE_MOCK=false" >> .env.production

# 调试：显示环境变量文件
RUN cat .env.production

# 构建应用（仅构建，不进行类型检查）
RUN npx vite build || (echo "=== Build failed ===" && ls -la && exit 1)

# ========= 运行阶段 =========
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# 删除默认的 nginx 静态资源
RUN rm -rf ./*

# 从构建阶段复制构建产物
COPY --from=build /app/dist .

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
