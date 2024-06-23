import { redirectToSignIn } from "@clerk/nextjs"
import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { getOrCreateConversation } from "@/lib/conversation"
import { currentProfile } from "@/lib/current-profile"
import { ChatHeader } from "@/components/chat/chat-header"
import { ChatMessages } from "@/components/chat/chat-messages"
import { ChatInput } from "@/components/chat/chat-input"
import { MediaRoom } from "@/components/media-room"

interface MemberIdPageProps {
	params: {
		memberId: string
		serverId: string
	}
	searchParams: {
		video?: boolean
	}
}
/**
 * 用于成员之间聊天的界面
 *
 * @param param0
 * @returns
 */
const MemberIdPage = async ({ params, searchParams }: MemberIdPageProps) => {
	const profile = await currentProfile()

	if (!profile) {
		return redirectToSignIn()
	}

	/**
	 * 找到自己的成员信息
	 */
	const currentMember = await db.member.findFirst({
		where: {
			serverId: params.serverId,
			profileId: profile.id,
		},
		include: {
			profile: true,
		},
	})

	if (!currentMember) {
		return redirect("/")
	}

	/**
	 * 创建或找到对应的聊天对话
	 */
	const conversation = await getOrCreateConversation(
		currentMember.id,
		params.memberId
	)

	if (!conversation) {
		return redirect(`/servers/${params.serverId}`)
	}
	// 从聊天对话从获取两个成员
	const { memberOne, memberTwo } = conversation

	const otherMember = memberOne.profileId === profile.id ? memberTwo : memberOne

	return (
		<div className='bg-white dark:bg-[#313338] flex flex-col h-full'>
			{/* 成员聊天头部 */}
			<ChatHeader
				imageUrl={otherMember.profile.imageUrl}
				name={otherMember.profile.name}
				serverId={params.serverId}
				type='conversation'
			/>
			{/* 视频聊天-跳转去视频聊天室 */}
			{searchParams.video && (
				<MediaRoom chatId={conversation.id} video={true} audio={true} />
			)}
			{!searchParams.video && (
				<>
					{/* 聊天内容 */}
					<ChatMessages
						member={currentMember}
						name={otherMember.profile.name}
						chatId={conversation.id}
						type='conversation'
						apiUrl='/api/direct-messages'
						paramKey='conversationId'
						paramValue={conversation.id}
						socketUrl='/api/socket/direct-messages'
						socketQuery={{
							conversationId: conversation.id,
						}}
					/>
					{/* 输入框 */}
					<ChatInput
						name={otherMember.profile.name}
						type='conversation'
						apiUrl='/api/socket/direct-messages'
						query={{
							conversationId: conversation.id,
						}}
					/>
				</>
			)}
		</div>
	)
}

export default MemberIdPage
