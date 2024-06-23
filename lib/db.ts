import { PrismaClient } from "@prisma/client"

declare global {
	var prisma: PrismaClient | undefined
}
// 减少开发环境下热重载多次初始化prisma客户端
export const db = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalThis.prisma = db
