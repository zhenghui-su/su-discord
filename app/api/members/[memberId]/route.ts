import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * 用于成员管理-对成员身份进行修改的API
 *
 * @param req
 * @param param1 传入成员的id
 * @returns
 */
export async function PATCH(
	req: Request,
	{ params }: { params: { memberId: string } }
) {
	try {
		const profile = await currentProfile()
		const { searchParams } = new URL(req.url)
		const { role } = await req.json()

		const serverId = searchParams.get("serverId")
		const memberId = params.memberId

		if (!profile) {
			return new NextResponse("Unauthorized", { status: 401 })
		}

		if (!serverId) {
			return new NextResponse("Server ID missing", { status: 400 })
		}

		if (!memberId) {
			return new NextResponse("Member ID missing", { status: 400 })
		}

		const server = await db.server.update({
			where: {
				id: serverId,
				profileId: profile.id,
			},
			data: {
				members: {
					update: {
						where: {
							id: memberId,
							profileId: {
								not: profile.id,
							},
						},
						data: {
							role: role,
						},
					},
				},
			},
			// 关联服务器中的所有成员, 将身份重新升序排序
			include: {
				members: {
					include: {
						profile: true,
					},
					orderBy: {
						role: "asc",
					},
				},
			},
		})

		return NextResponse.json(server)
	} catch (error) {
		console.log("[MEMBER_ID_PATCH]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}

/**
 * 用于成员管理-踢走成员的API
 * @param params
 */
export async function DELETE(
	req: Request,
	{ params }: { params: { memberId: string } }
) {
	try {
		const profile = await currentProfile()
		const { searchParams } = new URL(req.url)

		const serverId = searchParams.get("serverId")
		const memberId = params.memberId

		if (!profile) {
			return new NextResponse("Unauthorized", { status: 401 })
		}

		if (!serverId) {
			return new NextResponse("Server ID missing", { status: 400 })
		}

		if (!memberId) {
			return new NextResponse("Member ID missing", { status: 400 })
		}

		const server = await db.server.update({
			where: {
				id: serverId,
				profileId: profile.id,
			},
			data: {
				members: {
					deleteMany: {
						id: memberId,
						// 不踢走当前用户, 自己不能踢走自己
						profileId: {
							not: profile.id,
						},
					},
				},
			},
			include: {
				members: {
					include: {
						profile: true,
					},
					orderBy: {
						role: "asc",
					},
				},
			},
		})

		return NextResponse.json(server)
	} catch (error) {
		console.log("[MEMBER_ID_DELETE]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
