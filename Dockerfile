# 使用官方的 Node.js 18 版本作为基础镜像
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）到工作目录
COPY package.json package-lock.json* ./

# 安装所有依赖
RUN npm install --frozen-lockfile

# 复制 Prisma schema 文件
COPY prisma ./prisma

# 运行 Prisma generate（生成 Prisma 客户端）
RUN npx prisma generate

# 复制所有项目文件到工作目录
COPY . .

# 构建 Next.js 项目
RUN npm run build

# 使用一个精简的 Node.js 运行时镜像用于生产环境
FROM node:18-alpine AS runner

# 设置工作目录
WORKDIR /app

# 仅安装生产环境依赖
COPY package.json package-lock.json* ./
RUN npm install --only=production --frozen-lockfile

# 从构建阶段复制项目和 Prisma 客户端
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/.env ./.env

# 确保 middleware.ts 文件也被复制
COPY --from=builder /app/middleware.ts ./middleware.ts

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 暴露应用运行的端口
EXPOSE 3000

# 启动 Next.js 应用
CMD ["npm", "run", "start"]
