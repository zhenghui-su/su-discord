import { NextApiRequest } from "next"

import { NextApiResponseServerIo } from "@/types"
import { currentProfilePages } from "@/lib/current-profile-pages"
import { db } from "@/lib/db"
import { MemberRole } from "@prisma/client"

/**
 * 用于处理编辑/删除所发聊天消息的API
 *
 * @param req
 * @param res
 */
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponseServerIo
) {
	if (req.method !== "DELETE" && req.method !== "PATCH") {
		return res.status(405).json({ error: "Method not allowed" })
	}

	try {
		const profile = await currentProfilePages(req)
		const { messageId, serverId, channelId } = req.query
		const { content } = req.body

		if (!profile) {
			return res.status(401).json({ error: "Unauthorized" })
		}

		if (!serverId) {
			return res.status(400).json({ error: "Server ID missing" })
		}

		if (!channelId) {
			return res.status(400).json({ error: "Channel ID missing" })
		}
		// 找到对应服务器
		const server = await db.server.findFirst({
			where: {
				id: serverId as string,
				members: {
					some: {
						profileId: profile.id,
					},
				},
			},
			include: {
				members: true,
			},
		})

		if (!server) {
			return res.status(404).json({ error: "Server not found" })
		}

		// 找到对应频道
		const channel = await db.channel.findFirst({
			where: {
				id: channelId as string,
				serverId: serverId as string,
			},
		})

		if (!channel) {
			return res.status(404).json({ error: "Channel not found" })
		}

		// 找到对应成员
		const member = server.members.find(
			(member) => member.profileId === profile.id
		)

		if (!member) {
			return res.status(404).json({ error: "Member not found" })
		}

		// 找到对应消息
		let message = await db.message.findFirst({
			where: {
				id: messageId as string,
				channelId: channelId as string,
			},
			include: {
				member: {
					include: {
						profile: true,
					},
				},
			},
		})

		if (!message || message.deleted) {
			return res.status(404).json({ error: "Message not found" })
		}
		// 是否是消息所发者
		const isMessageOwner = message.memberId === member.id
		// 是否是管理员
		const isAdmin = member.role === MemberRole.ADMIN
		// 是否是版主
		const isModerator = member.role === MemberRole.MODERATOR
		// 能否修改
		const canModify = isMessageOwner || isAdmin || isModerator

		if (!canModify) {
			return res.status(401).json({ error: "Unauthorized" })
		}

		if (req.method === "DELETE") {
			message = await db.message.update({
				where: {
					id: messageId as string,
				},
				data: {
					fileUrl: null,
					content: "This message has been deleted",
					deleted: true,
				},
				include: {
					member: {
						include: {
							profile: true,
						},
					},
				},
			})
		}

		if (req.method === "PATCH") {
			if (!isMessageOwner) {
				// 只有消息所有者才能修改
				return res.status(401).json({ error: "Unauthorized" })
			}
			message = await db.message.update({
				where: {
					id: messageId as string,
				},
				data: {
					content,
				},
				include: {
					member: {
						include: {
							profile: true,
						},
					},
				},
			})
		}

		const updateKey = `chat:${channelId}:messages:update`

		// 通知socket服务器
		res?.socket?.server?.io?.emit(updateKey, message)

		return res.status(200).json(message)
	} catch (error) {
		console.log("[MESSAGE_ID]", error)
		return res.status(500).json({ error: "Internal Error" })
	}
}
