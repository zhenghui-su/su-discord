import { NextResponse } from "next/server"
import { MemberRole } from "@prisma/client"

import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"

/**
 * 用于创建服务器中频道的API
 *
 * @param req 传入服务器Id和创建频道的名称类型
 */
export async function POST(req: Request) {
	try {
		const profile = await currentProfile()
		const { name, type } = await req.json()
		const { searchParams } = new URL(req.url)

		const serverId = searchParams.get("serverId")

		if (!profile) {
			return new NextResponse("Unauthorized", { status: 401 })
		}

		if (!serverId) {
			return new NextResponse("Server ID missing", { status: 400 })
		}

		if (name === "general") {
			return new NextResponse("Name cannot be 'general'", { status: 400 })
		}

		const server = await db.server.update({
			where: {
				id: serverId,
				members: {
					some: {
						profileId: profile.id,
						role: {
							// 只有当前用户是管理员或版主(主持人)才能创建频道
							in: [MemberRole.ADMIN, MemberRole.MODERATOR],
						},
					},
				},
			},
			data: {
				channels: {
					create: {
						profileId: profile.id,
						name,
						type,
					},
				},
			},
		})

		return NextResponse.json(server)
	} catch (error) {
		console.log("CHANNELS_POST", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
