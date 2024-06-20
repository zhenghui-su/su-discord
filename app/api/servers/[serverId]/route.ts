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
