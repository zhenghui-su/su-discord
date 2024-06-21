import { NextResponse } from "next/server"

import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"

/**
 * 用于(普通成员和版主)离开服务器的 API
 *
 *
 * @param req
 * @param param1 传入服务器Id
 * @returns
 */
export async function PATCH(
	req: Request,
	{ params }: { params: { serverId: string } }
) {
	try {
		const profile = await currentProfile()

		if (!profile) {
			return new NextResponse("Unauthorized", { status: 401 })
		}

		if (!params.serverId) {
			return new NextResponse("Server ID Missing", { status: 400 })
		}

		const server = await db.server.update({
			where: {
				// 找对应服务器,但当前个人资料的id不能和服务器管理员的id一致
				id: params.serverId,
				profileId: {
					not: profile.id,
				},
				// 这是用于离开服务器的接口,当前个人资料的id必须是服务器里面的成员
				members: {
					some: {
						profileId: profile.id,
					},
				},
			},
			data: {
				// 找到对应的服务器后, 在成员中删除当前个人资料的成员
				members: {
					deleteMany: {
						profileId: profile.id,
					},
				},
			},
		})

		return NextResponse.json(server)
	} catch (error) {
		console.log("[SERVER_ID_LEAVE]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
