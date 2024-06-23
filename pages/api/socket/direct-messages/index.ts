import { NextApiRequest } from "next"

import { NextApiResponseServerIo } from "@/types"
import { currentProfilePages } from "@/lib/current-profile-pages"
import { db } from "@/lib/db"

/**
 * 用于发送消息,将其上传数据库且通知到socket的API
 * - 该API用于成员之间的聊天
 *
 * @param req
 * @param res
 * @returns
 */
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponseServerIo
) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" })
	}

	try {
		const profile = await currentProfilePages(req)
		const { content, fileUrl } = req.body
		const { conversationId } = req.query

		if (!profile) {
			return res.status(401).json({ error: "Unauthorized" })
		}

		if (!conversationId) {
			return res.status(400).json({ error: "Conversation ID missing" })
		}

		if (!content) {
			return res.status(400).json({ error: "Content missing" })
		}
		// 获取两个成员之间的会话
		const conversation = await db.conversation.findFirst({
			where: {
				id: conversationId as string,
				OR: [
					{
						memberOne: {
							profileId: profile.id,
						},
					},
					{
						memberTwo: {
							profileId: profile.id,
						},
					},
				],
			},
			include: {
				memberOne: {
					include: {
						profile: true,
					},
				},
				memberTwo: {
					include: {
						profile: true,
					},
				},
			},
		})

		if (!conversation) {
			return res.status(404).json({ message: "Conversation not found" })
		}
		// 找到成员
		const member =
			conversation.memberOne.profileId === profile.id
				? conversation.memberOne
				: conversation.memberTwo

		if (!member) {
			return res.status(404).json({ message: "Member not found" })
		}
		// 创建消息
		const message = await db.directMessage.create({
			data: {
				content,
				fileUrl,
				conversationId: conversationId as string,
				memberId: member.id,
			},
			include: {
				member: {
					include: {
						profile: true,
					},
				},
			},
		})

		const channelKey = `chat:${conversationId}:messages`
		// 通知给socket服务器
		res?.socket?.server?.io?.emit(channelKey, message)

		return res.status(200).json(message)
	} catch (error) {
		console.log("[DIRECT_MESSAGES_POST]", error)
		return res.status(500).json({ message: "Internal Error" })
	}
}
