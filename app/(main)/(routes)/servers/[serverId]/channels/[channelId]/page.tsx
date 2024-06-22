import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { ChatHeader } from "@/components/chat/chat-header"
import ChatInput from "@/components/chat/chat-input"
import { ChatMessages } from "@/components/chat/chat-messages"

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
			{/* 聊天界面消息内容区域 */}
			<ChatMessages
				member={member}
				name={channel.name}
				chatId={channel.id}
				type='channel'
				apiUrl='/api/messages'
				socketUrl='/api/socket/messages'
				socketQuery={{
					channelId: channel.id,
					serverId: channel.serverId,
				}}
				paramKey='channelId'
				paramValue={channel.id}
			/>
			{/* 聊天界面输入栏 */}
			<ChatInput
				name={channel.name}
				type='channel'
				apiUrl='/api/socket/messages'
				query={{
					channelId: channel.id,
					serverId: channel.serverId,
				}}
			/>
		</div>
	)
}

export default ChannelIdPage
