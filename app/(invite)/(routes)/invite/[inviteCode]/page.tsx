import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

interface InviteCodePageProps {
	params: {
		inviteCode: string
	}
}

/**
 * 被邀请成员进入的页面处理
 *
 * @param param0 传入邀请码 inviteCode
 * @returns
 */
const InviteCodePage = async ({ params }: InviteCodePageProps) => {
	const profile = await currentProfile()

	if (!profile) {
		return auth().redirectToSignIn()
	}

	if (!params.inviteCode) {
		return redirect("/")
	}
	/**
	 * 先找出是否已经加入过该服务器
	 */
	const existingServer = await db.server.findFirst({
		where: {
			inviteCode: params.inviteCode,
			members: {
				some: {
					profileId: profile.id,
				},
			},
		},
	})
	// 如果已经加入过该服务器，则直接跳转到该服务器
	if (existingServer) {
		return redirect(`/servers/${existingServer.id}`)
	}
	/**
	 * 如果没有加入过该服务器，则更新服务器信息，添加该成员
	 */
	const server = await db.server.update({
		where: {
			inviteCode: params.inviteCode,
		},
		data: {
			members: {
				create: [
					{
						profileId: profile.id,
					},
				],
			},
		},
	})

	if (server) {
		return redirect(`/servers/${server.id}`)
	}

	return (
		<div>
			<p>Hello Invite</p>
		</div>
	)
}

export default InviteCodePage
