import { v4 as uuidv4 } from "uuid"
import { NextResponse } from "next/server"

import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"

/**
 * 用于重新生成 inviteCode(邀请码) 的 Api
 *
 * @param param1 传入服务器的 id
 * @returns 返回新的server数据
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
				id: params.serverId,
				profileId: profile.id,
			},
			data: {
				inviteCode: uuidv4(),
			},
		})

		return NextResponse.json(server)
	} catch (error) {
		console.log("[SERVER_ID]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
