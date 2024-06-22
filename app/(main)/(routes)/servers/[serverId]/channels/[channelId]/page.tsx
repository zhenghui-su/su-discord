import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { ChatHeader } from "@/components/chat/chat-header"

interface ChannelIdPageProps {
	params: {
		serverId: string
		channelId: string
	}
}
/**
 *
 * @param param0 传入服务器id和频道id
 * @returns 对应的频道聊天界面
 */
const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
	const profile = await currentProfile()

	if (!profile) {
		return auth().redirectToSignIn()
	}

	// 找到和该频道相关的内容
	const channel = await db.channel.findUnique({
		where: {
			id: params.channelId,
		},
	})
	// 找到成员的相关内容
	const member = await db.member.findFirst({
		where: {
			serverId: params.serverId,
			profileId: profile.id,
		},
	})

	if (!channel || !member) {
		redirect("/")
	}

	return (
		<div className='bg-white dark:bg-[#313338] flex flex-col h-full'>
			{/* 聊天页面头部 */}
			<ChatHeader
				serverId={channel.serverId}
				name={channel.name}
				type='channel'
			/>
		</div>
	)
}

export default ChannelIdPage
