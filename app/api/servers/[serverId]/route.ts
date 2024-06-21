import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * 更新服务器信息的 API
 * @param req
 * @param param1
 */
export async function PATCH(
	req: Request,
	{ params }: { params: { serverId: string } }
) {
	try {
		const profile = await currentProfile()
		const { name, imageUrl } = await req.json()

		if (!profile) {
			return new NextResponse("Unauthorized", { status: 401 })
		}

		const server = await db.server.update({
			where: {
				id: params.serverId,
				profileId: profile.id,
			},
			data: {
				name,
				imageUrl,
			},
		})

		return NextResponse.json(server)
	} catch (error) {
		console.log("[SERVER_ID_PATCH]", error)
		return new Response("Internal Error", { status: 500 })
	}
}

/**
 * 用于管理员删除服务器的 API
 *
 *
 * @param req
 * @param param1 传入服务器Id
 * @returns
 */
export async function DELETE(
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

		const server = await db.server.delete({
			where: {
				// 找对应服务器,当前个人资料的id和服务器管理员的id一致
				id: params.serverId,
				profileId: profile.id,
			},
		})

		return NextResponse.json(server)
	} catch (error) {
		console.log("[SERVER_ID_DELETE]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
