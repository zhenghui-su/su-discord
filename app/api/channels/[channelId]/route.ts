import { NextResponse } from "next/server"

import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { MemberRole } from "@prisma/client"

/**
 *  用于删除服务器中的频道的API
 *
 * @param req 传入服务器id
 * @param param1 传入频道id
 * @returns
 */
export async function DELETE(
	req: Request,
	{ params }: { params: { channelId: string } }
) {
	try {
		const profile = await currentProfile()
		const { searchParams } = new URL(req.url)

		const serverId = searchParams.get("serverId")
		const channelId = params.channelId

		if (!profile) {
			return new NextResponse("Unauthorized", { status: 401 })
		}

		if (!serverId) {
			return new NextResponse("Server ID missing", { status: 400 })
		}

		if (!channelId) {
			return new NextResponse("Channel ID missing", { status: 400 })
		}

		const server = await db.server.update({
			// 找到对应的服务器同时只有
			// 管理员和版主可以删除频道
			where: {
				id: serverId,
				members: {
					some: {
						profileId: profile.id,
						role: {
							in: [MemberRole.ADMIN, MemberRole.MODERATOR],
						},
					},
				},
			},
			// 删除频道, 并且频道不能是初始化的general
			data: {
				channels: {
					delete: {
						id: channelId,
						name: {
							not: "general",
						},
					},
				},
			},
		})

		return NextResponse.json(server)
	} catch (error) {
		console.log("[CHANNEL_ID_DELETE]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}

/**
 *  用于编辑服务器中的频道的API
 *
 * @param req 传入频道名字和类型,服务器id
 * @param param1 传入频道id
 * @returns
 */
export async function PATCH(
	req: Request,
	{ params }: { params: { channelId: string } }
) {
	try {
		const profile = await currentProfile()
		const { name, type } = await req.json()
		const { searchParams } = new URL(req.url)

		const serverId = searchParams.get("serverId")
		const channelId = params.channelId

		if (!profile) {
			return new NextResponse("Unauthorized", { status: 401 })
		}

		if (!serverId) {
			return new NextResponse("Server ID missing", { status: 400 })
		}

		if (!channelId) {
			return new NextResponse("Channel ID missing", { status: 400 })
		}

		if (name === "general") {
			return new NextResponse("Name cannot be 'general'", { status: 400 })
		}

		const server = await db.server.update({
			// 找到对应的服务器同时只有
			// 管理员和版主可以编辑频道
			where: {
				id: serverId,
				members: {
					some: {
						profileId: profile.id,
						role: {
							in: [MemberRole.ADMIN, MemberRole.MODERATOR],
						},
					},
				},
			},
			// 编辑频道, 并且频道不能是初始化的general
			data: {
				channels: {
					update: {
						where: {
							id: channelId,
							NOT: {
								name: "general",
							},
						},
						data: {
							name,
							type,
						},
					},
				},
			},
		})

		return NextResponse.json(server)
	} catch (error) {
		console.log("[CHANNEL_ID_PATCH]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
