import { NextResponse } from "next/server"
import { Message } from "@prisma/client"

import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"

/**
 * 每次查询的最大消息数
 */
const MESSAGES_BATCH = 10

/**
 * 用于获取聊天消息的API
 * - 使用分页查询，每次查询 10 条消息
 *
 * @param {Request} req - 请求对象
 * @returns {Promise<NextResponse>} 响应对象，包含消息数据或错误信息
 */
export async function GET(req: Request): Promise<NextResponse> {
	try {
		// 获取当前用户的 profile
		const profile = await currentProfile()
		const { searchParams } = new URL(req.url)
		/**
		 * 当前处于的消息游标
		 */
		const cursor = searchParams.get("cursor")
		const channelId = searchParams.get("channelId")

		// 如果用户未授权，返回 401 错误
		if (!profile) {
			return new NextResponse("Unauthorized", { status: 401 })
		}

		// 如果缺少 channelId，返回 400 错误
		if (!channelId) {
			return new NextResponse("Channel ID missing", { status: 400 })
		}

		/**
		 * 消息列表
		 * @type {Message[]}
		 */
		let messages: Message[] = []

		// 如果存在游标，进行分页查询
		if (cursor) {
			messages = await db.message.findMany({
				take: MESSAGES_BATCH,
				// 跳过当前游标消息
				skip: 1,
				cursor: {
					id: cursor,
				},
				where: {
					channelId,
				},
				include: {
					member: {
						include: {
							profile: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			})
		} else {
			// 如果不存在游标，查询最新的消息
			messages = await db.message.findMany({
				take: MESSAGES_BATCH,
				where: {
					channelId,
				},
				include: {
					member: {
						include: {
							profile: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			})
		}

		// 下一页的游标
		let nextCursor = null

		// 如果查询到的消息数等于 MESSAGES_BATCH，设置 nextCursor 为最后一条消息的 id
		if (messages.length === MESSAGES_BATCH) {
			nextCursor = messages[MESSAGES_BATCH - 1].id
		}

		// 返回查询到的消息和下一页的游标
		return NextResponse.json({
			items: messages,
			nextCursor,
		})
	} catch (error) {
		// 打印错误并返回 500 错误
		console.log("[MESSAGES_GET]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
