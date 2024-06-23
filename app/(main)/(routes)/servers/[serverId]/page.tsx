import { redirectToSignIn } from "@clerk/nextjs"
import { redirect } from "next/navigation"

import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"

interface ServerIdPageProps {
	params: {
		serverId: string
	}
}
/**
 * 初始进入的页面
 * 1. 检查用户是否登录
 * 2. 找到用户的服务器
 * 3. 检查服务器是否包含通用频道 general
 * 4. 重定向到通用频道 general
 */
const ServerIdPage = async ({ params }: ServerIdPageProps) => {
	const profile = await currentProfile()

	if (!profile) {
		return redirectToSignIn()
	}

	// 找到对应的服务器
	const server = await db.server.findUnique({
		where: {
			id: params.serverId,
			members: {
				some: {
					profileId: profile.id,
				},
			},
		},
		include: {
			channels: {
				where: {
					name: "general",
				},
				orderBy: {
					createdAt: "asc",
				},
			},
		},
	})
	// 找到服务器中的第一个通用频道 即 general
	const initialChannel = server?.channels[0]

	if (initialChannel?.name !== "general") {
		return null
	}
	// 重定向到第一个通用频道 即 general
	return redirect(`/servers/${params.serverId}/channels/${initialChannel?.id}`)
}

export default ServerIdPage
