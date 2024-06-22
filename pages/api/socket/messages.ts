import { NextApiRequest } from "next"
import { NextApiResponseServerIo } from "@/types"

import { currentProfilePages } from "@/lib/current-profile-pages"
import { db } from "@/lib/db"

/**
 * 用于发送消息,将其上传数据库且通知到socket的API
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
		return res.status(405).json({ message: "Method not allowed" })
	}

	try {
		const profile = await currentProfilePages(req)
		const { content, fileUrl } = req.body
		const { serverId, channelId } = req.query

		if (!profile) {
			return res.status(401).json({ message: "Unauthorized" })
		}

		if (!serverId) {
			return res.status(400).json({ message: "Server ID missing" })
		}

		if (!channelId) {
			return res.status(400).json({ message: "Channel ID missing" })
		}

		if (!content) {
			return res.status(400).json({ message: "Content missing" })
		}
		/**
		 * 聊天的服务器
		 */
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
			return res.status(404).json({ message: "Server not found" })
		}
		/**
		 * 聊天的频道
		 */
		const channel = await db.channel.findFirst({
			where: {
				id: channelId as string,
				serverId: serverId as string,
			},
		})

		if (!channel) {
			return res.status(404).json({ message: "Channel not found" })
		}
		/**
		 * 发送消息的成员
		 */
		const member = server.members.find(
			(member) => member.profileId === profile.id
		)

		if (!member) {
			return res.status(404).json({ message: "Member not found" })
		}

		/**
		 * 发送的消息-添加到数据库
		 */
		const message = await db.message.create({
			data: {
				content,
				fileUrl,
				channelId: channelId as string,
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

		const channelKey = `chat:${channelId}:messages`
		// 将消息通知到socket服务器
		res?.socket?.server?.io?.emit(channelKey, message)

		return res.status(200).json(message)
	} catch (error) {
		console.log("[MESSAGES_POST]", error)
		return res.status(500).json({ message: "Internal Error" })
	}
}
