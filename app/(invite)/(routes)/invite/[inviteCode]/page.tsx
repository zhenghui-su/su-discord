import { redirectToSignIn } from "@clerk/nextjs"
import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { currentProfile } from "@/lib/current-profile"

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
		return redirectToSignIn()
	}

	if (!params.inviteCode) {
		return redirect("/")
	}

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

	if (existingServer) {
		return redirect(`/servers/${existingServer.id}`)
	}

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

	return null
}

export default InviteCodePage
